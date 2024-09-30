const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  refreshToken: { type: String, required: true },
  expired: { type: Boolean, default: false, require: true },
  createdAt: { type: Date, default: Date.now },
});

const RefreshTokens = mongoose.model("RefreshTokens", refreshTokenSchema);
module.exports = RefreshTokens;
