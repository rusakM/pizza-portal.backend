const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.post('/', bookingController.createBooking);

router.get('/:id', bookingController.getBooking);

router.use(authController.restrictTo('admin', 'kucharz'));

router.get('/', bookingController.getAllBookings);

router
    .route('/:id')
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking);

module.exports = router;
