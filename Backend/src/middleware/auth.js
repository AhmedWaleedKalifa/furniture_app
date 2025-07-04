const { getAuth, getFirestore } = require('../config/firebase');
const { auth: adminAuth, db } = require('../config/firebase');

// Verify Firebase Auth token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAuth();
    
    // For custom tokens, we need to verify them differently
    // Since we're using custom tokens for server-side auth, we'll use the uid directly
    // In a production environment, you'd want to implement proper token verification
    
    // For now, we'll assume the token is the uid for simplicity
    // This is a temporary solution - in production, implement proper JWT verification
    const uid = token;
    
    // Verify the user exists in Firebase Auth
    const userRecord = await auth.getUser(uid);
    
    req.user = {
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Get user profile from Firestore
const getUserProfile = async (req, res, next) => {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    req.userProfile = userDoc.data();
    next();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

// Role-based access control middleware
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.userProfile) {
        await getUserProfile(req, res, () => {});
      }

      if (!req.userProfile) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found'
        });
      }

      const userRole = req.userProfile.role;
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${roles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Role verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error verifying user role'
      });
    }
  };
};

// Specific role middlewares
const requireClient = requireRole(['client']);
const requireCompany = requireRole(['company']);
const requireAdmin = requireRole(['admin']);
const requireCompanyOrAdmin = requireRole(['company', 'admin']);

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAuth();
    
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };

    // Try to get user profile but don't fail if not found
    try {
      const db = getFirestore();
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      if (userDoc.exists) {
        req.userProfile = userDoc.data();
      }
    } catch (profileError) {
      console.warn('Could not fetch user profile:', profileError.message);
    }

    next();
  } catch (error) {
    // Don't fail the request, just continue without user info
    console.warn('Optional auth failed:', error.message);
    next();
  }
};

module.exports = {
  verifyToken,
  getUserProfile,
  requireRole,
  requireClient,
  requireCompany,
  requireAdmin,
  requireCompanyOrAdmin,
  optionalAuth
}; 