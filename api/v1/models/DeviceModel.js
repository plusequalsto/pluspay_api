const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
  token: { type: String, required: true },  // Device token
  type: { type: String, enum: ['android', 'ios', 'web'], required: true }, // Device type
}, { timestamps: true });

// Create the Device model
const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;