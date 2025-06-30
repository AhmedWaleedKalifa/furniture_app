# Furnish-AR Backend API

A comprehensive backend API for the Furnish-AR application, built with Node.js, Express, and Firebase.

## Features

- **Product Management**: CRUD operations for furniture catalog
- **User Management**: Profile creation, editing, and role management
- **Wishlist**: Save and manage favorite furniture items
- **AR Scene Management**: Save and retrieve AR room scenes
- **Analytics**: Track product engagement and system statistics
- **Role-based Access Control**: Admin, Company, and Client roles
- **Support System**: Ticket management for user support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **File Storage**: Firebase Storage (for 3D models and images)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
src/
├── config/
│   └── firebase.js          # Firebase configuration
├── controllers/
│   ├── adminController.js   # Admin dashboard operations
│   ├── authController.js    # Authentication operations
│   ├── orderController.js   # Order management
│   ├── productController.js # Product CRUD operations
│   ├── supportController.js # Support ticket management
│   └── userController.js    # User profile management
├── middleware/
│   └── auth.js             # Authentication middleware
├── routes/
│   ├── admin.js            # Admin routes
│   ├── auth.js             # Authentication routes
│   ├── orders.js           # Order routes
│   ├── products.js         # Product routes
│   ├── support.js          # Support routes
│   └── users.js            # User routes
├── scripts/
│   └── seedProducts.js     # Database seeding script
└── utils/
    ├── seedData.js         # Complete data seeding
    └── validation.js       # Input validation schemas
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sharkawy0/Furnish-AR.git
   cd Furnish-AR
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database and Authentication
   - Go to Project Settings > Service Accounts
   - Generate a new private key (JSON file)
   - Copy the values from the JSON file to your environment variables

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your Firebase credentials:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account-email%40your-project.iam.gserviceaccount.com
   
   PORT=3000
   NODE_ENV=development
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Seed the database (optional)**
   ```bash
   node src/utils/seedData.js
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Company/Admin)
- `PUT /api/products/:id` - Update product (Company/Admin)
- `DELETE /api/products/:id` - Delete product (Company/Admin)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/wishlist` - Get user wishlist
- `POST /api/users/wishlist/:productId` - Add to wishlist
- `DELETE /api/users/wishlist/:productId` - Remove from wishlist

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/products` - Get all products with approval status
- `PUT /api/admin/products/:id/approve` - Approve product
- `GET /api/admin/analytics` - System analytics

### Support
- `POST /api/support/tickets` - Create support ticket
- `GET /api/support/tickets` - Get user tickets
- `PUT /api/support/tickets/:id` - Update ticket status

## Role-based Access

- **Admin**: Full access to all features and admin dashboard
- **Company**: Can manage their own products and view analytics
- **Client**: Can browse products, create wishlists, and save AR scenes

## Database Collections

- `users` - User profiles and preferences
- `products` - Furniture catalog with 3D models
- `orders` - Purchase orders and transactions
- `support_tickets` - Customer support tickets
- `saved_scenes` - User's saved AR room scenes
- `wishlist` - User's favorite products
- `analytics` - Product engagement and system metrics

## Testing

Use the provided Postman collection to test all API endpoints:
`Furnish-AR-API.postman_collection.json`
