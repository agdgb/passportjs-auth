const UserRoles = require("../models/UserRoles");
const User = require("../models/User");
const Role = require("../models/Role");

const assignRoleToUser = async (req, res) => {
  const { userId, roleId } = req.body;

  try {
    const user = await User.findById(userId);
    const role = await Role.findById(roleId);
    if (!user || !role) {
      return res.status(404).json({ message: "User or Role not found" });
    }

    const existingUserRole = await UserRoles.findOne({ userId, roleId });
    if (existingUserRole) {
      return res.status(400).json({ message: "User already has this role" });
    }

    const userRole = new UserRoles({ userId, roleId });
    await userRole.save();

    res.status(201).json({ message: "Role assigned to user successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error assigning role to user", error });
  }
};

const getUserRoles = async (req, res) => {
  try {
    const roles = await UserRoles.find({ userId: req.params.userId }).populate(
      "roleId"
    );
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user roles", error });
  }
};

const getUsersInRole = async (req, res) => {
  try {
    const roles = await UserRoles.find({ roleId: req.params.roleId }).populate(
      "userId"
    );
    res.json(roles);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users for this role", error });
  }
};

const removeUserRole = async (req, res) => {
  const { userId, roleId } = req.body;

  try {
    const userRole = await UserRoles.findOneAndDelete({ userId, roleId });
    if (!userRole) {
      return res.status(404).json({ message: "Role not found for the user" });
    }

    res.json({ message: "Role removed from user successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing role from user", error });
  }
};

module.exports = {
  assignRoleToUser,
  getUserRoles,
  removeUserRole,
  getUsersInRole
};
