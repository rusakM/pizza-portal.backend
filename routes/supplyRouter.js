const express = require('express');
const supplyController = require('../controllers/supplyController');

const router = express.Router();

router
    .route('/')
    .get(supplyController.getAllSupplies)
    .post(supplyController.createNewSupply);

router
    .route('/:id')
    .get(supplyController.getSupply)
    .patch(
        supplyController.uploadPhoto,
        supplyController.resizePhoto,
        supplyController.updateSupply
    )
    .delete(supplyController.deleteSupply);

module.exports = router;
