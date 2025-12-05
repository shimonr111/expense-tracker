import React, { useEffect, useState } from 'react';
import { Version } from '../App.js';
import { db } from '../utils/firebase-config.js';
import { ref, update } from 'firebase/database';
import { renderSmallLoading, useMessage } from '../utils/helpFunctions.js';

// Salaries Component page
const Salaries = () => {
  const [shimonSalary, setShimonSalary] = useState('');
  const [haviSalary, setHaviSalary] = useState('');
  const [loading, setLoading] = useState(false);

  const { message, color, showMessage } = useMessage();

  // This function activated when button is pressed
  const handleSubmit = async (e, name) => {
    e.preventDefault();
    setLoading(true);
    let value;

    if (name === 'Shimon') {
      value = parseFloat(shimonSalary) || 0;
    } else {
      value = parseFloat(haviSalary) || 0;
    }

    try {
      // Use update to only change the specified salary
      await update(ref(db, 'Salaries'), {
        [name]: value
      });
      //setMessage(`${name.charAt(0).toUpperCase() + name.slice(1)}'s salary updated successfully!`);
      //setError(false);
      showMessage(`${name}'s salary updated successfully!`, false); 
      // Clear cached values so Stats page fetches fresh data
      sessionStorage.removeItem("totalSalaries");
      sessionStorage.removeItem("profits");
    } catch (err) {
      showMessage("Failed to update salary", true);
      //setMessage('Failed to update salary');
      //setError(true);
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
          <input type="text" inputMode="numeric" pattern="-?[0-9]*" id="amount" value={shimonSalary} onChange={(e) => setShimonSalary(e.target.value)}/>
        </label>
        <button onClick={(e) => handleSubmit(e, 'Shimon')} type="button" disabled={shimonSalary=='' || loading}>Update Shimon's Salary</button>
        <label>
          Havi's Salary:
          <input type="text" inputMode="numeric" pattern="-?[0-9]*" id="amount" value={haviSalary} onChange={(e) => setHaviSalary(e.target.value)}/>
        </label>
        <button onClick={(e) => handleSubmit(e, 'Havi')} type="button" disabled={haviSalary=='' || loading}>Update Havi's Salary</button>
        {loading && renderSmallLoading("Saving salary, please wait...")}
      </form>
      <div className="message" id="message" style={{ color }}>{message}</div>
      <div id="version-label">{Version}</div>
    </div>
  );
};

export default Salaries;
