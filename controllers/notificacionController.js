const Notificacion = require('../models/notificacionModel');

const notiController = {
  async listForUser(req, res) {
    const idUsuario = req.params.userId || req.user.id;
    const rows = await Notificacion.listForUser(idUsuario);
    res.json(rows);
  },
  async markRead(req, res) {
    const id = req.params.id;
    await Notificacion.markRead(id);
    res.json({ message: 'Leída' });
  }
};

module.exports = notiController;
