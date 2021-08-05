const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const bookingStatusController = require('../controllers/bookingStatusController');

const router = express.Router();

router.use(authController.protect);
router.use(authController.signUser);

router.get(
    '/mapped-booking/:id',
    bookingController.getOneBooking,
    bookingController.mapBooking,
    bookingController.mapPizzaDescriptions,
    bookingController.sendMappedBooking
);

router
    .route('/')
    .get(bookingController.getAllBookings)
    .post(
        bookingController.saveBooking,
        bookingController.populateBooking,
        bookingController.mapBooking,
        bookingController.mapPizzaDescriptions,
        bookingController.sendEmail,
        bookingController.processBooking,
        bookingController.mapBookingForPaymentSession,
        bookingController.createPaymentSession
    );

router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(
        bookingController.preventBooking,
        bookingController.payBooking,
        bookingController.finishBooking,
        bookingController.updateBooking
    );

router.get(
    '/:id/history',
    bookingStatusController.getBookingStatusList,
    bookingStatusController.getAll
);

router.use(authController.restrictTo('admin', 'kucharz'));

router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
