const express = require('express');
const supplyController = require('../controllers/supplyController');
const authControler = require('../controllers/authController');

const router = express.Router();

router.get('/', supplyController.getAllSupplies);

router.get('/:id', supplyController.getSupply);

router.use(authControler.protect, authControler.restrictTo('admin', 'kucharz'));

router.post(supplyController.createNewSupply);

router
    .route('/:id')
    .patch(
        supplyController.uploadPhoto,
        supplyController.resizePhoto,
        supplyController.updateSupply
    )
    .delete(supplyController.deleteSupply);

module.exports = router;
