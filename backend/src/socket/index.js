import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import { socketAuthMiddleware } from '../middlewares/socketMiddleware.js';

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

io.on('connection', async (socket) => {
  const user = socket.user;
  console.log(`${user.displayName} online with socket ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`socket disconnected: ${socket.id}`);
  });
});

export { io, app, server };
