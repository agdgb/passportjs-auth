const User = require("../models/User");
const jwt = require("jsonwebtoken");
const UserRoles = require("../models/UserRoles");
const RefreshTokenRepository = require("../repositories/RefreshTokenRepository");

// const process.env.JWT_SECRET = process.env.JWT_SECRET;
// const process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
// const process.env.TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN;
// const process.env.REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN;

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

const loginUser = async (req, res) => {
  console.log("process:", process.env.JWT_SECRET);
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userRoles = await UserRoles.find({ userId: user._id }).populate(
      "roleId"
    );

    const roles = userRoles.map((userRole) => userRole.roleId.name);

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

    res.json({ token, refreshToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error logging in", error });
  }
};

const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  const storedToken = await RefreshTokenRepository.findByToken(token);
  if (!storedToken) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
  if (storedToken.expired) {
    return res.status(403).json({ message: "Expired refresh token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    if (String(storedToken.userId) !== decoded.id) {
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
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token", error: error });
  }
};

const getAdminResource = (req, res) => {
  res.json({ message: "Welcome, Admin!" });
};

const getUserResource = (req, res) => {
  res.json({ message: "Welcome, User!" });
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  getAdminResource,
  getUserResource,
};
