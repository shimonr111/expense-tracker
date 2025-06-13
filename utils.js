function showMessage(msg, isError) {
  const positiveColors = ["green", "blue", "darkorange", "teal", "purple", "dodgerblue", "mediumseagreen"];
  const randomColor = positiveColors[Math.floor(Math.random() * positiveColors.length)];
  const messageDiv = document.getElementById('message');
  messageDiv.style.color = randomColor;
  messageDiv.textContent = msg;
  messageDiv.style.color = isError ? "red" : randomColor;
}

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

function exportToExcel() {
  console.log("Export to excel file");
}
