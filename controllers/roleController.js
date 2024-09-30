const Role = require("../models/Role");

const createRole = async (req, res) => {
  const { name, permissions } = req.body;

  try {
    let role = await Role.findOne({ name });
    if (role) {
      return res.status(400).json({ message: "Role already exists" });
    }

    role = new Role({ name, permissions });
    await role.save();
    res.status(201).json({ message: "Role created successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Error Creating role", error });
  }
};

const getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching roles", error });
  }
};

const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: "Error fetching role", error });
  }
};

const updateRole = async (req, res) => {
  const { name, permissions } = req.body;

  try {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, permissions },
      { new: true }
    );
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json({ message: "Role updated successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Error updating role", error });
  }
};

const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting role", error });
  }
};

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
};
