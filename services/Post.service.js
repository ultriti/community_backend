const { validationResult } = require('express-validator');
const postModel = require('../models/post.model');
const commentModel = require('../models/comments.model');


module.exports.post_uploads = async ({
  uploads,author,thought,uploads_id
}) => {
    
    if(!uploads  || !author){
        throw new Error('All fields are required');
    }
    const admin_uploads = postModel.create({
      uploads,
      uploads_id,
      author
    });


    
  
    return admin_uploads;
  };


  module.exports.create_comment = async ({
    comment, author, uploads_id
  }) => {
    
    if(!comment  ||!author){
        throw new Error('All fields are required');
    }
    const admin_comment = commentModel.create({
      comment,
      author,
      uploads:uploads_id
    });

    return admin_comment;
    
  };