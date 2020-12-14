const Pizza = require('../models/pizzaModel');
const PizzaTemplate = require('../models/pizzaTemplateModel');
const factory = require('./handlerFactory');

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
