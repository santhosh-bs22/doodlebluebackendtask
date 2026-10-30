const userService = require("../services/user.services.js");
const { Roles } = require("../constants/roles.js");

class UserController {
    
    async signup(req, res) {
        try {
            const { name, password, email, role } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: "All Fields are required" });
            }
            const assignedRole = role || Roles.STUDENT;
            const result = await userService.signup(name, email, password, assignedRole);
            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data: result
            });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllUser(req, res) {
        try {
            const result = await userService.getAllUser();
            return res.status(200).json({
                success: true,
                message: "Users fetched successfully",
                count: result.length,
                data: result
            });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllUserwithoutPop(req, res) {
        try {
            const result = await userService.getAllUserwithoutPop();
            return res.status(200).json({
                success: true,
                message: "Users fetched successfully",
                count: result.length,
                data: result
            });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllFaculty(req, res) {
        try {
            const result = await userService.getAllFaculty();
            return res.status(200).json({
                success: true,
                message: "Faculty list fetched successfully",
                count: result.length,
                data: result
            });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllStudents(req, res) {
        try {
            const { isactive } = req.query;
            const result = await userService.getAllStudents(isactive);
            return res.status(200).json({
                success: true,
                message: "Students fetched successfully",
                count: result.length,
                data: result
            });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getUserByQuery(req, res) {
        try {
            const { name, email } = req.query;
            const result = await userService.getUserByQuery(name, email);
            return res.status(200).json({
                success: true,
                message: "User fetch successfully",
                count: result.length,
                data: result
            });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const result = await userService.deleteUser(id);
            return res.status(200).json({
                success: true,
                message: "User deleted successfully",
                data: result
            });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const currentUser = req.user;
            const result = await userService.updateUser(id, updateData, currentUser);
            return res.status(200).json({
                success: true,
                message: "User updated Successfully",
                data: result
            });
        } catch (error) {
            console.log(error.message);
            return res.status(403).json({
                success: false,
                message: error.message
            });
        }
    }

    async softdeleteUser(req, res) {
        try {
            const { id } = req.params;
            const result = await userService.softdeleteUser(id);
            return res.status(200).json({
                success: true,
                message: "User soft deleted successfully",
                data: result
            });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const { password, email } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, message: "Email and password are required" });
            }
            const result = await userService.loginUser(email, password, res);
            return res.status(200).json({
                success: true,
                message: "Login successfully",
                data: result
            });
        } catch (error) {
            console.log(error.message);
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    async addUserProfile(req, res) {
        try {
            const userid = req.user.id;
            const { age, dob, bio } = req.body;
            if (!userid) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required"
                });
            }
            const newuserprofile = await userService.adduserProfile(userid, { age, dob, bio }, req.user);
            return res.status(201).json({
                success: true,
                message: "user profile added successfully",
                data: newuserprofile
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "A profile for this user already exists"
                });
            }
            console.log(error.message);
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateUserProfile(req, res) {
        try {
            const { userid } = req.params;
            const { age, dob, bio } = req.body;
            const currentUser = req.user;

            const targetUserId = userid || currentUser.id;
            const updatedProfile = await userService.updateUserProfile(targetUserId, { age, dob, bio }, currentUser);

            return res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: updatedProfile
            });
        } catch (error) {
            console.log(error.message);
            return res.status(403).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new UserController();

