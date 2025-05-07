const { validationResult } = require('express-validator');
const thoughtsModel = require('../models/thoughts.model.js');


module.exports.create_thoughts = async ({ 
    thought,userId
}) => {
    
    if(!thought || !userId){
        throw new Error('All fields are required');
    }
  
    const thoughts_data =await thoughtsModel.create({
        thoughts:thought,
        author: userId
      // profile_picture_id:'default_propile_pic'
    });
  
  
    return thoughts_data;
  };
