const express = require('express');
const pizzaController = require('../controllers/pizzaController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
    .route('/')
    .get(pizzaController.getAllPizzas)
    .post(pizzaController.createNewPizza);

router
    .route('/:id')
    .get(pizzaController.getOnePizza)
    .patch(pizzaController.updatePizza)
    .delete(pizzaController.deletePizza);

router
    .route('/:id/:status')
    .patch(pizzaController.updateStatus, pizzaController.updatePizza);

module.exports = router;
