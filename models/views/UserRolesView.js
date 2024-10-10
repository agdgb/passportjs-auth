const mongoose = require('mongoose')

const vwUserDetails = new mongoose.Schema({}, { collection: 'vwUserDetails', strict: false });
const UserRolesView = mongoose.model('vwUserDetails', vwUserDetails);

module.exports = { UserRolesView }