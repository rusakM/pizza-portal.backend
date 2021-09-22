const express = require('express');
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/', messageController.saveMessage);

router.use(
    authController.protect,
    authController.restrictTo('admin', 'kucharz')
);

router.get('/', messageController.getAllMessages);

router
    .route('/:id')
    .get(messageController.getMessage)
    .patch(messageController.updateMessage)
    .delete(messageController.deleteMessage);

router.patch(
    '/:id/read',
    messageController.readMessage,
    messageController.updateMessage
);

router.patch(
    '/:id/reply',
    messageController.setReply,
    messageController.updateMessage
);

module.exports = router;
