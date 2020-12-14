const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
    .route('/')
    .get(authController.restrictToCurrentUser, bookingController.getAllBookings)
    .post(bookingController.createBooking);

router.get(
    '/:id',
    authController.restrictToCurrentUser,
    bookingController.getBooking
);

router.use(authController.restrictTo('admin', 'kucharz'));

router
    .route('/:id')
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking);

module.exports = router;
