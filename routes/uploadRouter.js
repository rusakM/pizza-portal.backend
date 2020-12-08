const { Router } = require('express');
const uploadController = require('../controllers/uploadsController');

const router = Router();

router.route('/:filename').get(uploadController.getFile);

module.exports = router;
