const mongoose = require('mongoose');
const slugify = require('slugify');

const Pizza = require('./pizzaModel');

const pizzaTemplateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Nie podano nazwy szablonu'],
        },
        smallPizza: {
            type: mongoose.Schema.ObjectId,
            ref: 'Pizza',
        },
        mediumPizza: {
            type: mongoose.Schema.ObjectId,
            ref: 'Pizza',
        },
        largePizza: {
            type: mongoose.Schema.ObjectId,
            ref: 'Pizza',
        },
        counter: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            min: 0,
        },
        coverPhoto: String,
        slug: String,
    },
    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

pizzaTemplateSchema.pre('save', async function (next) {
    const pizza = await Pizza.findById(this.smallPizza);
    this.price = pizza.price;
    this.slug = slugify(this.name, { lower: true });
});

pizzaTemplateSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'smallPizza',
        select: '-__v',
    })
        .populate({
            path: 'mediumPizza',
            select: '-__v',
        })
        .populate({
            path: 'largePizza',
            select: '-__v',
        });
    next();
});

pizzaTemplateSchema.methods.incrementCounter = function () {
    this.counter += 1;
};

const PizzaTemplate = new mongoose.model('PizzaTemplate', pizzaTemplateSchema);

module.exports = PizzaTemplate;
