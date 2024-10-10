const express = require("express");
const passport = require("passport");
const {
  registerUser,
  loginUser,
  refreshToken,
  getAdminResource,
  getUserResource,
  getAllUsers,
  getUser,
  updateUser,
} = require("../controllers/userController");
const Authorize = require("../middlewares/authorizationMiddleware");
const { editUser } = require("../repositories/UserRepository");

const router = express.Router();

//auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);

//user routes
//passport.authenticate("jwt", { session: false }), Authorize(["admin"]),
router.get("/", getAllUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.get(
  "/admin", passport.authenticate("jwt", { session: false }), Authorize(["Admin, user"]), getAdminResource
);

router.get(
  "/user", passport.authenticate("jwt", { session: false }), Authorize(["user", "Admin"]), getUserResource
);

module.exports = router;
