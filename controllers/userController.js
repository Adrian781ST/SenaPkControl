const User = require('../models/userModel');

const userController = {
  async list(req, res) {
    const rows = await User.list();
    res.json(rows);
  },
  async get(req, res) {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'No encontrado' });
    res.json(user);
  },
  async update(req, res) {
    const id = req.params.id;
    const fields = req.body;
    // prohibir cambiar contraseña por este endpoint (si quieres, hacerlo aparte)
    delete fields.Contrasena;
    await User.update(id, fields);
    res.json({ message: 'Actualizado' });
  },
  async remove(req, res) {
    const id = req.params.id;
    await User.remove(id);
    res.json({ message: 'Eliminado' });
  }
};

module.exports = userController;
