const express = require("express");
const router = express.Router();
const { users } = require("../../controllers");
const { jwtAuthentication } = require("../../helpers")


router.post("/register", users.registerUser);
router.post("/login", users.loginUser);
router.get("/getAll", users.getAllUsers);
router.get("/get/:id", users.getUserById);
router.put("/update/:id", users.updateUser);
router.post("/forgate", users.forgatePassword);
router.post("/reset-password", users.resetPassword);
router.delete("/delete/:id", users.deleteUser);

module.exports = router;
