const commentModel = require("../models/comments.model");
const postModel = require("../models/post.model");
const userModel = require('../models/user.model');
const postService = require('../services/Post.service');
const { validationResult } = require('express-validator');
const { getReceiverSocketId,io } = require("../socket/socket");
const cloudinary = require('cloudinary').v2;



cloudinary.config({
  cloud_name: 'dqifawygq',
  api_key: '352965717988348',
  api_secret: '4ug3VX3fv2PoJaN0FlIEBckbsdo',
});


//   module.exports.post_uploads =async (req,res)=>{

//     const admin_id = req.id;
//     const uploads_pic = req.body.uploads_pic;
//     const uploads_thoughts = req.body.thoughts;
//     const uploads_comments = req.body.comments;

//     if(!uploads_pic || !admin_id){
//         return res.status(400).json({ errors: [{ msg: 'All fields are required' }] });
//     }

//     const admin_data = await userModel.findById(admin_id).select('-Password');




//     const admin_post_uploads =await postService.post_uploads({
//         uploads:uploads_pic,
//         thoughts:uploads_thoughts,
//         author:admin_id,
//         comments:uploads_comments,
//     })





//     const admin_posts_ = {
//         image_id : admin_post_uploads._id,
//         uploads: admin_post_uploads.uploads,
//         thought: admin_post_uploads.thoughts,
//         author: admin_post_uploads.author,
//         comments: admin_post_uploads.comments,
//         likes: admin_post_uploads.likes
//     };



//     res.status(200).json({msg:'okay',img_data:admin_posts_})


//   }

module.exports.post_uploads = async (req, res) => {

  const admin_id = req.id;
  const uploads_pic = req.body.uploads_pic;
  const uploads_img_id = req.body.profile_picture_id;
  const uploads_thoughts = req.body.thoughts;
  const uploads_comments = req.body.comments;

  if (!uploads_pic || !admin_id) {
    return res.status(400).json({ errors: [{ msg: 'All fields are required' }] });
  }
  const admin_data = await userModel.findById(admin_id).select('-Password');
  const admin_post_uploads = await postService.post_uploads({
    uploads: uploads_pic,
    author: admin_id,
    thought: uploads_thoughts,
    uploads_id: uploads_img_id
  });
  if (uploads_thoughts) {
    admin_post_uploads.thought = uploads_thoughts;
  }
  await admin_post_uploads.save();
  if (admin_data) {
    admin_data.post.push(admin_post_uploads._id);
    await admin_data.save();
  }
  res.status(200).json({ msg: 'okay', img_data: admin_post_uploads })

}

module.exports.get_admin_uploads = async (req, res) => {

  const adminId = req.id;
  const user_Id = req.params.id;
  if (!user_Id) {
    res.status(404).json({ msg: 'user not found invalid' })
  }
  else {
    const user_data = await userModel.findById(user_Id).select('post');
    if (!user_data) {
      res.status(404).json({ msg: 'user not found' })
    }
    else {
      const user_uploads = await postModel.find({ _id: { $in: user_data.post } }).sort({ createdAt: -1 }).populate('author', 'Username profilePic');


      const send_client_uplaods_data = user_uploads.map(upload => ({
        uploads_id: upload._id,
        uploads_url: upload.uploads,
        thought: upload.thought,
        author: upload.author._id,
        likes_len: upload.likes.length,
        comments_len: upload.comments.length,
        author_username: upload.author.Username,
        author_pic: upload.author.profilePic,
      }));
      res.status(200).json({ msg: 'okay', send_client_uplaods_data })
    }
  }
}

module.exports.get_all_uploads = async (req, res) => {
  const {limit} = req.query;
  const adminId = req.id;
  const page = req.query.page || 1;

  try {
    const startIndex = (parseInt(page) -1) * parseInt(limit);
    
    const posts = await postModel.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(parseInt(limit) || 4)
      .populate({
        path: 'author',
        select: 'Username profilePic'
      })

    res.status(200).json({ msg: 'all uplaods fetched successfully', posts });
  }

  catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
}

module.exports.uploads_likes = async (req, res) => {

  const admin_id = req.id
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ errors: [{ msg: 'All fields are required' }] });
  }

  if (!admin_id) {
    return res.status(401).json({ msg: 'unauthorized' });
  }
  const uploads_details = await postModel.findById(id);
  const isLiked_uploads = uploads_details.likes.includes(admin_id);
  if (isLiked_uploads) {
    await Promise.all([
      postModel.updateOne({ _id: id }, { $pull: { likes: admin_id } }),

    ]);

    const user = await userModel.findById(admin_id).select('Username profilePic');
    const postOwnerId = uploads_details.author.toString();
    if(postOwnerId != admin_id){
      // emit socket io notification event
      const notification = {
        type:'dislike',
        userId:admin_id,
        userDetails:user,
        PostId :id,
        message:"your post was liked"
      }
      const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      io.to(postOwnerSocketId).emit('notification',notification);
    }

    return res.status(200).json({ msg: "user unliked", isLiked_uploads });
  } else {
    await Promise.all([
      postModel.updateOne({ _id: id }, { $push: { likes: admin_id } }),
    ]);

    // implement socket io
    const user = await userModel.findById(admin_id).select('Username profilePic');
    const postOwnerId = uploads_details.author.toString();
    if(postOwnerId != admin_id){
      // emit socket io notification event
      const notification = {
        type:'like',
        userId:admin_id,
        userDetails:user,
        PostId :id,
        message:"your post was liked"
      }
      const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      io.to(postOwnerSocketId).emit('notification',notification);
    }

    return res.status(200).json({ msg: "user liked", isLiked_uploads });
  }
}

module.exports.delete_uploads = async (req, res) => {
  const admin_id = req.id;
  const { id } = req.params;
  const admin_data = await userModel.findById(admin_id);
  if (!id) {
    return res.status(400).json({ errors: [{ msg: 'cant find uploads' }] });
  }
  if (!admin_id) {
    return res.status(401).json({ msg: 'unauthorized' });
  }

  const uploads_details = await postModel.findById(id);
  if (!uploads_details) {
    return res.status(404).json({ errors: [{ msg: 'uploads not found' }] });
  }
  if (uploads_details.author.toString() !== admin_id.toString()) {
    return res.status(401).json({ msg: 'unauthorized to delete this uploads' });
  }
  await postModel.findByIdAndDelete(id);
  admin_data.post.pull({ _id: id }); // Update this line
  await admin_data.save();

  cloudinary.uploader.destroy(uploads_details.uploads_id);
  res.status(200).json({ msg: 'uploads deleted successfully' });

}

module.exports.add_comment = async (req, res) => {
  const admin_id = req.id;
  const { id } = req.params;
  const { comment } = req.body;
  if (!id || !comment) {
    return res.status(400).json({ errors: [{ msg: 'All fields are required' }] });
  }
  if (!admin_id) {
    return res.status(401).json({ msg: 'unauthorized user please login' });
  }
  const uploads_details = await postModel.findById(id);
  if (!uploads_details) {
    return res.status(404).json({ errors: [{ msg: 'uploads not found' }] });
  }
  const add_comment = await postService.create_comment({
    comment,
    author: admin_id,
    uploads_id: id
  })
  uploads_details.comments.push(add_comment._id);
  uploads_details.save();
  res.status(200).json({ msg: 'commented successfully' })
}

module.exports.get_all_comments = async (req, res) => {
  const admin_id = req.id;
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ errors: [{ msg: 'uploads not found' }] });
  }
  if (!admin_id) {
    return res.status(401).json({ msg: 'unauthorized user please login' });
  }
  const uploads_details = await commentModel.find({ uploads: id }).populate({
    path: 'author',
    select: 'Username profilePic'
  });
  if (!uploads_details) {
    return res.status(404).json({ errors: [{ msg: 'uploads not found' }] });
  }
  res.status(200).json({ msg: 'all comments', uploads_details })
}

module.exports.get_searched_files = async (req,res) =>{
  const admin_id = req.id;
  const {Username,uploads,limit} = req.query;


  const apiData = {};

  if(Username) {
    apiData.Username = {$regex: Username, $options: 'i'};
  }

  const find_username = await userModel.find(apiData).select('Username  profilePic Fullname').limit(parseInt(limit));

  res.status(200).json({msg:'username founf',find_username})
  







}