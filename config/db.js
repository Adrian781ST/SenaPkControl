const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const dbPath = path.join(__dirname, '..', process.env.DB_NAME || 'senaparkcontrol.db');

let db;
let dbReady = false;
let initPromise;

// Función para convertir valores undefined/null a strings vacíos o valores seguros
function sanitizeParams(params) {
  return params.map(param => {
    if (param === undefined || param === null) {
      return null;
    }
    return param;
  });
}

// Inicializar la base de datos
function initDB() {
  if (initPromise) return initPromise;
  
  initPromise = new Promise(async (resolve, reject) => {
    try {
      const SQL = await initSqlJs();
      
      // Cargar base de datos existente o crear nueva
      if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
      } else {
        db = new SQL.Database();
      }
      
      // Crear tablas
      db.run(`CREATE TABLE IF NOT EXISTS Rol (
        IdRol INTEGER PRIMARY KEY AUTOINCREMENT,
        NombreRol TEXT NOT NULL
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS Usuario (
        IdUsuario INTEGER PRIMARY KEY AUTOINCREMENT,
        IdRol INTEGER NOT NULL,
        NombreCompleto TEXT NOT NULL,
        Documento TEXT NOT NULL UNIQUE,
        Correo TEXT NOT NULL UNIQUE,
        Telefono TEXT,
        Contrasena TEXT NOT NULL,
        FOREIGN KEY (IdRol) REFERENCES Rol(IdRol)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS Vehiculo (
        IdVehiculo INTEGER PRIMARY KEY AUTOINCREMENT,
        IdUsuario INTEGER NOT NULL,
        Placa TEXT NOT NULL UNIQUE,
        Tipo TEXT NOT NULL,
        Modelo TEXT,
        Color TEXT,
        FotoVehiculo TEXT,
        FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS Movimiento (
        IdMovimiento INTEGER PRIMARY KEY AUTOINCREMENT,
        IdVehiculo INTEGER NOT NULL,
        FechaEntrada TEXT NOT NULL,
        FechaSalida TEXT,
        Estado TEXT NOT NULL DEFAULT 'dentro',
        FOREIGN KEY (IdVehiculo) REFERENCES Vehiculo(IdVehiculo)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS Notificacion (
        IdNotificacion INTEGER PRIMARY KEY AUTOINCREMENT,
        IdUsuario INTEGER NOT NULL,
        Mensaje TEXT NOT NULL,
        Fecha TEXT NOT NULL DEFAULT (datetime('now')),
        Leido INTEGER DEFAULT 0,
        FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS Reporte (
        IdReporte INTEGER PRIMARY KEY AUTOINCREMENT,
        IdUsuario INTEGER NOT NULL,
        FechaInicio TEXT NOT NULL,
        FechaFin TEXT NOT NULL,
        TipoVehiculo TEXT,
        FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
      )`);

      // Insertar Roles iniciales si no existen
      db.run(`INSERT OR IGNORE INTO Rol (IdRol, NombreRol) VALUES (1, 'Administrador')`);
      db.run(`INSERT OR IGNORE INTO Rol (IdRol, NombreRol) VALUES (2, 'Operario')`);
      db.run(`INSERT OR IGNORE INTO Rol (IdRol, NombreRol) VALUES (3, 'Usuario')`);
      
      // Guardar cambios
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
      
      dbReady = true;
      console.log('Base de datos SQLite inicializada correctamente');
      resolve(db);
    } catch (err) {
      console.error('Error al inicializar la base de datos:', err);
      reject(err);
    }
  });
  
  return initPromise;
}

// Wrapper para simular la API de mysql2/promise
const pool = {
  async query(sql, params = []) {
    await initPromise;
    
    return new Promise((resolve, reject) => {
      try {
        // Sanitizar parámetros
        const sanitizedParams = sanitizeParams(params);
        
        // sql.js usa parámetros posicionales $1, $2, etc.
        // Convertir ? a $1, $2, etc.
        let paramIndex = 1;
        const sqliteSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
        
        const stmt = db.prepare(sqliteSql);
        stmt.bind(sanitizedParams);
        
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        
        // Guardar cambios después de cada operación de escritura
        if (sql.trim().toUpperCase().startsWith('INSERT') || 
            sql.trim().toUpperCase().startsWith('UPDATE') || 
            sql.trim().toUpperCase().startsWith('DELETE')) {
          const data = db.export();
          const buffer = Buffer.from(data);
          fs.writeFileSync(dbPath, buffer);
        }
        
        resolve([results]);
      } catch (err) {
        reject(err);
      }
    });
  },
  getConnection() {
    return Promise.resolve({
      query: pool.query,
      release: () => {}
    });
  }
};

// Iniciar la base de datos
initDB();

module.exports = pool;
