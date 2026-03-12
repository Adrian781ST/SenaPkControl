const db = require('../config/db');

const Notificacion = {
  async create(idUsuario, mensaje) {
    const [result] = await db.query(`INSERT INTO Notificacion (IdUsuario, Mensaje) VALUES (?, ?)`, [idUsuario, mensaje]);
    return result.insertId;
  },
  async listForUser(idUsuario) {
    const [rows] = await db.query(`SELECT * FROM Notificacion WHERE IdUsuario = ? ORDER BY Fecha DESC`, [idUsuario]);
    return rows;
  },
  async markRead(idNotificacion) {
    await db.query(`UPDATE Notificacion SET Leido = 1 WHERE IdNotificacion = ?`, [idNotificacion]);
  }
};

module.exports = Notificacion;
