const mongoose = require('mongoose');

const commentsSchema = new mongoose.Schema({
    comment: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploads: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads', required: true },

},{
    timestamps: true,
});



const commentModel = mongoose.model('comment', commentsSchema);
module.exports = commentModel;