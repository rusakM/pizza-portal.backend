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
    isAvailable: {
        type: Boolean,
        default: true,
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
    isDeactivated: {
        type: Boolean,
        default: false,
    },
});

const Product = new mongoose.model('Product', productSchema);

module.exports = Product;
