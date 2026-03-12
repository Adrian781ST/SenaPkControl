const bcrypt = require('bcrypt');

async function generarHash() {
  try {
    console.log('🔐 Generando hash para la contraseña "123456"...');
    
    // Generar el hash (10 es el número de rondas de encriptación)
    const hash = await bcrypt.hash('123456', 10);
    
    console.log('\n✅ HASH GENERADO:');
    console.log('==================');
    console.log(hash);
    console.log('==================\n');
    
    console.log('📋 SCRIPT SQL PARA COPIAR:');
    console.log('============================');
    console.log(`-- Administrador
INSERT INTO Usuario (IdRol, NombreCompleto, Documento, Correo, Telefono, Contrasena, FechaRegistro) 
VALUES (
  1,
  'Administrador Principal',
  '1000000001',
  'admin@senaparkcontrol.com',
  '3001234567',
  '${hash}',
  NOW()
);

-- Vigilante
INSERT INTO Usuario (IdRol, NombreCompleto, Documento, Correo, Telefono, Contrasena, FechaRegistro) 
VALUES (
  5,
  'Vigilante Principal',
  '1000000002',
  'vigilante@senaparkcontrol.com',
  '3001234568',
  '${hash}',
  NOW()
);`);
    console.log('============================\n');
    
    console.log('📝 Instrucciones:');
    console.log('1. Copia el hash de arriba');
    console.log('2. Ejecuta el script SQL en tu base de datos MySQL');
    console.log('3. Inicia sesión con admin@senaparkcontrol.com / 123456');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar la función
generarHash();