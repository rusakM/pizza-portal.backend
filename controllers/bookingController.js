const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

exports.newBooking = catchAsync(async (req, res, next) => {
    const booking = await Booking.create(req.body);

    if (req.user.role === 'użytkownik') {
        const url = `${req.protocol}://${req
            .get('host')
            .replace(
                `:${process.env.PORT}`,
                `:${process.env.WEBPAGE_PORT}`
            )}/myBookings`;
        const backendUrl = `${req.protocol}://${req.get('host')}`;
        await new Email(req.user, url, backendUrl).sendBooking();
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: booking,
        },
    });
});
