const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender_id: {
         type: mongoose.Schema.Types.ObjectId, ref: 'User'
         },
    receiver_id: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
     },
    message:{
        type: String,
        required: true,
    },
    createdAt: { type: Date, default: Date.now }
});


const messageModel = mongoose.model('message', messageSchema);
module.exports = messageModel;


