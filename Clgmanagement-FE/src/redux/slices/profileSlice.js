import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../services/userService';

// Fetch profile of the logged-in user
export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await userService.getProfile();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch profile');
    }
  }
);

// Add new profile
export const addProfile = createAsyncThunk(
  'profile/add',
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await userService.createProfile(profileData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create profile');
    }
  }
);

// Update own profile
export const updateOwnProfile = createAsyncThunk(
  'profile/updateOwn',
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await userService.updateProfile(profileData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update profile');
    }
  }
);

// Update user profile by ID (Faculty only)
export const updateUserProfileById = createAsyncThunk(
  'profile/updateById',
  async ({ userId, profileData }, { rejectWithValue }) => {
    try {
      const res = await userService.updateUserProfileById(userId, profileData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update user profile');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearProfileStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add profile
      .addCase(addProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.successMessage = 'Profile created successfully!';
      })
      .addCase(addProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Own profile
      .addCase(updateOwnProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateOwnProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.successMessage = 'Profile updated successfully!';
      })
      .addCase(updateOwnProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Profile By ID
      .addCase(updateUserProfileById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUserProfileById.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'User profile updated successfully!';
      })
      .addCase(updateUserProfileById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileStatus } = profileSlice.actions;
export default profileSlice.reducer;

