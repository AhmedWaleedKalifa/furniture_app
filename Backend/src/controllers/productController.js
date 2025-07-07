const { getFirestore, admin } = require("../config/firebase");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("../config/cloudinary"); // Adjust path as needed
const { firestore } = require("firebase-admin");
const {
  deleteFromCloudinaryByUrl,
  upload3DModelToCloudinary,
} = require("../utils/cloudinaryHelpers");

const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "product_thumbnails", resource_type: "image" },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    stream.end(buffer);
  });
};


const getProducts = async (req, res) => {
  try {
    const db = getFirestore();
    const {
      category,
      company,
      tags,
      minPrice,
      maxPrice,
      customizable,
      approved = true,
      limit = 20,
      offset = 0,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let query = db.collection("products");

    // Apply filters
    // if (approved !== undefined) {
    //   query = query.where('isApproved', '==', approved === 'true' || approved === true);
    // }

    if (category) {
      query = query.where("category", "==", category);
    }

    if (company) {
      query = query.where("companyId", "==", company);
    }

    if (customizable !== undefined) {
      query = query.where("customizable.color", "==", customizable === "true");
    }

    // Apply sorting
    query = query.orderBy(sortBy, sortOrder);

    // Apply pagination
    query = query.limit(parseInt(limit)).offset(parseInt(offset));

    const snapshot = await query.get();
    const products = [];

    snapshot.forEach((doc) => {
      const product = { id: doc.id, ...doc.data() };

      // Apply additional filters that can't be done in Firestore query
      if (tags) {
        const tagArray = tags.split(",").map((tag) => tag.trim());
        if (
          !tagArray.some((tag) => product.tags && product.tags.includes(tag))
        ) {
          return; // Skip this product
        }
      }

      if (minPrice && product.price < parseFloat(minPrice)) {
        return; // Skip this product
      }

      if (maxPrice && product.price > parseFloat(maxPrice)) {
        return; // Skip this product
      }

      products.push(product);
    });

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: products.length,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
    });
  }
};

// Get single product by ID
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestore();

    const productDoc = await db.collection("products").doc(id).get();

    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = { id: productDoc.id, ...productDoc.data() };

    // Increment view count if user is authenticated
    if (req.user) {
      await db
        .collection("products")
        .doc(id)
        .update({
          views: (product.views || 0) + 1,
        });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
    });
  }
};
const createProduct = async (req, res) => {
  try {
    // Access files from multer.fields
    const thumbnailFile = req.files?.thumbnail?.[0];
    const modelFile = req.files?.modelFile?.[0];

    if (!thumbnailFile || !modelFile) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail image and 3D model file are required.",
      });
    }

    // 1. Upload image to Cloudinary
    const uploadResult = await streamUpload(thumbnailFile.buffer);
    const thumbnailUrl = uploadResult.secure_url;

    // 2. Upload 3D model to Cloudinary
    const modelUploadResult = await upload3DModelToCloudinary(
      modelFile.buffer,
      modelFile.originalname // This includes the extension
    );
    const modelUrl = modelUploadResult.secure_url;
    // 3. Parse fields (handle JSON-stringified fields)
    const { name, description, category, price } = req.body;
    let { tags, dimensions, customizable } = req.body;

    if (!name || !description || !category || !price) {
      return res.status(400).json({
        success: false,
        message: "Missing required product fields.",
      });
    }

    // Parse JSON fields
    try {
      tags = tags ? JSON.parse(tags) : [];
      dimensions = dimensions ? JSON.parse(dimensions) : {};
      customizable = customizable ? JSON.parse(customizable) : {};
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON in fields.",
      });
    }

    // 4. Construct product object
    const newProduct = {
      name,
      description,
      category,
      price: parseFloat(price),
      modelUrl,
      thumbnailUrl,
      tags,
      dimensions,
      customizable,
      companyId: req.user.uid,
      companyName: req.user.name || "",
      isApproved: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      views: 0,
      placements: 0,
      wishlistCount: 0,
    };

    const db = getFirestore();
    const productRef = await db.collection("products").add(newProduct);

    res.status(201).json({
      success: true,
      message: "Product submitted for approval successfully",
      data: { id: productRef.id, ...newProduct },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating product",
      error: error.message,
    });
  }
};



// Update product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { uid, role } = req.user;
  const db = getFirestore();
  const productRef = db.collection("products").doc(id);

  try {
    // Fetch existing product
    const doc = await productRef.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const productData = doc.data();

    // Authorization: Only owner company or admin
    if (role !== "admin" && productData.companyId !== uid) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not own this product.",
      });
    }

    // Prepare updateData
    const updateData = { ...req.body };

    // Handle new thumbnail image upload
    if (req.files && req.files.thumbnail) {
      const thumbnailFile = req.files.thumbnail[0];
      if (productData.thumbnailUrl) {
        try {
          await deleteFromCloudinaryByUrl(productData.thumbnailUrl);
        } catch (deleteError) {
          console.error(`Failed to delete old image ${productData.thumbnailUrl}:`, deleteError);
        }
      }
      const uploadResult = await streamUpload(thumbnailFile.buffer);
      updateData.thumbnailUrl = uploadResult.secure_url;
    }

    // Handle new 3D model upload
    if (req.files && req.files.modelFile) {
      const modelFile = req.files.modelFile[0];
      // Delete old model from Cloudinary if it exists
      if (productData.modelUrl) {
        try {
          await deleteFromCloudinaryByUrl(productData.modelUrl);
        } catch (deleteError) {
          console.error(`Failed to delete old model ${productData.modelUrl}:`, deleteError);
        }
      }
      // Upload new model and set modelUrl
      const modelUploadResult = await upload3DModelToCloudinary(
        modelFile.buffer,
        modelFile.originalname
      );
      updateData.modelUrl = modelUploadResult.secure_url;
    }

    // Parse and validate fields
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }
    if (updateData.dimensions && typeof updateData.dimensions === "string") {
      updateData.dimensions = JSON.parse(updateData.dimensions);
    }
    if (updateData.tags && typeof updateData.tags === "string") {
      updateData.tags = JSON.parse(updateData.tags);
    }

    // Remove undefined fields (Firestore does not accept undefined)
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Always update the timestamp
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // Reset approval if not admin
    if (role !== "admin") {
      updateData.isApproved = false;
    }

    await productRef.update(updateData);

    res.status(200).json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating product",
      error: error.message,
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestore();

    const productDoc = await db.collection("products").doc(id).get();

    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = productDoc.data();

    // Check if user owns this product or is admin
    if (
      product.companyId !== req.user.uid &&
      req.userProfile.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own products.",
      });
    }

    await db.collection("products").doc(id).delete();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
    });
  }
};

// Track product engagement
const trackEngagement = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, metadata } = req.body;
    const db = getFirestore();

    const productDoc = await db.collection("products").doc(id).get();

    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updateData = {};

    switch (type) {
      case "view":
        updateData.views = (productDoc.data().views || 0) + 1;
        break;
      case "placement":
        updateData.placements = (productDoc.data().placements || 0) + 1;
        break;
      case "wishlist":
        updateData.wishlistCount = (productDoc.data().wishlistCount || 0) + 1;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid engagement type",
        });
    }

    await db.collection("products").doc(id).update(updateData);

    // Store detailed engagement data
    if (req.user) {
      await db.collection("products").doc(id).collection("engagement").add({
        userId: req.user.uid,
        type,
        metadata,
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Engagement tracked successfully",
    });
  } catch (error) {
    console.error("Track engagement error:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking engagement",
    });
  }
};

// Get product categories
const getCategories = async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db
      .collection("products")
      .where("isApproved", "==", true)
      .get();

    const categories = new Set();
    snapshot.forEach((doc) => {
      const product = doc.data();
      if (product.category) {
        categories.add(product.category);
      }
    });

    res.status(200).json({
      success: true,
      data: Array.from(categories),
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  trackEngagement,
  getCategories,
};
