const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");
const authorizeRoles = require("../middleware/role.middleware.js");
const { Roles } = require("../constants/roles.js");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.use(authMiddleware);
router.get("/faculties", authorizeRoles(Roles.FACULTY), userController.getAllFaculty);
router.get("/students", authorizeRoles(Roles.FACULTY, Roles.STUDENT), userController.getAllStudents);
router.get("/all", authorizeRoles(Roles.FACULTY), userController.getAllUser);
router.get("/all-without-pop", authorizeRoles(Roles.FACULTY), userController.getAllUserwithoutPop);
router.get("/search", authorizeRoles(Roles.FACULTY), userController.getUserByQuery);
router.post("/profile", userController.addUserProfile);
router.put("/profile", userController.updateUserProfile);
router.put("/profile/:userid", authorizeRoles(Roles.FACULTY), userController.updateUserProfile);
router.put("/update/:id", userController.updateUser);
router.patch("/soft-delete/:id", authorizeRoles(Roles.FACULTY), userController.softdeleteUser);
router.delete("/delete/:id", authorizeRoles(Roles.FACULTY), userController.deleteUser);

module.exports = router;
