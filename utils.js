function showMessage(msg, isError) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = msg;
  messageDiv.style.color = isError ? "red" : "green";
}

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      console.log("User signed in:", user.displayName, user.email);
      // Optionally write user data to database:
      db.ref("users/" + user.uid).set({
        name: user.displayName,
        email: user.email
      });
    })
    .catch((error) => {
      console.error("Google Sign-In Error:", error.message);
    });
}
