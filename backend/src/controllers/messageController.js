import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { updateConversationAfterCreateMessage } from '../utils/messageHelper.js';

export const sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content, conversationId } = req.body;
    const senderId = req.user._id;

    let conversation;

    if (!content) {
      return res.status(400).json({ message: 'The content is empty!' });
    }

    // If conversation exist, then get it from db
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    // If conversation does not exist, then create a new one
    if (!conversation) {
      conversation = await Conversation.create({
        type: 'direct',
        participants: [
          { userId: senderId, joinedAt: new Date() },
          { userId: recipientId, joinedAt: new Date() },
        ],
        lastMessageAt: new Date(),
        unreadCounts: new Map(),
      });
    }

    // Create a message
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    return res.status(201).json({ message });
  } catch (error) {
    console.error('Error when send direct message', error);
    res.status(500).json({ message: 'System error' });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;

    if (!content) {
      return res.status(400).json({ message: 'The content is empty!' });
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    return res.status(201).json({ message });
  } catch (error) {
    console.error('Error when send group message', error);
    res.status(500).json({ message: 'System error' });
  }
};
