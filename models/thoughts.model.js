const mongoose = require('mongoose');

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
  createdAt: {
    type: Date,
    default: Date.now
  } 
});

// TTL index: delete document 2 minutes (120 seconds) after creation
thoughtsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });
const thoughtsModel = mongoose.model('Thoughts', thoughtsSchema);
module.exports = thoughtsModel;
