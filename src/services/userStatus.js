/**
 * @file userStatus.js
 * @description MOCK API & SECURITY LAYER V2 (The Fortress)
 * Simula un entorno de backend real con latencia variable (Jitter), 
 * fallos aleatorios (Chaos Monkey) y validación estricta de permisos.
 * * @version 2.1.0 - Strict Mode
 * @author Senior Architect (MonitorEco)
 */

// --- ⚙️ CONFIGURACIÓN DEL ENTORNO SIMULADO ---
const ENV_CONFIG = {
  // Latencia: Nunca es constante. Simulamos "Jitter" de red real.
  LATENCY: { MIN: 400, MAX: 1500 }, 
  
  // Chaos Monkey: 5% de probabilidad de que el "servidor" explote (500 Error)
  // Útil para verificar que tus Toasts de error funcionan.
  FAILURE_RATE: 0.05, 
  
  // Clave de persistencia (como si fuera una Cookie de Sesión)
  STORAGE_KEY: 'monitoreco_session_v2' 
};

// --- 🗄️ BASE DE DATOS MOCK (Source of Truth) ---
// Estos usuarios existen "en el servidor". Si intentas loguear otro, se crea on-the-fly.
const MOCK_DB = {
  users: [
    { 
      id: 'usr_admin_001', 
      email: 'admin@monitoreco.com', 
      name: 'Admin User', 
      plan: 'unlimited', 
      role: 'admin', 
      createdAt: '2025-01-01T00:00:00Z' 
    },
    { 
      id: 'usr_pro_002', 
      email: 'pro@monitoreco.com', 
      name: 'Trader Pro', 
      plan: 'pro', 
      role: 'user', 
      createdAt: '2026-01-15T10:30:00Z' 
    },
    { 
      id: 'usr_free_003', 
      email: 'free@monitoreco.com', 
      name: 'Estudiante Free', 
      plan: 'starter', 
      role: 'user', 
      createdAt: '2026-01-26T14:20:00Z' 
    }
  ]
};

// --- 🔧 MOTORES INTERNOS (PRIVATE HELPERS) ---

/**
 * Simula el tiempo de respuesta de red con variabilidad.
 * @returns {Promise<void>}
 */
const simulateNetworkLatency = () => {
  const delay = Math.floor(
    Math.random() * (ENV_CONFIG.LATENCY.MAX - ENV_CONFIG.LATENCY.MIN + 1) + ENV_CONFIG.LATENCY.MIN
  );
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Chaos Monkey: Introduce fallos aleatorios para probar robustez del frontend.
 * @throws {Error} 500 Internal Server Error
 */
const triggerChaosMonkey = () => {
  if (Math.random() < ENV_CONFIG.FAILURE_RATE) {
    console.error('[MockAPI] 🐒 Chaos Monkey atacó!');
    throw new Error('500: Error interno del servidor (Simulado)');
  }
};

/**
 * Lee la "Base de Datos" actual (simulada en localStorage para persistencia entre F5).
 */
const getDatabase = () => {
  const stored = localStorage.getItem('monitoreco_mock_db');
  return stored ? JSON.parse(stored) : MOCK_DB;
};

/**
 * Guarda el estado actual de la "Base de Datos".
 */
const saveDatabase = (db) => {
  localStorage.setItem('monitoreco_mock_db', JSON.stringify(db));
};

// --- 🚀 API PÚBLICA (SERVICE LAYER) ---

export const UserStatusService = {
  
  /**
   * POST /auth/login
   * Autentica un usuario o lo registra si no existe (modo dev).
   */
  async login({ email }) {
    await simulateNetworkLatency();
    triggerChaosMonkey();

    const db = getDatabase();
    // Normalizamos email a minúsculas para búsqueda
    let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // DEV MODE: Auto-registro si no existe
      user = {
        id: `usr_${crypto.randomUUID().split('-')[0]}`,
        email,
        name: email.split('@')[0], // Fallback name
        plan: 'starter', // Todo usuario nuevo nace Free
        role: 'user',
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      saveDatabase(db);
    }

    // Persistimos la sesión (Cookie simulada)
    localStorage.setItem(ENV_CONFIG.STORAGE_KEY, JSON.stringify(user));
    
    return user;
  },

  /**
   * GET /auth/me
   * Valida si la sesión actual sigue siendo válida en el servidor.
   */
  async fetchUser() {
    await simulateNetworkLatency();
    // Nota: No usamos Chaos Monkey aquí para evitar bloqueos infinitos al cargar la app.

    const sessionData = localStorage.getItem(ENV_CONFIG.STORAGE_KEY);
    if (!sessionData) return null;

    const sessionUser = JSON.parse(sessionData);
    const db = getDatabase();
    
    // Verificación estricta: ¿El usuario sigue existiendo en DB?
    const freshUser = db.users.find(u => u.id === sessionUser.id);
    
    if (!freshUser) {
      // Si el usuario fue borrado de la DB, invalidamos la sesión local
      localStorage.removeItem(ENV_CONFIG.STORAGE_KEY);
      return null;
    }

    return freshUser;
  },

  /**
   * POST /auth/logout
   */
  async logout() {
    await simulateNetworkLatency();
    localStorage.removeItem(ENV_CONFIG.STORAGE_KEY);
    return true;
  },

  /**
   * POST /billing/upgrade
   * Simula una transacción financiera compleja.
   */
  async updatePlan(newPlanId) {
    await simulateNetworkLatency();
    triggerChaosMonkey(); // Los pagos fallan a menudo en la vida real

    const sessionData = localStorage.getItem(ENV_CONFIG.STORAGE_KEY);
    if (!sessionData) throw new Error('401: No autorizado');

    const currentUser = JSON.parse(sessionData);
    
    // VALIDACIÓN DE NEGOCIO (Backend)
    if (currentUser.plan === newPlanId) {
      throw new Error(`400: Ya tienes activo el plan ${newPlanId.toUpperCase()}`);
    }

    // SIMULACIÓN DE PAGOS
    if (currentUser.email.includes('error')) {
      throw new Error('402: Fondos insuficientes (Simulado)');
    }

    // Actualizar en DB
    const db = getDatabase();
    const userIndex = db.users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) throw new Error('404: Usuario no encontrado');

    // Aplicar cambio
    db.users[userIndex].plan = newPlanId;
    saveDatabase(db); // Guardar en "DB"
    
    // Actualizar sesión local
    const updatedUser = db.users[userIndex];
    localStorage.setItem(ENV_CONFIG.STORAGE_KEY, JSON.stringify(updatedUser));

    return updatedUser;
  },

  /**
   * GET /api/premium-data (STRESS TEST)
   * Intenta acceder a un recurso protegido. Lanza 403 si el plan es insuficiente.
   */
  async checkPremiumAccess() {
    await simulateNetworkLatency();
    triggerChaosMonkey();

    const sessionData = localStorage.getItem(ENV_CONFIG.STORAGE_KEY);
    if (!sessionData) throw new Error('401: Debes iniciar sesión');

    const user = JSON.parse(sessionData);
    const ALLOWED_PLANS = ['pro', 'unlimited'];

    if (!ALLOWED_PLANS.includes(user.plan)) {
      throw new Error(`403: Acceso Denegado. El plan '${user.plan}' no tiene permisos.`);
    }

    return { access: true, timestamp: Date.now(), secret: 'DATA-ENCRYPTED-2026' };
  }
};