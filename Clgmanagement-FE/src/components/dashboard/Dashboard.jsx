import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  searchUsers,
  updateUser,
  softDeleteUser,
  deleteUser,
  updateStudentProfileByFaculty,
  setActiveFilter,
  clearUserStatus,
} from '../../redux/slices/userSlice';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { list: users, loading, actionLoading, error, successMessage, activeFilter } = useSelector(
    (state) => state.users
  );

  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  // Modals state
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: '' });

  const [profileModalUser, setProfileModalUser] = useState(null);
  const [profileFormData, setProfileFormData] = useState({ age: '', dob: '', bio: '' });

  const isFaculty = currentUser?.role?.toUpperCase() === 'FACULTY';

  useEffect(() => {
    dispatch(clearUserStatus());
    if (isFaculty) {
      dispatch(fetchUsers(activeFilter));
    } else {
      // Students can view all students
      dispatch(fetchUsers('students'));
    }
  }, [dispatch, activeFilter, isFaculty]);

  const handleFilterChange = (filter) => {
    dispatch(setActiveFilter(filter));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = {};
    if (searchName.trim()) query.name = searchName.trim();
    if (searchEmail.trim()) query.email = searchEmail.trim();
    dispatch(searchUsers(query));
  };

  const handleResetSearch = () => {
    setSearchName('');
    setSearchEmail('');
    dispatch(fetchUsers(activeFilter));
  };

  // Edit Account Info
  const handleStartEdit = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'student',
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingUser) {
      dispatch(updateUser({ id: editingUser._id, data: editFormData }));
      setEditingUser(null);
    }
  };

  // View / Edit Student Profile (Faculty)
  const handleOpenProfileModal = (user) => {
    setProfileModalUser(user);
    const p = user.profile || {};
    setProfileFormData({
      age: p.age !== undefined && p.age !== null ? p.age : '',
      dob: p.dob ? p.dob.split('T')[0] : '',
      bio: p.bio || '',
    });
  };

  const handleSaveStudentProfile = (e) => {
    e.preventDefault();
    if (profileModalUser) {
      dispatch(
        updateStudentProfileByFaculty({
          userId: profileModalUser._id,
          profileData: profileFormData,
        })
      );
      setProfileModalUser(null);
    }
  };

  const handleSoftDelete = (id) => {
    if (window.confirm('Are you sure you want to deactivate (soft-delete) this user?')) {
      dispatch(softDeleteUser(id));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) {
      dispatch(deleteUser(id));
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header section */}
      <div className="dashboard-header">
        <div>
          <h2>User Management Dashboard</h2>
          <p>
            Logged in as <strong>{currentUser?.name || currentUser?.email}</strong> (
            <span className="role-tag">{currentUser?.role}</span>)
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="status-banner banner-error">
          <span>{error}</span>
          <button onClick={() => dispatch(clearUserStatus())}>×</button>
        </div>
      )}

      {successMessage && (
        <div className="status-banner banner-success">
          <span>{successMessage}</span>
          <button onClick={() => dispatch(clearUserStatus())}>×</button>
        </div>
      )}

      {/* Faculty Tools: Filter Bar & Search */}
      {isFaculty ? (
        <div className="controls-panel">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All Users
            </button>
            <button
              className={`filter-btn ${activeFilter === 'faculty' ? 'active' : ''}`}
              onClick={() => handleFilterChange('faculty')}
            >
              Faculty Only
            </button>
            <button
              className={`filter-btn ${activeFilter === 'students' ? 'active' : ''}`}
              onClick={() => handleFilterChange('students')}
            >
              Students Only
            </button>
            <button
              className={`filter-btn ${activeFilter === 'all-without-pop' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all-without-pop')}
              title="Fetch without populate"
            >
              Raw Aggregate
            </button>
          </div>

          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="search-input"
            />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="action-btn search-btn">
              Search
            </button>
            {(searchName || searchEmail) && (
              <button
                type="button"
                onClick={handleResetSearch}
                className="action-btn reset-btn"
              >
                Reset
              </button>
            )}
          </form>
        </div>
      ) : (
        <div className="student-notice">
          <p>Viewing verified student records</p>
        </div>
      )}

      {/* Main Table / Content */}
      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <p>No users found matching current filters.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Age</th>
                  <th>Bio</th>
                  {isFaculty && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((item) => {
                  const profile = item.profile;
                  const isStudentUser = item.role?.toUpperCase() === 'STUDENT';

                  return (
                    <tr key={item._id} className={!item.isActive ? 'row-inactive' : ''}>
                      <td className="user-name-cell">
                        <strong>{item.name}</strong>
                      </td>
                      <td>{item.email}</td>
                      <td>
                        <span className={`badge badge-${item.role?.toLowerCase()}`}>
                          {item.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item.isActive ? 'badge-active' : 'badge-inactive'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>{profile?.age || '-'}</td>
                      <td className="bio-cell">{profile?.bio || '-'}</td>
                      {isFaculty && (
                        <td>
                          {isStudentUser ? (
                            <div className="action-buttons">
                              <button
                                onClick={() => handleOpenProfileModal(item)}
                                className="btn-sm btn-profile"
                                title="View & Edit Student Profile"
                                disabled={actionLoading}
                              >
                                Profile
                              </button>
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="btn-sm btn-edit"
                                disabled={actionLoading}
                                title="Edit user credentials"
                              >
                                Edit
                              </button>
                              {item.isActive && (
                                <button
                                onClick={() => handleSoftDelete(item._id)}
                                className="btn-sm btn-deactivate"
                                disabled={actionLoading}
                                title="Deactivate student"
                              >
                                Deactivate
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="btn-sm btn-delete"
                              disabled={actionLoading}
                              title="Delete permanently"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="view-only-text">View Only</span>
                        )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Account Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h3>Edit User: {editingUser.name}</h3>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                />
              </div>

              {isFaculty && (
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, role: e.target.value })
                    }
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                  </select>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="action-btn cancel-btn"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="action-btn save-btn"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View & Edit Student Profile Modal (Faculty feature) */}
      {profileModalUser && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h3>
              Student Profile: {profileModalUser.name}
            </h3>
            <p className="modal-subtitle">{profileModalUser.email}</p>

            <form onSubmit={handleSaveStudentProfile}>
              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 21"
                    value={profileFormData.age}
                    onChange={(e) =>
                      setProfileFormData({ ...profileFormData, age: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={profileFormData.dob}
                    onChange={(e) =>
                      setProfileFormData({ ...profileFormData, dob: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Biography / Notes</label>
                <textarea
                  rows="4"
                  placeholder="Student academic notes, bio..."
                  value={profileFormData.bio}
                  onChange={(e) =>
                    setProfileFormData({ ...profileFormData, bio: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="action-btn cancel-btn"
                  onClick={() => setProfileModalUser(null)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="action-btn save-btn"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Updating Profile...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
