/**
 * @file userStatus.js
 * @description MOCK API & SECURITY LAYER V2.6 (Data Sync)
 * Simula un entorno de backend robusto con gestión de ACLs y consistencia de datos.
 * * @version 2.6.0 - ID Synchronization
 */

// --- ⚙️ CONFIGURACIÓN DEL ENTORNO ---
const ENV_CONFIG = {
  LATENCY: { MIN: 300, MAX: 1200 }, 
  FAILURE_RATE: 0.02, 
  STORAGE_KEY: 'monitoreco_session_v2',
  DB_KEY: 'monitoreco_mock_db_v2'
};

// --- 🗄️ ESQUEMA DE DATOS (DATA CONTRACT) ---
const INITIAL_DB = {
  users: [
    { 
      id: 'usr_admin_001', 
      email: 'admin@monitoreco.com', 
      name: 'Admin User', 
      plan: 'unlimited', 
      role: 'admin', 
      purchasedCourses: [], 
      completedLessons: [],
      lastActivity: {}, 
      createdAt: '2025-01-01T00:00:00Z' 
    },
    { 
      id: 'usr_pro_002', 
      email: 'pro@monitoreco.com', 
      name: 'Trader Pro', 
      plan: 'pro', 
      role: 'user', 
      // [FIX] Sincronización con IDs de course.service.js
      purchasedCourses: ['course_macro_101', 'course_trading_adv'], 
      completedLessons: ['course_macro_101_l_101'], // IDs consistentes
      lastActivity: { 'course_macro_101': 'course_macro_101_l_101' },
      createdAt: '2026-01-15T10:30:00Z' 
    },
    { 
      id: 'usr_free_003', 
      email: 'free@monitoreco.com', 
      name: 'Estudiante Free', 
      plan: 'starter', 
      role: 'user', 
      purchasedCourses: [],
      completedLessons: [],
      lastActivity: {},
      createdAt: '2026-01-26T14:20:00Z' 
    }
  ]
};

// --- 🔧 PRIVATE HELPERS ---

const _simulateLatency = () => {
  const delay = Math.floor(
    Math.random() * (ENV_CONFIG.LATENCY.MAX - ENV_CONFIG.LATENCY.MIN + 1) + ENV_CONFIG.LATENCY.MIN
  );
  return new Promise(resolve => setTimeout(resolve, delay));
};

const _triggerChaosMonkey = () => {
  if (Math.random() < ENV_CONFIG.FAILURE_RATE) {
    console.warn('[MockAPI] 🐒 Chaos Monkey induced 500 Error');
    throw new Error('500: Error interno del servidor (Simulado)');
  }
};

const _getDatabase = () => {
  const stored = localStorage.getItem(ENV_CONFIG.DB_KEY);
  const db = stored ? JSON.parse(stored) : INITIAL_DB;
  
  db.users = db.users.map(u => ({
    ...u,
    purchasedCourses: u.purchasedCourses ?? [],
    completedLessons: u.completedLessons ?? [],
    lastActivity: u.lastActivity ?? {}
  }));
  
  return db;
};

const _persistUserState = (db, updatedUser) => {
  localStorage.setItem(ENV_CONFIG.DB_KEY, JSON.stringify(db));
  
  const currentSession = localStorage.getItem(ENV_CONFIG.STORAGE_KEY);
  if (currentSession) {
    const sessionUser = JSON.parse(currentSession);
    if (sessionUser.id === updatedUser.id) {
      localStorage.setItem(ENV_CONFIG.STORAGE_KEY, JSON.stringify(updatedUser));
    }
  }
};

// --- 🚀 SERVICE LAYER ---

export const UserStatusService = {
  
  async login({ email }) {
    await _simulateLatency();
    _triggerChaosMonkey();

    const db = _getDatabase();
    let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      user = {
        id: `usr_${crypto.randomUUID().split('-')[0]}`,
        email,
        name: email.split('@')[0],
        plan: 'starter',
        role: 'user',
        purchasedCourses: [], 
        completedLessons: [], 
        lastActivity: {},
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      localStorage.setItem(ENV_CONFIG.DB_KEY, JSON.stringify(db));
    }

    localStorage.setItem(ENV_CONFIG.STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  async fetchUser() {
    await _simulateLatency();
    
    const sessionData = localStorage.getItem(ENV_CONFIG.STORAGE_KEY);
    if (!sessionData) return null;

    const sessionUser = JSON.parse(sessionData);
    const db = _getDatabase();
    
    const freshUser = db.users.find(u => u.id === sessionUser.id);
    
    if (!freshUser) {
      localStorage.removeItem(ENV_CONFIG.STORAGE_KEY);
      return null;
    }

    return freshUser;
  },

  async logout() {
    await _simulateLatency();
    localStorage.removeItem(ENV_CONFIG.STORAGE_KEY);
    return true;
  },

  async grantAccess(productIds) {
    await _simulateLatency();
    const sessionData = localStorage.getItem(ENV_CONFIG.STORAGE_KEY);
    if (!sessionData) throw new Error('401: Unauthorized');
    
    const currentUser = JSON.parse(sessionData);
    const db = _getDatabase();
    const userIndex = db.users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) throw new Error('404: User not found');

    const currentCourses = new Set(db.users[userIndex].purchasedCourses);
    productIds.forEach(id => currentCourses.add(id));

    db.users[userIndex].purchasedCourses = Array.from(currentCourses);
    _persistUserState(db, db.users[userIndex]);

    return db.users[userIndex];
  },

  async updateProfile(partialData) {
    await _simulateLatency();

    const sessionData = localStorage.getItem(ENV_CONFIG.STORAGE_KEY);
    if (!sessionData) throw new Error('401: Sesión expirada');

    const currentUser = JSON.parse(sessionData);
    const db = _getDatabase();
    const userIndex = db.users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) throw new Error('404: Usuario no encontrado');

    const allowedUpdates = {
      name: partialData.name,
      username: partialData.username,
      bio: partialData.bio,
      jobTitle: partialData.jobTitle,
      location: partialData.location,
      avatar: partialData.avatar,
      website: partialData.website,
    };

    const updatedUser = { ...db.users[userIndex], ...allowedUpdates };
    _persistUserState(db, updatedUser);

    return updatedUser;
  },

  async updatePlan(newPlanId) {
    await _simulateLatency();
    _triggerChaosMonkey();

    const sessionData = localStorage.getItem(ENV_CONFIG.STORAGE_KEY);
    if (!sessionData) throw new Error('401: No autorizado');

    const currentUser = JSON.parse(sessionData);
    
    if (currentUser.plan === newPlanId) {
      throw new Error(`400: Ya tienes activo el plan ${newPlanId.toUpperCase()}`);
    }

    const db = _getDatabase();
    const userIndex = db.users.findIndex(u => u.id === currentUser.id);
    
    db.users[userIndex].plan = newPlanId;
    _persistUserState(db, db.users[userIndex]);

    return db.users[userIndex];
  }
};