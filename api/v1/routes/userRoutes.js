const express = require('express');
const userController = require('../controllers/userController'); // Adjust the path as necessary
const authTokenMiddleware = require('../middleware/authTokenMiddleware'); // Protect routes that require authentication
const router = express.Router();

// Add Business Details Route (protected)
router.post('/addshopdetails/:userId', authTokenMiddleware(['Client']), userController.addShopDetails);

// Get Business List and Details Route (protected)
router.get('/getshopdetails/:userId', authTokenMiddleware(['Client']), userController.getShopDetails);

module.exports = router;