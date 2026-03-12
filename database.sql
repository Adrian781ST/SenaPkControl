-- Base de datos para SENA ParkControl
CREATE DATABASE IF NOT EXISTS senaparkcontrol;
USE senaparkcontrol;

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS Rol (
    IdRol INT PRIMARY KEY AUTO_INCREMENT,
    NombreRol VARCHAR(50) NOT NULL
);

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS Usuario (
    IdUsuario INT PRIMARY KEY AUTO_INCREMENT,
    IdRol INT NOT NULL,
    NombreCompleto VARCHAR(100) NOT NULL,
    Documento VARCHAR(20) NOT NULL UNIQUE,
    Correo VARCHAR(100) NOT NULL UNIQUE,
    Telefono VARCHAR(20),
    Contrasena VARCHAR(255) NOT NULL,
    FOREIGN KEY (IdRol) REFERENCES Rol(IdRol)
);

-- Tabla de Vehículos
CREATE TABLE IF NOT EXISTS Vehiculo (
    IdVehiculo INT PRIMARY KEY AUTO_INCREMENT,
    IdUsuario INT NOT NULL,
    Placa VARCHAR(20) NOT NULL UNIQUE,
    Tipo VARCHAR(20) NOT NULL,
    Modelo VARCHAR(20),
    Color VARCHAR(20),
    FotoVehiculo TEXT,
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);

-- Tabla de Movimientos (entradas y salidas)
CREATE TABLE IF NOT EXISTS Movimiento (
    IdMovimiento INT PRIMARY KEY AUTO_INCREMENT,
    IdVehiculo INT NOT NULL,
    FechaEntrada DATETIME NOT NULL,
    FechaSalida DATETIME,
    Estado ENUM('dentro', 'fuera') NOT NULL DEFAULT 'dentro',
    FOREIGN KEY (IdVehiculo) REFERENCES Vehiculo(IdVehiculo)
);

-- Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS Notificacion (
    IdNotificacion INT PRIMARY KEY AUTO_INCREMENT,
    IdUsuario INT NOT NULL,
    Mensaje TEXT NOT NULL,
    Fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Leido BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);

-- Tabla de Reportes
CREATE TABLE IF NOT EXISTS Reporte (
    IdReporte INT PRIMARY KEY AUTO_INCREMENT,
    IdUsuario INT NOT NULL,
    FechaInicio DATE NOT NULL,
    FechaFin DATE NOT NULL,
    TipoVehiculo VARCHAR(20),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);

-- Insertar Roles iniciales
INSERT INTO Rol (NombreRol) VALUES ('Administrador'), ('Operario'), ('Usuario');

-- Insertar un usuario administrador por defecto
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO Usuario (IdRol, NombreCompleto, Documento, Correo, Telefono, Contrasena) 
VALUES (1, 'Administrador', '1000000', 'admin@senapark.com', '3000000000', '$2b$10$8K1p/a0dL3LXMIgoEDFrwO5s2o7.3F0.5YJ1N0mX8K1p/a0dL3LXMI');
