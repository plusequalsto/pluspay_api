const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  userRole: { type: String, enum: ["Admin", "Client"], required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  expiresAt: { type: Date, required: true },
  type: { type: Number, required: true }, // type 1 for email verification, type 2 for JWT token, type 3 for password reset
}, { timestamps: true });

// Indexes for better query performance
TokenSchema.index({ userId: 1 });
TokenSchema.index({ accessToken: 1 });
TokenSchema.index({ expiresAt: 1 });

const Token = mongoose.model('tokens', TokenSchema);

module.exports = Token;