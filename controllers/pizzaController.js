/* eslint-disable no-await-in-loop */
const Pizza = require('../models/pizzaModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Supply = require('../models/supplyModel');

exports.createNewPizza = catchAsync(async (req, res, next) => {
    const newDoc = await Pizza.create(req.body);
    if (req.body.ingredients.length) {
        for (let i = 0; i < req.body.ingredients.length; i++) {
            let item = req.body.ingredients[i];
            let supply = await Supply.findById(item);
            await supply.decrementCount();
            await supply.save({ validateBeforeSave: false });
        }
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: newDoc,
        },
    });
});

exports.getAllPizzas = factory.getAll(Pizza);

exports.getOnePizza = factory.getOne(Pizza, { path: 'supplies' });

exports.updatePizza = factory.updateOne(Pizza);

exports.deletePizza = factory.deleteOne(Pizza);

exports.updateStatus = (req, res, next) => {
    let { status } = req.params;
    switch (status * 1) {
        case 0:
            status = 'zamówiona';
            break;
        case 1:
            status = 'w przygotowaniu';
            break;
        case 2:
            status = 'w piekarniku';
            break;
        case 3:
            status = 'gotowa';
            break;
        default:
            return next(new AppError('Nieprawidłowy status zamówienia', 404));
    }
    req.body = {
        status,
    };
    next();
};

exports.updatePaymentStatus = (req, res, next) => {
    let { status } = req.params;
    if (status * 1 === 1) {
        status = true;
    } else {
        status = false;
    }
    req.body = {
        status,
    };
    next();
};
