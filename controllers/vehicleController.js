const Vehicle = require('../models/vehicleModel');

const vehicleController = {
  async create(req, res) {
    const data = req.body;
    const exists = await Vehicle.findByPlaca(data.placa);
    if (exists) return res.status(400).json({ message: 'Placa ya registrada' });

    const id = await Vehicle.create({
      idUsuario: data.idUsuario || req.user.id,
      placa: data.placa,
      tipo: data.tipo,
      modelo: data.modelo,
      color: data.color,
      foto: data.foto || null
    });

    res.status(201).json({ message: 'Vehículo registrado', id });
  },

  async findByPlaca(req, res) {
    const placa = req.params.placa;
    const vehicle = await Vehicle.findByPlaca(placa);
    if (!vehicle) return res.status(404).json({ message: 'Vehículo no encontrado' });
    res.json(vehicle);
  },

  async listByUser(req, res) {
    const idUsuario = req.user.id;
    const vehicles = await Vehicle.listByUser(idUsuario);
    res.json(vehicles);
  },

  // NUEVO → Listar TODOS los vehículos (admin)
  async listAll(req, res) {
    const rows = await Vehicle.listAll();
    res.json(rows);
  },

  async remove(req, res) {
    const id = req.params.id;
    await Vehicle.remove(id);
    res.json({ message: 'Vehículo eliminado' });
  }
};

module.exports = vehicleController;
