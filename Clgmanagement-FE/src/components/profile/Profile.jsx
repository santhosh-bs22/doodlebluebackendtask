import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProfile,
  addProfile,
  updateOwnProfile,
  clearProfileStatus,
} from '../../redux/slices/profileSlice';
import './Profile.css';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { data: profileData, loading, error, successMessage } = useSelector(
    (state) => state.profile
  );

  const [formData, setFormData] = useState({
    age: '',
    dob: '',
    bio: '',
  });

  // Fetch logged in user's profile on mount
  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(clearProfileStatus());
  }, [dispatch]);

  // Sync state when profile is fetched or updated
  useEffect(() => {
    if (profileData) {
      setFormData({
        age: profileData.age !== undefined && profileData.age !== null ? profileData.age : '',
        dob: profileData.dob ? profileData.dob.split('T')[0] : '',
        bio: profileData.bio || '',
      });
    } else if (user?.profile) {
      const p = typeof user.profile === 'object' ? user.profile : {};
      setFormData({
        age: p.age !== undefined && p.age !== null ? p.age : '',
        dob: p.dob ? p.dob.split('T')[0] : '',
        bio: p.bio || '',
      });
    }
  }, [profileData, user]);

  const hasProfile = Boolean(profileData || user?.profile);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hasProfile) {
      dispatch(updateOwnProfile(formData));
    } else {
      dispatch(addProfile(formData));
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-placeholder">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="profile-user-info">
            <h2>{user?.name || 'User Profile'}</h2>
            <p className="email-text">{user?.email}</p>
            <span className={`role-badge role-${user?.role?.toLowerCase()}`}>{user?.role}</span>
          </div>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <span>{error}</span>
            <button onClick={() => dispatch(clearProfileStatus())}>×</button>
          </div>
        )}

        {successMessage && (
          <div className="alert-box alert-success">
            <span>{successMessage}</span>
            <button onClick={() => dispatch(clearProfileStatus())}>×</button>
          </div>
        )}

        <div className="profile-body">
          <div className="profile-section-title">
            <h3>Personal Information</h3>
            <span className="profile-status-indicator">
              {hasProfile ? 'Profile Active' : 'No Profile Yet'}
            </span>
          </div>

          {loading && !profileData ? (
            <div className="profile-loading">
              <div className="spinner"></div>
              <p>Fetching your profile details...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    min="1"
                    max="120"
                    placeholder="e.g. 21"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dob">Date of Birth</label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bio">Biography / Notes</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  placeholder="Share a short bio or academic background..."
                  value={formData.bio}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="form-footer">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading
                    ? 'Saving...'
                    : hasProfile
                    ? 'Update Profile'
                    : 'Create Profile'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
