const RefreshTokens = require("../models/RefreshToken");

class RefreshTokenRepository {
  async createRefreshToken(userId, refreshToken) {
    try {
      const newToken = new RefreshTokens({
        userId,
        refreshToken,
      });
      return await newToken.save();
    } catch (error) {
      throw new Error("Error saving refresh token: " + error.message);
    }
  }

  async findByToken(token) {
    try {
      return await RefreshTokens.findOne({ refreshToken: token });
    } catch (error) {
      throw new Error("Error finding refresh token: " + error.message);
    }
  }

  async findByUserId(userId) {
    try {
      return await RefreshTokens.find({ userId });
    } catch (error) {
      throw new Error("Error finding refresh token for user: " + error.message);
    }
  }

  async expireToken(token) {
    try {
      return await RefreshTokens.findOneAndUpdate(
        { refreshToken: token },
        { expired: true },
        { new: true }
      );
    } catch (error) {
      throw new Error("Error expiring token: " + error.message);
    }
  }

  async deleteToken(token) {
    try {
      return await RefreshTokens.findOneAndDelete({ refreshToken: token });
    } catch (error) {
      throw new Error("Error deleting refresh token: " + error.message);
    }
  }

  async deleteTokensByUserId(userId) {
    try {
      return await RefreshTokens.deleteMany({ userId });
    } catch (error) {
      throw new Error("Error deleting tokens for user: " + error.message);
    }
  }
}

module.exports = new RefreshTokenRepository();
