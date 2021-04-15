const Address = require('../models/addressModel');
const factory = require('./handlerFactory');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getUserAddress = catchAsync(async (req, res, next) => {
    const address = await Address.find({ user: req.user.id });

    if (!address) {
        return next(
            new AppError(
                'Użytkownik nie utworzył jeszcze żadnego adresu dostawy.',
                404
            )
        );
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: address,
        },
    });
});

exports.getAddress = factory.getOne(Address);

exports.createAddress = factory.createOne(Address);

exports.updateAddress = factory.updateOne(Address);

exports.deleteAddress = factory.deleteOne(Address);

exports.tryToSetAsDefault = catchAsync(async (req, res, next) => {
    const { isDefault } = req.body;
    if (req.method === 'PATCH' && !isDefault) {
        return next();
    }

    const addresses = await Address.find({ user: req.user._id });
    if (req.method === 'PATCH' && !addresses) {
        return next(
            new AppError('Wystąpił błąd podczas zmiany użytkownika', 404)
        );
    }

    if (!addresses) {
        req.body.isDefault = true;
        return next();
    }

    if (isDefault) {
        await Address.updateMany(
            { user: req.user.id },
            { $set: { isDefault: false } }
        );
    }

    next();
});
