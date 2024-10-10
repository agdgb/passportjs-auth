
const { User } = require("../models/User");
const { UserRolesView } = require("../models/views/UserRolesView");

const createUser = async (userData, session) =>
{
  const user = new User(userData);
  return await user.save();
};

const findUserById = async (userId) =>
{
  return await UserRolesView.find({ '_id': userId });
};

const findUserByUsername = async (username) =>
{
  return await User.findOne({ username });
};

const editUser = async (userId, userDetails, session) =>
{
  return User.findByIdAndUpdate(userId, userDetails, { new: true, session }).exec();
}

const deleteUser = async (userId) =>
{
  return await User.findByIdAndDelete(userId);
};

const changePassword = async (userId, newPassword) =>
{
  return await User.findByIdAndUpdate(
    userId,
    { password: newPassword },
    { new: true }
  );
};

const listUsers = async (query = {}) =>
{
  return await User.find(query);
};

module.exports = {
  createUser,
  findUserById,
  findUserByUsername,
  editUser,
  deleteUser,
  changePassword,
  listUsers,
};
