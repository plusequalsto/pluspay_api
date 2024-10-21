const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const path = require('path');
const connectmongoDB = require('./api/config/mongodbConfig.js');
const authRoutes = require('./api/v1/routes/authRoutes.js')
dotenv.config();
const port = process.env.PORT;
const app = express();
connectmongoDB();

// Content Security Policy (CSP) configuration
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://kit.fontawesome.com",
        "https://ka-f.fontawesome.com",
        "https://code.jquery.com",
        "https://cdn.jsdelivr.net",
        "https://stackpath.bootstrapcdn.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://ka-f.fontawesome.com",
        "https://stackpath.bootstrapcdn.com",
        "https://fonts.googleapis.com" // Added for Google Fonts
      ],
      fontSrc: [
        "'self'",
        "https://kit.fontawesome.com",
        "https://ka-f.fontawesome.com",
        "https://stackpath.bootstrapcdn.com",
        "https://fonts.gstatic.com" // Added for Google Fonts
      ],
      imgSrc: ["'self'", "https://res.cloudinary.com", "data:"],
      connectSrc: ["'self'", "https://ka-f.fontawesome.com"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      preconnectSrc: [
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
      ], // Added preconnect sources
    },
  })
);

// Define CORS options
const corsOptions = {
  origin: [
    'https://qiot-pneumothorax-api-b70842062523.herokuapp.com',
    'http://80.177.32.233:${port}'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browsers
};
app.use(xss());
app.use(express.json());
// Apply CORS middleware globally
app.use(cors(corsOptions));
// Handle preflight requests with CORS
app.options('*', cors(corsOptions));
// Serve static files with correct MIME types
// Serving static files with correct MIME types
app.use('/public', express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  },
}));
app.get('/api/v1', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API v1 Response</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f4f4f4;
          margin: 0;
        }
        .container {
          text-align: center;
          padding: 20px;
          border-radius: 8px;
          background-color: #ffffff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
        }
        p {
          color: #555;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to PlusPay API v1</h1>
        <p>This is the HTML response for the <i>/api/v1</i> endpoint.</p>
      </div>
    </body>
    </html>
  `);
});

app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API link at http://80.177.32.233:${port}`)
});