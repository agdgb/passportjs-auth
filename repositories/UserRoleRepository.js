
const UserRole = require('../models/UserRoles');
const Role = require('../models/Role');

const isInRole = async (userId, roleName) =>
{

    const role = await Role.findOne({ role_name: roleName });
    if (!role)
    {
        throw new Error(`Role '${roleName}' does not exist.`);
    }

    const userRole = await UserRole.findOne({ user_id: userId, role_id: role._id });
    return !!userRole;
}


const assignRoleToUser = async (userId, roleId) =>
{
    const userRole = new UserRole({ user_id: userId, role_id: roleId });
    return await userRole.save();
}


const removeRoleFromUser = async (userId, roleId) =>
{
    return await UserRole.findOneAndDelete({ user_id: userId, role_id: roleId });
}


const getUserRoles = async (userId) =>
{
    return await UserRole.find({ user_id: userId }).populate('role_id');
}


const getUsersByRole = async (roleId) =>
{
    return await UserRole.find({ role_id: roleId }).populate('user_id');
}


const listUserRoles = async (query = {}) =>
{
    return await UserRole.find(query).populate(['user_id', 'role_id']);
}

const deleteRolesByUserId = async (userId, session) =>
{
    return UserRole.deleteMany({ userId: userId }).session(session).exec();
}

module.exports = {
    isInRole,
    assignRoleToUser,
    removeRoleFromUser,
    getUserRoles,
    getUsersByRole,
    listUserRoles,
    deleteRolesByUserId
};
