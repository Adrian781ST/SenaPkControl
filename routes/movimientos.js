const express = require('express');
const router = express.Router();
const movCtrl = require('../controllers/movimientoController');
const authenticate = require('../middlewares/auth');
const permit = require('../middlewares/roles');

// Registrar entrada (solo admin y vigilante)
router.post(
  '/entrada',
  authenticate,
  permit('Administrador', 1, 'Vigilante', 5),
  movCtrl.entrada
);

// Registrar salida (solo admin y vigilante)
router.post(
  '/salida',
  authenticate,
  permit('Administrador', 1, 'Vigilante', 5),
  movCtrl.salida
);

// Ruta PUT para salida por ID (agregada para el frontend)
router.put(
  '/:id/salida',
  authenticate,
  permit('Administrador', 1, 'Vigilante', 5),
  async (req, res) => {
    try {
      const movCtrl = require('../controllers/movimientoController');
      const Movimiento = require('../models/movimientoModel');
      const Vehicle = require('../models/vehicleModel');
      const Notificacion = require('../models/notificacionModel');
      
      const idMovimiento = req.params.id;
      const mov = await Movimiento.salida(idMovimiento);
      
      const veh = await Vehicle.getById(mov.IdVehiculo);
      if (veh) {
        await Notificacion.create(veh.IdUsuario, `Salida registrada para la placa ${veh.Placa}`);
      }
      
      res.json({ message: 'Salida registrada', movimiento: mov });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error' });
    }
  }
);

// Rango de fechas (todos pueden ver)
router.get('/range', authenticate, movCtrl.listByRange);

// Listar todos los movimientos (solo admin y vigilante)
router.get('/', authenticate, permit('Administrador', 1, 'Vigilante', 5), movCtrl.listAll);

// Vehículos dentro (solo admin y vigilante)
router.get('/dentro', authenticate, permit('Administrador', 1, 'Vigilante', 5), movCtrl.vehiculosDentro);

module.exports = router;
