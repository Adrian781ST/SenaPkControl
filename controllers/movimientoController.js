const Movimiento = require('../models/movimientoModel');
const Vehicle = require('../models/vehicleModel');
const Notificacion = require('../models/notificacionModel');

const movimientoController = {
  async entrada(req, res) {
    try {
      const { idVehiculo } = req.body;
      const veh = await Vehicle.getById(idVehiculo);
      if (!veh) return res.status(404).json({ message: 'Vehículo no encontrado' });

      const active = await Movimiento.getActiveByVehicle(idVehiculo);
      if (active) return res.status(400).json({ message: 'Vehículo ya dentro' });

      const id = await Movimiento.entrada(idVehiculo);
      await Notificacion.create(veh.IdUsuario, `Ingreso registrado para la placa ${veh.Placa}`);

      res.json({ 
        message: 'Entrada registrada', 
        id,
        placa: veh.Placa  // Enviamos la placa en la respuesta
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error' });
    }
  },

  async salida(req, res) {
    try {
      const { idMovimiento, placa } = req.body;

      if (idMovimiento) {
        const mov = await Movimiento.salida(idMovimiento);
        return res.json({ message: 'Salida registrada', movimiento: mov });
      }

      if (placa) {
        const veh = await Vehicle.findByPlaca(placa);
        if (!veh) return res.status(404).json({ message: 'Placa no encontrada' });

        const active = await Movimiento.getActiveByVehicle(veh.IdVehiculo);
        if (!active) return res.status(400).json({ message: 'No hay registro de entrada activo' });

        const mov = await Movimiento.salida(active.IdMovimiento);
        await Notificacion.create(veh.IdUsuario, `Salida registrada para la placa ${veh.Placa}`);

        return res.json({ 
          message: 'Salida registrada', 
          movimiento: mov,
          placa: veh.Placa  // Enviamos la placa en la respuesta
        });
      }

      res.status(400).json({ message: 'Falta idMovimiento o placa' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error' });
    }
  },

  async listByRange(req, res) {
    const { start, end } = req.query;
    const rows = await Movimiento.listByDateRange(start, end);
    res.json(rows);
  },

  // CORREGIDO: Ahora incluye la placa
  async listAll(req, res) {
    const rows = await Movimiento.listAll();
    res.json(rows);
  },

  // NUEVO: Endpoint para vehículos dentro
  async vehiculosDentro(req, res) {
    const rows = await Movimiento.getVehiculosDentro();
    res.json(rows);
  }
};

module.exports = movimientoController;