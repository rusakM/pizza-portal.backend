const BookingStatus = require('../models/bookingStatusModel');
const factory = require('./handlerFactory');

exports.createStatus = factory.createOne(BookingStatus);

exports.getStatus = factory.getOne(BookingStatus);

exports.deleteStatus = factory.deleteOne(BookingStatus);

exports.getBookingStatusList = (req, res, next) => {
    req.query.booking = req.params.id;

    next();
};

exports.getAll = factory.getAll(BookingStatus);
