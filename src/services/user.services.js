const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwtservices = require("../jwt/jwt.services.js");
const mongoose = require("mongoose");
const userProfile = require("../models/user.profile.model.js");
const { Roles } = require("../constants/roles.js");

class UserServices {
    async signup(name, email, password, role = Roles.STUDENT) {
        const hashedpassword = await bcrypt.hash(String(password), 10);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error("Email already there");
        }
        const user = await User.create({
            name,
            email,
            password: hashedpassword,
            role
        });
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        return userWithoutPassword;
    }

    async getAllUser() {
        const users = await User.find({ isActive: true }).populate("profile");
        return users;
    }

    async getAllUserwithoutPop() {
        const users = await User.find({ isActive: true });
        const userid = users.map(user => user._id);
        const userProfiles = await userProfile.find({ user: { $in: userid } });

        const userwithProfiles = users.map(user => {
            const profile = userProfiles.find(profile => profile.user.toString() === user._id.toString());
            return {
                ...user.toObject(),
                profile: profile || null
            };
        });
        return userwithProfiles;
    }

    async getAllFaculty() {
        const faculties = await User.find({ role: Roles.FACULTY, isActive: true }).populate("profile");
        return faculties;
    }

    async getAllStudents(isActive) {
        const filter = { role: Roles.STUDENT };
        if (isActive !== undefined) {
            filter.isActive = (isActive === "true" || isActive === true);
        } else {
            // Default to active students
            filter.isActive = true;
        }
        const students = await User.find(filter).populate("profile");
        return students;
    }

    async getUserByQuery(name, email) {
        const filter = {};
        if (name) {
            filter.name = name;
        }
        if (email) {
            filter.email = email;
        }
        const users = await User.find(filter);
        return users;
    }

    async deleteUser(id) {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new Error("User not found");
        }
        await userProfile.findOneAndDelete({ user: id });
        return user;
    }

    async updateUser(id, updateData, currentUser) {
        if (!mongoose.isValidObjectId(id)) {
            throw new Error("Invalid User ID");
        }

        const targetUser = await User.findById(id);
        if (!targetUser) {
            throw new Error("User not found");
        }

        // Authorization checks
        if (currentUser.role === Roles.STUDENT) {
            // Student can only update their own profile
            if (currentUser.id.toString() !== id.toString()) {
                throw new Error("Students can only update their own profile");
            }
        } else if (currentUser.role === Roles.FACULTY) {
            // Faculty can update all student profiles OR their own profile
            const isSelf = currentUser.id.toString() === id.toString();
            const isTargetStudent = targetUser.role === Roles.STUDENT;

            if (!isSelf && !isTargetStudent) {
                throw new Error("Faculty can only update their own profile or student profiles");
            }
        }

        const data = { ...updateData };
        if (data.password) {
            data.password = await bcrypt.hash(String(data.password), 10);
        }

        // Prevent unauthorized role manipulation if needed
        if (currentUser.role === Roles.STUDENT && data.role) {
            delete data.role;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            data,
            {
                new: true,
                runValidators: true
            }
        ).populate("profile");

        return updatedUser;
    }

    async softdeleteUser(id) {
        if (!mongoose.isValidObjectId(id)) {
            throw new Error("Invalid User ID");
        }

        const user = await User.findByIdAndUpdate(
            id,
            { isActive: false },
            {
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    }

    async loginUser(email, password, res) {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            throw new Error("User not Found");
        }
        if (!user.isActive) {
            throw new Error("Account was inactive");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid Password");
        }

        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
            isactive: user.isActive
        };
        const token = jwtservices.generateToken(payload);
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        return { user: userWithoutPassword, token };
    }

    async adduserProfile(userid, profiledata, currentUser) {
        if (!mongoose.isValidObjectId(userid)) {
            throw new Error("Invalid User ID");
        }

        // Faculty can only add their own profiles alone; Student can also add only their own profile
        if (currentUser.id.toString() !== userid.toString()) {
            throw new Error("Users can only create/add their own profile");
        }

        const user = await User.findById(userid);
        if (!user) {
            throw new Error("User not found");
        }

        const existingProfile = await userProfile.findOne({ user: userid });
        if (existingProfile) {
            throw new Error("A profile for this user already exists");
        }

        const newprofile = await userProfile.create({
            user: userid,
            age: profiledata.age,
            dob: profiledata.dob,
            bio: profiledata.bio
        });

        user.profile = newprofile._id;
        await user.save();

        return newprofile;
    }

    async updateUserProfile(userid, profiledata, currentUser) {
        if (!mongoose.isValidObjectId(userid)) {
            throw new Error("Invalid User ID");
        }

        const targetUser = await User.findById(userid);
        if (!targetUser) {
            throw new Error("User not found");
        }

        // Authorization rule:
        // Student only update their own profile
        // Faculty can update all students profile and their own profile
        if (currentUser.role === Roles.STUDENT) {
            if (currentUser.id.toString() !== userid.toString()) {
                throw new Error("Students can only update their own profile");
            }
        } else if (currentUser.role === Roles.FACULTY) {
            const isSelf = currentUser.id.toString() === userid.toString();
            const isTargetStudent = targetUser.role === Roles.STUDENT;

            if (!isSelf && !isTargetStudent) {
                throw new Error("Faculty can only update students profile or their own profile");
            }
        }

        const updatedProfile = await userProfile.findOneAndUpdate(
            { user: userid },
            {
                age: profiledata.age,
                dob: profiledata.dob,
                bio: profiledata.bio
            },
            { new: true, upsert: true, runValidators: true }
        );

        if (!targetUser.profile) {
            targetUser.profile = updatedProfile._id;
            await targetUser.save();
        }

        return updatedProfile;
    }
}

module.exports = new UserServices();

