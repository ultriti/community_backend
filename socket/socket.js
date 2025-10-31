// socketServer.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);

const isDev = process.env.NODE_ENV !== 'production';
const allowedOrigins = isDev
  ? [process.env.cors_frontend]
  : [process.env.cors_frontend_2];

console.log('✅ Allowed Origins:', allowedOrigins);

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      console.log('🔍 Incoming origin:', origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('❌ Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 30000,
  pingInterval: 25000,
});

const userSocketMap = {};

const getReceiverSocketId = (receiverId) => {
  console.log('userSocketMap:', userSocketMap);
  return userSocketMap[receiverId];
};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`🔌 User connected: ${userId} → ${socket.id}`);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit('getOnlineUser', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${userId}`);
    if (userId in userSocketMap) {
      delete userSocketMap[userId];
    }
    io.emit('getOnlineUser', Object.keys(userSocketMap));
  });

  // Example custom event
  socket.on('sendMessage', ({ receiverId, message }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', { senderId: userId, message });
    }
  });
});

module.exports = { server, app, io, getReceiverSocketId };
