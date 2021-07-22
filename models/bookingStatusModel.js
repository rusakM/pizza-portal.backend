const mongoose = require('mongoose');

const bookingStatusSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.ObjectId,
        ref: 'Booking',
        required: [true, 'Nie podano numeru zamówienia'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    description: {
        type: String,
        required: [true, 'Nie podano opisu do statusu'],
        trim: true,
    },
});

bookingStatusSchema.index({ booking: 1, createdAt: -1 });

const BookingStatus = new mongoose.model('BookingStatus', bookingStatusSchema);

module.exports = BookingStatus;
