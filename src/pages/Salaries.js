import React, { useEffect, useState } from 'react';
import { Version } from '../App.js';
import { db } from '../utils/firebase-config.js';
import { ref, update } from 'firebase/database';
import { renderSmallLoading } from '../utils/helpFunctions.js';

// Salaries Component page
const Salaries = () => {
  const [shimonSalary, setShimonSalary] = useState('');
  const [haviSalary, setHaviSalary] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  // This function activated when button is pressed
  const handleSubmit = async (e, name) => {
    e.preventDefault();
    setLoading(true);
    let value;

    if (name === 'shimon') {
      value = parseFloat(shimonSalary) || 0;
    } else {
      value = parseFloat(haviSalary) || 0;
    }

    try {
      // Use update to only change the specified salary
      await update(ref(db, 'Salaries'), {
        [name]: value
      });
      setMessage(`${name.charAt(0).toUpperCase() + name.slice(1)}'s salary updated successfully!`);
      setError(false);
      // Clear cached values so Stats page fetches fresh data
      sessionStorage.removeItem("totalSalaries");
      sessionStorage.removeItem("profits");
    } catch (err) {
      console.error('Error updating salary:', err);
      setMessage('Failed to update salary');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Update Salaries</h1>
      <form>
        <label>
          Shimon's Salary:
          <input type="text" inputMode="numeric" pattern="-?[0-9]*" value={shimonSalary} onChange={(e) => setShimonSalary(e.target.value)}/>
        </label>
        <button onClick={(e) => handleSubmit(e, 'shimon')} type="button" disabled={shimonSalary=='' || loading}>Update Shimon's Salary</button>
        <label>
          Havi's Salary:
          <input type="text" inputMode="numeric" pattern="-?[0-9]*" value={haviSalary} onChange={(e) => setHaviSalary(e.target.value)}/>
        </label>
        <button onClick={(e) => handleSubmit(e, 'havi')} type="button" disabled={haviSalary=='' || loading}>Update Havi's Salary</button>
        {loading && renderSmallLoading("Saving salary, please wait...")}
      </form>
      <div className={`message ${error ? 'error' : ''}`}>{message}</div>
      <div id="version-label">{Version}</div>
    </div>
  );
};

export default Salaries;
