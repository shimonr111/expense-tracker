import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
  
  // Firebase project configuration details
  const firebaseConfig = {
    apiKey: "AIzaSyAUY-V4nwwc1Agy09B5qSwcXuQ3yfz3Beo",
    authDomain: "expensetrackerz.firebaseapp.com",
    databaseURL: "https://expensetrackerz-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "expensetrackerz",
    storageBucket: "expensetrackerz.firebasestorage.app",
    messagingSenderId: "711206263090",
    appId: "1:711206263090:web:ee33c43db4c953c01a5f2b",
    measurementId: "G-6309MYR3YM"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
// Initialize services
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, db, auth, provider, signInWithPopup, signOut, onAuthStateChanged };


