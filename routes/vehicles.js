const express = require('express');
const router = express.Router();
const vehicleCtrl = require('../controllers/vehicleController');
const authenticate = require('../middlewares/auth');
const permit = require('../middlewares/roles');

// Crear vehículo
router.post('/', authenticate, vehicleCtrl.create);

// Buscar vehículo por placa
router.get('/placa/:placa', authenticate, vehicleCtrl.findByPlaca);

// Vehículos del usuario autenticado
router.get('/user', authenticate, vehicleCtrl.listByUser);

// NUEVO: Listar todos los vehículos (solo admin y vigilante)
router.get('/', authenticate, permit('Administrador', 1, 'Vigilante', 5), vehicleCtrl.listAll);


// Eliminar vehículo
router.delete('/:id', authenticate, vehicleCtrl.remove);

module.exports = router;
