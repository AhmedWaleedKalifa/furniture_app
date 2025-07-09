const { getAuth, getFirestore, admin } = require('../config/firebase');
const cloudinary = require('../config/cloudinary');

// Create user profile in Firestore
const createUserProfile = async (uid, userData) => {
  const db = getFirestore();
  const userRef = db.collection('users').doc(uid);
  
  // Validate role - only allow client or company for regular signup
  const validRoles = ['client', 'company'];
  const role = validRoles.includes(userData.role) ? userData.role : 'client';
  
  const profileData = {
    uid,
    email: userData.email,
    displayName: userData.displayName || userData.email.split('@')[0],
    avatar: userData.avatar || null,
    role: role, // Use provided role or default to client
    emailVerified: userData.emailVerified || false,
    createdAt: new Date(),
    updatedAt: new Date(),
    preferences: {
      theme: 'light',
      notifications: true
    }
  };

  await userRef.set(profileData);
  return profileData;
};

// Sign up user (allows client or company role only)
const signUp = async (req, res) => {
  try {
    const { email, password, displayName, role = 'client' } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Validate role - only allow client or company for regular signup
    const validRoles = ['client', 'company'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be client or company. Admin users must be created by existing admins.'
      });
    }

    const auth = getAuth();
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName
    });

    // Create user profile in Firestore
    const profileData = await createUserProfile(userRecord.uid, {
      email,
      displayName,
      role
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: profileData.displayName,
        role: profileData.role
      }
    });
  } catch (error) {
    console.error('Sign up error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    if (error.code === 'auth/weak-password') {
      return res.status(400).json({
        success: false,
        message: 'Password is too weak'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const userData = userDoc.data();
    
    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { displayName, phone } = req.body;
    const db = getFirestore();
    const updateData = {};

    // Update display name if provided
    if (displayName) {
      updateData.displayName = displayName;
    }

    // Update phone number if provided
    if (phone) {
      updateData.phoneNumber = phone;
    }

    // Handle avatar upload to Cloudinary if a file is present
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "avatars",
        public_id: `avatar_${uid}`,
        overwrite: true,
        resource_type: "image"
      });
      updateData.avatarUrl = result.secure_url;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update provided' });
    }

    updateData.updatedAt = new Date();

    // Update Firestore user document
    await db.collection('users').doc(uid).update(updateData);

    // Update Firebase Auth user profile if display name or avatar changed
    const authUpdatePayload = {};
    if (displayName) authUpdatePayload.displayName = displayName;
    if (updateData.avatarUrl) authUpdatePayload.photoURL = updateData.avatarUrl;

    if (Object.keys(authUpdatePayload).length > 0) {
      await admin.auth().updateUser(uid, authUpdatePayload);
    }

    // Fetch the fully updated user data to return
    const userDoc = await db.collection('users').doc(uid).get();
    const finalUserData = userDoc.data();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: finalUserData
    });
  } catch (error) {
    console.error("Error updating profile: ", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};



// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const auth = getAuth();
    const db = getFirestore();

    // Delete user from Firebase Auth
    await auth.deleteUser(req.user.uid);

    // Delete user data from Firestore
    await db.collection('users').doc(req.user.uid).delete();

    // Delete user's wishlist
    const wishlistRef = db.collection('users').doc(req.user.uid).collection('wishlist');
    const wishlistDocs = await wishlistRef.get();
    const deleteWishlistPromises = wishlistDocs.docs.map(doc => doc.ref.delete());
    await Promise.all(deleteWishlistPromises);

    // Delete user's saved scenes
    const scenesRef = db.collection('users').doc(req.user.uid).collection('savedScenes');
    const scenesDocs = await scenesRef.get();
    const deleteScenesPromises = scenesDocs.docs.map(doc => doc.ref.delete());
    await Promise.all(deleteScenesPromises);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account'
    });
  }
};

// Verify token (for client-side use)
const verifyToken = async (req, res) => {
  try {
    // Token is already verified by middleware
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        uid: req.user.uid,
        email: req.user.email,
        emailVerified: req.user.emailVerified
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Admin-only: Create admin user (special endpoint)
const createAdminUser = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const auth = getAuth();
    const db = getFirestore();
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName
    });

    // Create admin profile in Firestore
    const profileData = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: displayName || userRecord.email.split('@')[0],
      avatar: null,
      role: 'admin', // Admin role
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: {
        theme: 'light',
        notifications: true
      }
    };

    await db.collection('users').doc(userRecord.uid).set(profileData);

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: profileData.displayName,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Create admin user error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    if (error.code === 'auth/weak-password') {
      return res.status(400).json({
        success: false,
        message: 'Password is too weak'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating admin user'
    });
  }
};

// Create first admin user (no authentication required, only works if no admins exist)
const createFirstAdmin = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const db = getFirestore();
    
    // Check if any admin users already exist
    const adminSnapshot = await db.collection('users')
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    if (!adminSnapshot.empty) {
      return res.status(403).json({
        success: false,
        message: 'Admin users already exist. Use the admin-only endpoint to create additional admin users.'
      });
    }

    const auth = getAuth();
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName
    });

    // Create admin profile in Firestore
    const profileData = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: displayName || userRecord.email.split('@')[0],
      avatar: null,
      role: 'admin', // Admin role
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: {
        theme: 'light',
        notifications: true
      }
    };

    await db.collection('users').doc(userRecord.uid).set(profileData);

    res.status(201).json({
      success: true,
      message: 'First admin user created successfully',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: profileData.displayName,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Create first admin user error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    if (error.code === 'auth/weak-password') {
      return res.status(400).json({
        success: false,
        message: 'Password is too weak'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating first admin user'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const auth = getAuth();
    const db = getFirestore();

    // For server-side authentication, we'll use a different approach
    // Since we can't verify passwords with Admin SDK, we'll create a session token
    // In a real application, you'd want to implement proper password verification
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    
    // Get user profile from Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const userProfile = userDoc.data();

    // Create a session token (in production, implement proper JWT)
    const sessionToken = userRecord.uid; // For now, using uid as token

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userProfile.displayName,
        role: userProfile.role,
        token: sessionToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error during login'
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // Note: Firebase handles token invalidation on the client side
    // This endpoint is mainly for server-side logout tracking if needed
    
    const db = getFirestore();
    
    // Update last logout time in user profile
    await db.collection('users').doc(req.user.uid).update({
      lastLogoutAt: new Date(),
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const auth = getAuth();
    
    // Get user record to verify they still exist
    const userRecord = await auth.getUser(req.user.uid);
    
    // Create a new session token
    const sessionToken = userRecord.uid; // For now, using uid as token

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: sessionToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing token'
    });
  }
};

module.exports = {
  signUp,
  getCurrentUser,
  updateProfile,
  deleteAccount,
  verifyToken,
  createAdminUser,
  createFirstAdmin,
  login,
  logout,
  refreshToken
}; 