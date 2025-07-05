import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // ← This expects a default export
import './style.css'; // if you have CSS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
