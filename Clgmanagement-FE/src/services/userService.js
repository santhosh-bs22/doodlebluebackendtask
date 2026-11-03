import api from "./api";

export const userService = {
  // Auth endpoints
  login: async (credentials) => {
    return await api.post("/login", credentials);
  },
  signup: async (userData) => {
    return await api.post("/signup", userData);
  },

  // User management endpoints
  getAllUsers: async () => {
    return await api.get("/all");
  },
  getAllUsersWithoutPop: async () => {
    return await api.get("/all-without-pop");
  },
  getAllFaculty: async () => {
    return await api.get("/faculties");
  },
  getAllStudents: async (isActive) => {
    const query = isActive !== undefined ? `?isactive=${isActive}` : "";
    return await api.get(`/students${query}`);
  },
  searchUsers: async (params) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/search?${query}`);
  },
  updateUser: async (id, data) => {
    return await api.put(`/update/${id}`, data);
  },
  softDeleteUser: async (id) => {
    return await api.patch(`/soft-delete/${id}`);
  },
  deleteUser: async (id) => {
    return await api.delete(`/delete/${id}`);
  },

  // Profile endpoints
  getProfile: async () => {
    return await api.get("/profile");
  },
  getProfileByUserId: async (userId) => {
    return await api.get(`/profile/${userId}`);
  },
  createProfile: async (profileData) => {
    return await api.post("/profile", profileData);
  },
  updateProfile: async (profileData) => {
    return await api.put("/profile", profileData);
  },
  updateUserProfileById: async (userId, profileData) => {
    return await api.put(`/profile/${userId}`, profileData);
  },
};
