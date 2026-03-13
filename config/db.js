// Base de datos simple en memoria para Vercel
// Nota: Los datos se reinician en cada despliegue en Vercel

// Datos en memoria
const db = {
  Rol: [
    { IdRol: 1, NombreRol: 'Administrador' },
    { IdRol: 2, NombreRol: 'Operario' },
    { IdRol: 3, NombreRol: 'Usuario' }
  ],
  // Nota: Las contraseñas están en texto plano para pruebas en Vercel
  // En producción usa una base de datos real con hash
  Usuario: [
    { IdUsuario: 1, IdRol: 1, NombreCompleto: 'Admin', Documento: '1000000', Correo: 'admin2@test.com', Telefono: '3000000000', Contrasena: 'admin123' },
    { IdUsuario: 2, IdRol: 2, NombreCompleto: 'Operario Test', Documento: '55555', Correo: 'operario@test.com', Telefono: '3001111111', Contrasena: 'operario123' },
    { IdUsuario: 3, IdRol: 3, NombreCompleto: 'Aprendiz Test', Documento: '66666', Correo: 'aprendiz@test.com', Telefono: '3002222222', Contrasena: 'aprendiz123' }
  ],
  Vehiculo: [],
  Movimiento: [],
  Notificacion: [],
  Reporte: []
};

// Funciones helper
function getNextId(table) {
  if (db[table].length === 0) return 1;
  return Math.max(...db[table].map(r => r['Id' + table.slice(0, -1) || 'Id'])) + 1;
}

function sanitizeParams(params) {
  if (!params) return [];
  return params.map(param => {
    if (param === undefined || param === null) return null;
    return param;
  });
}

// Pool simulado
const pool = {
  async query(sql, params = []) {
    return new Promise((resolve) => {
      try {
        const p = sanitizeParams(params);
        
        // Analizar la consulta SQL básica
        const sqlUpper = sql.trim().toUpperCase();
        
        if (sqlUpper.startsWith('SELECT')) {
          let results = [];
          
          if (sql.includes('Usuario') && sql.includes('Rol')) {
            // JOIN Usuario con Rol
            const correo = p[0];
            console.log('Query by email:', correo);
            if (correo) {
              results = db.Usuario.filter(u => u.Correo === correo).map(u => {
                const rol = db.Rol.find(r => r.IdRol === u.IdRol);
                return { ...u, NombreRol: rol ? rol.NombreRol : null };
              });
              console.log('Results:', results);
            } else {
              results = db.Usuario.map(u => {
                const rol = db.Rol.find(r => r.IdRol === u.IdRol);
                return { ...u, NombreRol: rol ? rol.NombreRol : null };
              });
            }
          } else if (sql.includes('last_insert_rowid')) {
            results = [{ insertId: db.Usuario.length + 1 }];
          } else if (sql.includes('FROM Usuario')) {
            results = db.Usuario.map(u => {
              const rol = db.Rol.find(r => r.IdRol === u.IdRol);
              return { ...u, NombreRol: rol ? rol.NombreRol : null };
            });
          } else if (sql.includes('FROM Vehiculo')) {
            if (sql.includes('Placa') && p[0]) {
              results = db.Vehiculo.filter(v => v.Placa === p[0]);
            } else if (sql.includes('IdUsuario') && p[0]) {
              results = db.Vehiculo.filter(v => v.IdUsuario === p[0]).map(v => {
                const usuario = db.Usuario.find(u => u.IdUsuario === v.IdUsuario);
                const rol = usuario ? db.Rol.find(r => r.IdRol === usuario.IdRol) : null;
                return { 
                  ...v, 
                  NombreCompleto: usuario ? usuario.NombreCompleto : null,
                  Correo: usuario ? usuario.Correo : null,
                  NombreRol: rol ? rol.NombreRol : null
                };
              });
            } else {
              results = db.Vehiculo.map(v => {
                const usuario = db.Usuario.find(u => u.IdUsuario === v.IdUsuario);
                const rol = usuario ? db.Rol.find(r => r.IdRol === usuario.IdRol) : null;
                return { 
                  ...v, 
                  NombreCompleto: usuario ? usuario.NombreCompleto : null,
                  Correo: usuario ? usuario.Correo : null,
                  NombreRol: rol ? rol.NombreRol : null
                };
              });
            }
          } else if (sql.includes('FROM Movimiento')) {
            if (sql.includes('dentro') && sql.includes('Estado')) {
              results = db.Movimiento.filter(m => m.Estado === 'dentro').map(m => {
                const vehiculo = db.Vehiculo.find(v => v.IdVehiculo === m.IdVehiculo);
                const usuario = vehiculo ? db.Usuario.find(u => u.IdUsuario === vehiculo.IdUsuario) : null;
                return {
                  ...m,
                  Placa: vehiculo ? vehiculo.Placa : null,
                  Tipo: vehiculo ? vehiculo.Tipo : null,
                  NombreCompleto: usuario ? usuario.NombreCompleto : null
                };
              });
            } else if (sql.includes('IdVehiculo') && p[0]) {
              results = db.Movimiento.filter(m => m.IdVehiculo === p[0] && m.Estado === 'dentro');
            } else {
              results = db.Movimiento.map(m => {
                const vehiculo = db.Vehiculo.find(v => v.IdVehiculo === m.IdVehiculo);
                return { ...m, Placa: vehiculo ? vehiculo.Placa : null };
              });
            }
          } else if (sql.includes('FROM Rol')) {
            results = db.Rol;
          }
          
          resolve([results]);
        } else if (sqlUpper.startsWith('INSERT')) {
          if (sql.includes('INSERT INTO Usuario')) {
            const newUser = {
              IdUsuario: db.Usuario.length + 1,
              IdRol: p[0],
              NombreCompleto: p[1],
              Documento: p[2],
              Correo: p[3],
              Telefono: p[4],
              Contrasena: p[5]
            };
            db.Usuario.push(newUser);
            resolve([{ insertId: newUser.IdUsuario }]);
          } else if (sql.includes('INSERT INTO Vehiculo')) {
            const newVehicle = {
              IdVehiculo: db.Vehiculo.length + 1,
              IdUsuario: p[0],
              Placa: p[1],
              Tipo: p[2],
              Modelo: p[3],
              Color: p[4],
              FotoVehiculo: p[5]
            };
            db.Vehiculo.push(newVehicle);
            resolve([{ insertId: newVehicle.IdVehiculo }]);
          } else if (sql.includes('INSERT INTO Movimiento')) {
            const newMov = {
              IdMovimiento: db.Movimiento.length + 1,
              IdVehiculo: p[0],
              FechaEntrada: new Date().toISOString(),
              FechaSalida: null,
              Estado: 'dentro'
            };
            db.Movimiento.push(newMov);
            resolve([{ insertId: newMov.IdMovimiento }]);
          } else if (sql.includes('INSERT INTO Notificacion')) {
            const newNoti = {
              IdNotificacion: db.Notificacion.length + 1,
              IdUsuario: p[0],
              Mensaje: p[1],
              Fecha: new Date().toISOString(),
              Leido: 0
            };
            db.Notificacion.push(newNoti);
            resolve([{ insertId: newNoti.IdNotificacion }]);
          } else if (sql.includes('INSERT INTO Rol')) {
            resolve([{ insertId: 1 }]);
          } else {
            resolve([{}]);
          }
        } else if (sqlUpper.startsWith('UPDATE')) {
          if (sql.includes('Movimiento') && sql.includes('FechaSalida')) {
            const id = p[p.length - 1];
            const mov = db.Movimiento.find(m => m.IdMovimiento === id);
            if (mov) {
              mov.FechaSalida = new Date().toISOString();
              mov.Estado = 'fuera';
            }
            resolve([{ affectedRows: 1 }]);
          } else if (sql.includes('Notificacion') && sql.includes('Leido')) {
            const id = p[p.length - 1];
            const noti = db.Notificacion.find(n => n.IdNotificacion === id);
            if (noti) noti.Leido = 1;
            resolve([{ affectedRows: 1 }]);
          } else {
            resolve([{ affectedRows: 1 }]);
          }
        } else if (sqlUpper.startsWith('DELETE')) {
          if (sql.includes('Usuario') && p[0]) {
            const idx = db.Usuario.findIndex(u => u.IdUsuario === p[0]);
            if (idx !== -1) db.Usuario.splice(idx, 1);
          } else if (sql.includes('Vehiculo') && p[0]) {
            const idx = db.Vehiculo.findIndex(v => v.IdVehiculo === p[0]);
            if (idx !== -1) db.Vehiculo.splice(idx, 1);
          }
          resolve([{ affectedRows: 1 }]);
        } else {
          resolve([{}]);
        }
      } catch (err) {
        console.error('SQL Error:', err);
        resolve([[]]);
      }
    });
  },
  
  getConnection() {
    return Promise.resolve({
      query: this.query,
      release: () => {}
    });
  }
};

module.exports = pool;
