import { db } from './firebase-config.js';  
import { ref, get, remove } from 'firebase/database';

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