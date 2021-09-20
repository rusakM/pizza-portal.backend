const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const addressController = require('../controllers/addressController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.post('/loginAdmin', authController.loginAdmin);

router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);

router.get('/getMyAddress', addressController.getUserAddress);

router.patch(
    '/updateMe',
    userController.uploadUserPhoto,
    userController.resizePhoto,
    userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin', 'kucharz'));

router.route('/').get(userController.getAllUsers);

router.get('/find-users/:name', userController.findUsers);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
