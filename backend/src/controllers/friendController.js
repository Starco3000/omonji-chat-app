import Friend from '../models/Friend.js';
import User from '../models/User.js';
import FriendRequest from './../models/FriendRequest.js';

export const sendFriendRequest = async (req, res) => {
  try {
    const { to, message } = req.body;
    //Get current user id
    const from = req.user._id;
    // Check if user sent a friend request to themself
    if (from === to) {
      return res
        .status(400)
        .json({ message: 'Cannot send a friend request for yourself' });
    }
    //Check if User exist in database
    const userExist = await User.exists({ _id: to });
    if (!userExist) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    // Check if between them already friends or existing a friend request waiting for accept
    let userA = from.toString();
    let userB = to.toString();

    if (userA > userB) {
      [userA, userB] = [userB, userA];
    }

    const [alreadyFriends, existingRequest] = await Promise.all([
      //Promise.all giúp chạy 2 request song song cho tiết tiệm thời gian
      Friend.findOne({ userA, userB }), //
      FriendRequest.findOne({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      }),
    ]);

    if (alreadyFriends) {
      return res.status(400).json({ message: 'You two are already friends' });
    }

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: 'There is a friend request waiting' });
    }

    // Create a friend request
    const request = await FriendRequest.create({
      from,
      to,
      message,
    });

    // Return result
    return res
      .status(201)
      .json({ message: 'Sending a friend request successfully!', request });
  } catch (error) {
    console.error('Error when sending add friend request', error);
    return res.status(500).json({ message: 'System Error' });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);

    //Check if friend requests are not exist
    if (!request) {
      return res.status(404).json({ message: 'Cannot find a friend request' });
    }

    // Avoid another person accept friend requests except ower
    if (request.to.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You don't have permission to accept this friend request",
      });
    }

    // If valid, then create relationship between them
    const friend = await Friend.create({
      userA: request.from,
      userB: request.to,
    });

    //Delete friend request after add friends
    await FriendRequest.findByIdAndDelete(requestId);

    const from = await User.findById(request.from)
      .select('_id displayName avatarUrl')
      .lean(); //lean will improve performance, the return will be javascript object instend of MongoDB document

    return res.status(200).json({
      message: 'Accept friend request successfully!',
      newFriend: {
        _id: from?._id,
        displayName: from?.displayName,
        avatarUrl: from?.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Error when accept friend request', error);
    return res.status(500).json({ message: 'System Error' });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);

    //Check if friend requests are not exist
    if (!request) {
      return res.status(404).json({ message: 'Cannot find a friend request' });
    }

    // Avoid another person decline friend requests except ower account
    if (request.to.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You don't have permission to decline this friend request",
      });
    }
    //If userId valid then do the action below
    await FriendRequest.findByIdAndDelete(requestId);

    return res.sendStatus(204);
  } catch (error) {
    console.error('Error when decline friend request', error);
    return res.status(500).json({ message: 'System Error' });
  }
};

export const getAllFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const friendShips = await Friend.find({
      $or: [
        {
          userA: userId,
        },
        {
          userB: userId,
        },
      ],
    })
      .populate('userA', '_id displayName avatarUrl')
      .populate('userB', '_id displayName avatarUrl')
      .lean();

    if (!friendShips.length) {
      return res.status(200).json({ friend: [] });
    }

    // Check UserA is a friend of UserB or not
    const friends = friendShips.map((friend) =>
      friend.userA._id.toString() === userId.toString()
        ? friend.userB
        : friend.userA,
    );

    //Return result
    return res.status(200).json({ friends });
  } catch (error) {
    console.error('Error when get list of friends', error);
    return res.status(500).json({ message: 'System Error' });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    // Get userId
    const userId = req.user._id;
    // Setup info want to get from user
    const populateFields = '_id username displayName avatarUrl';
    // Get all friendRequest include their info
    const [sent, received] = await Promise.all([
      FriendRequest.find({ from: userId }).populate('to', populateFields),
      FriendRequest.find({ to: userId }).populate('from', populateFields),
    ]);
    // Return value
    res.status(200).json({ sent, received });
  } catch (error) {
    console.error('Error when get friend request', error);
    return res.status(500).json({ message: 'System Error' });
  }
};

export const deleteFriend = async (req, res) => {
  try {
    // Get friendId from params
    const { friendUserId } = req.params;
    // Get current userId
    const userId = req.user._id;

    // Check if user trying to delete themselves
    if (userId.toString() === friendUserId) {
      return res
        .status(400)
        .json({ message: 'Cannot delete friendship with yourself' });
    }

    // Find friendship document (current user is either userA or userB in the friendship)
    const friendShip = await Friend.findOne({
      $or: [
        { userA: userId, userB: friendUserId },
        { userA: friendUserId, userB: userId },
      ],
    });

    // Check if friendship exists
    if (!friendShip) {
      return res.status(404).json({ message: 'Friend does not exist' });
    }

    //If valid, then delete the friendShip
    await Friend.findByIdAndDelete(friendShip._id);

    return res.status(200).json({ message: 'Friend deleted successfully!' });
  } catch (error) {
    console.error('Error when delete friend', error);
    return res.status(500).json({ message: 'System Error' });
  }
};
