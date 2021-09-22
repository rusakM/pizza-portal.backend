const mongoose = require('mongoose');
const validator = require('validator');

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nie podano imienia'],
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        required: [true, 'Nie podano adresu email'],
        validate: [validator.isEmail, 'Niepoprawny adres email'],
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    message: {
        type: String,
        required: [true, 'Nie podano treści wiadomości'],
        trim: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    isReplied: {
        type: Boolean,
        default: false,
    },
    createdAt: Date,
    readAt: Date,
    repliedAt: Date,
    reply: String,
});

messageSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdAt = Date.now();
    }

    next();
});

const messageModel = new mongoose.model('Message', messageSchema);

module.exports = messageModel;
