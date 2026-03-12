const express = require('express');
const router = express.Router();
const repCtrl = require('../controllers/reporteController');
const authenticate = require('../middlewares/auth');

router.post('/', authenticate, repCtrl.createAndGenerate);
router.get('/', authenticate, repCtrl.generateOnly);

module.exports = router;
