const Message = require('../models/messageModel');
const factory = require('./handlerFactory');
//const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getMessage = factory.getOne(Message);

exports.getAllMessages = factory.getAll(Message);

exports.updateMessage = factory.updateOne(Message);

exports.deleteMessage = factory.deleteOne(Message);

exports.saveMessage = factory.createOne(Message);

exports.markMessage = (field) => {
    return (req, res, next) => {
        if (field !== 'isRead' && field !== 'isReplied') {
            console.log(field);
            return next(new AppError('Błąd oznaczania wiadomosci', 404));
        }
        req.body = {
            [field]: true,
        };
        next();
    };
};
