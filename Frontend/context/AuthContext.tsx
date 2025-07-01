import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import {
  loginUser,
  signupUser,
  getCurrentUser,
  logoutUser,
  LoginData,
  SignupData,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/services/api";
import { router } from "expo-router";
const TOKEN_KEY = "my-jwt";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  wishlist: WishlistItem[];
  fetchWishlist: () => Promise<void>;
  addItemToWishlist: (product: Product) => Promise<void>;
  removeItemFromWishlist: (productId: string) => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  isLoading: true, // Start with loading as true
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  wishlist: [],
  fetchWishlist: async () => {},
  addItemToWishlist: async () => {},
  removeItemFromWishlist: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const fetchWishlist = async () => {
    // Use a local copy of the token to avoid timing issues with state updates
    const currentToken = await SecureStore.getItemAsync(TOKEN_KEY);
    if (currentToken) {
      try {
        const items = await getWishlist(currentToken);
        setWishlist(items);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      }
    } else {
      // If there's no token, ensure the wishlist is empty
      setWishlist([]);
    }
  };
  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          const userData = await getCurrentUser(storedToken);
          setUser(userData);
          // Fetch wishlist after user is loaded
          await fetchWishlist(); // Use the new reusable function
        }
      } catch (e) {
        console.error("Failed to load user session", e);
        // If token is invalid, log out
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setWishlist([]); // Ensure wishlist is cleared on error
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const addItemToWishlist = async (product: Product) => {
    if (!token) return;
    try {
      await addToWishlist(token, product.id);
      // FIX: Create the new item with the corrected flattened structure
      const newItem: WishlistItem = {
        productId: product.id,
        addedAt: new Date().toISOString(),
        productName: product.name,
        price: product.price,
        productImage: product.thumbnailUrl, // Map from Product to the new WishlistItem structure
      };
      setWishlist((prev) => [...prev, newItem]);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };
  const removeItemFromWishlist = async (productId: string) => {
    if (!token) return;
    try {
      await removeFromWishlist(token, productId);
      setWishlist((prev) =>
        prev.filter((item) => item.productId !== productId)
      );
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const login = async (data: LoginData) => {
    try {
      const { token: newToken, ...userData } = await loginUser(data);
      setToken(newToken);
      setUser(userData);
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);

      // FIX 2: Fetch the wishlist immediately after a successful login.
      await fetchWishlist();

      router.replace("/");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };
  const signup = async (data: SignupData) => {
    try {
      await signupUser(data);
      router.replace("/login");
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };
  const logout = async () => {
    try {
      if (token) {
        await logoutUser(token);
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // FIX 3: Clear all local state *before* navigating away.
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setWishlist([]);
      router.replace("/login");
    }
  };
  const value = {
    user,
    token,
    isLoading,
    login,
    signup,
    logout,
    wishlist,
    fetchWishlist,
    addItemToWishlist,
    removeItemFromWishlist,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};