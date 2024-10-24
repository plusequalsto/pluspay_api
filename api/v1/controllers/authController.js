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

const signupVerifyEmail = fs.readFileSync('public/verification_email.html', 'utf8');

const sendVerificationEmail = async (firstName, email, location, token) => {
  const verificationLink = `${URL}/auth/verifysignup/${token}`;
  const currentYear = new Date().getFullYear();
  const options = {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Europe/London',
    timeZoneName: 'short'
  };
  const currentDateTime = new Intl.DateTimeFormat('en-GB', options).format(new Date());
  const htmlContent = signupVerifyEmail
    .replace('{{firstName}}', firstName)
    .replace('{{verificationLink}}', verificationLink)
    .replace('{{verificationLink}}', verificationLink)
    .replace('{{location}}', location)
    .replace('{{currentDateTime}}', currentDateTime)
    .replace('{{currentYear}}', currentYear);

  const msg = {
    to: email,
    from: {
      email: 'contact@plusequalsto.com', // Change to your verified sender
      name: 'Contact - Plus Equals To' // Properly set the sender's name
    },
    subject: `Welcome to PlusPay by Plus Equals To`,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification email');
  }
};

const verifySignupToken = async (req, res) => {
    const { token } = req.params;
  
    try {
      // Find the verification token in the database
      const verificationToken = await Token.findOne({
        accessToken: token,
        expiresAt: { $gt: Date.now() },
        type: 1 // Assuming type 1 is for email verification
      });
  
      if (!verificationToken) {
        return res.status(400).json({ status: 400, message: 'Invalid or expired token' });
      }
  
      // Find the user associated with the verification token
      const user = await User.findById(verificationToken.userId);
      if (!user) {
        return res.status(404).json({ status: 404, message: 'User not found' });
      }
  
      // Update user verification status and save
      user.verified = true;
      await user.save();
  
      // Delete the verification token from the database
      await Token.deleteOne({ _id: verificationToken._id });
  
      // Send the verification success HTML page
      res.sendFile(path.join(__dirname, '..', '..', '..', 'public', 'verification_success.html'));
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 500, message: 'Error verifying token', error: error.message });
    }
};

const generateEmailVerificationToken = async (user, userIp, type) => {
    const accessToken = jwt.sign({ userId: user._id, userRole: user.role }, process.env.JWT_SECRET, {
        expiresIn: '15m', // Set your desired expiration time
    });

    await saveToken(user._id, user.auth.role, accessToken, '', 1);

    if(type == 1) {
      // Send verification email
      await sendVerificationEmail(user.firstName, user.auth.email, userIp, accessToken);
    } else if(type == 2){
  
    } else {
      
    }
};

const saveToken = async (userId, userRole, accessToken, refreshToken, type) => {
    await Token.create({
        userId,
        userRole,
        accessToken,
        refreshToken,
        expiresAt: Date.now() + 15 * 60 * 1000,
        type: type,
    });
};

// Sign Up
const signUp = async (req, res) => {
    const { firstName, lastName, email, password, deviceToken, deviceType } = req.body; // Include firstName, lastName, deviceToken, and deviceType
    
    console.log(firstName);
    console.log(lastName);

    // Get the user's IP address
    let userIp = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;

    // If the IP address is in IPv6 format, convert it to IPv4
    if (userIp.startsWith('::ffff:')) {
        userIp = userIp.replace('::ffff:', '');
    }

    console.log('User IP:', userIp);

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !deviceToken || !deviceType) {
        return res.status(400).json({ message: 'Email, password, first name, last name, device token, and device type are required.' });
    }

    try {
        // Get the location from IP
        let location = {};
        try {
            const response = await axios.get(`https://ipinfo.io/${userIp}?token=587916888074d8`);
            location = `${response.data.city}, ${response.data.region}, ${response.data.country} (${response.data.ip})`;
            console.log('Location:', `${location}`);
        } catch (locationError) {
            console.error('Error retrieving location:', locationError);
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ 'auth.email': email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists with this email.' });
        }

        // Create a new user
        const newUser = await User.create({
            firstName,
            lastName,
            auth: { // Embed the auth schema
                email,
                password, // The password will be hashed by the pre-save middleware
            },
            subscriptionStatus: 'inactive', // Set the default subscription status
            shops: [] // Initialize shops as an empty array
        });

        // Create a new device record
        const newDevice = await Device.create({
            userId: newUser._id,
            token: deviceToken,
            type: deviceType,
        });

        // Generate tokens for the user
        const accessToken = jwt.sign({ userId: newUser._id, userRole: newUser.role }, process.env.JWT_SECRET, {
            expiresIn: '15m', // Set your desired expiration time
        });
        const refreshToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: '7d', // Set your desired expiration time for the refresh token
        });
        await saveToken(newUser._id, newUser.auth.role, accessToken, refreshToken, 2);

        // Create a verification token and send email
        await generateEmailVerificationToken(newUser, location, 1);

        // Respond with user and device information
        res.status(201).json({
            status: 201,
            accessToken,
            refreshToken,
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.auth.email,
                role: newUser.auth.role,
                subscriptionStatus: usnewUserer.subscriptionStatus,
                shops: newUser.shops
            }
        });
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Sign In
const signIn = async (req, res) => {
    const { email, password, deviceToken, deviceType } = req.body;

    console.log(email);
    console.log(password);

    // Get the user's IP address
    let userIp = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;

    // If the IP address is in IPv6 format, convert it to IPv4
    if (userIp.startsWith('::ffff:')) {
        userIp = userIp.replace('::ffff:', '');
    }

    console.log('User IP:', userIp);

    try {
        // Get the location from IP
        let location = {};
        try {
            const response = await axios.get(`https://ipinfo.io/${userIp}?token=587916888074d8`);
            location = `${response.data.city}, ${response.data.region}, ${response.data.country} (${response.data.ip})`;
            console.log('Location:', `${location}`);
        } catch (locationError) {
            console.error('Error retrieving location:', locationError);
        }

        // Find the user by the email inside the embedded 'auth' schema
        const user = await User.findOne({ 'auth.email': email });
        
        // Check if user exists and if the provided password matches the hashed password
        if (!user || !(await bcrypt.compare(password, user.auth.password))) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Check if the user is verified
        if (!user.verified) {
            return res.status(403).json({ message: 'User account is not verified. Please verify your email.' });
        }

        // Generate access and refresh tokens for the user
        const accessToken = jwt.sign({ userId: user._id, userRole: user.auth.role }, process.env.JWT_SECRET, {
            expiresIn: '15m', // Set your desired expiration time
        });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d', // Set your desired expiration time for the refresh token
        });

        // Check if there is already a token for the user
        const existingToken = await Token.findOne({ userId: user._id });

        if (existingToken) {
            // Update the existing token
            existingToken.accessToken = accessToken;
            existingToken.refreshToken = refreshToken;
            existingToken.expiresAt = Date.now() + 15 * 60 * 1000; // Set new expiration for access token
            await existingToken.save();
        } else {
            // Create a new token if none exists
            await saveToken(user._id, user.auth.role, accessToken, refreshToken, 2);
        }

        // Save or update the device information
        const existingDevice = await Device.findOne({ userId: user._id, token: deviceToken });
        if (existingDevice) {
            // Update the existing device if it already exists
            existingDevice.type = deviceType;
            await existingDevice.save();
        } else {
            // Create a new device entry if it doesn't exist
            const newDevice = new Device({
                userId: user._id,
                token: deviceToken,
                type: deviceType,
            });
            await newDevice.save();
        }

        // Respond with the tokens and user information
        res.status(200).json({ 
            status: 200,
            accessToken, 
            refreshToken,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.auth.email,
                role: user.auth.role,
                subscriptionStatus: user.subscriptionStatus,
                shops: user.shops
            },
        });
    } catch (error) {
        console.error('Error signing in:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

const refreshToken = async (req, res) => {
    const { refreshToken, deviceToken, deviceType } = req.body ?? {};

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided.' });
    }

    // Validate device type and device token if necessary
    if (deviceType !== 'web') {
        if (!deviceToken || !deviceType) {
            return res.status(400).json({ status: 400, message: 'Invalid credentials' });
        }

        if (deviceType !== 'android' && deviceType !== 'ios') {
            return res.status(400).json({ status: 400, message: 'Invalid device type' });
        }
    }

    try {
        const tokenDoc = await Token.findOne({ refreshToken });
        if (!tokenDoc) {
            return res.status(403).json({ message: 'Invalid refresh token.' });
        }

        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        if (decoded.userId !== tokenDoc.userId.toString()) {
            return res.status(403).json({ message: 'Invalid refresh token.' });
        }

        // Generate a new access token
        const newAccessToken = jwt.sign(
            { userId: tokenDoc.userId, userRole: tokenDoc.userRole },
            process.env.JWT_SECRET,
            { expiresIn: '15m' } // Set your desired expiration time
        );

        // Update access token and its expiration in the database
        const newAccessTokenExpiry = Date.now() + (15 * 60 * 1000); // Set expiry to 15 minutes from now
        await Token.updateOne(
            { userId: tokenDoc.userId },
            { accessToken: newAccessToken, expiresAt: newAccessTokenExpiry }
        );

        // Generate a new refresh token if necessary
        let newRefreshToken = refreshToken; // Keep the old refresh token
        const refreshTokenExpiryTime = jwt.decode(refreshToken).exp * 1000;

        // Check if the refresh token is about to expire (e.g., within 1 day)
        if (Date.now() > refreshTokenExpiryTime - (24 * 60 * 60 * 1000)) {
            newRefreshToken = jwt.sign(
                { userId: tokenDoc.userId },
                process.env.JWT_SECRET,
                { expiresIn: '7d' } // New refresh token expiration
            );

            await Token.updateOne(
                { userId: tokenDoc.userId },
                { refreshToken: newRefreshToken, expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) }
            );
        }

        // Handle device information if provided
        if (deviceToken && deviceType) {
            // Find the device by userId and deviceType
            const existingDevice = await Device.findOne({ userId: tokenDoc.userId, type: deviceType });

            if (existingDevice) {
                // If the existing device token is different, update it
                if (existingDevice.token !== deviceToken) {
                    existingDevice.token = deviceToken; // Update the device token
                    await existingDevice.save();
                }
                // If the token is the same, do nothing
            } else {
                // If no device exists for the userId and deviceType, create a new device entry
                const newDevice = new Device({
                    userId: tokenDoc.userId,
                    token: deviceToken,
                    type: deviceType,
                });
                await newDevice.save();
            }
        }

        console.log('New AccessToken', newAccessToken);

        // Respond with the new tokens
        res.status(200).json({
            status: 200,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Sign Out
const signOut = async (req, res) => {
    const userId = req.params.id;
    console.log(userId);
    try {
        await Token.deleteOne({ userId, type: 2 });
        res.status(200).json({ 
            status: 200,
        });
    } catch (error) {
        console.error('Error signing out:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Add Business Details
const addBusinessDetails = async (req, res) => {
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
    signUp,
    verifySignupToken,
    signIn,
    refreshToken,
    signOut,
    addBusinessDetails,
};