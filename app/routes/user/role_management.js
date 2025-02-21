const express = require("express");
const router = express.Router();
const roles = require("../../controllers");

router.post("/create", roles.roles.createRole)
router.get("/getAll", roles.roles.getAll);
router.get("/get/:id", roles.roles.getRoleById);
router.put("/update/:id", roles.roles.updateRole);
router.delete("/delete/:id", roles.roles.deleteRole);

module.exports = router; 
