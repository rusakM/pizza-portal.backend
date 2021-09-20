const mongoose = require('mongoose');
const BookingStatus = require('../models/bookingStatusModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createStatus = factory.createOne(BookingStatus);

exports.getStatus = factory.getOne(BookingStatus);

exports.deleteStatus = factory.deleteOne(BookingStatus);

exports.getBookingStatusList = (req, res, next) => {
    req.query.booking = req.params.id;

    next();
};

exports.rewriteBookingId = (req, res, next) => {
    req.body.booking = req.params.id;

    next();
};

exports.checkIfExist = catchAsync(async (req, res, next) => {
    const bookingStatus = await BookingStatus.find({
        booking: new mongoose.Types.ObjectId(req.params.id),
        description: req.body.description,
    });

    if (bookingStatus.length === 0) {
        return next();
    }

    next(
        new AppError(
            'Nie można ustawić tego statusu dla zamówienia po raz kolejny',
            404
        )
    );
});

exports.getByOrder = catchAsync(async (req, res, next) => {
    const bookingStatus = await BookingStatus.find({
        booking: new mongoose.Types.ObjectId(req.params.id),
        description: req.body.description,
    });

    res.status(200).json(bookingStatus);
});

exports.getAll = factory.getAll(BookingStatus);
