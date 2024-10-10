const express = require("express");

const {
  addToRoleAsync,
  getUserRoles,
  removeUserRole,
  getUsersInRole,
} = require("../controllers/userRolesController");

const router = express.Router();

router.post("/assign", addToRoleAsync);

router.get("/:userId", getUserRoles);

router.get("/role/:roleId", getUsersInRole);

router.post("/remove", removeUserRole);

module.exports = router;
