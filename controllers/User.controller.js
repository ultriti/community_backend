const userModel = require('../models/user.model');
const userService = require('../services/User.service');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const cookieparser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const { getDataUri } = require('../mongodb/dataUri');



cloudinary.config({
    cloud_name: 'dqifawygq',
    api_key: '352965717988348',
    api_secret: '4ug3VX3fv2PoJaN0FlIEBckbsdo',
  });


module.exports.registerUser = async (req, res, next) => {

    const { Username, Email, Password } = req.body;

    if (!Username || !Email || !Password) {
        return res.status(400).json({ errors: [{ msg: 'All fields are required' }] });
    }
    const user_data = await userModel.findOne({ Email: Email });


    if (!user_data) {
        try {
            const hashedPassword = await userModel.hashPassword(Password);
            const admin_data = await userService.createUser({
                Username: Username,
                Email: Email,
                Password: hashedPassword
            });
            
            const user = {
                userId: admin_data._id,
                Username: admin_data.Username,
                Firstname:admin_data.Fullname.Firstname,
                Lastmame:admin_data.Fullname.Lastname,
                Email: admin_data.Email,
                profilePic: admin_data.profilePic,
                bio: admin_data.bio,
                Followers:admin_data.Followers,
                Following: admin_data.Following,
                posts: admin_data.posts,
                bookmarks: admin_data.bookmarks
            }
            const token = jwt.sign({ Email: Email, userId: user.userId }, process.env.JWT_SECRET);
            res.cookie('token', token, {
                httpOnly: true,
                expires: new Date(Date.now() + 3600000 * 24 * 30) // 30 days
            });
            res.status(200).json({ msg: 'user created successfully',user,token:token});
        }
        catch (error) {
            console.log(error);
        }
    } else {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }
}


module.exports.loginUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(),msg: 'somryhing went wrong'});
    };
    const { Email, Password } = req.body
    if (!Email || !Password) {
        return res.status(400).json({ msg: 'All fields are required' });
    };
    const user_data = await userModel.findOne({ Email: Email }).select("+Password");
    if (!user_data) {
        return res.status(400).json({ msg: 'invalid email or password'  });
    }
    else {
        const isMatch_password = await user_data.comparePassword(Password, user_data.Password);
   
        if (!isMatch_password) {
            return res.status(400).json({ msg: 'invalid email or password' } );
        } 
        else {
            const user = {
                userId: user_data._id,
                Username: user_data.Username,
                Firstname:user_data.Fullname.Firstname,
                Lastmame:user_data.Fullname.Lastname,
                Email: user_data.Email,
                profilePic: user_data.profilePic,
                bio: user_data.bio,
                Followers:user_data.Followers,
                Following: user_data.Following,
                posts: user_data.posts,
                bookmarks: user_data.bookmarks
            }
            const token = jwt.sign({ Email: Email, userId: user.userId }, process.env.JWT_SECRET);
            res.cookie('token', token, {
                httpOnly: true,
                expires: new Date(Date.now() + 3600000 * 24 * 30) // 30 days
            });
            res.status(200).json({ msg: 'user found ',token:token,user });
        };
         };
    } catch (error) {
        res.status(500).json({msg: 'something went wrong'});
    }
}


module.exports.logoutUser = async (req, res) => {
    try {  
        res.clearCookie('token');
        res.status(200).json({ msg: 'Logged out successfully' });
        
    } catch (error) {
        res.status(400).json({msg:'user cant logout '})
    }

}


module.exports.getProfile = async (req, res) => {
    try {
        const adminId = req.id;
        const UserID = req.params.id;
        const user_data = await userModel.findById(UserID).select('-Password');
   
        if(adminId == UserID) {
            const user_data = await userModel.findById(adminId).select('-Password');
            return res.status(200).json({mg:'USer profile found',user:user_data,user_data_toggle:'true'});

        }
        res.status(200).json({mg:'USer profile found',user:user_data,user_data_toggle:'false'});
    } catch (error) {
        console.log('err',error);
        
        res.status(400).json({err:'no able to get profile'})
    }
}


module.exports.editUserProfile = async (req,res) =>{

    try {
        const adminId = req.id;
        const {bio,Firstname,Lastname,profile_picture_id} = req.body;
        const profilePic = req.body.profilePic;

        const user = await userModel.findById(adminId).select('-Password');

        const current_ppic_id = user.profilePic;
        if(!user){
            return res.status(400).json({msg:"User not found"})
        }else{
            const old_img_public_id = user.profile_picture_id;

            // if(Gender){user.Gender = Gender};
            if(Firstname) {user.Fullname.Firstname = Firstname};
            if(Lastname) {user.Fullname.Lastname = Lastname};
            if(bio){user.bio = bio};
            if(profilePic){ 
                
                
                if(old_img_public_id == 'default_profile_pic'){
                    user.profilePic = profilePic,
                    user.profile_picture_id = profile_picture_id
                    await user.save();
                }else{
                    user.profilePic = profilePic,
                    user.profile_picture_id = profile_picture_id

                    // delte the img by img ptoblic id
                    cloudinary.uploader.destroy(old_img_public_id);
                    await user.save();
                    
                }
            };
            await user.save();
            

            const user_ = {
                userId: user._id,
                Username: user.Username,
                Firstname:user.Fullname.Firstname,
                Lastmame:user.Fullname.Lastname,
                Email: user.Email,
                profilePic: user.profilePic,
                profile_picture_id:user.profile_picture_id,
                bio: user.bio,
                Followers:user.Followers,
                Following: user.Following,
                posts: user.posts,
                bookmarks: user.bookmarks
            }
            await res.status(200).json({msg:"Profile edited successfully",user_});
        }
    } catch (error) {
        
        res.status(400).json({err:"problem in editing the profile"})    }
}


module.exports.getSuggestedUsers = async (req, res) => {
    try {
        
        const suggestedUsers = await userModel.find({_id:{$ne:req.id}}).select("-Password");
        const admin_id = await userModel.findById(req.id).select("-password");
        if(!suggestedUsers){
            res.status(404).json({err:"current user not found"})
        };

        
        return res.status(200).json({msg:"suggested users",suggestedUsers,admin_id});
        
    } catch (error) {
        
    }
}


module.exports.followorunfollow = async (req,res) =>{
    try {
        
        const adminId = req.id;
        const otherUserId = req.params.id;

        if(adminId == otherUserId){
            return res.status(400).json({msg:"you cant follow or unfollow yourself"});
        }

        const user = await userModel.findById(adminId);
        const otherUser = await userModel.findById(otherUserId);

        if(!user ||!otherUser){
            return res.status(404).json({msg:"User not found"})
        }
        const isFollowing = user.Following.includes(otherUserId);
        if(isFollowing){

            await Promise.all([
                userModel.updateOne({_id:adminId},{$pull:{Following:otherUserId}}),
                userModel.updateOne({_id:otherUser},{$pull:{Follower:adminId}})
            ]);
            return res.status(200).json({msg:"user unfollowed",isConnected:(!isFollowing),isFollowing});
        }else{
            await Promise.all([
                userModel.updateOne({_id:adminId},{$push:{Following:otherUserId}}),
                userModel.updateOne({_id:otherUser},{$push:{Follower:adminId}})
            ]);
            return res.status(200).json({msg:"user followed",isConnected:(!isFollowing),isFollowing});
        }


    } catch (error) {
        console.log(error);
        
        res.status(400).json({err:"somrthinf went wrong"})
    }
}


module.exports.getconnected_users = async (req,res)=>{

    try {
        const adminId = req.id;
        const otherUserId = req.params.id;
        
        const user = await userModel.findById(adminId);
        const isFollowing = user.Following.includes(otherUserId);
    
        if(isFollowing){
            res.status(200).json({msg:"following",isFollowing});
            
        }else{
            res.status(200).json({msg:"not following",isFollowing});
            
        }
        
    } catch (error) {
        console.log(error);
        res.status(400).json({err:"somrthinf went wrong"})
        
    }
  

}


module.exports.getadmin_data = async (req, res) => {
    try {
        const adminId = req.id;

        const admin = await userModel.findById(adminId).select('-Password');
        
        if(!admin){
            return res.status(404).json({msg:"Admin not found"})
        }
        const admin_data = {
            userId: admin._id,
            Username: admin.Username,
            Email: admin.Email,
            profilePic: admin.profilePic,
            bio: admin.bio,
            Followers:admin.Followers,
            Following: admin.Following,
            posts: admin.posts,
            bookmarks: admin.bookmarks
        }
        
        return res.status(200).json({msg:"admin data",admin_data});


    } catch (error) {
        console.log('error', error);
        
    }
}