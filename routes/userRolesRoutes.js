const express = require("express");

const {
  assignRoleToUser,
  getUserRoles,
  removeUserRole,
  getUsersInRole,
} = require("../controllers/userRolesController");

const router = express.Router();

router.post("/assign", assignRoleToUser);

router.get("/:userId", getUserRoles);

router.get("/role/:roleId", getUsersInRole);

router.post("/remove", removeUserRole);

module.exports = router;
