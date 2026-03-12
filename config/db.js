const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const dbPath = path.join(__dirname, '..', process.env.DB_NAME || 'senaparkcontrol.db');

let db = null;
let dbReady = false;
let initPromise;

// Función para convertir valores undefined/null a valores seguros
function sanitizeParams(params) {
  if (!params) return [];
  return params.map(param => {
    if (param === undefined || param === null) {
      return null;
    }
    return param;
  });
}

// Inicializar la base de datos
async function initDB() {
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      console.log('Inicializando base de datos SQLite...');
      const SQL = await initSqlJs({
        // Para Vercel, necesitamos especificar la ubicación del archivo wasm
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      
      // Intentar cargar base de datos existente
      try {
        if (fs.existsSync(dbPath)) {
          const fileBuffer = fs.readFileSync(dbPath);
          db = new SQL.Database(fileBuffer);
          console.log('Base de datos cargada desde archivo');
        } else {
          db = new SQL.Database();
          console.log('Nueva base de datos creada');
        }
      } catch (e) {
        console.log('Creando nueva base de datos...');
        db = new SQL.Database();
      }
      
      // Crear tablas si no existen
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

      // Insertar Roles iniciales
      db.run(`INSERT OR IGNORE INTO Rol (IdRol, NombreRol) VALUES (1, 'Administrador')`);
      db.run(`INSERT OR IGNORE INTO Rol (IdRol, NombreRol) VALUES (2, 'Operario')`);
      db.run(`INSERT OR IGNORE INTO Rol (IdRol, NombreRol) VALUES (3, 'Usuario')`);
      
      // Guardar cambios
      saveDB();
      
      dbReady = true;
      console.log('✓ Base de datos SQLite inicializada correctamente');
      return db;
    } catch (err) {
      console.error('Error al inicializar la base de datos:', err);
      // No rechazamos - el servidor puede funcionar sin DB para serves estáticos
      dbReady = true;
      return null;
    }
  })();
  
  return initPromise;
}

function saveDB() {
  if (db) {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    } catch (e) {
      // En Vercel esto puede fallar, está bien
    }
  }
}

// Wrapper para simular la API de mysql2/promise
const pool = {
  async query(sql, params = []) {
    await initPromise;
    
    if (!db) {
      // En modo solo lectura o sin DB
      return [[]];
    }
    
    return new Promise((resolve, reject) => {
      try {
        const sanitizedParams = sanitizeParams(params);
        
        let paramIndex = 1;
        const sqliteSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
        
        const stmt = db.prepare(sqliteSql);
        stmt.bind(sanitizedParams);
        
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        
        // Guardar cambios después de operaciones de escritura
        if (sql.trim().toUpperCase().startsWith('INSERT') || 
            sql.trim().toUpperCase().startsWith('UPDATE') || 
            sql.trim().toUpperCase().startsWith('DELETE')) {
          saveDB();
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

// Iniciar la base de datos (no bloqueante)
initDB();

module.exports = pool;
