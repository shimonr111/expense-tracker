import React from 'react';
import { auth, provider, signInWithPopup } from '../utils/firebase-config';
import { Version } from '../App.js';

// Login Page Component 
const Login = () => {
  
  // Triggered when the user clicks the login button
  // Opens a Google login popup and signs in the user via Firebase Authentication
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-content">
        <h2>Welcome</h2>
        <p>Please login with your Google account to continue</p>
        <button className="login-button" onClick={handleLogin}>
          Login
        </button>
      </div>
      <div id="version-label">{Version}</div>
    </div>
  );
};

export default Login;
