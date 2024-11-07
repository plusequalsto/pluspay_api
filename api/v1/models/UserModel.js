const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing

// Address Schema for reusable address structure
const addressSchema = new mongoose.Schema({
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    postal_code: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true, minlength: 2, maxlength: 2 } // Ensuring 2-letter country code
}, { _id: false }); // Prevents creation of _id for sub-documents

// Authentication Schema
const authSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ },
    password: { 
        type: String, 
        required: true, 
        minlength: [8, 'Password must be at least 8 characters long'],
        validate: {
            validator: function(v) {
                return /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v) && /[!@#$%^&*]/.test(v);
            },
            message: props => `${props.value} is not a valid password!`
        }
    },
    role: { type: String, enum: ['Admin', 'Client'], default: 'Client' },
}, { _id: false });

// Main User Schema
const userSchema = new mongoose.Schema({
    verified: { type: Boolean, default: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: Number },
    auth: { type: authSchema, required: true },
    subscriptionStatus: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
    deleted: { type: Boolean, default: false },
    inCorrectCount: { type: Number, default: 0 },
    lastLoginDate: { type: Date },
    dateTimeZone: { type: String, default: '' },
    shops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }],

    // Add address and registered_address fields
    address: { type: addressSchema, required: true }, // Primary address
    registeredAddress: { type: addressSchema, required: true }, // Registered address

}, { timestamps: true });

// Indexes for better query performance
userSchema.index({ 'auth.email': 1 });
userSchema.index({ 'firstName': 1 });
userSchema.index({ 'lastName': 1 });
userSchema.index({ 'shops': 1 });

// Middleware to hash the password before saving a new user
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('auth.password')) {
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