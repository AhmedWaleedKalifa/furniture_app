const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

// --- Interfaces ---
export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData extends LoginData {
  displayName: string;
  role: 'client' | 'company';
}

interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        uid: string;
        email: string;
        displayName: string;
        role: string;
        token: string;
    }
}

// --- Auth Functions ---
export const loginUser = async (credentials: LoginData): Promise<User & {token: string}> => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
    }
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

    const data = await response.json();

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
        // We can ignore logout errors on the client side
        // as we will clear the session anyway.
        console.warn('Logout API call failed:', data.message);
    }
}


// --- Furniture Functions (existing) ---
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
// ... (at the top with other interfaces)
interface GoogleAuthResponse {
    success: boolean;
    message: string;
    data: User & { token: string };
}
// ...
export const signInWithGoogle = async (idToken: string): Promise<User & { token: string }> => {
    const response = await fetch(`${BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });

    const data: GoogleAuthResponse = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Google Sign-In failed');
    }
    return data.data;
};

// ... (existing auth and furniture functions)

// Helper to create authenticated headers
const getAuthHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
});

// --- Wishlist Functions ---

export const getWishlist = async (token: string): Promise<WishlistItem[]> => {
    const response = await fetch(`${BASE_URL}/api/users/wishlist`, {
        headers: getAuthHeaders(token)
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch wishlist');
    }
    // The API returns an object with a 'data' property that holds the array of items
    return data.data || [];
};



export const addToWishlist = async (token: string, productId: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/api/users/wishlist`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ productId })
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to add to wishlist');
};

export const removeFromWishlist = async (token: string, productId: string): Promise<void> => {
    // This now matches the new backend route: DELETE /api/users/wishlist/:productId
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
    const data = await response.json();
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
  }
  
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