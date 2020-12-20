const Pizza = require('../models/pizzaModel');
const PizzaTemplate = require('../models/pizzaTemplateModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const photoSaver = require('../utils/photoSaver');

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
