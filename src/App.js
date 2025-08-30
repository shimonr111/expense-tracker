import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation} from 'react-router-dom';
import { auth, onAuthStateChanged, signOut } from './utils/firebase-config';
import Sidebar from "./utils/Sidebar";
import { getDatabase, ref, get } from 'firebase/database';
import Home from './pages/Home';
import Edit from './pages/Edit';
import About from './pages/About';
import Login from './pages/Login';
import Add from './pages/Add';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import NoPage from './pages/NoPage';
import './style.css';
import { FaHome, FaChartPie, FaEdit, FaPlus } from 'react-icons/fa';

// App Routes component - managing the routing
const AppRoutes = () => {
  const [user, setUser] = useState(null); // holds the currently logged-in user
  const [isAuthorized, setIsAuthorized] = useState(false); // whether the user is allowed (based on DB)
  const [loading, setLoading] = useState(true); // whether auth check is still in progress
  const location = useLocation(); // Gets the current route path (e.g "/")
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Side effect - it listens for changes in the Firebase authentication state (login/logout), so it will get triggered then
  // This side effect also triggered once, right after AppRoutes component is mounted
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { // Firebase method that fires when the user's auth changes
      setUser(currentUser); // Store the current Firebase user
      if (currentUser) { // If user is not null, check if the current user is allowed based on the data in the DB
        const emailKey = currentUser.email.replace(/\./g, '_');
        const db = getDatabase();
        const snapshot = await get(ref(db, `allowed_users/${emailKey}`));
        const isAllowed = snapshot.exists() && snapshot.val() === true;
        setIsAuthorized(isAllowed);
        if (!isAllowed) {
        alert("You are not allowed to access this app.");
        await signOut(auth);
        }
      } else {
        setIsAuthorized(false); // Not authorized or the user logged out
      }
      setLoading(false); // Once done stop loading (stop showing "Verifying authentication..." message)
    });

    return () => unsubscribe(); // Unsubscribes from onAuthStateChanged, and prevent memory leaks or duplicate listeners
  }, []);

  // Triggered when the user is logged out
  const handleLogout = () => {
    signOut(auth);
  };

  // If loading is true then set div "Verifying authentication, please wait..."
  // Its called when you try to acces one of the protected routes (Home/Edit/About)
  const ProtectedRoute = ({ element }) => {
    if (loading) return <div className="loading-message">Verifying authentication, please wait...</div>;
    if (!user || !isAuthorized) return <Navigate to="/" replace />; // if not logged in or not authorized -> redirects to Login page
    return element;
  };

  // Prevent any rendering until Firebase check is done (avoids flashing Login screen at the initial before routing)
  if (loading) return <div className="loading-message">Verifying authentication, please wait...</div>;

  // If already logged in and on the login page ("/"), redirect to the Home page
  if (user && isAuthorized && location.pathname === "/") {
    return <Navigate to="/home" replace />;
  }

  return (
    <>
      <nav>
        <ul>
          {user && isAuthorized && ( // If logged in and authorized, show the sidebar nav
            <>
              <li><NavLink to="#" onClick={(e) => {e.preventDefault(); setSidebarOpen(true);}}>☰</NavLink></li>
              <li>
                <NavLink to="/home" className={({ isActive }) => isActive ? 'active-link' : undefined}>
                  <FaHome style={{ marginRight: '2px' }} /> Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/stats" className={({ isActive }) => isActive ? 'active-link' : undefined}>
                  <FaChartPie style={{ marginRight: '2px' }} /> Stats
                </NavLink>
              </li>
              <li>
                <NavLink to="/edit" className={({ isActive }) => isActive ? 'active-link' : undefined}>
                  <FaEdit style={{ marginRight: '2px' }} /> Edit
                </NavLink>
              </li>
              <li>
                <NavLink to="/add" className={({ isActive }) => isActive ? 'active-link' : undefined}>
                  <FaPlus style={{ marginRight: '2px' }} /> Add
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onLogout={handleLogout}
      />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/stats" element={<ProtectedRoute element={<Stats />} />} />
        <Route path="/edit" element={<ProtectedRoute element={<Edit />} />} />
        <Route path="/add" element={<ProtectedRoute element={<Add />} />} />
        <Route path="/about" element={<ProtectedRoute element={<About />} />} />
        <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </>
  );
};

const isDev = process.env.NODE_ENV === 'development';
const basename = isDev ? '/' : '/expense-tracker';

// Wrap everthing in Router
const App = () => (
  <Router basename={basename}>
    <AppRoutes />
  </Router>
);

export const Version = "Version 1.0.28";
export default App;
