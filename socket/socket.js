const {Server}  = require('socket.io');
const express = require('express');
const http = require('http');

const app = express();

const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST']
    }
})


// this store socket id of coreesponding userId -> socket.id
const userSocketMap = {}

const getReceiverSocketId =(receiverId) => userSocketMap[receiverId];


io.on('connection', (socket)=>{
    const userId = socket.handshake.query.userId;
    if(userId){
        userSocketMap[userId] = socket.id
    }

    io.emit('getOnlineUser', Object.keys(userSocketMap))
    

    socket.on('disconnect', ()=>{
        if(userId in userSocketMap){
            delete userSocketMap[userId]
        }
        io.emit('getOnlineUser', Object.keys(userSocketMap))
    })
})

module.exports = {server,app,io,getReceiverSocketId};