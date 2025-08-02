import { showMessage } from './helpFunctions.js';
import { db } from './firebase-config.js';  
import { ref, get, remove } from 'firebase/database';

export async function cleanLogFile() {
  try {
    const logRef = ref(db, 'log');
    const snapshot = await get(logRef);

    if (!snapshot.exists()) {
      showMessage('No logs found to delete.', true);
      return;
    }

    await remove(logRef); // <-- this deletes all data under 'log'
    showMessage('Log data cleaned successfully!', false);
  } catch (error) {
    showMessage('Error cleaning log data: ' + error.message, true);
  }
}