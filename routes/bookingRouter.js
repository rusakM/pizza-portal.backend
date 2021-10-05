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
        bookingController.emitBookingToSockets,
        bookingController.processBooking,
        bookingController.mapBookingForPaymentSession,
        bookingController.createPaymentSession
    );

router.get('/unapproved', bookingController.getUnapprovedOrders);

router.get('/unpaid', bookingController.getUnpaidOrders);

router.get('/pending', bookingController.getPendingOrders);

//nice to have use shipping param as boolean
//true means - orders during delivery
//false mesns - orders not prepared for delivery yet
router.get('/shipping', bookingController.getShippingOrders);

router.get('/done', bookingController.getDoneOrders);

router.get('/ready', bookingController.getReadyOrders);

router.get('/canceled', bookingController.getCanceledBookings);

router.get('/all', bookingController.getAllAggregatedBookings);

router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(
        bookingController.preventBooking,
        bookingController.payBooking,
        bookingController.finishBooking,
        bookingController.updateBooking
    );

router
    .route('/:id/history')
    .get(
        bookingStatusController.getBookingStatusList,
        bookingStatusController.getAll
    )
    .post(
        bookingStatusController.rewriteBookingId,
        bookingStatusController.checkIfExist,
        bookingStatusController.createStatus
    );

router.post('/:id/getByOrder', bookingStatusController.getByOrder);

router.use(authController.restrictTo('admin', 'kucharz'));

router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
