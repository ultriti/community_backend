const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// 🌐 Dynamic CORS origin setup
const isDev = process.env.NODE_ENV !== 'production';
const allowedOrigins = isDev
  ? ['http://localhost:5173']
  : ['https://communichat.ultriti.com'];

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// 🧠 In-memory user socket map
const userSocketMap = {};

// 🔍 Helper to get receiver's socket ID
const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

// ⚡ Socket.IO connection logic
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Broadcast online users
  io.emit('getOnlineUser', Object.keys(userSocketMap));

  // Handle disconnect
  socket.on('disconnect', () => {
    if (userId in userSocketMap) {
      delete userSocketMap[userId];
    }
    io.emit('getOnlineUser', Object.keys(userSocketMap));
  });
});

// 🛠 Export for use in main server file
module.exports = { server, app, io, getReceiverSocketId };
