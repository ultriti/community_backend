const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);

// 🌐 Dynamic CORS origin setup
const isDev = process.env.NODE_ENV !== 'production';
const allowedOrigins = isDev
  ? [process.env.cors_frontend]
  : [process.env.cors_frontend_2];

console.log('✅ Allowed Origins:', allowedOrigins);

// ⚙️ Socket.IO setup with dynamic CORS
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('❌ Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// 🧠 In-memory user socket map
const userSocketMap = {};

// 🔍 Helper to get receiver's socket ID
const getReceiverSocketId = (receiverId) => {
  console.log('userSocketMap',userSocketMap);
  userSocketMap[receiverId]
  console.log('userSocketMap[receiverId]',userSocketMap[receiverId]);
  return userSocketMap[receiverId]
  
}

// ⚡ Socket.IO connection logic
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`🔌 User connected: ${userId} → ${socket.id}`);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Broadcast online users
  io.emit('getOnlineUser', Object.keys(userSocketMap));

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${userId}`);
    if (userId in userSocketMap) {
      delete userSocketMap[userId];
    }
    io.emit('getOnlineUser', Object.keys(userSocketMap));
  });

  // Optional: handle custom events like message, typing, etc.
  // socket.on('sendMessage', ({ receiverId, message }) => {
  //   const receiverSocketId = getReceiverSocketId(receiverId);
  //   if (receiverSocketId) {
  //     io.to(receiverSocketId).emit('receiveMessage', { senderId: userId, message });
  //   }
  // });
});

// 🛠 Export for use in main server file
module.exports = { server, app, io, getReceiverSocketId };
