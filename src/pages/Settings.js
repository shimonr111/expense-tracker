import React, { useEffect, useState } from 'react';
import { auth } from '../utils/firebase-config';
import { getDatabase, ref, get, set } from 'firebase/database';
import { Version } from '../App.js';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    role: ''
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // Reads a cached value (if exist) from earlier visit in the same session
    const cachedUser = sessionStorage.getItem("user");
    const cachedProfile = sessionStorage.getItem("profile");
    if (cachedUser && cachedProfile) {
      setUser(JSON.parse(cachedUser));
      setProfile(JSON.parse(cachedProfile));
      return;
    }

    if (auth.currentUser) {
      setUser(auth.currentUser);
      sessionStorage.setItem("user", JSON.stringify(auth.currentUser));
      const db = getDatabase();
      const userRef = ref(db, `users/${auth.currentUser.uid}`);

      get(userRef).then(snapshot => {
        if (snapshot.exists()) {
          setProfile(snapshot.val());
          sessionStorage.setItem("profile", JSON.stringify(snapshot.val()));
        } else {
          // fallback to auth info if DB entry not found
          setProfile({
            displayName: auth.currentUser.displayName || '',
            email: auth.currentUser.email,
            role: 'user'
          });
          sessionStorage.setItem("profile", JSON.stringify({
            displayName: auth.currentUser.displayName || '',
            email: auth.currentUser.email,
            role: 'user'
          }));
        }
      });
    }
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const db = getDatabase();
    const userRef = ref(db, `users/${auth.currentUser.uid}`);
    set(userRef, profile).then(() => {
      setEditing(false);
      alert("Profile updated successfully ✅");
    });
  };

  if (!user) {
    return <p>You need to log in to view settings.</p>;
  }

  return (
    <div>
      <h1>Settings</h1>

      {!editing ? (
        <div>
          <p><strong>Name:</strong> {profile.displayName}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <button disabled onClick={() => setEditing(true)}>Edit</button>
        </div>
      ) : (
        <div>
          <label>
            Name:
            <input 
              type="text" 
              name="displayName" 
              value={profile.displayName} 
              onChange={handleChange} 
            />
          </label>
          <br />
          <label>
            Email:
            <input 
              type="email" 
              name="email" 
              value={profile.email} 
              onChange={handleChange} 
              disabled // usually email comes from Firebase Auth, safer not to allow edit
            />
          </label>
          <br />
          <label>
            Role:
            <input 
              type="text" 
              name="role" 
              value={profile.role} 
              onChange={handleChange} 
            />
          </label>
          <br />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </div>
      )}
      <div id="version-label">{Version}</div>
    </div>
  );
};

export default Settings;
