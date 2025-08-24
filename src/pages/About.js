import React from 'react';
import { Version } from '../App.js';

// About Page Component 
const About = () => (
  <div>
    <h1>About</h1>
    <p>This app was developed to manage expenses easily and efficiently.</p>
    
    <hr style={{ margin: '30px 0' }} />

    <p style={{ fontStyle: 'italic', color: 'gray' }}>
      Created with 💻 by <strong>Shimon Rubin</strong>
    </p>
    <div id="version-label">{Version}</div>
  </div>
);

export default About;
