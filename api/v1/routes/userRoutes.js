const express = require('express');
const authController = require('../controllers/userController'); // Adjust the path as necessary
const authMiddleware = require('../middleware/authMiddleware'); // Protect routes that require authentication
const router = express.Router();

// Add Business Details Route (protected)
router.post('/addbusiness', authMiddleware, authController.addBusiness);

module.exports = router;