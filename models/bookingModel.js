const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    pizzas: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Pizza',
            required: [true, 'Zamówienie musi mieć przynajmniej jedną pizzę'],
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: [true, 'Zamówienie musi należeć do użytkownika'],
    },
    price: {
        type: Number,
        required: [true, 'Zamówienie musi mieć cenę'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    paimentMethod: {
        type: String,
        enum: ['gotówka', 'karta'],
        required: [true, 'Należy wybrać metodę płatności'],
    },
    paymentType: {
        type: String,
        enum: ['z góry', 'przy odbiorze'],
        required: [true, 'Należy wybrać typ płatności'],
    },
    paid: {
        type: Boolean,
        default: false,
    },
});

bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'pizza',
        select: '-__v',
    });

    next();
});

const Booking = new mongoose.model('Booking', bookingSchema);

module.exports = Booking;
