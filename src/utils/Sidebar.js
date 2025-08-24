// Sidebar.js
import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={onClose}>Close</button>
      <NavLink to="/home" className="sidebar-link">Link1</NavLink>
      <NavLink to="/home" className="sidebar-link">Link2</NavLink>
      <NavLink to="/home" className="sidebar-link">Link3</NavLink>
    </div>
  );
};

export default Sidebar;
