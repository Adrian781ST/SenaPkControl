const db = require('../config/db');

const Reporte = {
  async create(data) {
    const { idUsuario, fechaInicio, fechaFin, tipoVehiculo } = data;
    const [result] = await db.query(`INSERT INTO Reporte (IdUsuario, FechaInicio, FechaFin, TipoVehiculo) VALUES (?, ?, ?, ?)`, [idUsuario, fechaInicio, fechaFin, tipoVehiculo]);
    return result.insertId;
  },
  async generate(fechaInicio, fechaFin, tipoVehiculo) {
    // ejemplo: conteo de movimientos por tipo de vehículo
    let sql = `SELECT v.Tipo, COUNT(*) as total, DATE(m.FechaEntrada) as fecha FROM Movimiento m JOIN Vehiculo v ON m.IdVehiculo = v.IdVehiculo WHERE DATE(m.FechaEntrada) BETWEEN ? AND ?`;
    const params = [fechaInicio, fechaFin];
    if (tipoVehiculo && tipoVehiculo !== 'todos') {
      sql += ` AND v.Tipo = ?`;
      params.push(tipoVehiculo);
    }
    sql += ` GROUP BY DATE(m.FechaEntrada), v.Tipo ORDER BY DATE(m.FechaEntrada)`;
    const [rows] = await db.query(sql, params);
    return rows;
  }
};

module.exports = Reporte;
