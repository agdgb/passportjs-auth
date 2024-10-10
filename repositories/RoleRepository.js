const UserRoles = require("../models/UserRoles");

class RoleRepository {
  async addToRolesAsync(userId, roles, session) {
    const userRoles = roles.map((role) => ({
      userId: userId,
      roleId: role,
    }));
    await UserRoles.insertMany(userRoles, { session });
    return roles;
  }
}

module.exports = new RoleRepository();
