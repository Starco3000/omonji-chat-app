import Conversation from '../models/Conversation.js';
import Friend from '../models/Friend.js';

const pair = (a, b) => (a < b ? [a, b] : [b, a]);

export const checkFriendship = async (req, res, next) => {
  try {
    const me = req.user._id.toString();
    const recipientId = req.body?.recipientId ?? null;
    const memberIds = req.body?.memberIds ?? []; // (options)

    //(Options)
    // if (!recipientId) {
    //   return res
    //     .status(400)
    //     .json({ message: 'Cần cung cấp recipientId' });
    // }

    if (!recipientId && memberIds.length === 0) {
        return res
        .status(400)
        .json({ message: 'Cần cung cấp recipientId hoặc memberIds' });
    }

    if (recipientId) {
      const [userA, userB] = pair(me, recipientId);
      const isFriend = await Friend.findOne({ userA, userB });
      if (!isFriend) {
        return res
          .status(403)
          .json({ message: 'Bạn chưa kết bạn với người này' });
      }

      return next();
    }

    //Check members in group are user friend or not (options)
    const friendChecks = memberIds.map(async (memberId) => {
      const [userA, userB] = pair(me, memberId);
      const friend = await Friend.findOne({ userA, userB });
      return friend ? null : memberId;
    });

    const results = await Promise.all(friendChecks); //wait for all query is done
    const notFriends = results.filter(Boolean);

    if (notFriends.length > 0) {
      return res
        .status(403)
        .json({ message: 'You can only add friend into group', notFriends });
    }

    next();

  } catch (error) {
    console.error('Error in checkFriendship middleware', error);
    return res.status(500).json({ message: 'Systerm error' });
  }
};

export const checkGroupMembership = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Cannot find the conversation' });
    }

    //Check sender is the member of the group or not
    const isMember = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString(),
    );

    if (!isMember) {
      return res.status(403).json({
        message:
          'You are not in this group! Only members can send message in group',
      });
    }

    req.conversation = conversation;

    next();
  } catch (error) {
    console.error('Error in checkGroupMembership middleware');
    return res.status(500).json({ message: 'System error' });
  }
};
