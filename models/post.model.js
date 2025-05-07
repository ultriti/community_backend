const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieparser = require('cookie-parser');


const postSchema = new mongoose.Schema({
    thought:{
        type: String,
        default:''
    },
    uploads:{
        type: String,
        default:'',
        required: true
    },
    uploads_id:{
        type:String,
        default: 'default_propile_pic',
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment'
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]},{
        timestamps: true,
    }
    
)

const postModel = mongoose.model('uploads', postSchema);
module.exports = postModel;

