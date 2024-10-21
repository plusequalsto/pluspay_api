const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Make sure to import jwt
const User = require('../models/UserModel'); // Adjust the path to your user model
const Device = require('../models/DeviceModel');
const Token = require('../models/TokenModel'); // Adjust the path as necessary
const Shop = require('../models/ShopModel'); // Adjust the path as necessary
const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const URL = process.env.HEROKU_URL;

// Add Business Details
const addBusiness = async (req, res) => {
    try {
        const userId = req.user._id; // Get shop ID from the authenticated user

        // Check if the shop already exists
        const existingShop = await Shop.findOne({ userId });

        if (existingShop) {
            return res.status(400).json({ message: 'Business details already exist for this shop.' });
        }

        // Prepare business details from the request body
        const businessDetails = {
            userId, // Reference to the User model
            contactInfo: req.body.contactInfo,
            brandSettings: req.body.brandSettings,
            settings: req.body.settings,
        };

        // Create a new shop
        const shop = new Shop(businessDetails);
        await shop.save();

        return res.status(201).json({ 
            status: 201,
            shop });
    } catch (error) {
        console.error('Error adding business details:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    addBusiness,
};