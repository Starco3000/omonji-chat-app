import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Session from '../models/Session.js';

const ACCESS_TOKEN_TTL = '30m'; //Noramlly under 15 mins
const REFESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days

// In development we typically run on http://localhost, so cookies cannot be marked secure.
// Browsers like Chrome/Edge will ignore cookies with `secure: true` over plain HTTP.
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    //Check if one of these things are empty
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message:
          'The username, password, email, firstName and lastName cannot be empty',
      });
    }

    //Check if username is exist
    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(400).json({ message: 'username already exists' });
    }

    //Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10); //salt = 10

    //Create new User
    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${lastName} ${firstName}`,
    });

    //Return result
    return res.sendStatus(204);
  } catch (error) {
    console.error(`Error when call signUp`, error);
    return res.status(500).json({ message: 'System error' });
  }
};

export const signIn = async (req, res) => {
  try {
    //Get inputs
    const { username, password } = req.body; //object destructuring

    if (!username || !password) {
      return res.status(400).json({ message: 'Missing Username or Password' });
    }

    //Get hashedPassword in db to compare with password from User input
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ message: 'Username or Password is incorrect' });
    }

    //Checking the Password
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: 'Username or Password is incorrect' });
    }

    //If correct, create an accessToken with JWT (This part include {UserId + AccessTokenSecret + expires times})
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    //Create a refresh token - The refesh token always need to save in db
    const refreshToken = crypto.randomBytes(64).toString('hex');

    //Create a new session to save the refresh token
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFESH_TOKEN_TTL),
    });

    // Return refresh token in cookie
    // - secure: only for production/HTTPS (browsers reject Secure cookies on HTTP)
    // - sameSite: 'none' is required for cross-site requests (frontend + backend on different origins)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Cookie cannot be accessed by JavaScript
      secure: true, // Only send cookie via HTTPS in production
      sameSite: 'none', // Required for cross-site (frontend/backend on different origins)
      maxAge: REFESH_TOKEN_TTL,
      path: '/',
    });

    //Return the accessToken into request
    return res.status(200).json({
      message: `User ${user.displayName} has been logged in`,
      accessToken,
    });
  } catch (error) {
    console.error(`Error when call signIn`, error);
    return res.status(500).json({ message: 'System error' });
  }
};

export const signOut = async (req, res) => {
  try {
    //Get refresh token from cookie
    const token = req.cookies?.refreshToken;

    if (token) {
      //Delete refresh token in session
      await Session.deleteOne({ refreshToken: token });

      // Delete cookie (must match options set when creating it)
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'none',
        path: '/',
      });
    }
    return res.sendStatus(204);
  } catch (error) {
    console.error(`Error when call signOut`, error);
    return res.status(500).json({ message: 'System error' });
  }
};

// Create a new access token from refresh token
export const refreshToken = async (req, res) => {
  try {
    //Get refresh token from Cookie
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'Token không tồn tại' });
    }

    //Compare with refreshToken in database
    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      return res
        .status(403)
        .json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
    //Check token's expired date
    if (session.expiresAt < new Date()) {
      return res.status(403).json({ message: 'Token đã hết hạn' });
    }

    //Create a new access token
    const accessToken = jwt.sign(
      { userId: session.userId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: ACCESS_TOKEN_TTL,
      },
    );

    //Return the new access token back to user
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Lỗi khi gọi refreshToken', error);
    return res.status(500).json({ message: 'System Error' });
  }
};
