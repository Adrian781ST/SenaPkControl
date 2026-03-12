const Reporte = require('../models/reporteModel');

const reporteController = {
  async createAndGenerate(req, res) {
    const { fechaInicio, fechaFin, tipoVehiculo } = req.body;
    const idReporte = await Reporte.create({ idUsuario: req.user.id, fechaInicio, fechaFin, tipoVehiculo });
    const data = await Reporte.generate(fechaInicio, fechaFin, tipoVehiculo);
    res.json({ idReporte, data });
  },
  async generateOnly(req, res) {
    const { fechaInicio, fechaFin, tipoVehiculo } = req.query;
    const data = await Reporte.generate(fechaInicio, fechaFin, tipoVehiculo || 'todos');
    res.json(data);
  }
};

module.exports = reporteController;
