const db = require('../config/db');

const User = {
  async findByEmail(correo) {
    const [rows] = await db.query(`
      SELECT u.*, r.NombreRol 
      FROM Usuario u
      JOIN Rol r ON u.IdRol = r.IdRol
      WHERE u.Correo = ?
    `, [correo]);

    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.query('SELECT u.*, r.NombreRol FROM Usuario u JOIN Rol r ON u.IdRol = r.IdRol WHERE IdUsuario = ?', [id]);
    return rows[0];
  },
  
  async create(user) {
    const { idRol, nombreCompleto, documento, correo, telefono, contrasena } = user;
    const [result] = await db.query(
      `INSERT INTO Usuario (IdRol, NombreCompleto, Documento, Correo, Telefono, Contrasena)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [idRol || null, nombreCompleto || '', documento || '', correo || '', telefono || '', contrasena || '']
    );
    // Para SQLite, obtener el último ID insertado
    const [lastId] = await db.query('SELECT last_insert_rowid() as insertId');
    return lastId[0] ? lastId[0].insertId : 0;
  },
  async list() {
    const [rows] = await db.query('SELECT u.*, r.NombreRol FROM Usuario u JOIN Rol r ON u.IdRol = r.IdRol');
    return rows;
  },
  async update(id, fields) {
    const set = [];
    const params = [];
    for (const key in fields) {
      if (fields[key] !== undefined) {
        set.push(`${key} = ?`);
        params.push(fields[key]);
      }
    }
    if (set.length === 0) return;
    params.push(id);
    const sql = `UPDATE Usuario SET ${set.join(', ')} WHERE IdUsuario = ?`;
    await db.query(sql, params);
  },
  async remove(id) {
    await db.query('DELETE FROM Usuario WHERE IdUsuario = ?', [id]);
  }
};

module.exports = User;
