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
