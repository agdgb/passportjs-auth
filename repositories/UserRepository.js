
const bcrypt = require("bcryptjs/dist/bcrypt");
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


const deactivateUser = async (userId) =>
{
  return User.findByIdAndUpdate(
    userId,
    { status: false },
    { new: true }
  ).exec();
}


const deleteUser = async (userId) =>
{
  return await User.findByIdAndDelete(userId);
};

const listUsers = async (query = {}) =>
{
  return await User.find(query);
};

const updateProfile = async (userId, userDetails, session) =>
{
  return User.findByIdAndUpdate(userId, userDetails, { new: true, session }).exec();
};

const changePassword = async (userId, currentPassword, newPassword) =>
{
  const user = await User.findById(userId);

  if (!user)
  {
    throw new Error('User not found');
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password);


  if (!isMatch)
  {
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  return user;
};

module.exports = {
  createUser,
  findUserById,
  findUserByUsername,
  editUser,
  changePassword,
  listUsers,
  deactivateUser,
  updateProfile
};
