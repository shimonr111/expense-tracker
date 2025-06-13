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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

const signInBtn = document.getElementById("signInBtn");
const saveExpenseBtn = document.getElementById("saveExpenseBtn");

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in:", user.displayName, user.email);
    saveExpenseBtn.disabled = false;
    exportToExcelBtn.disabled = false;
    signInBtn.disabled = true;
  } else {
    console.log("No user is signed in.");
    saveExpenseBtn.disabled = true;
    exportToExcelBtn.disabled = true;
    signInBtn.disabled = false;
  }
});

