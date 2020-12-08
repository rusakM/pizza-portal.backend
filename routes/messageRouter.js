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
    '/:id/markAsReplied',
    messageController.markMessage('isReplied'),
    messageController.updateMessage
);

router.patch(
    '/:id/markAsRead',
    messageController.markMessage('isRead'),
    messageController.updateMessage
);

module.exports = router;
