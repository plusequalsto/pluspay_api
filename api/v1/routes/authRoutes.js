const express = require('express');
const authController = require('../controllers/authController'); // Adjust the path as necessary
const authMiddleware = require('../middleware/authMiddleware'); // Protect routes that require authentication
const router = express.Router();

// Sign Up Route
router.post('/signup', authController.signUp);

router.get('/verifysignup/:token', authController.verifySignupToken);

// Sign In Route
router.post('/signin', authController.signIn);

// Refresh Token Route
router.post('/refreshtoken', authController.refreshToken);

// Add Business Details Route (protected)
router.post('/add-business-details', authMiddleware, authController.addBusinessDetails);

// Sign Out Route (protected)
router.delete('/signout/:userId', authController.signOut);

module.exports = router;