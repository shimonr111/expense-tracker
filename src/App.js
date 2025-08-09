import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation} from 'react-router-dom';
import { auth, onAuthStateChanged, signOut } from './utils/firebase-config';
import { getDatabase, ref, get } from 'firebase/database';
import Home from './pages/Home';
import Edit from './pages/Edit';
import About from './pages/About';
import Login from './pages/Login';
import Add from './pages/Add';
import NoPage from './pages/NoPage';
import './style.css';

// App Routes component - managing the routing
const AppRoutes = () => {
  const [user, setUser] = useState(null); // holds the currently logged-in user
  const [isAuthorized, setIsAuthorized] = useState(false); // whether the user is allowed (based on DB)
  const [loading, setLoading] = useState(true); // whether auth check is still in progress

  const location = useLocation(); // Gets the current route path (e.g "/")

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
              <li><NavLink to="/home" className={({ isActive }) => (isActive ? 'active-link' : undefined)}>Home</NavLink></li>
              <li><NavLink to="/edit" className={({ isActive }) => (isActive ? 'active-link' : undefined)}>Edit</NavLink></li>
              <li><NavLink to="/add" className={({ isActive }) => (isActive ? 'active-link' : undefined)}>Add</NavLink></li>
              <li><NavLink to="/about" className={({ isActive }) => (isActive ? 'active-link' : undefined)}>About</NavLink></li>
              <li><NavLink to="#" className="logout-link" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</NavLink></li>
            </>
          )}
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/edit" element={<ProtectedRoute element={<Edit />} />} />
        <Route path="/add" element={<ProtectedRoute element={<Add />} />} />
        <Route path="/about" element={<ProtectedRoute element={<About />} />} />
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

export const Version = "Version 1.0.15";
export default App;
