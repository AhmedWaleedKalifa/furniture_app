import { User, Product, ProductDetails, Order, SupportTicket, AdminStats, WishlistItem } from '../types/index';
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

// --- Interfaces ---
export interface LoginData {
  email: string;
  password: string;
}
export interface NewProductData {
  name: string;
  description: string;
  category: string;
  price: number;
  modelUrl: string;
  thumbnailUrl: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  // FIX: Add the customizable object to the interface
  customizable: {
      color: boolean;
      material: boolean;
  };
}
export interface SignupData extends LoginData {
  displayName: string;
  role: 'client' | 'company';
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface WishlistAddData {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
}
export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  // Using a placeholder address for now as the UI doesn't collect this yet.
  shippingAddress: { 
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: string;
}
// --- Auth Functions ---
export const loginUser = async (credentials: LoginData): Promise<User & { token: string }> => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
  });

  const data: ApiResponse<User & { token: string }> = await response.json();

  if (!response.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
  }
  // The login response from the backend doesn't include createdAt,
  // which is why the property must be optional in the User type.
  return data.data;
};

export const signupUser = async (userData: SignupData): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
  });
  
  const data = await response.json();

  if (!response.ok || !data.success) {
      throw new Error(data.message || 'Signup failed');
  }
};
export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
          'Authorization': `Bearer ${token}`
      }
  });

  const data: ApiResponse<User> = await response.json();

  if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch user');
  }
  return data.data;
}
export const logoutUser = async (token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${token}`
      }
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
      console.warn('Logout API call failed:', data.message);
  }
}


// --- Furniture Functions (existing) ---

// ... (at the top with other interfaces)
export const fetchFurniture = async (): Promise<Product[]> => {
  const endpoint = `${BASE_URL}/api/products`
  console.log("Fetching from endpoint:", endpoint); 
  const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
          accept: 'application/json',
      }
  });
  
  if (!response.ok) {
      throw new Error(`Failed to fetch furniture ${response.statusText}`);
  }

  const data = await response.json();

  return data.data;
}
export const fetchFurnitureDetails = async (id:string): Promise<ProductDetails> => {
  const endpoint = `${BASE_URL}/api/products/${id}`

  console.log("Fetching from endpoint:", endpoint); 

  const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
          accept: 'application/json',
      }
  });
  
  if (!response.ok) {
      throw new Error(`Failed to fetch furniture ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}


// ... (existing auth and furniture functions)

// Helper to create authenticated headers
const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});


// --- Wishlist Functions ---
export const getWishlist = async (token: string): Promise<WishlistItem[]> => {
  const response = await fetch(`${BASE_URL}/api/users/wishlist`, {
      headers: getAuthHeaders(token),
  });
  const data: ApiResponse<any> = await response.json();
  if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch wishlist');
  }

  // FIX: The backend returns an object with an 'items' array.
  const itemsArray = data.data?.items || [];

  if (!Array.isArray(itemsArray)) {
    console.error("Wishlist data received from API is not in an expected array format:", data.data);
    return []; // Return empty array to prevent crash
  }

  // FIX: Map the flattened properties from the wishlist item directly.
  const mappedWishlist: WishlistItem[] = itemsArray.map((item: any) => ({
    productId: item.productId,
    addedAt: item.addedAt,
    productName: item.productName || 'Unknown Product',
    price: item.price || 0,
    productImage: item.productImage,
  }));
  
  return mappedWishlist;
};


export const addToWishlist = async (token: string, productData: WishlistAddData): Promise<void> => {
  // FIX: Send the entire product data object to be stored.
  const response = await fetch(`${BASE_URL}/api/users/wishlist`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(productData)
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || 'Failed to add to wishlist');
};
export const removeFromWishlist = async (token: string, productId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/users/wishlist/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token)
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to remove from wishlist');
  } 
};

// --- Order Functions ---

export const getMyOrders = async (token: string): Promise<Order[]> => {
    const response = await fetch(`${BASE_URL}/api/orders/my-orders`, {
        headers: getAuthHeaders(token)
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch orders');
    return data.data;
}

export const createOrder = async (token: string, orderData: CreateOrderData): Promise<Order> => {
  const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(orderData),
  });
  const data: ApiResponse<Order> = await response.json();
  if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to create order');
  }
  return data.data;
};

// --- Support Ticket Functions ---

export const getMyTickets = async (token: string): Promise<SupportTicket[]> => {
    const response = await fetch(`${BASE_URL}/api/support/tickets`, {
        headers: getAuthHeaders(token)
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch tickets');
    return data.data;
}

export const createTicket = async (token: string, ticketData: { subject: string, message: string, priority: string, category: string }): Promise<void> => {
    const response = await fetch(`${BASE_URL}/api/support/tickets`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(ticketData)
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to create ticket');
}


// --- Admin Functions ---

export const getAllUsers = async (token: string): Promise<User[]> => {
  const response = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: getAuthHeaders(token)
  });
  const data: ApiResponse<User[]> = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch users');
  return data.data;
};

export const updateUserRole = async (token: string, userId: string, role: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ role })
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to update user role');
};

export const getAdminStats = async (token: string): Promise<AdminStats> => {
    const response = await fetch(`${BASE_URL}/api/admin/stats`, {
        headers: getAuthHeaders(token)
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch admin stats');
    return data.data;
}

export const getPendingProducts = async (token: string): Promise<Product[]> => {
    const response = await fetch(`${BASE_URL}/api/admin/products/pending`, {
        headers: getAuthHeaders(token)
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch pending products');
    return data.data;
}

export const approveProduct = async (token: string, productId: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/api/admin/products/${productId}/approve`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ action: 'approve' })
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to approve product');
}


// ... (at the top, with other interfaces)

// Define the shape of data for creating a new product

  
  // ... (inside the file, after existing functions)
  
  // --- Company Functions ---
  
  export const getCompanyProducts = async (token: string): Promise<Product[]> => {
      // The backend should automatically filter by the logged-in company's token
      const response = await fetch(`${BASE_URL}/api/products`, {
          headers: getAuthHeaders(token)
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to fetch company's products");
      return data.data;
  }
  
  export const createProduct = async (token: string, productData: NewProductData): Promise<void> => {
      const response = await fetch(`${BASE_URL}/api/products`, {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify(productData)
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to create product");
  }

  // Add to existing imports
  
  // Add these functions
  export const deleteProduct = async (token: string, productId: string) => {
    const response = await fetch(`${BASE_URL}/api/admin/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete product');
    }
    return data;
  };
  
  export const getAdminOrders = async (token: string) => {
    const response = await fetch(`${BASE_URL}/api/admin/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch orders');
    }
    return data.data;
  };
  
  // Add these functions to your API service
export const getSystemStats = async (token: string) => {
    const response = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch system stats');
    }
    return data;
  };
  
  export const getProductAnalytics = async (token: string) => {
    const response = await fetch(`${BASE_URL}/api/admin/analytics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch product analytics');
    }
    return data;
  };
  // Add these functions to api.ts

// Delete User
export const deleteUser = async (token: string, userId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || 'Failed to delete user');
};
  
  // Update Order Status
  export const updateOrderStatus = async (
    token: string, 
    orderId: string, 
    orderStatus: string, 
    paymentStatus?: string
  ): Promise<void> => {
    const response = await fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ orderStatus, paymentStatus })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update order status');
    }
  };
  
  // Reject Product
  export const rejectProduct = async (token: string, productId: string, reason: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/api/admin/products/${productId}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ action: 'reject', reason })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to reject product');
    }
  };
  
  // Get All Orders (Admin)
  export const getAllOrders = async (token: string): Promise<Order[]> => {
    const response = await fetch(`${BASE_URL}/api/orders`, {
      headers: getAuthHeaders(token)
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch orders');
    }
    return data.data;
  };
  
