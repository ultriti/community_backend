const conversationModel = require("../models/conversation.model.js");
const messageModel = require("../models/message.model.js");
const userModel = require("../models/user.model.js");
const { getReceiverSocketId, io } = require("../socket/socket.js");

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

        console.log('receiverSocketId', receiverId);

        // implement socket io for real time data
        const receiverSocketId = getReceiverSocketId(receiverId)

        if (receiverSocketId) {
            console.log('receiverSocketId', receiverSocketId);
            io.to(receiverSocketId).emit('newMessage', newMessage)
        }

        return res.status(200).json({
            success: true,
            newMessage: newMessage
        })

    } catch (error) {
        res.status(400).json({ message: "something went wrong" })
        console.log(error);

    }
}

module.exports.getMessage = async (req, res) => {

    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const conversation = await conversationModel.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate('messages');
        if (!conversation) {
            return res.status(200).json({ success: true, messages: [] })
        }

        return res.status(200).json({ success: true, messages: conversation?.messages, msg: "esadadsa" })


    } catch (error) {
        res.status(400).json({ message: "something went wrong fetching messages" })
        console.log(error);
    }

}


module.exports.getMessagingUser = async (req, res) => {

    const adminId = req.id;
    try {
        const conversations = await conversationModel.find({ participants: adminId }).lean();
        const userIds = conversations.flatMap(conv =>
            conv.participants.filter(user => user.toString() !== adminId)
        );


        const userDetails = await Promise.allSettled(
            userIds.map(userId => userModel.findById(userId).lean())
        );
        const results = await Promise.allSettled(
            userIds.map(userId => userModel.findById(userId).lean())
        );


        const successfulResults = results
            .filter(result => result.status === 'fulfilled' && result.value !== null)
            .map(result => result.value);



        // users wiyhout texing admin
        const allUsers = await userModel.find().limit(15).lean();

        // Extract IDs of users who have interacted
        const interactedUserIds = new Set([
            adminId.toString(),
            ...successfulResults.map(user => user._id.toString())
        ]);

        // Filter users who are NOT in interactedUserIds
        const nonInteractingUserIds = allUsers
            .filter(user => !interactedUserIds.has(user._id.toString()))
            .map(user => user);



        res.status(200).json({ message: "user found", allMessagingUsers: successfulResults, allNonmessagingUsers: nonInteractingUserIds, success: true });

    } catch (error) {
        return res.status(400).status({ error: "internal error", success: false })
    }

}

