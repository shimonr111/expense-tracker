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
import Remove from './pages/Remove';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import History from './pages/History';
import Insights from './pages/Insights';
import Salaries from './pages/Salaries';
import NoPage from './pages/NoPage';
import './style.css';
import { renderLoading } from './utils/helpFunctions';
import { FaHome, FaChartPie, FaHistory, FaLightbulb, FaSpinner } from 'react-icons/fa';

const AppRoutes = React.memo(({ setSidebarOpen }) => {
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

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

  // If loading is true then set div "Verifying authentication, please wait..."
  // Its called when you try to acces one of the protected routes (Home/Edit/About)
  const ProtectedRoute = ({ element }) => {
    if (loading) return renderLoading("Verifying authentication, please wait...");
    if (!user || !isAuthorized) return <Navigate to="/" replace />; // if not logged in or not authorized -> redirects to Login page
    return element;
  };

  // Prevent any rendering until Firebase check is done (avoids flashing Login screen at the initial before routing)
  if (loading) return renderLoading("Verifying authentication, please wait...");

  // If already logged in and on the login page ("/"), redirect to the Home page
  if (user && isAuthorized && location.pathname === "/") {
    return <Navigate to="/home" replace />;
  }

  return (
    <>
      <nav>
        <ul>
          {user && isAuthorized && (
            <>
              <li>
                <NavLink to="#" onClick={(e) => { e.preventDefault(); setSidebarOpen(true); }}>
                  ☰
                </NavLink>
              </li>
               <li>
                <NavLink to="/home" style={{ fontSize: '12.5px'}} className={({ isActive }) => isActive ? 'active-link' : undefined}>
                  <FaHome style={{ marginRight: '1px' }} /> Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/stats" style={{ fontSize: '12.5px'}} className={({ isActive }) => isActive ? 'active-link' : undefined}>
                  <FaChartPie style={{ marginRight: '1px' }} /> Stats
                </NavLink>
              </li>
              <li>
                <NavLink to="/history" style={{ fontSize: '12.5px'}} className={({ isActive }) => isActive ? 'active-link' : undefined}>
                  <FaHistory style={{ marginRight: '1px' }} /> History
                </NavLink>
              </li>
              <li>
                <NavLink to="/insights" style={{ fontSize: '12.5px'}} className={({ isActive }) => isActive ? 'active-link' : undefined}>
                  <FaLightbulb style={{ marginRight: '1px' }} /> Insights
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/stats" element={<ProtectedRoute element={<Stats />} />} />
        <Route path="/edit" element={<ProtectedRoute element={<Edit />} />} />
        <Route path="/add" element={<ProtectedRoute element={<Add />} />} />
        <Route path="/remove" element={<ProtectedRoute element={<Remove />} />} />
        <Route path="/about" element={<ProtectedRoute element={<About />} />} />
        <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
        <Route path="/history" element={<ProtectedRoute element={<History />} />} />
        <Route path="/insights" element={<ProtectedRoute element={<Insights />} />} />
        <Route path="/salaries" element={<ProtectedRoute element={<Salaries />} />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </>
  );
});

const isDev = process.env.NODE_ENV === 'development';
const basename = isDev ? '/' : '/expense-tracker';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = () => signOut(auth); // Triggered when the user is logged out
  return (
    <Router basename={basename}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout}/>
      <AppRoutes setSidebarOpen={setSidebarOpen}/>
    </Router>
  );
};

export const Version = "Version 1.0.50";
export default App;
