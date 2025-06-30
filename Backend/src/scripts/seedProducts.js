const { initializeFirebase, getFirestore } = require('../config/firebase');

initializeFirebase();

const seedProducts = async () => {
  try {
    const db = getFirestore();
    
    console.log('Starting to seed furniture products...');

    // Sample companies (you can replace with real company IDs)
    const companies = [
      { id: 'cmp_living_spaces', name: 'Living Spaces' },
      { id: 'cmp_modern_home', name: 'Modern Home Co.' },
      { id: 'cmp_eco_furniture', name: 'Eco Furniture' },
      { id: 'cmp_luxury_design', name: 'Luxury Design Studio' }
    ];

    // Sample furniture products
    const products = [
      {
        name: "Modern Gray Fabric Sofa",
        description: "A comfortable 3-seater sofa with premium gray fabric upholstery and solid wood legs.",
        companyId: "cmp_living_spaces",
        companyName: "Living Spaces",
        category: "Sofa",
        dimensions: { width: 2.1, height: 0.85, depth: 0.9, unit: "m" },
        modelUrl: "https://example.com/models/modern-gray-sofa.glb",
        thumbnailUrl: "https://example.com/images/modern-gray-sofa.jpg",
        customizable: { color: true, material: false, size: false },
        tags: ["sofa", "modern", "gray", "fabric"],
        isApproved: true,
        price: 1499.99,
        currency: "USD",
        views: 0,
        placements: 0,
        purchases: 0
      },
      {
        name: "Ergonomic Office Chair",
        description: "High-back ergonomic office chair with lumbar support and breathable mesh back.",
        companyId: "cmp_modern_home",
        companyName: "Modern Home Co.",
        category: "Chair",
        dimensions: { width: 0.65, height: 1.2, depth: 0.7, unit: "m" },
        modelUrl: "https://example.com/models/ergonomic-office-chair.glb",
        thumbnailUrl: "https://example.com/images/ergonomic-office-chair.jpg",
        customizable: { color: true, material: false, size: false },
        tags: ["chair", "office", "ergonomic", "mesh"],
        isApproved: true,
        price: 299.99,
        currency: "USD",
        views: 0,
        placements: 0,
        purchases: 0
      },
      {
        name: "Solid Wood Dining Table",
        description: "Beautiful 6-seater dining table made from sustainable oak wood.",
        companyId: "cmp_eco_furniture",
        companyName: "Eco Furniture",
        category: "Table",
        dimensions: { width: 1.8, height: 0.75, depth: 0.9, unit: "m" },
        modelUrl: "https://example.com/models/oak-dining-table.glb",
        thumbnailUrl: "https://example.com/images/oak-dining-table.jpg",
        customizable: { color: true, material: true, size: true },
        tags: ["table", "dining", "wood", "oak"],
        isApproved: true,
        price: 899.99,
        currency: "USD",
        views: 0,
        placements: 0,
        purchases: 0
      },
      {
        name: "Queen Size Platform Bed",
        description: "Minimalist platform bed with upholstered headboard and built-in storage.",
        companyId: "cmp_luxury_design",
        companyName: "Luxury Design Studio",
        category: "Bed",
        dimensions: { width: 1.6, height: 0.9, depth: 2.0, unit: "m" },
        modelUrl: "https://example.com/models/platform-bed.glb",
        thumbnailUrl: "https://example.com/images/platform-bed.jpg",
        customizable: { color: true, material: true, size: true },
        tags: ["bed", "queen", "platform", "storage"],
        isApproved: true,
        price: 1299.99,
        currency: "USD",
        views: 0,
        placements: 0,
        purchases: 0
      },
      {
        name: "Glass Coffee Table",
        description: "Contemporary glass coffee table with chrome-finished metal legs.",
        companyId: "cmp_modern_home",
        companyName: "Modern Home Co.",
        category: "Table",
        dimensions: { width: 1.2, height: 0.45, depth: 0.6, unit: "m" },
        modelUrl: "https://example.com/models/glass-coffee-table.glb",
        thumbnailUrl: "https://example.com/images/glass-coffee-table.jpg",
        customizable: { color: false, material: false, size: true },
        tags: ["table", "coffee", "glass", "modern"],
        isApproved: true,
        price: 449.99,
        currency: "USD",
        views: 0,
        placements: 0,
        purchases: 0
      },
      {
        name: "Accent Armchair",
        description: "Stylish accent chair with velvet upholstery and gold-finished legs.",
        companyId: "cmp_luxury_design",
        companyName: "Luxury Design Studio",
        category: "Chair",
        dimensions: { width: 0.75, height: 0.85, depth: 0.8, unit: "m" },
        modelUrl: "https://example.com/models/accent-armchair.glb",
        thumbnailUrl: "https://example.com/images/accent-armchair.jpg",
        customizable: { color: true, material: true, size: false },
        tags: ["chair", "accent", "velvet", "gold"],
        isApproved: true,
        price: 599.99,
        currency: "USD",
        views: 0,
        placements: 0,
        purchases: 0
      },
      {
        name: "Bookshelf with Drawers",
        description: "Versatile bookshelf with built-in drawers for storage.",
        companyId: "cmp_living_spaces",
        companyName: "Living Spaces",
        category: "Storage",
        dimensions: { width: 0.9, height: 1.8, depth: 0.35, unit: "m" },
        modelUrl: "https://example.com/models/bookshelf-drawers.glb",
        thumbnailUrl: "https://example.com/images/bookshelf-drawers.jpg",
        customizable: { color: true, material: false, size: true },
        tags: ["storage", "bookshelf", "drawers", "wood"],
        isApproved: true,
        price: 349.99,
        currency: "USD",
        views: 0,
        placements: 0,
        purchases: 0
      },
      {
        name: "Bar Stool Set",
        description: "Set of 4 modern bar stools with padded seats and chrome legs.",
        companyId: "cmp_modern_home",
        companyName: "Modern Home Co.",
        category: "Chair",
        dimensions: { width: 0.35, height: 0.75, depth: 0.35, unit: "m" },
        modelUrl: "https://example.com/models/bar-stools.glb",
        thumbnailUrl: "https://example.com/images/bar-stools.jpg",
        customizable: { color: true, material: false, size: false },
        tags: ["chair", "bar-stool", "kitchen", "chrome"],
        isApproved: true,
        price: 199.99,
        currency: "USD",
        views: 0,
        placements: 0,
        purchases: 0
      },
      {
        name: "Console Table",
        description: "Elegant console table with marble top and brass-finished legs.",
        companyId: "cmp_luxury_design",
        companyName: "Luxury Design Studio",
        category: "Table",
        dimensions: { width: 1.2, height: 0.85, depth: 0.4, unit: "m" },
        modelUrl: "https://example.com/models/console-table.glb",
        thumbnailUrl: "https://example.com/images/console-table.jpg",
        customizable: { color: false, material: true, size: true },
        tags: ["table", "console", "marble", "brass"],
        isApproved: true,
        price: 799.99,
        currency: "USD",
        views: 0,
        placements: 0,
        purchases: 0
      },
      {
        name: "Reclining Loveseat",
        description: "Comfortable 2-seater reclining loveseat with power reclining mechanism.",
        companyId: "cmp_living_spaces",
        companyName: "Living Spaces",
        category: "Sofa",
        dimensions: { width: 1.6, height: 0.9, depth: 0.95, unit: "m" },
        modelUrl: "https://example.com/models/reclining-loveseat.glb",
        thumbnailUrl: "https://example.com/images/reclining-loveseat.jpg",
        customizable: { color: true, material: false, size: false },
        tags: ["sofa", "loveseat", "reclining", "power"],
        isApproved: true,
        price: 899.99,
        currency: "USD",
        views: 0,
        placements: 0,
        purchases: 0
      }
    ];

    // Create products in Firestore
    for (const productData of products) {
      try {
        const productRef = await db.collection('products').add({
          ...productData,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        console.log(`Created product: ${productData.name} - $${productData.price}`);
      } catch (error) {
        console.error(`Error creating product ${productData.name}:`, error.message);
      }
    }

    console.log('\nProduct seeding completed!');
    console.log(`Created ${products.length} furniture products`);
    
    console.log('\nProduct Categories:');
    const categories = [...new Set(products.map(p => p.category))];
    categories.forEach(category => {
      const count = products.filter(p => p.category === category).length;
      console.log(`   ${category}: ${count} products`);
    });

    console.log('\nPrice Range:');
    const prices = products.map(p => p.price);
    console.log(`   Min: $${Math.min(...prices)}`);
    console.log(`   Max: $${Math.max(...prices)}`);
    console.log(`   Average: $${(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)}`);

  } catch (error) {
    console.error('Product seeding failed:', error);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts }; 