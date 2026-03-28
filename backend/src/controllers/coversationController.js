import Conversation from '../models/Conversation.js';
import Message from './../models/Message.js';
import { io } from '../socket/index.js';

export const createConversation = async (req, res) => {
  try {
    const { type, name, memberIds } = req.body;
    const userId = req.user._id;

    if (
      !type ||
      (type === 'group' && !name) ||
      !memberIds ||
      !Array.isArray(memberIds) ||
      memberIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: 'Group name and list of member is required' });
    }

    let conversation;
    if (type === 'direct') {
      const participantId = memberIds[0];

      // Check if there is a conversation exist between userId and participantId.
      conversation = await Conversation.findOne({
        type: 'direct',
        'participants.userId': { $all: [userId, participantId] }, // The "$all" means the array must contain both userId and participantId
      });

      // If conversation not exist, then create a new one
      if (!conversation) {
        conversation = new Conversation({
          type: 'direct',
          participants: [{ userId }, { userId: participantId }],
          lastMessageAt: new Date(),
        });

        // Save into Database
        await conversation.save();
      }
    }

    if (type === 'group') {
      conversation = new Conversation({
        type: 'group',
        participants: [{ userId }, ...memberIds.map((id) => ({ userId: id }))],
        group: {
          name,
          createdBy: userId,
        },
        lastMessageAt: new Date(),
      });

      await conversation.save();
    }

    // Check if conversation type is not "direct" or "group"
    if (!conversation) {
      return res
        .status(400)
        .json({ message: 'Conversation type không hợp lệ' });
    }

    await conversation.populate([
      { path: 'participants.userId', select: 'displayName avatarUrl' },
      { path: 'seenBy', select: 'displayName avatarUrl' },
      { path: 'lastMessage.senderId', select: 'displayName avatarUrl' },
    ]);

    const participants = (conversation.participants || []).map((p) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
    }));

    const formatted = { ...conversation.toObject(), participants };

    return res.status(201).json({ conversation: formatted });
  } catch (error) {
    console.error('Error when create Conversation', error);
    return res.status(500).json({ message: 'System error' });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      'participants.userId': userId,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate({
        path: 'participants.userId',
        select: 'displayName avatarUrl',
      })
      .populate({
        path: 'lastMessage.senderId',
        select: 'displayName avatarUrl',
      })
      .populate({
        path: 'seenBy',
        select: 'displayName avatarUrl',
      });

    const formatted = conversations.map((convo) => {
      const participants = (convo.participants || []).map((p) => ({
        _id: p.userId?._id,
        displayName: p.userId?.displayName,
        avatarUrl: p.userId?.avatarUrl ?? null,
        joinedAt: p.joinedAt,
      }));

      return {
        ...convo.toObject(),
        unreadCounts: convo.unreadCounts || {},
        participants,
      };
    });

    return res.status(200).json({ conversations: formatted });
  } catch (error) {
    console.error('Error when get conversations', error);
    return res.status(500).json({ message: 'System error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, cursor } = req.query;

    const query = { conversationId };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    let messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1);

    let nextCursor = null;

    if (messages.length > Number(limit)) {
      const nextMessage = messages[messages.length - 1];
      nextCursor = nextMessage.createdAt.toISOString();
      messages.pop();
    }

    messages = messages.reverse(); // đảo ngược mảng đã sort để tin mới nhất nằm ở cuối cùng để hiện thị đúng tron khung chat

    return res.status(200).json({ messages, nextCursor });
  } catch (error) {
    console.error('Error when get messages', error);
    return res.status(500).json({ message: 'System error' });
  }
};

export const getUserConversationsForSocketIO = async (userId) => {
  try {
    const conversations = await Conversation.find(
      { 'participants.userId': userId },
      { _id: 1 },
    );

    return conversations.map((c) => c._id.toString());
  } catch (error) {
    console.error('Error when fetch conversations: ', error);
    return [];
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId).lean();

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation does not exist!' });
    }

    const last = conversation.lastMessage;

    if (!last) {
      return (
        res.status(200) / json({ message: 'Không có tin nhắn để mark as seen' })
      );
    }

    if (last.senderId.toString() === userId) {
      return res.status(200).json({ message: 'Sender không cần mark as seen' });
    }

    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: { seenBy: userId },
        $set: { [`unreadCounts.${userId}`]: 0 },
      },
      { new: true },
    );

    io.to(conversationId).emit('read-message', {
      conversation: updated,
      lastMessage: {
        _id: updated?.lastMessage?._id,
        content: updated?.lastMessage?.content,
        createdAt: updated?.lastMessage?.createdAt,
        sender: {
          _id: updated?.lastMessage?.senderId,
        },
      },
    });

    return res.status(200).json({
      message: 'Marked as seen',
      seenBy: updated?.seenBy || [],
      myUnreadCount: updated?.unreadCounts[userId] || 0,
    });
  } catch (error) {
    console.error('Error when mark as seen', error);
    return res.status(500).json({ message: 'System error' });
  }
};
