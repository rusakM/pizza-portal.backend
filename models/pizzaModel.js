const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        size: {
            type: Number,
            enum: [24, 32, 42],
            default: 24,
        },
        ingredients: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Supply',
            },
        ],
        price: {
            type: Number,
            min: 0,
        },
        status: {
            type: String,
            enum: ['zamówiona', 'w przygotowaniu', 'w piekarniku', 'gotowa'],
            default: 'zamówiona',
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
    },
    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

pizzaSchema.pre(/^find/, async function (next) {
    this.populate({
        path: 'ingredients',
        select: '-__v -count -isAvailable',
    });

    next();
});

const Pizza = new mongoose.model('Pizza', pizzaSchema);

module.exports = Pizza;
