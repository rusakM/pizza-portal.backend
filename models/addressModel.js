const mongoose = require('mongoose');
const validator = require('validator');

const zipCodeValidator = new RegExp(/^([0-9]{2})(-[0-9]{3})?$/i);
const cityValidator = new RegExp(/^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/);
const houseNumberValidator = new RegExp(/^\d+[a-zA-Z]*$/);

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Adres musi być przypisany do użytkownika'],
    },
    city: {
        type: String,
        trim: true,
        validate: {
            validator: function (el) {
                return cityValidator.test(el);
            },
            message: 'Podana nazwa miasta jest nieprawidłowa',
        },
        required: [true, 'Należy podać nazwę miasta'],
    },
    zipCode: {
        type: String,
        trim: true,
        required: [true, 'Należy podać kod pocztowy'],
        validate: {
            validator: function (el) {
                return zipCodeValidator.test(el);
            },
            message: 'Podany kod pocztowy jest nieprawidłowy',
        },
    },
    street: {
        type: String,
        required: [true, 'Należy podać nazwę ulicy'],
        trim: true,
        validate: {
            validator: function (el) {
                return cityValidator.test(el);
            },
            message: 'Podana nazwa ulicy jest nieprawidłowa',
        },
    },
    houseNumber: {
        type: String,
        required: [true, 'Należy podać numer domu'],
        trim: true,
        validate: {
            validator: function (el) {
                return houseNumberValidator.test(el);
            },
            message: 'Numer domu jest nieprawidłowy',
        },
    },
    flatNumber: {
        type: Number,
        min: 1,
    },
    phoneNumber: {
        type: String,
        required: [true, 'Należy podać numer telefonu'],
        validate: {
            validator: function (el) {
                return validator.isMobilePhone(el, 'pl-PL');
            },
        },
    },
});

addressSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: '-__v -role -photo',
    });
    next();
});

const Address = new mongoose.model('Address', addressSchema);

module.exports = Address;
