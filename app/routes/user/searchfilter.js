const express = require('express');
const router = express.Router();
const{searchUser}=require("../../controllers")


router.get("/user",searchUser.searchAndFilterUsers)

module.exports = router;
