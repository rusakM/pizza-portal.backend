const mongoose = require('mongoose');

const pizzaTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nie podano nazwy szablonu'],
    },
    pizzaId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Pizza',
        required: [true, 'Szblon musi być przypisany do istniejącej pizzy'],
    },
    counter: {
        type: Number,
        default: 0,
    },
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
