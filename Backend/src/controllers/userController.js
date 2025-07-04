// const { getFirestore } = require('../config/firebase');

// // Get user profile
// const getUserProfile = async (req, res) => {
//   try {
//     const db = getFirestore();
//     const userDoc = await db.collection('users').doc(req.user.uid).get();
    
//     if (!userDoc.exists) {
//       return res.status(404).json({
//         success: false,
//         message: 'User profile not found'
//       });
//     }

//     const userData = userDoc.data();
    
//     // Remove sensitive data
//     delete userData.uid;
    
//     res.status(200).json({
//       success: true,
//       data: {
//         id: userDoc.id,
//         ...userData
//       }
//     });
//   } catch (error) {
//     console.error('Get user profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching user profile'
//     });
//   }
// };

// // Update user profile
// const updateUserProfile = async (req, res) => {
//   try {
//     const { displayName, phoneNumber, preferences, address } = req.body;
//     const db = getFirestore();
    
//     const updateData = {
//       updatedAt: new Date()
//     };

//     if (displayName) updateData.displayName = displayName;
//     if (phoneNumber) updateData.phoneNumber = phoneNumber;
//     if (preferences) updateData.preferences = preferences;
//     if (address) updateData.address = address;

//     await db.collection('users').doc(req.user.uid).update(updateData);

//     res.status(200).json({
//       success: true,
//       message: 'Profile updated successfully',
//       data: updateData
//     });
//   } catch (error) {
//     console.error('Update user profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating user profile'
//     });
//   }
// };

// // Add item to wishlist
// const addToWishlist = async (req, res) => {
//   try {
//     const { productId } = req.body;
//     const db = getFirestore();
    
//     // Check if product exists
//     const productDoc = await db.collection('products').doc(productId).get();
//     if (!productDoc.exists) {
//       return res.status(404).json({
//         success: false,
//         message: 'Product not found'
//       });
//     }

//     const product = productDoc.data();
    
//     // Check if already in wishlist
//     const wishlistDoc = await db.collection('wishlist').doc(req.user.uid).get();
    
//     if (wishlistDoc.exists) {
//       const wishlist = wishlistDoc.data();
//       const existingItem = wishlist.items.find(item => item.productId === productId);
      
//       if (existingItem) {
//         return res.status(400).json({
//           success: false,
//           message: 'Product already in wishlist'
//         });
//       }
      
//       // Add to existing wishlist
//       wishlist.items.push({
//         productId,
//         productName: product.name,
//         productImage: product.thumbnailUrl,
//         price: product.price,
//         addedAt: new Date()
//       });
      
//       await db.collection('wishlist').doc(req.user.uid).update({
//         items: wishlist.items,
//         updatedAt: new Date()
//       });
//     } else {
//       // Create new wishlist
//       await db.collection('wishlist').doc(req.user.uid).set({
//         userId: req.user.uid,
//         items: [{
//           productId,
//           productName: product.name,
//           productImage: product.thumbnailUrl,
//           price: product.price,
//           addedAt: new Date()
//         }],
//         updatedAt: new Date()
//       });
//     }

//     // Increment wishlist count on product
//     await db.collection('products').doc(productId).update({
//       wishlistCount: (product.wishlistCount || 0) + 1
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Product added to wishlist'
//     });
//   } catch (error) {
//     console.error('Add to wishlist error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error adding to wishlist'
//     });
//   }
// };

// // Remove item from wishlist
// const removeFromWishlist = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const db = getFirestore();
    
//     // Check if wishlist exists
//     const wishlistDoc = await db.collection('wishlist').doc(req.user.uid).get();
    
//     if (!wishlistDoc.exists) {
//       return res.status(404).json({
//         success: false,
//         message: 'Wishlist not found'
//       });
//     }

//     const wishlist = wishlistDoc.data();
//     const itemIndex = wishlist.items.findIndex(item => item.productId === productId);
    
//     if (itemIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: 'Product not found in wishlist'
//       });
//     }

//     // Remove item from wishlist
//     wishlist.items.splice(itemIndex, 1);
    
//     await db.collection('wishlist').doc(req.user.uid).update({
//       items: wishlist.items,
//       updatedAt: new Date()
//     });

//     // Decrement wishlist count on product
//     const productDoc = await db.collection('products').doc(productId).get();
//     if (productDoc.exists) {
//       const product = productDoc.data();
//       await db.collection('products').doc(productId).update({
//         wishlistCount: Math.max(0, (product.wishlistCount || 0) - 1)
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Product removed from wishlist'
//     });
//   } catch (error) {
//     console.error('Remove from wishlist error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error removing from wishlist'
//     });
//   }
// };

// // Get user's wishlist
// const getWishlist = async (req, res) => {
//   try {
//     const db = getFirestore();
//     const wishlistDoc = await db.collection('wishlist').doc(req.user.uid).get();

//     if (!wishlistDoc.exists) {
//       return res.status(200).json({
//         success: true,
//         data: {
//           userId: req.user.uid,
//           items: [],
//           updatedAt: null
//         }
//       });
//     }

//     const wishlist = wishlistDoc.data();

//     res.status(200).json({
//       success: true,
//       data: wishlist
//     });
//   } catch (error) {
//     console.error('Get wishlist error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching wishlist'
//     });
//   }
// };

// // Save AR scene
// const saveScene = async (req, res) => {
//   try {
//     const { name, description, roomDimensions, furnitureItems, isPublic = false } = req.body;
//     const db = getFirestore();
    
//     const sceneData = {
//       userId: req.user.uid,
//       name,
//       description,
//       roomDimensions,
//       furnitureItems,
//       isPublic,
//       thumbnailUrl: null, // Will be set when screenshot is uploaded
//       likes: 0,
//       views: 0,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };

//     const sceneRef = await db.collection('savedScenes').add(sceneData);

//     res.status(201).json({
//       success: true,
//       message: 'Scene saved successfully',
//       data: {
//         id: sceneRef.id,
//         ...sceneData
//       }
//     });
//   } catch (error) {
//     console.error('Save scene error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error saving scene'
//     });
//   }
// };

// // Get user's saved scenes
// const getSavedScenes = async (req, res) => {
//   try {
//     const db = getFirestore();
//     const scenesSnapshot = await db.collection('savedScenes')
//       .where('userId', '==', req.user.uid)
//       .orderBy('createdAt', 'desc')
//       .get();

//     const scenes = [];
//     scenesSnapshot.forEach(doc => {
//       scenes.push({
//         id: doc.id,
//         ...doc.data()
//       });
//     });

//     res.status(200).json({
//       success: true,
//       data: scenes
//     });
//   } catch (error) {
//     console.error('Get saved scenes error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching saved scenes'
//     });
//   }
// };

// // Get single saved scene
// const getSavedScene = async (req, res) => {
//   try {
//     const { sceneId } = req.params;
//     const db = getFirestore();
    
//     const sceneDoc = await db.collection('savedScenes').doc(sceneId).get();

//     if (!sceneDoc.exists) {
//       return res.status(404).json({
//         success: false,
//         message: 'Scene not found'
//       });
//     }

//     const scene = sceneDoc.data();
    
//     // Check if user owns this scene
//     if (scene.userId !== req.user.uid) {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         id: sceneDoc.id,
//         ...scene
//       }
//     });
//   } catch (error) {
//     console.error('Get saved scene error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching saved scene'
//     });
//   }
// };

// // Update saved scene
// const updateSavedScene = async (req, res) => {
//   try {
//     const { sceneId } = req.params;
//     const { name, description, roomDimensions, furnitureItems, isPublic, thumbnailUrl } = req.body;
//     const db = getFirestore();
    
//     const sceneDoc = await db.collection('savedScenes').doc(sceneId).get();

//     if (!sceneDoc.exists) {
//       return res.status(404).json({
//         success: false,
//         message: 'Scene not found'
//       });
//     }

//     const scene = sceneDoc.data();
    
//     // Check if user owns this scene
//     if (scene.userId !== req.user.uid) {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied'
//       });
//     }

//     const updateData = {
//       updatedAt: new Date()
//     };

//     if (name) updateData.name = name;
//     if (description !== undefined) updateData.description = description;
//     if (roomDimensions) updateData.roomDimensions = roomDimensions;
//     if (furnitureItems) updateData.furnitureItems = furnitureItems;
//     if (isPublic !== undefined) updateData.isPublic = isPublic;
//     if (thumbnailUrl) updateData.thumbnailUrl = thumbnailUrl;

//     await db.collection('savedScenes').doc(sceneId).update(updateData);

//     res.status(200).json({
//       success: true,
//       message: 'Scene updated successfully',
//       data: updateData
//     });
//   } catch (error) {
//     console.error('Update saved scene error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating saved scene'
//     });
//   }
// };

// // Delete saved scene
// const deleteSavedScene = async (req, res) => {
//   try {
//     const { sceneId } = req.params;
//     const db = getFirestore();
    
//     const sceneDoc = await db.collection('savedScenes').doc(sceneId).get();

//     if (!sceneDoc.exists) {
//       return res.status(404).json({
//         success: false,
//         message: 'Scene not found'
//       });
//     }

//     const scene = sceneDoc.data();
    
//     // Check if user owns this scene
//     if (scene.userId !== req.user.uid) {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied'
//       });
//     }

//     await db.collection('savedScenes').doc(sceneId).delete();

//     res.status(200).json({
//       success: true,
//       message: 'Scene deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete saved scene error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting saved scene'
//     });
//   }
// };

// module.exports = {
//   getUserProfile,
//   updateUserProfile,
//   addToWishlist,
//   removeFromWishlist,
//   getWishlist,
//   saveScene,
//   getSavedScenes,
//   getSavedScene,
//   updateSavedScene,
//   deleteSavedScene
// }; 

const { getFirestore } = require('../config/firebase');
const crypto = require('crypto');

// Get user profile
const getUserProfile = async (req, res) => {
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
    
    // Remove sensitive data
    delete userData.uid;
    
    res.status(200).json({
      success: true,
      data: {
        id: userDoc.id,
        ...userData
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { displayName, phoneNumber, preferences, address } = req.body;
    const db = getFirestore();
    
    const updateData = {
      updatedAt: new Date()
    };

    if (displayName) updateData.displayName = displayName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (preferences) updateData.preferences = preferences;
    if (address) updateData.address = address;

    await db.collection('users').doc(req.user.uid).update(updateData);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updateData
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile'
    });
  }
};

// Add item to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const db = getFirestore();
    
    // Check if product exists
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = productDoc.data();
    
    // Check if already in wishlist
    const wishlistDoc = await db.collection('wishlist').doc(req.user.uid).get();
    
    if (wishlistDoc.exists) {
      const wishlist = wishlistDoc.data();
      const existingItem = wishlist.items.find(item => item.productId === productId);
      
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: 'Product already in wishlist'
        });
      }
      
      // Add to existing wishlist
      wishlist.items.push({
        productId,
        productName: product.name,
        productImage: product.thumbnailUrl,
        price: product.price,
        addedAt: new Date()
      });
      
      await db.collection('wishlist').doc(req.user.uid).update({
        items: wishlist.items,
        updatedAt: new Date()
      });
    } else {
      // Create new wishlist
      await db.collection('wishlist').doc(req.user.uid).set({
        userId: req.user.uid,
        items: [{
          productId,
          productName: product.name,
          productImage: product.thumbnailUrl,
          price: product.price,
          addedAt: new Date()
        }],
        updatedAt: new Date()
      });
    }

    // Increment wishlist count on product
    await db.collection('products').doc(productId).update({
      wishlistCount: (product.wishlistCount || 0) + 1
    });

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to wishlist'
    });
  }
};

// Remove item from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const db = getFirestore();
    
    // Check if wishlist exists
    const wishlistDoc = await db.collection('wishlist').doc(req.user.uid).get();
    
    if (!wishlistDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    const wishlist = wishlistDoc.data();
    const itemIndex = wishlist.items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    // Remove item from wishlist
    wishlist.items.splice(itemIndex, 1);
    
    await db.collection('wishlist').doc(req.user.uid).update({
      items: wishlist.items,
      updatedAt: new Date()
    });

    // Decrement wishlist count on product
    const productDoc = await db.collection('products').doc(productId).get();
    if (productDoc.exists) {
      const product = productDoc.data();
      await db.collection('products').doc(productId).update({
        wishlistCount: Math.max(0, (product.wishlistCount || 0) - 1)
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from wishlist'
    });
  }
};

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const db = getFirestore();
    const wishlistDoc = await db.collection('wishlist').doc(req.user.uid).get();

    if (!wishlistDoc.exists) {
      return res.status(200).json({
        success: true,
        data: {
          userId: req.user.uid,
          items: [],
          updatedAt: null
        }
      });
    }

    const wishlist = wishlistDoc.data();

    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist'
    });
  }
};

// Save AR scene
const saveScene = async (req, res) => {
  try {
    const { name, description, roomDimensions, furnitureItems, isPublic = false } = req.body;
    const db = getFirestore();
    
    const sceneData = {
      userId: req.user.uid,
      name,
      description,
      roomDimensions,
      furnitureItems,
      isPublic,
      thumbnailUrl: null, // Will be set when screenshot is uploaded
      likes: 0,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const sceneRef = await db.collection('savedScenes').add(sceneData);

    res.status(201).json({
      success: true,
      message: 'Scene saved successfully',
      data: {
        id: sceneRef.id,
        ...sceneData
      }
    });
  } catch (error) {
    console.error('Save scene error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving scene'
    });
  }
};

// Get user's saved scenes
const getSavedScenes = async (req, res) => {
  try {
    const db = getFirestore();
    const scenesSnapshot = await db.collection('savedScenes')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const scenes = [];
    scenesSnapshot.forEach(doc => {
      scenes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      data: scenes
    });
  } catch (error) {
    console.error('Get saved scenes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved scenes'
    });
  }
};

// Get single saved scene
const getSavedScene = async (req, res) => {
  try {
    const { sceneId } = req.params;
    const db = getFirestore();
    
    const sceneDoc = await db.collection('savedScenes').doc(sceneId).get();

    if (!sceneDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Scene not found'
      });
    }

    const scene = sceneDoc.data();
    
    // Check if user owns this scene
    if (scene.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: sceneDoc.id,
        ...scene
      }
    });
  } catch (error) {
    console.error('Get saved scene error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved scene'
    });
  }
};

// Update saved scene
const updateSavedScene = async (req, res) => {
  try {
    const { sceneId } = req.params;
    const { name, description, roomDimensions, furnitureItems, isPublic, thumbnailUrl } = req.body;
    const db = getFirestore();
    
    const sceneDoc = await db.collection('savedScenes').doc(sceneId).get();

    if (!sceneDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Scene not found'
      });
    }

    const scene = sceneDoc.data();
    
    // Check if user owns this scene
    if (scene.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (roomDimensions) updateData.roomDimensions = roomDimensions;
    if (furnitureItems) updateData.furnitureItems = furnitureItems;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (thumbnailUrl) updateData.thumbnailUrl = thumbnailUrl;

    await db.collection('savedScenes').doc(sceneId).update(updateData);

    res.status(200).json({
      success: true,
      message: 'Scene updated successfully',
      data: updateData
    });
  } catch (error) {
    console.error('Update saved scene error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating saved scene'
    });
  }
};

// Delete saved scene
const deleteSavedScene = async (req, res) => {
  try {
    const { sceneId } = req.params;
    const db = getFirestore();
    
    const sceneDoc = await db.collection('savedScenes').doc(sceneId).get();

    if (!sceneDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Scene not found'
      });
    }

    const scene = sceneDoc.data();
    
    // Check if user owns this scene
    if (scene.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await db.collection('savedScenes').doc(sceneId).delete();

    res.status(200).json({
      success: true,
      message: 'Scene deleted successfully'
    });
  } catch (error) {
    console.error('Delete saved scene error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting saved scene'
    });
  }
};

// Share a scene (publicly or with specific users)
const shareScene = async (req, res) => {
  try {
    const { sceneId } = req.params;
    const { shareType = 'private', sharedWith = [] } = req.body; // shareType: 'private', 'public', 'users'
    const db = getFirestore();
    const sceneRef = db.collection('savedScenes').doc(sceneId);
    const sceneDoc = await sceneRef.get();

    if (!sceneDoc.exists) {
      return res.status(404).json({ success: false, message: 'Scene not found' });
    }
    const scene = sceneDoc.data();
    if (scene.userId !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let updateData = { shareType };
    if (shareType === 'public') {
      let shareId = scene.shareId;
      if (!shareId) {
        shareId = crypto.randomBytes(8).toString('hex');
      }
      updateData.shareId = shareId;
      updateData.sharedWith = [];
    } else if (shareType === 'users') {
      updateData.sharedWith = sharedWith;
      updateData.shareId = null;
    } else {
      updateData.sharedWith = [];
      updateData.shareId = null;
    }
    await sceneRef.update(updateData);
    res.json({ success: true, ...updateData });
  } catch (error) {
    console.error('Share scene error:', error);
    res.status(500).json({ success: false, message: 'Error sharing scene' });
  }
};

// Get a scene by shareId (public access)
const getSharedScene = async (req, res) => {
  try {
    const { shareId } = req.params;
    const db = getFirestore();
    const scenesSnapshot = await db.collection('savedScenes')
      .where('shareId', '==', shareId)
      .where('shareType', '==', 'public')
      .limit(1)
      .get();
    if (scenesSnapshot.empty) {
      return res.status(404).json({ success: false, message: 'Scene not found or not public' });
    }
    const doc = scenesSnapshot.docs[0];
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('Get shared scene error:', error);
    res.status(500).json({ success: false, message: 'Error fetching shared scene' });
  }
};

// Get all scenes shared with the current user
const getScenesSharedWithMe = async (req, res) => {
  try {
    const db = getFirestore();
    const scenesSnapshot = await db.collection('savedScenes')
      .where('shareType', '==', 'users')
      .where('sharedWith', 'array-contains', req.user.uid)
      .get();
    const scenes = [];
    scenesSnapshot.forEach(doc => {
      scenes.push({ id: doc.id, ...doc.data() });
    });
    res.json({ success: true, data: scenes });
  } catch (error) {
    console.error('Get scenes shared with me error:', error);
    res.status(500).json({ success: false, message: 'Error fetching shared scenes' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  saveScene,
  getSavedScenes,
  getSavedScene,
  updateSavedScene,
  deleteSavedScene,
  shareScene,
  getSharedScene,
  getScenesSharedWithMe
};