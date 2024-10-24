const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const TokenModel = require('../models/TokenModel');

dotenv.config();

const authTokenMiddleware = (roles = []) => async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];
  console.log('AccessToken', accessToken);
  if (!accessToken) {
    return res.status(401).json({ status: 401, message: 'Access denied, token missing!' });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    // Find the token in the database to check its expiration status
    const dbToken = await TokenModel.findOne({ accessToken: accessToken, type: 2 }); // Type 2 for JWT access tokens
    
    if (!dbToken) {
      return res.status(401).json({ status: 401, message: 'Invalid token' });
    }

    if (dbToken.expiresAt < Date.now()) {
      return res.status(403).json({ status: 403, message: 'Token has expired' });
    }

    // Check if the user's role matches any of the roles specified
    if (roles.length && !roles.includes(decoded.userRole)) {
      return res.status(403).json({ status: 403, message: 'Access denied, role mismatch' });
    }

    req.user = decoded; // Store the user information in the request object
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(403).json({ status: 403, message: 'Invalid or expired token' });
  }
};

module.exports = authTokenMiddleware;
