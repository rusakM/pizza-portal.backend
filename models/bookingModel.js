const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    pizzas: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Pizza',
        },
    ],
    products: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Zamówienie musi należeć do użytkownika'],
    },
    price: {
        type: Number,
        required: [true, 'Zamówienie musi mieć cenę'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    paymentMethod: {
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
    this.populate({
        path: 'user',
        select: '-__v -role -photo',
    })
        .populate({
            path: 'pizza',
            select: '-__v',
        })
        .populate({
            path: 'products',
            select: '-__v -count -isAwailable',
        });

    next();
});

const Booking = new mongoose.model('Booking', bookingSchema);

module.exports = Booking;
