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
  deleteUser,
  profile,
  updateUserProfile,
  changeUserPassword
} = require("../controllers/userController");
const Authorize = require("../middlewares/authorizationMiddleware");

const router = express.Router();

//auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);

//user routes
router.get("/", passport.authenticate("jwt", { session: false }), Authorize(['Admin']), getAllUsers);
router.get("/profile", passport.authenticate("jwt", { session: false }), Authorize(['Admin']), profile);
router.put("/profile", passport.authenticate("jwt", { session: false }), Authorize(['Admin']), updateUserProfile);
router.put("/changepassword", passport.authenticate("jwt", { session: false }), Authorize(['Admin']), changeUserPassword);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.put("/delete/:id", deleteUser);
router.get("/admin", passport.authenticate("jwt", { session: false }), Authorize(["Admin, user"]), getAdminResource);
router.get("/user", passport.authenticate("jwt", { session: false }), Authorize(["user", "Admin"]), getUserResource);

module.exports = router;
