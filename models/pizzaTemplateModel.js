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
        isDeactivated: {
            type: Boolean,
            default: false,
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

pizzaTemplateSchema.pre(/save|findOneAndUpdate/, async function (next) {
    if (this.isNew) {
        const pizza = await Pizza.findById(this.smallPizza);
        this.price = pizza.price;
        this.slug = slugify(this.name, { lower: true });
    } else {
        const docToUpdate = await this.model.findOne(this.getFilter());
        const pizza = await Pizza.findById(docToUpdate.smallPizza);
        this._update.price = pizza.price;
        if (this._update.name) {
            this._update.slug = slugify(this._update.name, { lower: true });
        }
    }

    next();
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
