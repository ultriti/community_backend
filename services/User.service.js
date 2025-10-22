const { validationResult } = require('express-validator');
const userModel = require('../models/user.model');
const postService = require('../services/Post.service');


module.exports.createUser = async ({ 
    Username, Email, Password 
}) => {
    
    if(!Username || !Email || !Password){
        throw new Error('All fields are required');
        
    }
  
    const user = userModel.create({
      Username,
      Email,
      Password,
      // profile_picture_id:'default_propile_pic'
    });
  
    return user;
  };

// module.exports.createUser = async ({ Username, Email, Password }) => {

//     // Check if the username is already taken
//     const existingUser = await userModel.findOne({ Username });
//     if (existingUser) {
//       throw new Error('Username already exists');
//     }
  
    
//     // Create a new user
//     const user = new userModel({
//       Username,
//       Email,
//       Password,
//       bio:''
//     });
  
//     // Save the user to the database
//     await user.save();
  
//     return user;
//   };