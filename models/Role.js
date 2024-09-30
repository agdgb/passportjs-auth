const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String }], // Optionally store role permissions here
});

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
