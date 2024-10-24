const { User, userValidationSchema } = require("../models/User");
const jwt = require("jsonwebtoken");
const UserRoles = require("../models/UserRoles");
const RefreshTokenRepository = require("../repositories/RefreshTokenRepository");
const RoleRepository = require("../repositories/RoleRepository");
const { default: mongoose } = require("mongoose");
const { listUsers, findUserById, editUser, deactivateUser, updateProfile, changePassword } = require("../repositories/UserRepository");
const { deleteRolesByUserId } = require("../repositories/UserRoleRepository");

const registerUser = async (req, res) =>
{
  userValidationSchema.validate(req.body);

  const {
    username,
    firstName,
    lastName,
    grandFatherName,
    email,
    phone,
    password,
    status,
    roles,
  } = req.body;

  const session = await mongoose.startSession();

  try
  {
    let user = await User.findOne({ username });
    if (user)
    {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({
      username,
      firstName,
      lastName,
      grandFatherName,
      email,
      phone,
      password,
      status,
    });

    session.startTransaction();
    const result = await user.save({ session });

    await RoleRepository.addToRolesAsync(result._id, roles, session);
    await session.commitTransaction();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error)
  {
    console.error("Error during user registration:", error);
    await session.abortTransaction();
    if (error.name === "ValidationError")
    {
      return res.status(400).json({
        message: error._message,
        details:
          "One or more validation errors occurred. Please check your input.",
      });
    }
    return res.status(500).json({ message: "Error creating user", error });
  } finally
  {
    session.endSession();
  }
}

const loginUser = async (req, res) =>
{
  const { username, password } = req.body;

  try
  {
    const user = await User.findOne({ username });
    if (!user)
    {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch)
    {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const userRoles = await UserRoles.find({ userId: user._id }).populate(
      "roleId"
    );
    var roles = userRoles.length === 0
      ? []
      : userRoles.map((userRole) => userRole.roleId ? userRole.roleId.name : null)
        .filter(name => name !== null);

    const payload = {
      id: user._id,
      roles: roles,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRES_IN,
    });
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      }
    );

    await RefreshTokenRepository.createRefreshToken(user._id, refreshToken);
    const currentUser = user._id
    res.status(200).json({ token, refreshToken, currentUser });
  } catch (error)
  {

    res.status(500).json({ message: "Error logging in", error });
  }
}

const refreshToken = async (req, res) =>
{
  const { token } = req.body;

  if (!token)
  {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  const storedToken = await RefreshTokenRepository.findByToken(token);
  if (!storedToken)
  {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
  if (storedToken.expired)
  {
    return res.status(403).json({ message: "Expired refresh token" });
  }

  try
  {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    if (String(storedToken.userId) !== decoded.id)
    {
      return res.status(403).json({ message: "Unmatched refresh token" });
    }

    const userRoles = await UserRoles.find({ userId: decoded.id }).populate(
      "roleId"
    );
    const roles = userRoles.map((userRole) => userRole.roleId.name);

    const newAccessToken = jwt.sign(
      { id: decoded.id, roles },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.TOKEN_EXPIRES_IN,
      }
    );

    const newRefreshToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      }
    );
    await RefreshTokenRepository.createRefreshToken(
      decoded.id,
      newRefreshToken
    );
    await RefreshTokenRepository.expireToken(storedToken.refreshToken);
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error)
  {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token", error: error });
  }
}

const getAllUsers = async (req, res) =>
{
  try
  {
    const users = await listUsers();
    return res.status(200).json(users);
  } catch (error)
  {
    return res.status(500).json({ message: "Unexpected error while fetching data.", error })
  }
}

const updateUser = async (req, res) =>
{
  const userId = req.params.id;
  const { username,
    firstName,
    lastName,
    grandFatherName,
    email,
    phone,
    status,
    roles } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try
  {
    const updatedUser = await editUser(userId, {
      username,
      firstName,
      lastName,
      grandFatherName,
      email,
      phone,
      status,
    }, session);

    if (!updatedUser)
    {
      return res.status(404).json({ message: 'User not found' });
    }

    await deleteRolesByUserId(userId, session);

    const newUserRoles = roles.map(roleId => ({
      userId: userId,
      roleId: roleId
    }));

    const frs = await RoleRepository.addToRolesAsync(userId, roles, session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'User and roles updated successfully' });
  } catch (error)
  {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Error updating user and roles', error });
  }
}

const getUser = async (req, res) =>
{
  try
  {
    const user = await findUserById(req.params.id);
    if (!user)
    {
      return res.status(404).json({ message: "User not found." })
    }
    return res.status(200).json(user[0]);
  } catch (error)
  {
    return res.status(500).json({ message: "Unexpected error while fetching data.", error })
  }
}

const profile = async (req, res) =>
{

  try
  {
    const user = await findUserById(req.user.id);
    if (!user)
    {
      return res.status(404).json({ message: "User not found." })
    }
    return res.status(200).json(user[0]);
  } catch (error)
  {
    return res.status(500).json({ message: "Unexpected error while fetching data.", error })
  }
}

const updateUserProfile = async (req, res) =>
{
  const userId = req.user.id;
  const userDetails = req.body;

  const {
    username,
    firstName,
    lastName,
    grandFatherName,
    email,
    phone
  } = req.body;


  try
  {
    const updatedUser = await updateProfile(userId, {
      username,
      firstName,
      lastName,
      grandFatherName,
      email,
      phone
    });
    return res.status(200).json({ message: "User profile updated." });
  } catch (error)
  {
    return res.status(500).json({ message: "Error updating profile", error });
  }
}

const getAdminResource = (req, res) =>
{
  res.json({ message: "Welcome, Admin!" });
}

const getUserResource = (req, res) =>
{
  res.json({ message: "Welcome, User!" });
}

const deleteUser = async (req, res) =>
{
  const { id } = req.params;
  try
  {
    const deletedUser = await deactivateUser(id);

    if (!deletedUser)
    {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", user: deletedUser });
  } catch (error)
  {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error, could not delete user" });
  }
}

const changeUserPassword = async (req, res) =>
{
  const userId = req.user.id;
  const { currentPassword, password } = req.body;

  try
  {
    const user = await changePassword(userId, currentPassword, password);
    return res.status(200).json({ message: `Password changed successfully ${user.firstName} ${user.lastName}` });
  } catch (error)
  {
    return res.status(400).json({ message: error.message, error: error });
  }
}

module.exports = {
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
};
