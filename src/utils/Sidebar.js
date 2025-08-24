// Sidebar.js
import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {

  const handleLinkClick = () => {
    onClose(); // close sidebar
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={onClose}>X</button>
      <NavLink to="/settings" className="sidebar-link" onClick={handleLinkClick}>Settings</NavLink>
      <NavLink to="/about" className="sidebar-link" onClick={handleLinkClick}>About</NavLink>
    </div>
  );
};

export default Sidebar;
