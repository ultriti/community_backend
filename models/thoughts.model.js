const mongoose = require('mongoose');
const userModel = require('../models/user.model');


const thoughtsSchema = new mongoose.Schema({
    thoughts: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    thoughts_comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ThoughtsComment'
    }],
    },{
        // expires: 24 * 60 * 60 * 60,
        timestamps: true,
    });
    thoughtsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });



const thoughtsModel = mongoose.model('Thoughts', thoughtsSchema);
module.exports = thoughtsModel; 