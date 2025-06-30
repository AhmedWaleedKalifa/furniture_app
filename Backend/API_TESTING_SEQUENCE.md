# Furnish-AR API Testing Sequence

## Base URL: http://localhost:3000

---

## **Phase 1: Health Check & Authentication**

### 1. Health Check
```http
GET http://localhost:3000/health
```
**Expected Output:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### 2. Sign Up (Client)
```http
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "email": "client@example.com",
  "password": "password123",
  "displayName": "Test Client",
  "role": "client"
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "uid": "generated-uid",
    "email": "client@example.com",
    "displayName": "Test Client",
    "role": "client"
  }
}
```

### 3. Sign Up (Company)
```http
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "email": "company@example.com",
  "password": "password123",
  "displayName": "Test Company",
  "role": "company"
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "uid": "generated-uid",
    "email": "company@example.com",
    "displayName": "Test Company",
    "role": "company"
  }
}
```

### 4. Create First Admin User (No Authentication Required)
```http
POST http://localhost:3000/api/auth/first-admin
Content-Type: application/json

{
  "email": "firstadmin@example.com",
  "password": "password123",
  "displayName": "First Admin"
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "First admin user created successfully",
  "data": {
    "uid": "generated-uid",
    "email": "firstadmin@example.com",
    "displayName": "First Admin",
    "role": "admin"
  }
}
```

### 5. Create Additional Admin User (Admin-only endpoint)
```http
POST http://localhost:3000/api/auth/admin/create
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "email": "admin2@example.com",
  "password": "password123",
  "displayName": "Second Admin"
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "data": {
    "uid": "generated-uid",
    "email": "admin2@example.com",
    "displayName": "Second Admin",
    "role": "admin"
  }
}
```

### 6. Login User
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "client@example.com",
  "password": "password123"
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "uid": "client-uid",
    "email": "client@example.com",
    "displayName": "Test Client",
    "role": "client",
    "token": "client-uid" // Session token (uid)
  }
}
```

### 7. Login Company User
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "company@example.com",
  "password": "password123"
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "uid": "company-uid",
    "email": "company@example.com",
    "displayName": "Test Company",
    "role": "company",
    "token": "company-uid" // Session token (uid)
  }
}
```

### 8. Login Admin User
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "firstadmin@example.com",
  "password": "password123"
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "uid": "admin-uid",
    "email": "firstadmin@example.com",
    "displayName": "First Admin",
    "role": "admin",
    "token": "admin-uid" // Session token (uid)
  }
}
```

### 9. Update User Role (Admin-only) - Optional
```http
PUT http://localhost:3000/api/admin/users/{userId}/role
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "role": "company"
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "User role updated successfully"
}
```

---

## **Phase 2: Product Management (Company Role)**

### 10. Create Product (Company)
```http
POST http://localhost:3000/api/products
Authorization: Bearer {company-token}
Content-Type: application/json

{
  "name": "Modern Leather Sofa",
  "description": "Premium leather sofa with modern design",
  "category": "Sofa",
  "dimensions": {
    "width": 220,
    "height": 85,
    "depth": 95,
    "unit": "cm"
  },
  "modelUrl": "https://example.com/models/sofa.glb",
  "thumbnailUrl": "https://example.com/images/sofa.jpg",
  "price": 1299.99,
  "customizable": {
    "color": true,
    "material": true
  },
  "tags": ["modern", "leather", "comfortable"]
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "generated-product-id",
    "name": "Modern Leather Sofa",
    "companyId": "company-uid",
    "isApproved": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 11. Create Another Product (Company)
```http
POST http://localhost:3000/api/products
Authorization: Bearer {company-token}
Content-Type: application/json

{
  "name": "Ergonomic Office Chair",
  "description": "Comfortable office chair with lumbar support",
  "category": "Chair",
  "dimensions": {
    "width": 65,
    "height": 120,
    "depth": 70,
    "unit": "cm"
  },
  "modelUrl": "https://example.com/models/chair.glb",
  "thumbnailUrl": "https://example.com/images/chair.jpg",
  "price": 599.99,
  "customizable": {
    "color": true,
    "material": false
  },
  "tags": ["ergonomic", "office", "comfortable"]
}
```

---

## **Phase 3: Admin Approval**

### 12. Get Pending Products (Admin)
```http
GET http://localhost:3000/api/admin/products/pending?limit=10&offset=0
Authorization: Bearer {admin-token}
```
**Expected Output:**
```json
{
  "success": true,
  "data": [
    {
      "id": "product-id-1",
      "name": "Modern Leather Sofa",
      "isApproved": false,
      "companyId": "company-uid"
    },
    {
      "id": "product-id-2", 
      "name": "Ergonomic Office Chair",
      "isApproved": false,
      "companyId": "company-uid"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 2
  }
}
```

### 13. Approve Product (Admin)
```http
PUT http://localhost:3000/api/admin/products/{productId}/approve
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "action": "approve"
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "Product approved successfully"
}
```

### 14. Approve Second Product (Admin)
```http
PUT http://localhost:3000/api/admin/products/{productId2}/approve
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "action": "approve"
}
```

---

## **Phase 4: Product Browsing (Public)**

### 15. Get All Products (Public)
```http
GET http://localhost:3000/api/products?limit=10&offset=0&category=Sofa
```
**Expected Output:**
```json
{
  "success": true,
  "data": [
    {
      "id": "product-id-1",
      "name": "Modern Leather Sofa",
      "description": "Premium leather sofa with modern design",
      "category": "Sofa",
      "price": 1299.99,
      "isApproved": true,
      "thumbnailUrl": "https://example.com/images/sofa.jpg"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1
  }
}
```

### 16. Get Single Product
```http
GET http://localhost:3000/api/products/{productId}
```
**Expected Output:**
```json
{
  "success": true,
  "data": {
    "id": "product-id-1",
    "name": "Modern Leather Sofa",
    "description": "Premium leather sofa with modern design",
    "category": "Sofa",
    "dimensions": {
      "width": 220,
      "height": 85,
      "depth": 95,
      "unit": "cm"
    },
    "modelUrl": "https://example.com/models/sofa.glb",
    "thumbnailUrl": "https://example.com/images/sofa.jpg",
    "price": 1299.99,
    "isApproved": true,
    "customizable": {
      "color": true,
      "material": true
    },
    "tags": ["modern", "leather", "comfortable"]
  }
}
```

### 17. Get Categories
```http
GET http://localhost:3000/api/products/categories
```
**Expected Output:**
```json
{
  "success": true,
  "data": ["Sofa", "Chair", "Table", "Bed", "Storage"]
}
```

---

## **Phase 5: User Features (Client)**

### 18. Add to Wishlist
```http
POST http://localhost:3000/api/users/wishlist
Authorization: Bearer {client-token}
Content-Type: application/json

{
  "productId": "{productId}"
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "Product added to wishlist successfully"
}
```

### 19. Get Wishlist
```http
GET http://localhost:3000/api/users/wishlist
Authorization: Bearer {client-token}
```
**Expected Output:**
```json
{
  "success": true,
  "data": [
    {
      "productId": "{productId}",
      "addedAt": "2024-01-01T00:00:00.000Z",
      "product": {
        "name": "Modern Leather Sofa",
        "price": 1299.99,
        "thumbnailUrl": "https://example.com/images/sofa.jpg"
      }
    }
  ]
}
```

### 20. Save AR Scene
```http
POST http://localhost:3000/api/users/scenes
Authorization: Bearer {client-token}
Content-Type: application/json

{
  "name": "Living Room Setup",
  "furnitureItems": [
    {
      "productId": "{productId}",
      "x": 0,
      "y": 0,
      "z": 0,
      "rotation": 0
    }
  ],
  "roomDimensions": {
    "width": 400,
    "length": 300,
    "height": 250,
    "unit": "cm"
  },
  "notes": "My living room setup"
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "Scene saved successfully",
  "data": {
    "id": "generated-scene-id",
    "name": "Living Room Setup",
    "userId": "client-uid",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 21. Get Saved Scenes
```http
GET http://localhost:3000/api/users/scenes
Authorization: Bearer {client-token}
```
**Expected Output:**
```json
{
  "success": true,
  "data": [
    {
      "id": "scene-id",
      "name": "Living Room Setup",
      "furnitureItems": [
        {
          "productId": "{productId}",
          "x": 0,
          "y": 0,
          "z": 0,
          "rotation": 0
        }
      ],
      "roomDimensions": {
        "width": 400,
        "length": 300,
        "height": 250,
        "unit": "cm"
      },
      "notes": "My living room setup",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## **Phase 6: Order Management**

### 22. Create Order (Client)
```http
POST http://localhost:3000/api/orders
Authorization: Bearer {client-token}
Content-Type: application/json

{
  "items": [
    {
      "productId": "{productId}",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Cairo",
    "country": "Egypt",
    "postalCode": "12345"
  },
  "paymentMethod": "credit_card"
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "generated-order-id",
    "userId": "client-uid",
    "items": [
      {
        "productId": "{productId}",
        "productName": "Modern Leather Sofa",
        "quantity": 1,
        "unitPrice": 1299.99,
        "totalPrice": 1299.99
      }
    ],
    "totalPrice": 1299.99,
    "orderStatus": "processing",
    "paymentStatus": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 23. Get User Orders
```http
GET http://localhost:3000/api/orders/my-orders
Authorization: Bearer {client-token}
```
**Expected Output:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-id",
      "userId": "client-uid",
      "items": [
        {
          "productId": "{productId}",
          "productName": "Modern Leather Sofa",
          "quantity": 1,
          "unitPrice": 1299.99,
          "totalPrice": 1299.99
        }
      ],
      "totalPrice": 1299.99,
      "orderStatus": "processing",
      "paymentStatus": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 1
  }
}
```

### 24. Update Order Status (Admin/Company)
```http
PUT http://localhost:3000/api/orders/{orderId}/status
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "orderStatus": "shipped",
  "paymentStatus": "paid",
  "trackingNumber": "TRK123456789"
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "orderStatus": "shipped",
    "paymentStatus": "paid",
    "trackingNumber": "TRK123456789",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## **Phase 7: Support System**

### 25. Create Support Ticket
```http
POST http://localhost:3000/api/support/tickets
Authorization: Bearer {client-token}
Content-Type: application/json

{
  "subject": "Product Issue",
  "message": "I have a problem with my recent order",
  "priority": "medium",
  "category": "order"
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "Support ticket created successfully",
  "data": {
    "id": "generated-ticket-id",
    "subject": "Product Issue",
    "status": "open",
    "priority": "medium",
    "category": "order",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 26. Get User Tickets
```http
GET http://localhost:3000/api/support/tickets
Authorization: Bearer {client-token}
```
**Expected Output:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ticket-id",
      "subject": "Product Issue",
      "message": "I have a problem with my recent order",
      "status": "open",
      "priority": "medium",
      "category": "order",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## **Phase 8: Admin Dashboard**

### 27. Get System Stats
```http
GET http://localhost:3000/api/admin/stats
Authorization: Bearer {admin-token}
```
**Expected Output:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 3,
    "totalProducts": 2,
    "totalOrders": 1,
    "totalRevenue": 1299.99,
    "pendingProducts": 0,
    "activeUsers": 3
  }
}
```

### 28. Get Analytics
```http
GET http://localhost:3000/api/admin/analytics?days=30
Authorization: Bearer {admin-token}
```
**Expected Output:**
```json
{
  "success": true,
  "data": {
    "userGrowth": [
      {
        "date": "2024-01-01",
        "newUsers": 3
      }
    ],
    "productEngagement": [
      {
        "productId": "{productId}",
        "views": 5,
        "wishlistAdds": 1,
        "purchases": 1
      }
    ],
    "revenue": [
      {
        "date": "2024-01-01",
        "amount": 1299.99
      }
    ]
  }
}
```

### 29. Get All Users
```http
GET http://localhost:3000/api/admin/users?limit=50&offset=0
Authorization: Bearer {admin-token}
```
**Expected Output:**
```json
{
  "success": true,
  "data": [
    {
      "uid": "client-uid",
      "email": "client@example.com",
      "displayName": "Test Client",
      "role": "client",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "uid": "company-uid",
      "email": "company@example.com",
      "displayName": "Test Company",
      "role": "company",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "uid": "admin-uid",
      "email": "admin@example.com",
      "displayName": "Test Admin",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 3
  }
}
```

---

## **Phase 9: Product Engagement**

### 30. Track Product Engagement
```http
POST http://localhost:3000/api/products/{productId}/engagement
Authorization: Bearer {client-token}
Content-Type: application/json

{
  "type": "view",
  "metadata": {
    "source": "catalog"
  }
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "Engagement tracked successfully"
}
```

---

## **Phase 10: Profile Management**

### 31. Update Profile
```http
PUT http://localhost:3000/api/auth/profile
Authorization: Bearer {client-token}
Content-Type: application/json

{
  "displayName": "Updated Name",
  "avatar": "https://example.com/avatar.jpg",
  "phone": "+201234567890"
}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "displayName": "Updated Name",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "+201234567890",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 32. Get Current User
```http
GET http://localhost:3000/api/auth/me
Authorization: Bearer {client-token}
```
**Expected Output:**
```json
{
  "success": true,
  "data": {
    "uid": "client-uid",
    "email": "client@example.com",
    "displayName": "Updated Name",
    "role": "client",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "+201234567890"
  }
}
```

### 33. Refresh Token
```http
POST http://localhost:3000/api/auth/refresh
Authorization: Bearer {client-token}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "client-uid" // New session token (uid)
  }
}
```

### 34. Logout User
```http
POST http://localhost:3000/api/auth/logout
Authorization: Bearer {client-token}
```
**Expected Output:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## **Important Security Notes:**

1. **Restricted Signup**: Users can only signup as "client" or "company" role. Admin role is completely blocked from regular signup.

2. **Admin Creation Restriction**: Admin users can only be created through:
   - `/api/auth/first-admin` (only if no admins exist)
   - `/api/auth/admin/create` (requires existing admin authentication)

3. **Role Management**: Only admins can update user roles using `/api/admin/users/{userId}/role`.

4. **Token Management**: 
   - After login, extract the `token` (Firebase ID token) from the response
   - Use this token as the Bearer token for subsequent requests: `Authorization: Bearer {token}`
   - The `uid` is the user ID, not the authentication token

5. **Testing Sequence**: 
   - Create client and company users directly via signup
   - Login to get proper Firebase ID tokens
   - Create first admin using `/api/auth/first-admin` endpoint
   - Use admin token to create additional admins or manage roles
   - Continue with product creation and testing

6. **Error Handling**: All endpoints return consistent error formats:
   ```json
   {
     "success": false,
     "message": "Error description"
   }
   ```

7. **Role-based Access**: Make sure to use the correct token for each role (client, company, admin) as specified in the sequence.

This secure sequence ensures that:
- Regular signup is restricted to client and company roles only
- Admin creation is completely controlled and restricted
- Role changes are controlled by admin-only endpoints
- Proper validation prevents unauthorized admin creation
- Firebase ID tokens are used for secure authentication

This sequence tests all major features of your Furnish-AR backend API, including authentication, product management, user features, orders, support, and admin functionality. 