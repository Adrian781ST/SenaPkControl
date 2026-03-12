const db = require("../config/db");

const Vehicle = {
  async create(data) {
    const { idUsuario, placa, tipo, modelo, color, foto } = data;
    const [result] = await db.query(
      `INSERT INTO Vehiculo (IdUsuario, Placa, Tipo, Modelo, Color, FotoVehiculo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [idUsuario, placa, tipo, modelo, color, foto]
    );
    return result.insertId;
  },

  async findByPlaca(placa) {
    const [rows] = await db.query("SELECT * FROM Vehiculo WHERE Placa = ?", [
      placa,
    ]);
    return rows[0];
  },

  async listByUser(idUsuario) {
    const [rows] = await db.query(
      `
    SELECT 
      v.*,
      u.NombreCompleto,
      u.Correo,
      r.NombreRol
    FROM Vehiculo v
    JOIN Usuario u ON v.IdUsuario = u.IdUsuario
    JOIN Rol r ON u.IdRol = r.IdRol
    WHERE v.IdUsuario = ?
  `,
      [idUsuario]
    );
    return rows;
  },
  async getById(id) {
    const [rows] = await db.query(
      "SELECT * FROM Vehiculo WHERE IdVehiculo = ?",
      [id]
    );
    return rows[0];
  },

  async remove(id) {
    await db.query("DELETE FROM Vehiculo WHERE IdVehiculo = ?", [id]);
  },

  // NUEVO: todos los vehículos
  async listAll() {
    const [rows] = await db.query(`
    SELECT 
      v.*,
      u.NombreCompleto,
      u.Correo,
      r.NombreRol
    FROM Vehiculo v
    LEFT JOIN Usuario u ON v.IdUsuario = u.IdUsuario
    LEFT JOIN Rol r ON u.IdRol = r.IdRol
  `);
    return rows;
  },
};

module.exports = Vehicle;
