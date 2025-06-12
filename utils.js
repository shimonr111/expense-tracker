function showMessage(msg, isError) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = msg;
  messageDiv.style.color = isError ? "red" : "green";
}
