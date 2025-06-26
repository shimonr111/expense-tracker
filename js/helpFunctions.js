// This function is responsible to display the feedback message after the user click on 'Save Expense' button
function showMessage(msg, isError) {
  const positiveColors = ["green", "blue", "darkorange", "teal", "purple", "dodgerblue", "mediumseagreen"];
  const randomColor = positiveColors[Math.floor(Math.random() * positiveColors.length)];
  const messageDiv = document.getElementById('message');
  messageDiv.style.color = randomColor;
  messageDiv.textContent = msg;
  messageDiv.style.color = isError ? "red" : randomColor;
}

// This functions responsible for implementing the process of login to Google account, after 'Sign in with Google' clicked
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      console.log("User signed in:", user.displayName, user.email);
      // Write user data to database:
      db.ref("users/" + user.uid).set({
        name: user.displayName,
        email: user.email
      });
    })
    .catch((error) => {
      console.error("Google Sign-In Error:", error.message);
    });
}

// This function get month number, and return month name
function getMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1); // JS months are 0-based
  return date.toLocaleString('en-US', { month: 'long' }); // e.g., "June"
}

function getCurrentDateInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const time = now.toTimeString().split(' ')[0];
  return [year, month, time];
}
