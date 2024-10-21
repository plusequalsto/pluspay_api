const mongoose = require('mongoose');

// Address Schema
const addressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    postcode: { type: String, required: true },
    country: { type: String, required: true },
}, { _id: false }); // Prevent automatic _id creation for sub-documents

// Contact Info Schema
const contactInfoSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // Ensure unique emails
    phone: { type: String, required: true },
    address: { type: addressSchema, required: true }, // Embed address schema
}, { _id: false });

// Brand Settings Schema
const brandSettingsSchema = new mongoose.Schema({
    logoUrl: { type: String, required: true },
    primaryColor: { type: String, required: true },
    secondaryColor: { type: String, required: true },
    font: { type: String, required: true },
}, { _id: false });

// Settings Schema
const settingsSchema = new mongoose.Schema({
    currency: { type: String, required: true },
    language: { type: String, required: true },
    timezone: { type: String, required: true },
    taxRate: { type: Number, required: true },
}, { _id: false });

// Main Shop Schema
const shopSchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
    businessName: { type: String, required: true },
    tradingName: { type: String, required: true },
    contactInfo: { type: contactInfoSchema, required: true }, // Embed contact info schema
    brandSettings: { type: brandSettingsSchema, required: true }, // Embed brand settings schema
    stripeAccountId: { type: String, required: true },
    settings: { type: settingsSchema, required: true }, // Embed settings schema
    deleted: { type: Boolean, default: false }, // Soft delete flag
    deletedAt: { type: Date, default: null }, // Timestamp for soft delete
}, { timestamps: true }); // Automatically handles createdAt and updatedAt fields

// Indexes for better query performance
shopSchema.index({ businessName: 1 });
shopSchema.index({ tradingName: 1 });
shopSchema.index({ 'contactInfo.email': 1 });

// Create the Shop model
const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;