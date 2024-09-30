const mongoose = require('mongoose');

const userRolesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  assignedAt: { type: Date, default: Date.now } 
});

const UserRoles = mongoose.model('UserRoles', userRolesSchema);
module.exports = UserRoles;
