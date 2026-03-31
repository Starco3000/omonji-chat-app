import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './libs/db.js';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import friendRoute from './routes/friendRoute.js';
import messageRoute from './routes/messageRoute.js';
import conversationRoute from './routes/conversationRoute.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { protectedRoute } from './middlewares/authMiddleware.js';
import { app, server } from './socket/index.js';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// const app = express();
const PORT = process.env.PORT || 5001;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.CLIENT_URL_PRODUCTION],
    credentials: true,
  }),
);

// if (process.env.MODE_ENV !== 'production') {
//   app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// }

// CLOUDINARY Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// public routes
app.use('/api/auth', authRoute);

// private route
app.use(protectedRoute);
app.use('/api/users', userRoute);
app.use('/api/friends', friendRoute);
app.use('/api/messages', messageRoute);
app.use('/api/conversations', conversationRoute);

//Running server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
  });
});
