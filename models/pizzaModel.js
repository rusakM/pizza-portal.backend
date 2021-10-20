/* eslint-disable prefer-destructuring */
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

pizzaSchema.pre(/save|findOneAndUpdate/, async function (next) {
    let ingredients = [];
    let size;
    let price;
    let docToUpdate;
    if (this.isNew) {
        ingredients = this.ingredients;
        size = this.size;
        if (!ingredients.length) {
            this.price = calculateSize(this.size);
            return next();
        }
    } else {
        ingredients = this._update.ingredients;
        docToUpdate = await this.model.findOne(this.getFilter());
        size = docToUpdate.size;
    }

    const pricesPromises = ingredients.map(async (id) => Supply.findById(id));
    if (ingredients.length > 0) {
        price =
            (await (await Promise.all(pricesPromises))
                .map((item) => item.price)
                .reduce((total, val) => total + val)) + calculateSize(size);
        price = Math.round(price * 100) / 100;
    } else {
        price = calculateSize(size);
    }

    if (this.isNew) {
        this.price = price;
    } else {
        if (docToUpdate.price !== price) {
            this._update.price = price;
        }
    }

    next();
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
