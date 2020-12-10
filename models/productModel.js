const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nie podano nazwy produktu'],
    },
    price: {
        type: Number,
        required: [true, 'Nie podano ceny produktu'],
        min: 0,
    },
    count: {
        type: Number,
        min: 0,
        default: 0,
    },
    isAvailable: {
        type: Boolean,
        default: function () {
            return this.count > 0;
        },
        select: false,
    },
    coverPhoto: {
        type: String,
        default: 'default.jpg',
    },
    category: {
        type: String,
        enum: ['Napoje', 'Sosy', 'Słodycze', 'Inne produkty'],
        default: 'Inne produkty',
    },
    adultRequired: {
        type: Boolean,
        default: false,
    },
});

// this function will switch availbility indicator for this product
productSchema.pre('save', function (next) {
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

productSchema.methods.decrementCount = function () {
    this.count -= 1;
};

const Product = new mongoose.model('Product', productSchema);

module.exports = Product;
