const conversationModel = require("../models/conversation.model.js");
const messageModel = require("../models/message.model.js");
const  {getReceiverSocketId, io}  = require("../socket/socket.js");

module.exports.SendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { message } = req.body;

        

        let conversation = await conversationModel.findOne({
            participants: { $all: [senderId, receiverId] }
        })
        // establish the convo if not tsarted
        if (!conversation) {
            conversation = await conversationModel.create({
                participants: [senderId, receiverId]
            })
        };
        const newMessage = await messageModel.create({
            sender_id: senderId,
            receiver_id: receiverId,
            message: message
        })
        if (newMessage) {
            conversation.messages.push(newMessage._id);
            await Promise.all([conversation.save(), newMessage.save()])
        }

        // implement socket io for real time data
        const receiverSocketId = getReceiverSocketId(receiverId)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage)
        }

        return res.status(200).json({
            success: true,
            newMessage:newMessage
        })

    } catch (error) {
        res.status(400).json({message:"something went wrong"})
        console.log(error);
        
    }
}

module.exports.getMessage = async (req, res) => {

    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const conversation = await conversationModel.findOne({
            participants:{$all:[senderId,receiverId]}
        }).populate('messages');
        if(!conversation){
            return res.status(200).json({success:true,messages:[]})
        }
            
        return res.status(200).json({success:true,messages:conversation?.messages,msg:"esadadsa"})


    } catch (error) {
        res.status(400).json({message:"something went wrong fetching messages"})
        console.log(error);
    }

}