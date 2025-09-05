// Sidebar.js
import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ isOpen, onClose, onLogout }) => {

  const handleLinkClick = () => {
    onClose(); // close sidebar
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={onClose}>X</button>
      <NavLink to="/edit" className="sidebar-link" onClick={handleLinkClick}>Edit</NavLink>
      <NavLink to="/add" className="sidebar-link" onClick={handleLinkClick}>Add</NavLink>
      <NavLink to="/settings" className="sidebar-link" onClick={handleLinkClick}>Settings</NavLink>
      <NavLink to="/about" className="sidebar-link" onClick={handleLinkClick}>About</NavLink>
      <NavLink to="#" className="sidebar-link" onClick={(e) => {
          e.preventDefault();
          onLogout();   // call logout
          onClose();    // close sidebar after logout
        }}>Logout</NavLink>
    </div>
  );
};

export default Sidebar;
