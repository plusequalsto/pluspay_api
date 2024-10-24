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

// Add Shop Details
const addShopDetails = async (req, res) => {
    try {
        // Extract userId from request parameters
        const userId = req.params.userId;
        console.log('User ID:', userId);
        console.log('Request Body:', req.body);

        // Prepare business details from the request body
        const businessDetails = {
            userId, // Reference to the User model
            businessName: req.body.businessName, // Ensure businessName is included
            tradingName: req.body.tradingName, // Ensure tradingName is included
            companyhouseregistrationNumber: req.body.companyhouseregistrationNumber,
            vatNumber: req.body.vatNumber,
            contactInfo: req.body.contactInfo,
            brandSettings: req.body.brandSettings,
            stripeAccountId: req.body.stripeAccountId || '', // Ensure stripeAccountId is included
            settings: req.body.settings,
            deleted: req.body.deleted || false, // Handle deleted flag
            deletedAt: req.body.deletedAt || null // Handle deletedAt
        };

        // Create a new shop
        const shop = new Shop(businessDetails);
        await shop.save();

        // Add the new shop ID to the user's shops list
        await User.findByIdAndUpdate(
            userId,
            { $push: { shops: shop._id } },
            { new: true }
        );

        return res.status(201).json({ 
            status: 201,
            shop 
        });
    } catch (error) {
        console.error('Error adding business details:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

// Get Shop Details
const getShopDetails = async (req, res) => {
    try {
        // Extract userId from request parameters
        const userId = req.params.userId;
        console.log('User ID:', userId);

        // Fetch shop details based on userId
        const shopDetails = await Shop.find({ userId: userId }); // Assuming you have a Shop model

        if (!shopDetails) {
            return res.status(404).json({ message: 'Shop not found for this user.' });
        }
        console.log('Shops Details', shopDetails);

        // Return shop details in response
        return res.status(200).json({
            status: 200,
            message: 'Shop details retrieved successfully.',
            shop: shopDetails,
        });

    } catch (error) {
        console.error('Error retrieving shop details:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    addShopDetails,
    getShopDetails,
};