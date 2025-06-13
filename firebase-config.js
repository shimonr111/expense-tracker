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

firebase.initializeApp(firebaseConfig); // Initialize Firebase with the configuration above
// Create references to Firebase services
const db = firebase.database();
const auth = firebase.auth();

// Get DOM elements of buttons
const signInBtn = document.getElementById("signInBtn");
const saveExpenseBtn = document.getElementById("saveExpenseBtn");

auth.onAuthStateChanged((user) => {
  if (user) { // If the user is signed in to its Google account then disable the 'Sign in with Google' button
    console.log("User is signed in:", user.displayName, user.email);
    saveExpenseBtn.disabled = false;
    exportToExcelBtn.disabled = false;
    signInBtn.disabled = true;
  } else { // Otherwise, disable the 'Save Expense' and the 'Export mont to Excel' buttons
    console.log("No user is signed in.");
    saveExpenseBtn.disabled = true;
    exportToExcelBtn.disabled = true;
    signInBtn.disabled = false;
  }
});

