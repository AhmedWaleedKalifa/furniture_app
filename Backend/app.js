const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
// Import routes
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const userRoutes = require('./src/routes/users');
const adminRoutes = require('./src/routes/admin');
const orderRoutes = require('./src/routes/orders');
const supportRoutes = require('./src/routes/support');
const uploadRoutes = require('./src/routes/upload');

// Import Firebase config
const { initializeFirebase } = require('./src/config/firebase');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase
initializeFirebase();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:3001',
  'exp://localhost:8081',
  'http://192.168.1.13:8081',
  '*' // For development - remove in production
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});


// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|glb|gltf|obj/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.includes('model');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and 3D model files are allowed'));
    }
  }
});

// Add before your routes
app.use('/uploads', express.static('uploads'));


// API routes
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/support', supportRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }

  // Handle validation errors
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.details.map(detail => detail.message)
    });
  }

  // Handle Firebase auth errors
  if (err.code === 'auth/id-token-expired') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  if (err.code === 'auth/id-token-revoked') {
    return res.status(401).json({
      success: false,
      message: 'Token revoked'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app; 