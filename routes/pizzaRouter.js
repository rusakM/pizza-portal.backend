const express = require('express');
const pizzaController = require('../controllers/pizzaController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/templates', pizzaController.getAllTemplates);
router.get('/templates/:id', pizzaController.getPizzaTemplate);

router.use(authController.protect);

router
    .route('/myPizzas')
    .get(pizzaController.getAllPizzas)
    .post(pizzaController.createNewPizza);

router
    .route('/:id')
    .get(pizzaController.getOnePizza)
    .patch(pizzaController.updatePizza)
    .delete(pizzaController.deletePizza);

router.use(authController.restrictTo('kucharz', 'admin'));

router.get('/', pizzaController.getAllPizzas);

router.post('/templates', pizzaController.createPizzaTemplate);

router
    .route('/templates/:id')
    .patch(pizzaController.updatePizzaTemplate)
    .delete(pizzaController.deletePizzaTemplate);

module.exports = router;
