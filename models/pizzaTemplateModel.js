const mongoose = require('mongoose');

const Pizza = require('./pizzaModel');

const pizzaTemplateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Nie podano nazwy szablonu'],
        },
        pizza: {
            type: mongoose.Schema.ObjectId,
            ref: 'Pizza',
            required: [true, 'Szblon musi być przypisany do istniejącej pizzy'],
        },
        counter: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            min: 0,
        },
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
    const pizza = await Pizza.findById(this.pizza);
    this.price = pizza.price;
});

pizzaTemplateSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'pizza',
        select: '-__v',
    });
    next();
});

pizzaTemplateSchema.methods.incrementCounter = function () {
    this.counter += 1;
};

const PizzaTemplate = new mongoose.model('PizzaTemplate', pizzaTemplateSchema);

module.exports = PizzaTemplate;
