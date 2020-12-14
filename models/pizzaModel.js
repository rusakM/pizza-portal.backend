const mongoose = require('mongoose');
const Supply = require('./supplyModel');

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

const calculateSize = (size) => {
    switch (size) {
        case 24:
            return 15;
        case 32:
            return 19;
        case 42:
            return 23;
        default:
            return 15;
    }
};

pizzaSchema.pre('save', async function (next) {
    if (!this.ingredients.length) {
        this.price = calculateSize(this.size);
        return next();
    }
    const pricesPromises = this.ingredients.map(async (id) =>
        Supply.findById(id)
    );
    const price =
        (await (await Promise.all(pricesPromises))
            .map((item) => item.price)
            .reduce((total, val) => total + val)) + calculateSize(this.size);

    this.price = price;
});

pizzaSchema.pre(/^find/, async function (next) {
    this.populate({
        path: 'ingredients',
        select: '-__v -count -isAvailable',
    });

    next();
});

const Pizza = new mongoose.model('Pizza', pizzaSchema);

module.exports = Pizza;
