const mongoose = require("mongoose");
const { Roles, ROLES_LIST } = require("../constants/roles");

const userschema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is Required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is Required"],
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, "Password is Required"],
            select: false
        },
        role: {
            type: String,
            enum: { 
                values: ROLES_LIST,
                message: "{VALUE} is not a valid role. Allowed roles: " + ROLES_LIST.join(", ")
            },
            default: Roles.STUDENT,
            required: [true, "Role is Required"]
        },
        isActive: {
            type: Boolean,
            default: true
        },
        profile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserProfile'
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userschema);

module.exports = User;

