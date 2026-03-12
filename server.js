const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const vehicleRoutes = require('./routes/vehicles');
const movimientoRoutes = require('./routes/movimientos');
const notiRoutes = require('./routes/notificaciones');
const reporteRoutes = require('./routes/reportes');

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/notificaciones', notiRoutes);
app.use('/api/reportes', reporteRoutes);

// health
app.get('/api', (req, res) => res.json({ ok: true, service: 'SENA ParkControl API' }));

// Redirigir raíz al frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Para cualquier otra ruta, servir el index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configuración del puerto
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
