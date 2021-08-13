const Pizza = require('../models/pizzaModel');
const PizzaTemplate = require('../models/pizzaTemplateModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const photoSaver = require('../utils/photoSaver');
const AppError = require('../utils/appError');

exports.createNewPizza = factory.createOne(Pizza);

exports.getAllPizzas = factory.getAll(Pizza);

exports.getOnePizza = factory.getOne(Pizza, { path: 'supplies' });

exports.updatePizza = factory.updateOne(Pizza);

exports.deletePizza = factory.deleteOne(Pizza);

exports.createPizzaTemplate = factory.createOne(PizzaTemplate);

exports.getPizzaTemplate = factory.getOne(PizzaTemplate);

exports.getAllTemplates = factory.getAll(PizzaTemplate);

exports.updatePizzaTemplate = factory.updateOne(PizzaTemplate);

exports.deletePizzaTemplate = factory.deleteOne(PizzaTemplate);

exports.uploadPhoto = photoSaver.uploadPhoto('coverPhoto');

exports.resizePhoto = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    await photoSaver.resizePhoto(
        req.file,
        'pizza',
        600,
        600,
        `${process.cwd()}/uploads/pizzas`,
        'png'
    );
    req.body.coverPhoto = req.file.filename;
    next();
});

exports.getTop3Pizzas = (req, res, next) => {
    req.query.limit = 3;
    req.query.sort = '-counter';
    next();
};

exports.createAndPopulatePizza = catchAsync(async (req, res, next) => {
    const newPizza = await Pizza.create(req.body);
    if (!newPizza) {
        return next(new AppError('Nie można utworzyć pizzy', 404));
    }

    const populatedPizza = await Pizza.findById(newPizza._id);

    if (!populatedPizza) {
        return next(new AppError('Nie znaleziono pizy', 404));
    }

    res.status(201).json({
        status: 'success',
        data: {
            data: populatedPizza,
        },
    });
});
