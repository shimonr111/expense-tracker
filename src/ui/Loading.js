import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const Loading = ({ message = "Loading your Expense Tracker..." }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #6dd5fa, #2980b9)'
    }}>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '400px',
        color: '#fff',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        textAlign: 'center',
        padding: '20px'
      }}>
        
        {/* Animated Text Logo */}
        <h1 style={{
          fontSize: 36,
          fontWeight: 'bold',
          marginBottom: 30,
          letterSpacing: 2,
          color: '#fff',
          textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
          animation: 'logoBounce 1.5s infinite alternate'
        }}>
          ExpenseTracker
        </h1>

        {/* Spinner */}
        <FaSpinner style={{
          fontSize: 50,
          marginBottom: 20,
          animation: 'spin 1s linear infinite',
          color: '#fff'
        }} />

        {/* Message */}
        <div style={{
          fontSize: 18,
          fontWeight: 500,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {message}
        </div>

        {/* Keyframes */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            @keyframes logoBounce {
              0% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
              100% { transform: translateY(0); }
            }
          `}
        </style>

      </div>
    </div>
  );
};

export default Loading;
