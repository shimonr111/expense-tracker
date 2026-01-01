import { db } from './firebase-config.js';  
import { ref, get, remove, update } from 'firebase/database';

export async function cleanLogFile() {
  try {
    const logRef = ref(db, 'log');
    const snapshot = await get(logRef);
    if (!snapshot.exists()) {
      return;
    }
    await remove(logRef); // <-- this deletes all data under 'log'
  } catch (error) {
  }
}

export async function resetSalaries() {
  try {
    const salariesRef = ref(db, 'Salaries');
    const snapshot = await get(salariesRef);

    if (!snapshot.exists()) {
      alert("Salaries not found.");
      return;
    }

    const data = snapshot.val();
    const resetData = {};

    for (const key in data) {
      resetData[key] = 0;
    }

    await update(salariesRef, resetData);
    console.log("Salaries reset successfully");
  } catch (error) {
    console.error("Reset salaries failed:", error);
  }
}
