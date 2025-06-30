const admin = require('firebase-admin');
const { initializeFirebase, getFirestore, getAuth } = require('../config/firebase');

// Initialize Firebase Admin SDK
initializeFirebase();

const seedData = async () => {
  try {
    const db = getFirestore();
    const auth = getAuth();

    console.log('Starting to seed database...');

    // Create dummy users with all schema fields
    const users = [
      {
        email: 'mohamed@furnishar.com',
        password: 'admin123456',
        displayName: 'Mohamed Sharkawi',
        role: 'admin',
        phoneNumber: '+201111111111',
        avatarUrl: 'https://cdn.com/avatars/mohamed.jpg',
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        },
        address: {
          street: '123 Main St',
          city: 'Cairo',
          country: 'Egypt',
          postalCode: '12345'
        },
        isVerified: true
      },
      {
        email: 'ahmed@furnishar.com',
        password: 'company123456',
        displayName: 'Ahmed Walid',
        role: 'company',
        phoneNumber: '+201122233344',
        avatarUrl: 'https://cdn.com/avatars/ahmed.jpg',
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'en'
        },
        address: {
          street: '456 Business Ave',
          city: 'Cairo',
          country: 'Egypt',
          postalCode: '54321'
        },
        isVerified: true
      },
      {
        email: 'moaaz@furnishar.com',
        password: 'client123456',
        displayName: 'Moaaz Amr',
        role: 'client',
        phoneNumber: '+201133344455',
        avatarUrl: 'https://cdn.com/avatars/moaaz.jpg',
        preferences: {
          theme: 'light',
          notifications: false,
          language: 'en'
        },
        address: {
          street: '789 Client Rd',
          city: 'Alexandria',
          country: 'Egypt',
          postalCode: '67890'
        },
        isVerified: true
      }
    ];

    const createdUsers = [];

    for (const userData of users) {
      try {
        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName
        });

        // Create user profile in Firestore
        const profileData = {
          uid: userRecord.uid,
          displayName: userData.displayName,
          email: userData.email,
          role: userData.role,
          phoneNumber: userData.phoneNumber,
          avatarUrl: userData.avatarUrl,
          preferences: userData.preferences,
          address: userData.address,
          isVerified: userData.isVerified,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date()
        };

        await db.collection('users').doc(userRecord.uid).set(profileData);
        createdUsers.push({ ...profileData, password: userData.password });
        
        console.log(`Created user: ${userData.email} (${userData.role})`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`User already exists: ${userData.email}`);
        } else {
          console.error(`Error creating user ${userData.email}:`, error.message);
        }
      }
    }

    // Create dummy companies with all schema fields
    const companies = [
      {
        name: 'Living Spaces Co.',
        displayName: 'Living Spaces',
        description: 'Premium furniture vendor specializing in modern home decor',
        shortDescription: 'Modern furniture for contemporary homes',
        contactEmail: 'info@livingspaces.com',
        contactPhone: '+201234567890',
        website: 'https://livingspaces.com',
        address: {
          street: '456 Business Ave',
          city: 'Cairo',
          country: 'Egypt',
          postalCode: '54321'
        },
        ownerUid: createdUsers.find(u => u.role === 'company')?.uid,
        verified: true,
        isActive: true,
        subscriptionPlan: 'premium',
        subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        logoUrl: 'https://cdn.furnishar.com/logos/living-spaces.png',
        bannerUrl: 'https://cdn.furnishar.com/banners/living-spaces.jpg',
        totalProducts: 3,
        totalSales: 125000,
        rating: 4.8,
        reviewCount: 156,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const companyData of companies) {
      try {
        await db.collection('companies').add(companyData);
        console.log(`Created company: ${companyData.name}`);
      } catch (error) {
        console.error(`Error creating company ${companyData.name}:`, error.message);
      }
    }

    // Create dummy products with all schema fields
    const products = [
      {
        name: 'Modern Gray Fabric Sofa',
        description: 'A comfortable 3-seater sofa with premium gray fabric upholstery and solid wood legs',
        companyId: createdUsers.find(u => u.role === 'company')?.uid || 'dummy-company-id',
        companyName: 'Living Spaces Co.',
        category: 'Sofa',
        subcategory: '3-Seater',
        dimensions: {
          width: 2.1,
          height: 0.85,
          depth: 0.9,
          unit: 'm'
        },
        modelUrl: 'https://models.furnishar.com/sofa-gray.glb',
        thumbnailUrl: 'https://images.furnishar.com/sofa-gray-thumb.jpg',
        galleryUrls: [
          'https://images.furnishar.com/sofa-gray-1.jpg',
          'https://images.furnishar.com/sofa-gray-2.jpg'
        ],
        price: 1499.99,
        currency: 'USD',
        originalPrice: 1799.99,
        discount: 16.67,
        customizable: {
          color: true,
          material: false,
          size: true
        },
        customizationOptions: {
          colors: ['gray', 'black', 'white', 'brown'],
          materials: ['fabric', 'leather'],
          sizes: ['small', 'medium', 'large']
        },
        tags: ['modern', 'gray', 'fabric', 'sofa', 'comfortable'],
        isApproved: true,
        isActive: true,
        isFeatured: false,
        approvalStatus: 'approved',
        approvedBy: createdUsers.find(u => u.role === 'admin')?.uid,
        approvedAt: new Date(),
        slug: 'modern-gray-fabric-sofa',
        metaTitle: 'Modern Gray Fabric Sofa - Living Spaces',
        metaDescription: 'Comfortable 3-seater sofa with premium gray fabric',
        views: Math.floor(Math.random() * 100),
        placements: Math.floor(Math.random() * 50),
        wishlistCount: Math.floor(Math.random() * 20),
        purchaseCount: Math.floor(Math.random() * 10),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ergonomic Office Chair',
        description: 'High-back ergonomic office chair with lumbar support and breathable mesh back',
        companyId: createdUsers.find(u => u.role === 'company')?.uid || 'dummy-company-id',
        companyName: 'Living Spaces Co.',
        category: 'Chair',
        subcategory: 'Office',
        dimensions: {
          width: 0.65,
          height: 1.2,
          depth: 0.7,
          unit: 'm'
        },
        modelUrl: 'https://models.furnishar.com/office-chair.glb',
        thumbnailUrl: 'https://images.furnishar.com/office-chair-thumb.jpg',
        galleryUrls: [
          'https://images.furnishar.com/office-chair-1.jpg',
          'https://images.furnishar.com/office-chair-2.jpg'
        ],
        price: 299.99,
        currency: 'USD',
        originalPrice: 349.99,
        discount: 14.29,
        customizable: {
          color: true,
          material: false,
          size: false
        },
        customizationOptions: {
          colors: ['black', 'gray', 'blue'],
          materials: ['mesh', 'fabric'],
          sizes: ['standard']
        },
        tags: ['ergonomic', 'office', 'chair', 'mesh', 'comfortable'],
        isApproved: true,
        isActive: true,
        isFeatured: true,
        approvalStatus: 'approved',
        approvedBy: createdUsers.find(u => u.role === 'admin')?.uid,
        approvedAt: new Date(),
        slug: 'ergonomic-office-chair',
        metaTitle: 'Ergonomic Office Chair - Living Spaces',
        metaDescription: 'High-back ergonomic office chair with lumbar support',
        views: Math.floor(Math.random() * 100),
        placements: Math.floor(Math.random() * 50),
        wishlistCount: Math.floor(Math.random() * 20),
        purchaseCount: Math.floor(Math.random() * 10),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Solid Wood Dining Table',
        description: 'Beautiful 6-seater dining table made from sustainable oak wood',
        companyId: createdUsers.find(u => u.role === 'company')?.uid || 'dummy-company-id',
        companyName: 'Living Spaces Co.',
        category: 'Table',
        subcategory: 'Dining',
        dimensions: {
          width: 1.8,
          height: 0.75,
          depth: 0.9,
          unit: 'm'
        },
        modelUrl: 'https://models.furnishar.com/dining-table.glb',
        thumbnailUrl: 'https://images.furnishar.com/dining-table-thumb.jpg',
        galleryUrls: [
          'https://images.furnishar.com/dining-table-1.jpg',
          'https://images.furnishar.com/dining-table-2.jpg'
        ],
        price: 899.99,
        currency: 'USD',
        originalPrice: 999.99,
        discount: 10.00,
        customizable: {
          color: true,
          material: true,
          size: true
        },
        customizationOptions: {
          colors: ['oak', 'walnut', 'mahogany', 'white'],
          materials: ['solid wood', 'engineered wood'],
          sizes: ['4-seater', '6-seater', '8-seater']
        },
        tags: ['wooden', 'dining', 'table', 'oak', 'natural'],
        isApproved: true,
        isActive: true,
        isFeatured: false,
        approvalStatus: 'approved',
        approvedBy: createdUsers.find(u => u.role === 'admin')?.uid,
        approvedAt: new Date(),
        slug: 'solid-wood-dining-table',
        metaTitle: 'Solid Wood Dining Table - Living Spaces',
        metaDescription: 'Beautiful 6-seater dining table made from sustainable oak wood',
        views: Math.floor(Math.random() * 100),
        placements: Math.floor(Math.random() * 50),
        wishlistCount: Math.floor(Math.random() * 20),
        purchaseCount: Math.floor(Math.random() * 10),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const productData of products) {
      try {
        await db.collection('products').add(productData);
        console.log(`Created product: ${productData.name}`);
      } catch (error) {
        console.error(`Error creating product ${productData.name}:`, error.message);
      }
    }

    console.log('\nDatabase seeding completed!');
    console.log('\nCreated Users:');
    createdUsers.forEach(user => {
      console.log(`   ${user.email} (${user.role}) - Password: ${user.password}`);
    });
    
    console.log('\nCreated Companies:');
    companies.forEach(company => {
      console.log(`   ${company.name}`);
    });
    
    console.log('\nCreated Products:');
    products.forEach(product => {
      console.log(`   ${product.name} - $${product.price}`);
    });

    console.log('\nTest Credentials:');
    console.log('   Admin: mohamed@furnishar.com / admin123456');
    console.log('   Company: ahmed@furnishar.com / company123456');
    console.log('   Client: moaaz@furnishar.com / client123456');

  } catch (error) {
    console.error('Seeding failed:', error);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData }; 