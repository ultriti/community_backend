const express = require('express');
const router = express.Router();

const messageContoller = require('../controllers/Message.controller');
const { isAunthenticate } = require('../middleware/User.auth');

router.post('/sendMessage/:id',isAunthenticate,messageContoller.SendMessage);
router.get('/getMessage/:id',isAunthenticate,messageContoller.getMessage);


module.exports = router;