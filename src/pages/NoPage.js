import React from 'react';
import { Version } from '../App.js';

// NoPage Component 
const NoPage = () => (
  <div style={{ textAlign: 'center', padding: '2rem' }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for doesn't exist.</p>
    <div id="version-label">{Version}</div>
  </div>
);

export default NoPage;
