import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Login from './components/login/Login';
import Signup from './components/signup/Signup';
import Dashboard from './components/dashboard/Dashboard';
import Profile from './components/profile/Profile';
import { ProtectedRoute, PublicRoute } from './components/common/ProtectedRoute';
import { useSelector } from 'react-redux';
import './App.css';

function App() {
  const { token } = useSelector((state) => state.auth);

  return (
    <div className="app-container">
      {token && <Navbar />}
      <main className="main-content">
        <Routes>
          {/* Public Routes (only for unauthenticated users) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Protected Routes (for logged-in users) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback & Default Redirection */}
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
