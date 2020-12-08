const mongoose = require('mongoose');

const supplySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Podaj nazwę składnika'],
        unique: true,
        trim: true,
    },
    count: {
        type: Number,
        default: 0,
        min: 0,
    },
    price: {
        type: Number,
        required: [true, 'Podaj cenę składnika'],
        min: 0,
    },
    isAwailable: {
        type: Boolean,
        default: true,
        select: false,
    },
    coverPhoto: {
        type: String,
        default: 'default.jpg',
    },
});

// this function will switch availbility indicator for this supply
supplySchema.pre('save', function (next) {
    if (!this.isModified('count')) {
        return next();
    }
    if (this.count === 0 && this.isAwailable) {
        this.isAwailable = false;
    }
    if (this.count > 0 && !this.isAwailable) {
        this.isAwailable = true;
    }
    next();
});

supplySchema.methods.decrementCount = function () {
    this.count -= 1;
};

const Supply = new mongoose.model('Supply', supplySchema);

module.exports = Supply;
