const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieparser = require('cookie-parser');


const userSchema = new mongoose.Schema({

    Username:{
        type:String,
        required: true,
        minlength:[3,'first name must be greater than 3 letters'],
    },
    Email:{
        type:String,
        required: true,
        unique: true,
        minlength:[5,'password must be at least 5 characters long'],
        match:[/\S+@\S+\.\S+/, 'Please enter a valid email address'],
    },
    Fullname:{
        Firstname:{
            type:String,
            default:'',
            // minlength:[3,'first name must be greater than 3 letters'],
        },
        Lastname:{
            type:String,
            default:'',
            // minlength:[3,'last name must be greater than 3 letters'],
        }
    },
    Password:{
        type:String,
        required: true,
        select:false,
        minlength:[4,'password must be at least 4 characters long'],
        // match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{3,}$/, 'Password must contain at least 3 characters, including uppercase, lowercase, number, and special character'],
    },
    bio:{
        type:String,
        default: '',
        maxlength:[200,'bio must be less than 200 characters'],
    },
    Gender:{
        type:String,
        enum:['Male', 'Female', 'Other'],
        default:'Other',
    },
    DateofBirth:{
        type:Date,
    },
    profilePic:{
        type:String,
        default: 'https://res.cloudinary.com/dqifawygq/image/upload/v1737742449/default_profile_pic.png',
    },
    profile_picture_id:{
        type:String,
        default: 'default_propile_pic',
    },
    Follower:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }],
    Following:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }],
    post:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'uploads',
    }],
    bookmarks:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'uploads',
    }]
},{
    isPremium: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true,
});

userSchema.methods.generateAuthToken =async function(user) {
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET,{expiresIn:'24h'});
    return token;
}

userSchema.methods.comparePassword = async function (password,userpassword){
    return await bcrypt.compare(password, userpassword);
}

userSchema.statics.hashPassword = async function(password){
    return await bcrypt.hash(password, 10);
}




const userModel = mongoose.model('User', userSchema);
module.exports = userModel;