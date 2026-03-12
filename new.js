Hola estoy creando un sistema de parqueadero que esta funcionando corerctamente, backend como api y frontend, lo que quiero es que en el componente de movimientos pues solo los administradores y vigilantes puedan editar las entradas y salidas y los roles aprendiz, instructor y visitante solo puedan ver sus movimientos sin poder editar, entonces te voy a pasar el frontend y luego el backend para que verifiques y me puedas cuadrar lo que necesito


import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { getToken } from '../services/auth'
import jwt_decode from "jwt-decode"

export default function MovimientosPage() {

  const [placa, setPlaca] = useState('')
  const [movimientos, setMovimientos] = useState([])

  // Obtener rol del token
  const token = getToken()
  let user = null
  if (token) {
    try {
      user = jwt_decode(token)
    } catch (err) {
      console.error("Token inválido", err)
    }
  }

  const canEdit = user?.idRolName === "Administrador" || user?.idRolName === "Vigilante"
  const isBasicRole = ["Aprendiz", "Instructor", "Visitante"].includes(user?.idRolName)

  async function entrada() {
    try {
      const v = await api.request('/vehicles/user/' + '', { method: 'GET' })
      const found = v.find(x => x.Placa === placa)
      if (!found) return alert('Placa no encontrada entre sus vehículos')
      await api.request('/movimientos/entrada', { method: 'POST', body: { idVehiculo: found.IdVehiculo } })
      alert('Entrada registrada')
      loadRange()
    } catch (err) { alert(err.message) }
  }

  async function salida() {
    try {
      await api.request('/movimientos/salida', { method: 'POST', body: { placa } })
      alert('Salida registrada')
      loadRange()
    } catch (err) { alert(err.message) }
  }

  async function loadRange() {
    try {
      const data = await api.request('/movimientos/range?start=' + new Date().toISOString().slice(0, 10) + '&end=' + new Date().toISOString().slice(0, 10), { method: 'GET' })
      setMovimientos(data)
    } catch (err) { console.error(err) }
  }

  useEffect(() => { loadRange() }, [])

  return (
    <div className="container">
      <h1>Movimientos</h1>

      {/* SOLO ADMIN/VIGILANTE PUEDEN EDITAR */}
      {canEdit && (
        <div className="card">
          <label>Placa</label>
          <input value={placa} onChange={e => setPlaca(e.target.value.toUpperCase())} />

          <div className="row">
            <button className="btn" onClick={entrada}>Registrar entrada</button>
            <button className="btn outline" onClick={salida}>Registrar salida</button>
          </div>
        </div>
      )}

      {/* SOLO APRENDIZ/INSTRUCTOR/VISITANTE → mensaje informativo */}
      {isBasicRole && (
        <div className="alert info">
          Solo puedes visualizar tus movimientos. Para registrar entrada/salida debe hacerlo un vigilante.
        </div>
      )}

      <h2>Movimientos (hoy)</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Placa</th>
            <th>Entrada</th>
            <th>Salida</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map(m => (
            <tr key={m.IdMovimiento}>
              <td>{m.Placa}</td>
              <td>{m.FechaEntrada}</td>
              <td>{m.FechaSalida ?? '-'}</td>
              <td>{m.Estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}



import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { clearToken, getToken } from '../services/auth'
import jwt_decode from "jwt-decode"

export default function Nav({ updateAuth }) {
  const navigate = useNavigate()
  const token = getToken()
  let user = null

  if (token) {
    try {
      user = jwt_decode(token)
    } catch (err) {
      console.error("Token inválido:", err)
    }
  }

  const onLogout = () => { 
    clearToken()
    // Disparar evento para actualizar estado en App.jsx
    window.dispatchEvent(new Event('authChange'))
    navigate('/')
    // Forzar recarga completa para asegurar estado limpio
    window.location.reload()
  }

  return (
    <nav className="nav">
      <div className="brand">SENA ParkControl</div>
      <div className="links">

        <NavLink to="/dashboard">Dashboard</NavLink>

        {/* SOLO ADMIN */}
        {(user?.idRol === 1 || user?.idRolName === "Administrador") && (
          <>
            <NavLink to="/users">Usuarios</NavLink>
            <NavLink to="/reportes">Reportes</NavLink>
          </>
        )}

        {/* VIGILANTE - ya tiene acceso a Movimientos por la ruta general abajo */}
        {user?.idRolName === "Vigilante" && (
          <NavLink to="/reportes">Reportes</NavLink>
        )}

        {/* TODOS los roles pueden ver Movimientos (pero con permisos diferentes) */}
        <NavLink to="/movimientos">Movimientos</NavLink>

        {/* APRENDIZ / INSTRUCTOR / VISITANTE */}
        {["Aprendiz", "Instructor", "Visitante"].includes(user?.idRolName) && (
          <NavLink to="/vehicles">Vehículos</NavLink>
        )}

        <button onClick={onLogout} className="btn-logout">Cerrar sesión</button>
      </div>
    </nav>
  )
}

import React, { useEffect, useState } from 'react'
import api from '../services/api'


export default function VehiclesPage(){
const [vehicles, setVehicles] = useState([])
const [form, setForm] = useState({ placa: '', tipo: 'carro', modelo: '', color: '' })
const [error, setError] = useState(null)


useEffect(()=>{ load() }, [])
async function load(){
try{
// obtiene vehículos del usuario autenticado: backend devuelve por token
const data = await api.request('/vehicles/user', { method: 'GET' })
setVehicles(data)
}catch(err){ setError(err.message) }
}


async function submit(e){
e.preventDefault()
try{
await api.request('/vehicles', { method: 'POST', body: { ...form } })
setForm({ placa: '', tipo: 'carro', modelo: '', color: '' })
load()
}catch(err){ alert(err.message) }
}


async function remove(id){ if(!confirm('Eliminar vehículo?')) return; try{ await api.request('/vehicles/' + id, { method: 'DELETE' }); load() } catch(err){ alert(err.message) } }


return (
<div className="container">
<h1>Vehículos</h1>
{error && <div className="error">{error}</div>}
<form className="form-inline" onSubmit={submit}>
<input placeholder="Placa" value={form.placa} onChange={e=>setForm({...form, placa:e.target.value.toUpperCase()})} required />
<select value={form.tipo} onChange={e=>setForm({...form, tipo:e.target.value})}>
<option value="carro">Carro</option>
<option value="moto">Moto</option>
<option value="bicicleta">Bicicleta</option>
</select>
<input placeholder="Modelo" value={form.modelo} onChange={e=>setForm({...form, modelo:e.target.value})} />
<input placeholder="Color" value={form.color} onChange={e=>setForm({...form, color:e.target.value})} />
<button className="btn">Agregar</button>
</form>


<table className="table">
<thead><tr><th>ID</th><th>Placa</th><th>Tipo</th><th>Modelo</th><th>Color</th><th>Acciones</th></tr></thead>
<tbody>
{vehicles.map(v=> (
<tr key={v.IdVehiculo}>
<td>{v.IdVehiculo}</td>
<td>{v.Placa}</td>
<td>{v.Tipo}</td>
<td>{v.Modelo}</td>
<td>{v.Color}</td>
<td><button className="btn small" onClick={()=>remove(v.IdVehiculo)}>Eliminar</button></td>
</tr>
))}
</tbody>
</table>
</div>
)
}
api.js
// src/services/api.js
import { getToken, clearToken } from './auth';

const API_URL = 'http://localhost:4000/api';

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: 'Bearer ' + token }),
  };

  // log request (útil para debug)
  console.log('[API] Request]', options.method || 'GET', API_URL + path, options.body || '');

  const res = await fetch(API_URL + path, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // log status
  console.log('[API] Response status]', res.status, res.statusText);

  if (res.status === 401) {
    // token inválido: limpiar y forzar login
    clearToken();
    window.location.href = '/login';
    return;
  }

  // intenta parsear JSON, si no es JSON devuelve texto
  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }

  console.log('[API] Response body]', data);

  if (!res.ok) {
    // si el backend envía { message: '...' } lo mostramos, si no mostramos el body
    const message = data?.message || (typeof data === 'string' ? data : 'Error en la petición');
    throw new Error(message);
  }

  return data;
}

export default { request };

auth.js
// services/auth.js

export function saveToken(token) {
  localStorage.setItem('sp_token', token)
}

export function getToken() {
  return localStorage.getItem('sp_token')
}

export function clearToken() {
  localStorage.removeItem('sp_token')
}

Y AHORA TE VOY A PASAR EL BACKEND

auth.js
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);

module.exports = router;

movimientos.js
const express = require('express');
const router = express.Router();
const movCtrl = require('../controllers/movimientoController');
const authenticate = require('../middlewares/auth');
const permit = require('../middlewares/roles');

// Registrar entrada/salida
router.post('/entrada', authenticate, movCtrl.entrada);
router.post('/salida', authenticate, movCtrl.salida);

// Rango de fechas
router.get('/range', authenticate, movCtrl.listByRange);

// Listar todos los movimientos (admin y vigilante) - CORREGIDO
router.get('/', authenticate, permit('Administrador', 1, 'Vigilante', 5), movCtrl.listAll);

// NUEVA RUTA: Obtener vehículos dentro
router.get('/dentro', authenticate, movCtrl.vehiculosDentro);

module.exports = router;
vehicles.js
const express = require('express');
const router = express.Router();
const vehicleCtrl = require('../controllers/vehicleController');
const authenticate = require('../middlewares/auth');
const permit = require('../middlewares/roles');

// Crear vehículo
router.post('/', authenticate, vehicleCtrl.create);

// Vehículos del usuario autenticado
router.get('/user', authenticate, vehicleCtrl.listByUser);

// NUEVO: Listar todos los vehículos (solo admin)
router.get('/', authenticate, permit('Administrador', 1), vehicleCtrl.listAll);

// Eliminar vehículo
router.delete('/:id', authenticate, vehicleCtrl.remove);

module.exports = router;

movimientoModel.js
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
    const [rows] = await db.query(
      `SELECT m.*, v.Placa, v.Tipo, u.NombreCompleto 
       FROM Movimiento m 
       JOIN Vehiculo v ON m.IdVehiculo = v.IdVehiculo 
       JOIN Usuario u ON v.IdUsuario = u.IdUsuario
       ORDER BY m.FechaEntrada DESC`
    );
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
vehicleModel.js
const db = require('../config/db');

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
    const [rows] = await db.query('SELECT * FROM Vehiculo WHERE Placa = ?', [placa]);
    return rows[0];
  },

  async listByUser(idUsuario) {
    const [rows] = await db.query('SELECT * FROM Vehiculo WHERE IdUsuario = ?', [idUsuario]);
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM Vehiculo WHERE IdVehiculo = ?', [id]);
    return rows[0];
  },

  async remove(id) {
    await db.query('DELETE FROM Vehiculo WHERE IdVehiculo = ?', [id]);
  },

  // NUEVO: todos los vehículos
  async listAll() {
    const [rows] = await db.query('SELECT * FROM Vehiculo');
    return rows;
  }
};

module.exports = Vehicle;

roles.js
const permit = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user debe venir del middleware authenticate
    if(!req.user) return res.status(401).json({ message: 'No auth' });
    if (allowedRoles.length === 0) return next();
    const userRole = req.user.idRolName || req.user.idRol; // dependiendo del payload
    // permit by numeric id or by role name
    if (allowedRoles.includes(userRole) || allowedRoles.includes(req.user.idRol)) {
      return next();
    }
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  };
};

module.exports = permit;

auth.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if(!authHeader) return res.status(401).json({ message: 'Token missing' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, idRol, correo, nombre }
    next();
  } catch(err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authenticate;

authController.js
const bcrypt = require('bcrypt');
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
      const user = await User.findByEmail(correo);
      if (!user) return res.status(400).json({ message: 'Credenciales inválidas' });
      const ok = await bcrypt.compare(contrasena, user.Contrasena);
      if (!ok) return res.status(400).json({ message: 'Credenciales inválidas' });
      const payload = { id: user.IdUsuario, idRol: user.IdRol, correo: user.Correo, nombre: user.NombreCompleto, idRolName: user.NombreRol };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
      res.json({ token, user: payload });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error en login' });
    }
  }
};

module.exports = authController;

vehicleController.js
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

movimientoController.js
const Movimiento = require('../models/movimientoModel');
const Vehicle = require('../models/vehicleModel');
const Notificacion = require('../models/notificacionModel');

const movimientoController = {
  async entrada(req, res) {
    try {
      const { idVehiculo } = req.body;
      const veh = await Vehicle.getById(idVehiculo);
      if (!veh) return res.status(404).json({ message: 'Vehículo no encontrado' });

      const active = await Movimiento.getActiveByVehicle(idVehiculo);
      if (active) return res.status(400).json({ message: 'Vehículo ya dentro' });

      const id = await Movimiento.entrada(idVehiculo);
      await Notificacion.create(veh.IdUsuario, `Ingreso registrado para la placa ${veh.Placa}`);

      res.json({ 
        message: 'Entrada registrada', 
        id,
        placa: veh.Placa  // Enviamos la placa en la respuesta
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error' });
    }
  },

  async salida(req, res) {
    try {
      const { idMovimiento, placa } = req.body;

      if (idMovimiento) {
        const mov = await Movimiento.salida(idMovimiento);
        return res.json({ message: 'Salida registrada', movimiento: mov });
      }

      if (placa) {
        const veh = await Vehicle.findByPlaca(placa);
        if (!veh) return res.status(404).json({ message: 'Placa no encontrada' });

        const active = await Movimiento.getActiveByVehicle(veh.IdVehiculo);
        if (!active) return res.status(400).json({ message: 'No hay registro de entrada activo' });

        const mov = await Movimiento.salida(active.IdMovimiento);
        await Notificacion.create(veh.IdUsuario, `Salida registrada para la placa ${veh.Placa}`);

        return res.json({ 
          message: 'Salida registrada', 
          movimiento: mov,
          placa: veh.Placa  // Enviamos la placa en la respuesta
        });
      }

      res.status(400).json({ message: 'Falta idMovimiento o placa' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error' });
    }
  },

  async listByRange(req, res) {
    const { start, end } = req.query;
    const rows = await Movimiento.listByDateRange(start, end);
    res.json(rows);
  },

  // CORREGIDO: Ahora incluye la placa
  async listAll(req, res) {
    const rows = await Movimiento.listAll();
    res.json(rows);
  },

  // NUEVO: Endpoint para vehículos dentro
  async vehiculosDentro(req, res) {
    const rows = await Movimiento.getVehiculosDentro();
    res.json(rows);
  }
};

module.exports = movimientoController;