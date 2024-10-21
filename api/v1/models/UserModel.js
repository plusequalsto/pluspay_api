const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing

// Authentication Schema
const authSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ },
    password: { 
        type: String, 
        required: true, 
        minlength: [8, 'Password must be at least 8 characters long'], // Minimum length validation
        validate: {
            validator: function(v) {
                return /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v) && /[!@#$%^&*]/.test(v);
            },
            message: props => `${props.value} is not a valid password!`
        }
    },
    role: { type: String, enum: ['Admin', 'Client'], default: 'Client' }, // Role field for differentiation
}, { _id: false }); // Prevent automatic _id creation for sub-documents

// Main User Schema
const userSchema = new mongoose.Schema({
    verified: { type: Boolean, default: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    auth: { type: authSchema, required: true }, // Embed authentication schema
    subscriptionStatus: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
    deleted: { type: Boolean, default: false }, // Soft delete flag
    inCorrectCount: { type: Number, default: 0 },
    lastLoginDate: { type: Date },
    dateTimeZone: { type: String, default: '' },
    shops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }], // Field to keep list of shopId
}, { timestamps: true }); // Automatically handles createdAt and updatedAt fields

// Indexes for better query performance
userSchema.index({ 'auth.email': 1 });
userSchema.index({ 'firstName': 1 });
userSchema.index({ 'lastName': 1 });
userSchema.index({ 'shops': 1 }); // Index for shops array

// Middleware to hash the password before saving a new user
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('auth.password')) { // Check if password is modified
        user.auth.password = await bcrypt.hash(user.auth.password, 8);
    }
    next();
});

// Middleware to hash the password before updating it
userSchema.pre('findByIdAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (update.auth && update.auth.password) {
        update.auth.password = await bcrypt.hash(update.auth.password, 8);
    }
    next();
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;