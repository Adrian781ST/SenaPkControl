const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const db = require('../config/db');

const dotenv = require('dotenv');
dotenv.config();

const authController = {
  async register(req, res) {
    try {
      const { idRol, nombreCompleto, documento, correo, telefono, contrasena } = req.body;
      const exists = await User.findByEmail(correo);
      if (exists) return res.status(400).json({ message: 'Correo ya registrado' });
      const hashed = await bcrypt.hash(contrasena, 10);
      const newId = await User.create({ idRol, nombreCompleto, documento, correo, telefono, contrasena: hashed });
      const user = await User.findById(newId);
      res.status(201).json({ message: 'Usuario creado', user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error en registro' });
    }
  },
  async login(req, res) {
    try {
      const { correo, contrasena } = req.body;
      console.log('Login attempt:', correo);
      const user = await User.findByEmail(correo);
      console.log('User found:', user);
      if (!user) return res.status(400).json({ message: 'Credenciales inválidas' });
      
      // Aceptar contraseña en texto plano O hash bcrypt
      let ok = false;
      if (!user.Contrasena) {
        return res.status(400).json({ message: 'Usuario sin contraseña configurada' });
      }
      if (user.Contrasena.startsWith('$2')) {
        // Es un hash bcrypt
        ok = await bcrypt.compare(contrasena, user.Contrasena);
      } else {
        // Es texto plano
        ok = (contrasena === user.Contrasena);
      }
      
      console.log('Password valid:', ok);
      if (!ok) return res.status(400).json({ message: 'Credenciales inválidas' });
      const payload = { id: user.IdUsuario, idRol: user.IdRol, correo: user.Correo, nombre: user.NombreCompleto, idRolName: user.NombreRol };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
      res.json({ token, user: payload });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Error en login' });
    }
  }
};

module.exports = authController;
