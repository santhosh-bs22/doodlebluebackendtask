import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../services/userService';

// Fetch users based on role/filter
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (type = 'all', { rejectWithValue }) => {
    try {
      let res;
      if (type === 'faculty') {
        res = await userService.getAllFaculty();
      } else if (type === 'students') {
        res = await userService.getAllStudents();
      } else if (type === 'all-without-pop') {
        res = await userService.getAllUsersWithoutPop();
      } else {
        res = await userService.getAllUsers();
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch users');
    }
  }
);

export const searchUsers = createAsyncThunk(
  'users/search',
  async (queryParams, { rejectWithValue }) => {
    try {
      const res = await userService.searchUsers(queryParams);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to search users');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await userService.updateUser(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update user');
    }
  }
);

export const softDeleteUser = createAsyncThunk(
  'users/softDelete',
  async (id, { rejectWithValue }) => {
    try {
      await userService.softDeleteUser(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to deactivate user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      await userService.deleteUser(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to permanently delete user');
    }
  }
);

export const updateStudentProfileByFaculty = createAsyncThunk(
  'users/updateStudentProfile',
  async ({ userId, profileData }, { rejectWithValue }) => {
    try {
      const res = await userService.updateUserProfileById(userId, profileData);
      return { userId, profile: res.data };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update student profile');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    loading: false,
    actionLoading: false,
    error: null,
    successMessage: null,
    activeFilter: 'all',
  },
  reducers: {
    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
    },
    clearUserStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'User updated successfully!';
        const updated = action.payload;
        state.list = state.list.map((u) => (u._id === updated._id ? updated : u));
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Soft delete user
      .addCase(softDeleteUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(softDeleteUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'User deactivated successfully!';
        state.list = state.list.map((u) =>
          u._id === action.payload ? { ...u, isActive: false } : u
        );
      })
      .addCase(softDeleteUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Permanently delete user
      .addCase(deleteUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'User permanently deleted!';
        state.list = state.list.filter((u) => u._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update student profile by faculty
      .addCase(updateStudentProfileByFaculty.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateStudentProfileByFaculty.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'Student profile updated successfully!';
        const { userId, profile } = action.payload;
        state.list = state.list.map((u) =>
          u._id === userId ? { ...u, profile } : u
        );
      })
      .addCase(updateStudentProfileByFaculty.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveFilter, clearUserStatus } = userSlice.actions;
export default userSlice.reducer;

