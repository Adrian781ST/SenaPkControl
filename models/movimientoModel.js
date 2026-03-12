const db = require('../config/db');

const Movimiento = {
  async entrada(idVehiculo) {
    const [result] = await db.query(
      `INSERT INTO Movimiento (IdVehiculo, FechaEntrada, Estado) VALUES (?, NOW(), 'dentro')`,
      [idVehiculo]
    );
    return result.insertId;
  },
  
  async salida(idMovimiento) {
    // set FechaSalida = NOW() and Estado = 'fuera'
    await db.query(`UPDATE Movimiento SET FechaSalida = NOW(), Estado = 'fuera' WHERE IdMovimiento = ?`, [idMovimiento]);
    const [rows] = await db.query(`SELECT * FROM Movimiento WHERE IdMovimiento = ?`, [idMovimiento]);
    return rows[0];
  },
  
  async getActiveByVehicle(idVehiculo) {
    const [rows] = await db.query(
      `SELECT * FROM Movimiento WHERE IdVehiculo = ? AND Estado = 'dentro' ORDER BY FechaEntrada DESC LIMIT 1`, 
      [idVehiculo]
    );
    return rows[0];
  },
  
  async listByDateRange(start, end) {
    const [rows] = await db.query(
      `SELECT m.*, v.Placa, u.NombreCompleto 
       FROM Movimiento m 
       JOIN Vehiculo v ON m.IdVehiculo = v.IdVehiculo 
       JOIN Usuario u ON v.IdUsuario = u.IdUsuario 
       WHERE DATE(FechaEntrada) BETWEEN ? AND ?`,
      [start, end]
    );
    return rows;
  },
  
  // CORRECCIÓN AQUÍ: Agregar JOIN para obtener la placa
    async listAll() {
      const [rows] = await db.query(`
        SELECT 
          v.*, 
          u.NombreCompleto, 
          u.Correo,
          r.NombreRol
        FROM Vehiculo v
        JOIN Usuario u ON v.IdUsuario = u.IdUsuario
        JOIN Rol r ON u.IdRol = r.IdRol
      `);

      return rows;
    },

  // MÉTODO NUEVO: Para obtener vehículos dentro con placa
  async getVehiculosDentro() {
    const [rows] = await db.query(
      `SELECT m.*, v.Placa, v.Tipo, u.NombreCompleto 
       FROM Movimiento m 
       JOIN Vehiculo v ON m.IdVehiculo = v.IdVehiculo 
       JOIN Usuario u ON v.IdUsuario = u.IdUsuario
       WHERE m.Estado = 'dentro'
       ORDER BY m.FechaEntrada ASC`
    );
    return rows;
  }

};

module.exports = Movimiento;