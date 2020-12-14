const mongoose = require('mongoose');

const supplySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Podaj nazwę składnika'],
        unique: true,
        trim: true,
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

const Supply = new mongoose.model('Supply', supplySchema);

module.exports = Supply;
