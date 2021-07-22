const express = require('express');

const bookingStatusController = require('../controllers/bookingStatusController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
    .route('/')
    .post(bookingStatusController.createStatus)
    .get(bookingStatusController.getAll);

router.route('/:id').get(bookingStatusController.getStatus);

router
    .route('/booking/:id')
    .get(
        bookingStatusController.getBookingStatusList,
        bookingStatusController.getAll
    );

module.exports = router;
