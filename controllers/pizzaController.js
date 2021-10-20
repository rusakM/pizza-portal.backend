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

exports.createPizzasForTemplate = catchAsync(async (req, res, next) => {
    const ingredients = req.body.ingredients
        ? req.body.ingredients.split(',')
        : [];

    const pizzaData = {
        ingredients,
        user: req.body.user,
    };

    const smallPizza = await Pizza.create({ ...pizzaData, size: 24 });
    const mediumPizza = await Pizza.create({ ...pizzaData, size: 32 });
    const largePizza = await Pizza.create({ ...pizzaData, size: 42 });

    req.body.smallPizza = smallPizza._id;
    req.body.mediumPizza = mediumPizza._id;
    req.body.largePizza = largePizza._id;

    next();
});

exports.updatePizzasForTemplate = catchAsync(async (req, res, next) => {
    let template = await PizzaTemplate.findById(req.params.id);
    if (!template) {
        return next(new AppError('Podany szablon pizzy nie istnieje', 404));
    }
    template = template.toObject();
    let { ingredients } = req.body;

    if (ingredients !== undefined) {
        if (ingredients === '') {
            ingredients = [];
        } else {
            ingredients = ingredients.split(',');
        }
        await Pizza.findByIdAndUpdate(template.smallPizza._id, { ingredients });
        await Pizza.findByIdAndUpdate(template.mediumPizza._id, {
            ingredients,
        });
        await Pizza.findByIdAndUpdate(template.largePizza._id, { ingredients });
    }

    next();
});

exports.toggleActivationTemplateStatus = catchAsync(async (req, res, next) => {
    const template = await PizzaTemplate.findById(req.params.id);
    if (!template) {
        return next(new AppError('Podany szblon pizzy nie istnieje', 404));
    }
    req.body = {};
    req.body.isDeactivated = !template.isDeactivated;

    next();
});
