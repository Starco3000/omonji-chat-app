import User from '../models/User.js';

export const authMe = async (req, res) => {
  try {
    const user = req.user; //Get from authMiddleware

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error when call authMe', error);
    return res.status(500).json({ message: 'System error' });
  }
};

export const searchUserByUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || !username.trim() === '') {
      return res
        .status(400)
        .json({ message: 'Need provide username to query' });
    }

    const user = await User.findOne({ username }).select(
      '_id displayName username avatarUrl',
    );

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error when searchUserByUsername', error);
    return res.status(500).json({ message: 'System error' });
  }
};
