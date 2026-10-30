const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const protect = require("../middleware/auth.middleware.js");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.use(protect);
router.get("/faculties", userController.getAllFaculty);
router.get("/students", userController.getAllStudents);
router.get("/all", userController.getAllUser);
router.get("/all-without-pop", userController.getAllUserwithoutPop);
router.get("/search", userController.getUserByQuery);
router.post("/profile", userController.addUserProfile);
router.put("/profile", userController.updateUserProfile);
router.put("/profile/:userid", userController.updateUserProfile);
router.put("/update/:id", userController.updateUser);
router.patch("/soft-delete/:id", userController.softdeleteUser);
router.delete("/delete/:id", userController.deleteUser);

module.exports = router;
