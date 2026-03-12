const API_URL = window.location.origin + '/api';
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
let currentMovementType = '';

// Navigation functions
function showHome() {
    document.querySelector('.home-hero').style.display = 'flex';
    document.querySelector('.features-section').style.display = 'block';
    document.querySelector('.how-it-works').style.display = 'block';
    document.querySelector('.home-footer').style.display = 'block';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'none';
}

function showLogin() {
    document.querySelector('.home-hero').style.display = 'none';
    document.querySelector('.features-section').style.display = 'none';
    document.querySelector('.how-it-works').style.display = 'none';
    document.querySelector('.home-footer').style.display = 'none';
    document.getElementById('login-section').style.display = 'flex';
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'none';
}

function showRegister() {
    document.querySelector('.home-hero').style.display = 'none';
    document.querySelector('.features-section').style.display = 'none';
    document.querySelector('.how-it-works').style.display = 'none';
    document.querySelector('.home-footer').style.display = 'none';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'flex';
    document.getElementById('dashboard-section').style.display = 'none';
}

function showDashboard() {
    document.querySelector('.home-hero').style.display = 'none';
    document.querySelector('.features-section').style.display = 'none';
    document.querySelector('.how-it-works').style.display = 'none';
    document.querySelector('.home-footer').style.display = 'none';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    
    document.getElementById('user-name').textContent = currentUser?.nombre || 'Usuario';
    
    // Configurar menús según el rol
    configureMenuByRole();
    
    // Cargar datos según el rol
    loadDataByRole();
}

// Configurar menú según el rol del usuario
function configureMenuByRole() {
    const roleId = currentUser?.idRol;
    const roleName = currentUser?.idRolName || '';
    
    const navLinks = document.querySelector('.nav-links');
    
    if (roleId === 1) {
        // Administrador - Acceso total
        navLinks.innerHTML = `
            <button class="nav-btn active" onclick="showTab('vehicles')">🚗 Vehículos</button>
            <button class="nav-btn" onclick="showTab('movements')">📊 Movimientos</button>
            <button class="nav-btn" onclick="showTab('users')">👥 Usuarios</button>
            <button class="nav-btn" onclick="showTab('reports')">📈 Reportes</button>
        `;
    } else if (roleId === 2) {
        // Operario - Solo movimientos y vehículos
        navLinks.innerHTML = `
            <button class="nav-btn active" onclick="showTab('vehicles')">🚗 Vehículos</button>
            <button class="nav-btn" onclick="showTab('movements')">📊 Movimientos</button>
        `;
    } else {
        // Aprendiz - Solo sus vehículos
        navLinks.innerHTML = `
            <button class="nav-btn active" onclick="showTab('myvehicles')">🚗 Mis Vehículos</button>
            <button class="nav-btn" onclick="showTab('history')">📋 Mi Historial</button>
        `;
    }
}

// Cargar datos según el rol
function loadDataByRole() {
    const roleId = currentUser?.idRol;
    
    // Mostrar la primera pestaña según el rol
    if (roleId === 1 || roleId === 2) {
        showTab('vehicles');
    } else {
        showTab('myvehicles');
    }
}

// Tab navigation
function showTab(tabName) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    
    // Find and activate the right button
    const buttons = document.querySelectorAll('.nav-btn');
    const tabNames = ['vehicles', 'movements', 'users', 'reports', 'myvehicles', 'history'];
    const tabIndex = tabNames.indexOf(tabName);
    if (tabIndex >= 0 && buttons[tabIndex]) {
        buttons[tabIndex].classList.add('active');
    }
    
    const tabContent = document.getElementById(`${tabName}-tab`);
    if (tabContent) {
        tabContent.style.display = 'block';
        
        // Cargar datos según la pestaña
        if (tabName === 'vehicles') loadVehicles();
        if (tabName === 'movements') loadMovements();
        if (tabName === 'users') loadUsers();
        if (tabName === 'reports') loadReports();
        if (tabName === 'myvehicles') loadMyVehicles();
        if (tabName === 'history') loadMyHistory();
    }
}

// Auth handlers
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: email, contrasena: password })
        });
        const data = await res.json();
        
        if (res.ok) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            // Mensaje de bienvenida según el rol
            const roleMessages = {
                1: '¡Bienvenido Administrador! Tienes acceso total al sistema.',
                2: '¡Bienvenido Operario! Puedes registrar entradas y salidas.',
                3: '¡Bienvenido! Puedes registrar tus vehículos.'
            };
            alert(roleMessages[currentUser.idRol] || '¡Bienvenido!');
            
            showDashboard();
        } else {
            document.getElementById('login-error').textContent = data.message || 'Error al iniciar sesión';
        }
    } catch (err) {
        document.getElementById('login-error').textContent = 'Error de conexión';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const data = {
        nombreCompleto: document.getElementById('reg-name').value,
        documento: document.getElementById('reg-document').value,
        correo: document.getElementById('reg-email').value,
        telefono: document.getElementById('reg-phone').value,
        contrasena: document.getElementById('reg-password').value,
        idRol: document.getElementById('reg-role').value
    };
    
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            showLogin();
        } else {
            const err = await res.json();
            document.getElementById('register-error').textContent = err.message || 'Error al registrarse';
        }
    } catch (err) {
        document.getElementById('register-error').textContent = 'Error de conexión';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token = null;
    currentUser = null;
    showHome();
}

// ==================== VEHÍCULOS (Admin/Operario) ====================
async function loadVehicles() {
    try {
        const res = await fetch(`${API_URL}/vehicles`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const vehicles = await res.json();
        
        const tbody = document.getElementById('vehicles-list');
        if (!tbody) return;
        
        tbody.innerHTML = vehicles.map(v => `
            <tr>
                <td>${v.Placa}</td>
                <td>${v.Tipo}</td>
                <td>${v.Modelo || '-'}</td>
                <td>${v.Color || '-'}</td>
                <td>${v.NombreCompleto || '-'}</td>
                <td>${v.NombreRol || '-'}</td>
                <td>
                    <button onclick="deleteVehicle(${v.IdVehiculo})" style="background: #e74c3c; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading vehicles:', err);
    }
}

function showAddVehicleForm() {
    document.getElementById('add-vehicle-form').style.display = 'flex';
}

function hideAddVehicleForm() {
    document.getElementById('add-vehicle-form').style.display = 'none';
    document.getElementById('vehicle-plate').value = '';
    document.getElementById('vehicle-model').value = '';
    document.getElementById('vehicle-color').value = '';
}

async function addVehicle() {
    const data = {
        idUsuario: currentUser.id,
        placa: document.getElementById('vehicle-plate').value.toUpperCase(),
        tipo: document.getElementById('vehicle-type').value,
        modelo: document.getElementById('vehicle-model').value,
        color: document.getElementById('vehicle-color').value
    };
    
    try {
        const res = await fetch(`${API_URL}/vehicles`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            hideAddVehicleForm();
            loadVehicles();
            alert('¡Vehículo registrado exitosamente!');
        } else {
            const err = await res.json();
            alert(err.message || 'Error al agregar vehículo');
        }
    } catch (err) {
        alert('Error de conexión');
    }
}

async function deleteVehicle(id) {
    if (!confirm('¿Estás seguro de eliminar este vehículo?')) return;
    
    try {
        await fetch(`${API_URL}/vehicles/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadVehicles();
    } catch (err) {
        alert('Error al eliminar');
    }
}

// ==================== MIS VEHÍCULOS (Aprendiz) ====================
async function loadMyVehicles() {
    try {
        const res = await fetch(`${API_URL}/vehicles/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const vehicles = await res.json();
        
        const tbody = document.getElementById('my-vehicles-list');
        if (!tbody) return;
        
        tbody.innerHTML = vehicles.map(v => `
            <tr>
                <td>${v.Placa}</td>
                <td>${v.Tipo}</td>
                <td>${v.Modelo || '-'}</td>
                <td>${v.Color || '-'}</td>
            </tr>
        `).join('');
        
        // También mostrar formulario para agregar
        const formDiv = document.getElementById('add-my-vehicle-form');
        if (formDiv) {
            formDiv.style.display = 'flex';
        }
    } catch (err) {
        console.error('Error loading my vehicles:', err);
    }
}

async function addMyVehicle() {
    const data = {
        idUsuario: currentUser.id,
        placa: document.getElementById('my-vehicle-plate').value.toUpperCase(),
        tipo: document.getElementById('my-vehicle-type').value,
        modelo: document.getElementById('my-vehicle-model').value,
        color: document.getElementById('my-vehicle-color').value
    };
    
    try {
        const res = await fetch(`${API_URL}/vehicles`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            document.getElementById('my-vehicle-plate').value = '';
            document.getElementById('my-vehicle-model').value = '';
            document.getElementById('my-vehicle-color').value = '';
            loadMyVehicles();
            alert('¡Vehículo registrado exitosamente!');
        } else {
            const err = await res.json();
            alert(err.message || 'Error al agregar vehículo');
        }
    } catch (err) {
        alert('Error de conexión');
    }
}

// ==================== MOVIMIENTOS ====================
async function loadMovements() {
    try {
        // Vehicles inside
        const insideRes = await fetch(`${API_URL}/movimientos/dentro`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const inside = await insideRes.json();
        
        const insideBody = document.getElementById('inside-vehicles-list');
        if (!insideBody) return;
        
        insideBody.innerHTML = inside.map(m => `
            <tr>
                <td>${m.Placa}</td>
                <td>${m.Tipo}</td>
                <td>${new Date(m.FechaEntrada).toLocaleString()}</td>
                <td>${getTimeDiff(m.FechaEntrada)}</td>
            </tr>
        `).join('');
        
        // All movements
        const allRes = await fetch(`${API_URL}/movimientos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const all = await allRes.json();
        
        const allBody = document.getElementById('movements-list');
        allBody.innerHTML = all.map(m => `
            <tr>
                <td>${m.Placa || '-'}</td>
                <td>${m.FechaEntrada ? new Date(m.FechaEntrada).toLocaleString() : '-'}</td>
                <td>${m.FechaSalida ? new Date(m.FechaSalida).toLocaleString() : '-'}</td>
                <td class="status-${m.Estado}">${m.Estado}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading movements:', err);
    }
}

function getTimeDiff(start) {
    const diff = new Date() - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
}

function registerEntry() {
    currentMovementType = 'entrada';
    document.getElementById('movement-form').style.display = 'flex';
}

function registerExit() {
    currentMovementType = 'salida';
    document.getElementById('movement-form').style.display = 'flex';
}

function hideMovementForm() {
    document.getElementById('movement-form').style.display = 'none';
    document.getElementById('movement-plate').value = '';
}

async function confirmMovement() {
    const plate = document.getElementById('movement-plate').value.toUpperCase();
    if (!plate) return alert('Ingresa la placa');
    
    try {
        if (currentMovementType === 'entrada') {
            const vehicleRes = await fetch(`${API_URL}/vehicles/placa/${plate}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const vehicle = await vehicleRes.json();
            
            if (!vehicle.IdVehiculo) {
                return alert('Vehículo no encontrado. Debes registrarlo primero.');
            }
            
            const res = await fetch(`${API_URL}/movimientos/entrada`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ idVehiculo: vehicle.IdVehiculo })
            });
            
            if (res.ok) {
                alert(`¡Entrada registrada! Vehículo ${plate} ingresado.`);
            } else {
                const err = await res.json();
                alert(err.message || 'Error al registrar entrada');
            }
        } else {
            const insideRes = await fetch(`${API_URL}/movimientos/dentro`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const inside = await insideRes.json();
            const movement = inside.find(m => m.Placa === plate);
            
            if (!movement) {
                return alert('Este vehículo no está dentro del parqueadero');
            }
            
            await fetch(`${API_URL}/movimientos/${movement.IdMovimiento}/salida`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            alert(`¡Salida registrada! Vehículo ${plate} salió.`);
        }
        
        hideMovementForm();
        loadMovements();
    } catch (err) {
        alert('Error al registrar movimiento');
    }
}

// ==================== USUARIOS (Solo Admin) ====================
async function loadUsers() {
    try {
        const res = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await res.json();
        
        const tbody = document.getElementById('users-list');
        if (!tbody) return;
        
        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${u.NombreCompleto}</td>
                <td>${u.Documento}</td>
                <td>${u.Correo}</td>
                <td>${u.Telefono || '-'}</td>
                <td>${u.NombreRol}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading users:', err);
    }
}

function showAddUserForm() {
    document.getElementById('add-user-form').style.display = 'flex';
}

function hideAddUserForm() {
    document.getElementById('add-user-form').style.display = 'none';
}

async function addUser() {
    const data = {
        nombreCompleto: document.getElementById('user-name-input').value,
        documento: document.getElementById('user-document-input').value,
        correo: document.getElementById('user-email-input').value,
        telefono: document.getElementById('user-phone-input').value,
        contrasena: document.getElementById('user-password-input').value,
        idRol: document.getElementById('user-role-input').value
    };
    
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            hideAddUserForm();
            loadUsers();
            alert('¡Usuario creado exitosamente!');
        } else {
            const err = await res.json();
            alert(err.message || 'Error al agregar usuario');
        }
    } catch (err) {
        alert('Error de conexión');
    }
}

// ==================== REPORTES (Solo Admin) ====================
async function loadReports() {
    const tbody = document.getElementById('reports-list');
    if (!tbody) return;
    
    // Cargar algunos datos para el reporte
    try {
        const [vehiclesRes, movementsRes, insideRes] = await Promise.all([
            fetch(`${API_URL}/vehicles`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/movimientos`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/movimientos/dentro`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const vehicles = await vehiclesRes.json();
        const movements = await movementsRes.json();
        const inside = await insideRes.json();
        
        const today = new Date().toLocaleDateString();
        
        tbody.innerHTML = `
            <div class="report-card">
                <h3>📊 Resumen General</h3>
                <p><strong>Fecha:</strong> ${today}</p>
                <p><strong>Total Vehículos Registrados:</strong> ${vehicles.length}</p>
                <p><strong>Total Movimientos:</strong> ${movements.length}</p>
                <p><strong>Vehículos Dentro:</strong> ${inside.length}</p>
                <p><strong>Vehículos Fuera:</strong> ${movements.length - inside.length}</p>
            </div>
            <div class="report-card">
                <h3>🚗 Por Tipo de Vehículo</h3>
                ${getVehicleTypeStats(vehicles)}
            </div>
        `;
    } catch (err) {
        tbody.innerHTML = '<p>Error al cargar reportes</p>';
    }
}

function getVehicleTypeStats(vehicles) {
    const types = {};
    vehicles.forEach(v => {
        types[v.Tipo] = (types[v.Tipo] || 0) + 1;
    });
    
    return Object.entries(types).map(([type, count]) => 
        `<p><strong>${type}:</strong> ${count}</p>`
    ).join('');
}

// ==================== HISTORIAL (Aprendiz) ====================
async function loadMyHistory() {
    const tbody = document.getElementById('my-history-list');
    if (!tbody) return;
    
    try {
        // Get user's vehicles
        const vehiclesRes = await fetch(`${API_URL}/vehicles/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const myVehicles = await vehiclesRes.json();
        
        // Get all movements
        const movementsRes = await fetch(`${API_URL}/movimientos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const movements = await movementsRes.json();
        
        // Filter movements for user's vehicles
        const myPlates = myVehicles.map(v => v.Placa);
        const myMovements = movements.filter(m => myPlates.includes(m.Placa));
        
        tbody.innerHTML = myMovements.map(m => `
            <tr>
                <td>${m.Placa}</td>
                <td>${m.FechaEntrada ? new Date(m.FechaEntrada).toLocaleString() : '-'}</td>
                <td>${m.FechaSalida ? new Date(m.FechaSalida).toLocaleString() : '-'}</td>
                <td class="status-${m.Estado}">${m.Estado}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading history:', err);
    }
}

// ==================== MODAL ====================
function showUsersModal() {
    document.getElementById('users-modal').style.display = 'flex';
}

function hideUsersModal() {
    document.getElementById('users-modal').style.display = 'none';
}

function fillLogin(email, password) {
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = password;
    hideUsersModal();
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showDashboard();
    } else {
        showHome();
    }
});
