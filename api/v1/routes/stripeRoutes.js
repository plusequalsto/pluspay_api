const express = require('express');
const stripeController = require('../controllers/stripeController'); // Adjust the path as necessary
const authTokenMiddleware = require('../middleware/authTokenMiddleware'); // Protect routes that require authentication
const router = express.Router();

// Add Connected Stripe Account Route (protected)
router.post('/addstripeaccount/:userId', authTokenMiddleware(['Client']), stripeController.addStripeAccount);
// Get Connected Stripe Account Route (protected)
router.get('/getStripeAccount/:userId', authTokenMiddleware(['Client']), stripeController.getStripeAccount);
// Delete Connected Stripe Account Route (protected)
router.post('/deletestripeaccount/:userId', authTokenMiddleware(['Client']), stripeController.deleteStripeAccount);

module.exports = router;