const express = require('express');
const router = express.Router();
const postController = require('../controllers/Post.controller')
const userController = require('../controllers/User.controller');
const thoughtsController = require('../controllers/Thoughts.controller');
const { isAunthenticate } = require('../middleware/User.auth');
const upload  = require('../middleware/Multer.auth');
const { demoauth } = require('../middleware/demo.auth');


// --------------- user routes ---------------
router.post('/register',userController.registerUser);
router.post('/login',userController.loginUser);
router.get('/logout',userController.logoutUser);
router.get('/:id/profile',isAunthenticate,userController.getProfile);
router.get('/adminprofile',isAunthenticate,userController.getadmin_data);
router.post('/edit_user_profile',isAunthenticate,userController.editUserProfile);
router.get('/suggested',isAunthenticate,userController.getSuggestedUsers);
router.post('/follownunfollow/:id',isAunthenticate,userController.followorunfollow);
router.post('/getConnect_user/:id',isAunthenticate,userController.getconnected_users);

// ----------------- user post -----------------

router.post('/create_user',isAunthenticate,postController.post_uploads);
router.post('/get_user_uploads/:id',isAunthenticate,postController.get_admin_uploads);
router.get('/get_all_uploads',isAunthenticate,postController.get_all_uploads);
router.post('/like_uploads/:id',isAunthenticate,postController.uploads_likes);
router.post('/delete_uploads/:id',isAunthenticate,postController.delete_uploads);

// ----------------- user comment -----------------

router.post('/create_comment/:id',isAunthenticate,postController.add_comment);
router.get('/get_all_comments/:id',isAunthenticate,postController.get_all_comments);
router.post('/search_items_',isAunthenticate,postController.get_searched_files);

// ----------------- user thoughts ------------------
router.post('/create_thoughts',isAunthenticate,thoughtsController.createThoughts);
router.get('/get_all_thoughts',isAunthenticate,thoughtsController.getallThouhghts);



module.exports = router;