const Message = require('../models/messageModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');

exports.getMessage = factory.getOne(Message);

exports.getAllMessages = factory.getAll(Message);

exports.updateMessage = factory.updateOne(Message);

exports.deleteMessage = factory.deleteOne(Message);

exports.saveMessage = factory.createOne(Message);

exports.emitMessageToSockets = (req, res, next) => {
    req.app.get('io').emit('message', req.body);

    next();
};

exports.readMessage = (req, res, next) => {
    req.body = {
        isRead: true,
        readAt: Date.now(),
    };
    next();
};

exports.setReply = catchAsync(async (req, res, next) => {
    req.body.repliedAt = Date.now();
    req.body.isReplied = true;

    let message = await Message.findById(req.params.id);

    if (!message) {
        return next(new AppError('Nie udało się znaleźć wiadomości', 404));
    }

    message = message.toObject();
    const backendUrl = `${req.protocol}://${req.get('host')}`;

    await new Email(
        {
            email: message.email,
            name: message.name,
        },
        null,
        backendUrl
    ).sendMessageReply(req.body.reply);

    next();
});
