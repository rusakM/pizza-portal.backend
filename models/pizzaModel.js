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
        createdAt: {
            type: Date,
            default: Date.now(),
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
