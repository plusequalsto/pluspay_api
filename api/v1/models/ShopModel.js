const mongoose = require('mongoose');

// Address Schema
const addressSchema = new mongoose.Schema({
    street: { type: String, required: false },
    city: { type: String, required: false },
    postcode: { type: String, required: false },
    country: { type: String, required: false },
}, { _id: false }); // Prevent automatic _id creation for sub-documents

// Contact Info Schema
const contactInfoSchema = new mongoose.Schema({
    email: { type: String, required: false, unique: false }, // Ensure unique emails
    phone: { type: String, required: false },
    address: { type: addressSchema, required: false }, // Embed address schema
}, { _id: false });

// Brand Settings Schema
const brandSettingsSchema = new mongoose.Schema({
    logoUrl: { type: String, required: false },
    primaryColor: { type: String, required: false },
    secondaryColor: { type: String, required: false },
    font: { type: String, required: false },
}, { _id: false });

// Settings Schema
const settingsSchema = new mongoose.Schema({
    currency: { type: String, required: false },
    language: { type: String, required: false },
    timezone: { type: String, required: false },
    taxRate: { type: Number, required: false },
}, { _id: false });

// Main Shop Schema
const shopSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Reference to User model
    verified: { type: Boolean, default: false },
    businessName: { type: String, required: false },
    tradingName: { type: String, required: false },
    companyhouseregistrationNumber: { type: String, required: false },
    vatNumber: { type: String, required: false },
    mcc: { type: String, required: false },
    contactInfo: { type: contactInfoSchema, required: false }, // Embed contact info schema
    brandSettings: { type: brandSettingsSchema, required: false }, // Embed brand settings schema
    stripeAccountId: { type: String, required: false },
    settings: { type: settingsSchema, required: false }, // Embed settings schema
    deleted: { type: Boolean, default: false }, // Soft delete flag
    deletedAt: { type: Date, default: null }, // Timestamp for soft delete
}, { timestamps: false }); // Automatically handles createdAt and updatedAt fields

// Indexes for better query performance
shopSchema.index({ businessName: 1 });
shopSchema.index({ tradingName: 1 });
shopSchema.index({ companyhouseregistrationNumber: 1 });
shopSchema.index({ 'contactInfo.email': 1 });

// Create the Shop model
const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;