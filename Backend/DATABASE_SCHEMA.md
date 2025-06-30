# Furnish-AR Database Schema

## Firestore Design Principles
- **No joins** → duplicate data where needed for performance
- **Fast reads** → avoid deep nesting, use flat structures
- **Subcollections** → only when needed for strict ownership
- **Indexing** → always index fields you'll query or sort by

## Collections Structure

### 1. `/users/{userId}`
```javascript
{
  uid: "user123",
  displayName: "Mohamed Sharkawi",
  email: "mohamed@furnishar.com",
  role: "client", // "client", "company", "admin"
  avatarUrl: "https://cdn.com/avatars/mohamed.jpg",
  phoneNumber: "+201234567890",
  preferences: {
    theme: "light",
    notifications: true,
    language: "en"
  },
  address: {
    street: "123 Main St",
    city: "Cairo",
    country: "Egypt",
    postalCode: "12345"
  },
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastLoginAt: Timestamp,
  isVerified: true
}
```

### 2. `/products/{productId}`
```javascript
{
  name: "Modern Gray Fabric Sofa",
  description: "A comfortable 3-seater sofa with premium gray fabric upholstery",
  companyId: "company123",
  companyName: "Living Spaces Co.",
  category: "Sofa",
  subcategory: "3-Seater",
  dimensions: {
    width: 2.1,
    height: 0.85,
    depth: 0.9,
    unit: "m"
  },
  modelUrl: "https://models.furnishar.com/sofa-gray.glb",
  thumbnailUrl: "https://images.furnishar.com/sofa-gray-thumb.jpg",
  galleryUrls: [
    "https://images.furnishar.com/sofa-gray-1.jpg",
    "https://images.furnishar.com/sofa-gray-2.jpg"
  ],
  price: 1499.99,
  currency: "USD",
  originalPrice: 1799.99,
  discount: 16.67,
  customizable: {
    color: true,
    material: false,
    size: true
  },
  customizationOptions: {
    colors: ["gray", "black", "white", "brown"],
    materials: ["fabric", "leather"],
    sizes: ["small", "medium", "large"]
  },
  tags: ["modern", "gray", "fabric", "sofa", "comfortable"],
  isApproved: true,
  isActive: true,
  isFeatured: false,
  approvalStatus: "approved", // "pending", "approved", "rejected"
  approvedBy: "admin123",
  approvedAt: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // Analytics counters
  views: 1250,
  placements: 342,
  wishlistCount: 89,
  purchaseCount: 23,
  
  // SEO
  slug: "modern-gray-fabric-sofa",
  metaTitle: "Modern Gray Fabric Sofa - Living Spaces",
  metaDescription: "Comfortable 3-seater sofa with premium gray fabric"
}
```

### 3. `/companies/{companyId}`
```javascript
{
  name: "Living Spaces Co.",
  displayName: "Living Spaces",
  logoUrl: "https://cdn.furnishar.com/logos/living-spaces.png",
  bannerUrl: "https://cdn.furnishar.com/banners/living-spaces.jpg",
  description: "Premium furniture vendor specializing in modern home decor",
  shortDescription: "Modern furniture for contemporary homes",
  contactEmail: "info@livingspaces.com",
  contactPhone: "+201234567890",
  website: "https://livingspaces.com",
  address: {
    street: "456 Business Ave",
    city: "Cairo",
    country: "Egypt",
    postalCode: "54321"
  },
  ownerUid: "mohamed123",
  verified: true,
  isActive: true,
  subscriptionPlan: "premium", // "basic", "premium", "enterprise"
  subscriptionExpiresAt: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // Stats
  totalProducts: 45,
  totalSales: 125000,
  rating: 4.8,
  reviewCount: 156
}
```

### 4. `/orders/{orderId}`
```javascript
{
  orderNumber: "ORD-2024-001",
  userId: "mohamed123",
  userEmail: "mohamed@furnishar.com",
  userPhone: "+201234567890",
  
  items: [
    {
      productId: "sofa123",
      productName: "Modern Gray Fabric Sofa",
      productImage: "https://images.furnishar.com/sofa-gray-thumb.jpg",
      quantity: 1,
      unitPrice: 1499.99,
      totalPrice: 1499.99,
      customization: {
        color: "gray",
        size: "medium"
      }
    }
  ],
  
  subtotal: 1499.99,
  tax: 149.99,
  shipping: 50.00,
  discount: 100.00,
  totalAmount: 1599.98,
  currency: "USD",
  
  shippingAddress: {
    name: "Mohamed Sharkawi",
    street: "123 Main St",
    city: "Cairo",
    country: "Egypt",
    postalCode: "12345",
    phone: "+201234567890"
  },
  
  billingAddress: {
    name: "Mohamed Sharkawi",
    street: "123 Main St",
    city: "Cairo",
    country: "Egypt",
    postalCode: "12345"
  },
  
  paymentMethod: "paymob", // "paymob", "stripe", "cash"
  paymentStatus: "paid", // "pending", "paid", "failed", "refunded"
  paymentId: "pay_123456789",
  
  orderStatus: "processing", // "pending", "processing", "shipped", "delivered", "cancelled"
  trackingNumber: "TRK123456789",
  estimatedDelivery: Timestamp,
  
  notes: "Please deliver during business hours",
  
  createdAt: Timestamp,
  updatedAt: Timestamp,
  paidAt: Timestamp,
  shippedAt: Timestamp,
  deliveredAt: Timestamp
}
```

### 5. `/savedScenes/{sceneId}`
```javascript
{
  userId: "mohamed123",
  name: "Living Room Design",
  description: "Modern living room with gray sofa and coffee table",
  thumbnailUrl: "https://cdn.furnishar.com/scenes/living-room-thumb.jpg",
  
  roomDimensions: {
    width: 4.0,
    height: 2.5,
    depth: 6.0,
    unit: "m"
  },
  
  furnitureItems: [
    {
      productId: "sofa123",
      productName: "Modern Gray Fabric Sofa",
      productImage: "https://images.furnishar.com/sofa-gray-thumb.jpg",
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 45, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
      },
      customization: {
        color: "gray",
        size: "medium"
      }
    },
    {
      productId: "table123",
      productName: "Glass Coffee Table",
      productImage: "https://images.furnishar.com/table-thumb.jpg",
      transform: {
        position: { x: 0, y: 0, z: 1.5 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
      }
    }
  ],
  
  isPublic: false,
  isFeatured: false,
  likes: 12,
  views: 45,
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 6. `/supportTickets/{ticketId}`
```javascript
{
  ticketNumber: "TKT-2024-001",
  userId: "mohamed123",
  userEmail: "mohamed@furnishar.com",
  userName: "Mohamed Sharkawi",
  
  category: "technical", // "technical", "billing", "product", "general"
  priority: "medium", // "low", "medium", "high", "urgent"
  
  subject: "AR Model not loading properly",
  description: "The sofa model crashes when I try to place it in AR mode on my iPhone 14",
  
  status: "open", // "open", "in_progress", "resolved", "closed"
  assignedTo: "ahmed123",
  assignedAt: Timestamp,
  
  attachments: [
    {
      name: "screenshot.jpg",
      url: "https://cdn.furnishar.com/support/screenshot.jpg",
      type: "image"
    }
  ],
  
  messages: [
    {
      id: "msg1",
      senderId: "mohamed123",
      senderName: "Mohamed Sharkawi",
      senderType: "user", // "user", "agent", "system"
      message: "The AR model crashes when I try to place it",
      timestamp: Timestamp
    },
    {
      id: "msg2",
      senderId: "ahmed123",
      senderName: "Ahmed Walid",
      senderType: "agent",
      message: "Thank you for reporting this. We're investigating the issue.",
      timestamp: Timestamp
    }
  ],
  
  createdAt: Timestamp,
  updatedAt: Timestamp,
  resolvedAt: Timestamp,
  closedAt: Timestamp
}
```

### 7. `/analytics/{productId}`
```javascript
{
  productId: "sofa123",
  
  // Daily stats
  dailyViews: {
    "2024-01-15": 45,
    "2024-01-16": 52,
    "2024-01-17": 38
  },
  
  dailyPlacements: {
    "2024-01-15": 12,
    "2024-01-16": 15,
    "2024-01-17": 8
  },
  
  dailyWishlist: {
    "2024-01-15": 3,
    "2024-01-16": 5,
    "2024-01-17": 2
  },
  
  // Total counters
  totalViews: 1250,
  totalPlacements: 342,
  totalWishlist: 89,
  totalPurchases: 23,
  
  // Conversion rates
  viewToPlacementRate: 27.36, // percentage
  placementToPurchaseRate: 6.73, // percentage
  
  lastUpdated: Timestamp
}
```

### 8. `/wishlist/{userId}`
```javascript
{
  userId: "mohamed123",
  items: [
    {
      productId: "sofa123",
      productName: "Modern Gray Fabric Sofa",
      productImage: "https://images.furnishar.com/sofa-gray-thumb.jpg",
      price: 1499.99,
      addedAt: Timestamp
    },
    {
      productId: "table123",
      productName: "Glass Coffee Table",
      productImage: "https://images.furnishar.com/table-thumb.jpg",
      price: 449.99,
      addedAt: Timestamp
    }
  ],
  updatedAt: Timestamp
}
```

## Subcollections (Optional)

### `/users/{userId}/wishlist/{productId}`
```javascript
{
  productId: "sofa123",
  addedAt: Timestamp
}
```

### `/users/{userId}/savedScenes/{sceneId}`
```javascript
{
  name: "Living Room Design",
  thumbnailUrl: "https://cdn.furnishar.com/scenes/living-room-thumb.jpg",
  furnitureItems: [...],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `/companies/{companyId}/products/{productId}`
```javascript
{
  name: "Modern Gray Fabric Sofa",
  isActive: true,
  createdAt: Timestamp
}
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth.token.role == 'admin';
    }
    
    // Products - public read, company/admin write
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth.token.role == 'company' && 
                      request.auth.uid == resource.data.companyId;
      allow update: if request.auth.token.role == 'company' && 
                      request.auth.uid == resource.data.companyId ||
                    request.auth.token.role == 'admin';
      allow delete: if request.auth.token.role == 'admin';
    }
    
    // Companies - public read, owner/admin write
    match /companies/{companyId} {
      allow read: if true;
      allow write: if request.auth.uid == resource.data.ownerUid ||
                    request.auth.token.role == 'admin';
    }
    
    // Orders - user can read/write their own, admin can read all
    match /orders/{orderId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow read: if request.auth.token.role == 'admin';
    }
    
    // Saved scenes - user can read/write their own
    match /savedScenes/{sceneId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Support tickets - user can read/write their own, agents can read assigned
    match /supportTickets/{ticketId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow read: if request.auth.uid == resource.data.assignedTo ||
                   request.auth.token.role == 'admin';
    }
    
    // Analytics - admin only
    match /analytics/{productId} {
      allow read, write: if request.auth.token.role == 'admin';
    }
  }
}
```

## Required Indexes

### Products Collection
- `companyId` (Ascending)
- `isApproved` (Ascending)
- `category` (Ascending)
- `price` (Ascending)
- `createdAt` (Descending)
- `tags` (Array contains)
- `isActive` (Ascending)

### Orders Collection
- `userId` (Ascending)
- `status` (Ascending)
- `createdAt` (Descending)
- `paymentStatus` (Ascending)

### Saved Scenes Collection
- `userId` (Ascending)
- `isPublic` (Ascending)
- `createdAt` (Descending)

### Support Tickets Collection
- `userId` (Ascending)
- `status` (Ascending)
- `priority` (Ascending)
- `assignedTo` (Ascending)
- `createdAt` (Descending)

## Sample Data Names

### Users
1. Mohamed Sharkawi (admin)
2. Ahmed Walid (company owner)
3. Moaaz Amr (client)
4. Sarah Johnson (client)
5. Alex Chen (company owner)

### Companies
1. Living Spaces Co. (Ahmed Walid)
2. Modern Home Studio (Alex Chen)
3. Eco Furniture Ltd. (Mohamed Sharkawi)
4. Luxury Design Hub (Ahmed Walid)
5. Urban Comfort (Moaaz Amr)

### Products
1. Modern Gray Fabric Sofa (Living Spaces)
2. Ergonomic Office Chair (Modern Home Studio)
3. Solid Wood Dining Table (Eco Furniture)
4. Glass Coffee Table (Luxury Design Hub)
5. Platform Bed with Storage (Urban Comfort) 