import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="navbar-container">
      <div className="navbar-brand">
        <NavLink to="/dashboard" className="brand-logo">
          🎓 <span>EduPortal</span>
        </NavLink>
        <span className="brand-badge">{user?.role?.toUpperCase()}</span>
      </div>

      <nav className="navbar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          My Profile
        </NavLink>
      </nav>

      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">{user?.name || user?.email}</span>
          <span className="user-email">{user?.email}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn" title="Sign out">
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Navbar;

