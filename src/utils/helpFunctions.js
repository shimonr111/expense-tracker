import React from 'react';

// This function is responsible to display the feedback message after the user click on 'Save Expense' button
export function showMessage(msg, isError) {
  const positiveColors = ["green", "blue", "darkorange", "teal", "purple", "dodgerblue", "mediumseagreen"];
  const randomColor = positiveColors[Math.floor(Math.random() * positiveColors.length)];
  const messageDiv = document.getElementById('message');
  messageDiv.style.color = randomColor;
  messageDiv.textContent = msg;
  messageDiv.style.color = isError ? "red" : randomColor;
}

// This function get month number, and return month name
export function getMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1); // JS months are 0-based
  return date.toLocaleString('en-US', { month: 'long' }); // e.g., "June"
}

// This function parse and get the relevant date fields
export function getCurrentDateInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const timeOnly = now.toTimeString().split(' ')[0]; // "HH:mm:ss"
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }); // "Saturday"
  const dayOfMonth = now.getDate(); // 12
  const time = `${timeOnly} at ${dayOfWeek} ${dayOfMonth}`;
  return [year, month, time];
}

// This function update the max column witdth
export function updateMaxColumnWidths(maxLengths, colAValue, colBValue) {
  maxLengths[0] = Math.max(maxLengths[0], colAValue.length);
  maxLengths[1] = Math.max(maxLengths[1], colBValue.length);
}

export function parseLogTimestamp(ts) {
  try {
    // Example format: "07-33-24 at Thursday 24-7-2025"
    const [timePart] = ts.split(' at ');
    const dateStr = ts.split(' ').slice(-1)[0]; // Gets "24-7-2025"
    
    const [hours, minutes, seconds] = timePart.split('-').map(Number);
    const [day, month, year] = dateStr.split('-').map(Number);

    return new Date(year, month - 1, day, hours, minutes, seconds);
  } catch {
    return new Date(0); // fallback for invalid format
  }
}

// This function help to format the timestamp to a more readable format
export function formatTimestamp(input) {
  // Example input: "09-14-48 at Wednesday 1-10-2025"
  // Split into [timePart, dayPart]
  const [timePart, rest] = input.split(" at ");
  if (!timePart || !rest) return input; // fallback if not in expected format
  // rest looks like "Wednesday 1-10-2025"
  const [weekday, datePart] = rest.split(" ");
  if (!weekday || !datePart) return input;
  // Parse date
  const [day, month, year] = datePart.split("-");
  // Format into nicer short style (DD/MM/YY)
  const formattedDate = `${day}/${month}/${year.slice(-2)}`;
  // Ensure time is HH:MM:SS
  const formattedTime = timePart.replace(/-/g, ":");
  return `${formattedDate}\n${weekday}\nat ${formattedTime}`;
}

export function renderLoading(text) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh"
    }}>
      <div style={{
        border: "6px solid #f3f3f3",
        borderTop: "6px solid #3498db",
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        animation: "spin 1s linear infinite"
      }} />
      <p style={{ marginTop: "12px", fontSize: "14px", color: "#444" }}>{text}</p>
    </div>
  );
}

export function renderSmallLoading(text) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center", // horizontal centering
      alignItems: "center",     // vertical centering
      height: "100%",           // fill parent container vertically
      width: "100%",            // fill parent container horizontally
    }}>
      <div style={{ display: "inline-flex", alignItems: "center" }}>
        <div style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #3498db",
          borderRadius: "50%",
          width: "20px",
          height: "20px",
          animation: "spin 1s linear infinite"
        }} />
        {text && <span style={{ marginLeft: "6px", fontSize: "12px", color: "#444" }}>{text}</span>}
      </div>
    </div>
  );
}


