const express = require('express');
const router = express.Router();
const notiCtrl = require('../controllers/notificacionController');
const authenticate = require('../middlewares/auth');

router.get('/user/:userId', authenticate, notiCtrl.listForUser);
router.patch('/:id/read', authenticate, notiCtrl.markRead);

module.exports = router;
