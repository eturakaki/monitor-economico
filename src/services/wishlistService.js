// src/services/wishlistService.js

/**
 * ☁️ MOCK BACKEND SERVICE (Wishlist)
 * Simula una base de datos real con latencia de red.
 * Persistencia: localStorage (por dispositivo).
 */

const SIMULATED_DELAY = 600; // ms (Simula internet promedio)
const DB_KEY = 'monitoreco_wishlist_db_v1';

// --- HELPERS INTERNOS ---
const getDB = () => {
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    // FIX 1: Usamos la variable 'error' imprimiéndola
    console.error("Database corruption detected:", error);
    return {};
  }
};

const saveDB = (data) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (error) {
    // FIX 2: Usamos la variable 'error'
    console.error("Write error in localStorage:", error);
  }
};

// --- API PÚBLICA DEL SERVICIO ---
export const wishlistService = {
  
  async getByUserId(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getDB();
        resolve(db[userId] || []);
      }, SIMULATED_DELAY);
    });
  },

  async addItem(userId, item) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const db = getDB();
          const userList = db[userId] || [];
          
          if (userList.some(i => i.id === item.id)) {
            resolve(userList);
            return;
          }

          const newList = [...userList, item];
          db[userId] = newList;
          saveDB(db);
          
          resolve(newList);
        } catch (error) {
          // FIX 3: Usamos la variable para rechazar la promesa con el error real
          console.error("Service Add Error:", error);
          reject(new Error("Error 500: No se pudo escribir en base de datos"));
        }
      }, SIMULATED_DELAY);
    });
  },

  async removeItem(userId, itemId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const db = getDB();
          const userList = db[userId] || [];
          
          const newList = userList.filter(i => i.id !== itemId);
          db[userId] = newList;
          saveDB(db);
          
          resolve(newList);
        } catch (error) {
           // FIX 4: Usamos la variable
           console.error("Service Remove Error:", error);
           reject(new Error("Error 500: Fallo al eliminar registro"));
        }
      }, SIMULATED_DELAY);
    });
  }
};