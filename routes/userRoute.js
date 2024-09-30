const express = require("express");
const passport = require("passport");
const {
  registerUser,
  loginUser,
  refreshToken,
  getAdminResource,
  getUserResource,
} = require("../controllers/userController");
const Authorize = require("../middlewares/authorizationMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/refresh", refreshToken);

router.get(
  "/admin",
  passport.authenticate("jwt", { session: false }),
  Authorize(["admin"]),
  getAdminResource
);

router.get(
  "/user",
  passport.authenticate("jwt", { session: false }),
  Authorize(["user", "admin"]),
  getUserResource
);

module.exports = router;
