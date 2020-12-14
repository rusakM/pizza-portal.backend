const mongoose = require('mongoose');

const Pizza = require('./pizzaModel');
const Product = require('./productModel');
const PizzaTemplate = require('./pizzaTemplateModel');

const bookingSchema = new mongoose.Schema({
    pizzas: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Pizza',
        },
    ],
    products: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
        },
    ],
    templates: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'PizzaTemplate',
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Zamówienie musi należeć do użytkownika'],
    },
    price: {
        type: Number,
        min: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    paymentMethod: {
        type: String,
        enum: ['gotówka', 'karta'],
        required: [true, 'Należy wybrać metodę płatności'],
    },
    paymentType: {
        type: String,
        enum: ['z góry', 'przy odbiorze'],
        required: [true, 'Należy wybrać typ płatności'],
    },
    paid: {
        type: Boolean,
        default: false,
    },
});

bookingSchema.pre('save', async function (next) {
    const pizzasPromises = this.pizzas.map(async (id) => Pizza.findById(id));
    const productsPromises = this.products.map(async (id) =>
        Product.findById(id)
    );
    const templatePromises = this.templates.map(async (id) =>
        PizzaTemplate.findById(id)
    );
    let price = 0;
    if (pizzasPromises.length) {
        price += await (await Promise.all(pizzasPromises))
            .map((pizza) => pizza.price)
            .reduce((total, val) => total + val);
    }
    if (productsPromises.length) {
        price += await (await Promise.all(productsPromises))
            .map((product) => product.price)
            .reduce((total, val) => total + val);
    }

    if (templatePromises.length) {
        price += await (await Promise.all(templatePromises))
            .map((template) => template.price)
            .reduce((total, val) => total + val);
    }
    this.price = price;
});

bookingSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: '-__v -role -photo',
    })
        .populate({
            path: 'pizzas',
            select: '-__v',
        })
        .populate({
            path: 'products',
            select: '-__v -count -isAwailable',
        })
        .populate({
            path: 'templates',
            select: '-__v -counter',
        });

    next();
});

const Booking = new mongoose.model('Booking', bookingSchema);

module.exports = Booking;
