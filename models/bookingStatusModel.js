const mongoose = require('mongoose');

const bookingStatusSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.ObjectId,
        ref: 'Booking',
        required: [true, 'Nie podano numeru zamówienia'],
    },
    createdAt: {
        type: Date,
    },
    description: {
        type: String,
        required: [true, 'Nie podano opisu do statusu'],
        trim: true,
    },
});

bookingStatusSchema.index({ booking: 1, createdAt: -1 });

bookingStatusSchema.pre('save', function (next) {
    this.createdAt = Date.now();

    next();
});

const BookingStatus = new mongoose.model('BookingStatus', bookingStatusSchema);

module.exports = BookingStatus;
