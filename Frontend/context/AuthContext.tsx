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
} from "../services/api";
import { router } from "expo-router";

import { Product, User, WishlistItem } from "../types/index";

const TOKEN_KEY = "my-jwt";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  wishlist: WishlistItem[];
  fetchWishlist: () => Promise<void>;
  addItemToWishlist: (product: Product) => Promise<void>;
  removeItemFromWishlist: (productId: string) => Promise<void>;
  // FIX: Add a refresh state and a function to trigger it
  globalRefreshKey: number;
  triggerGlobalRefresh: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  // FIX: Add state for global refresh
  const [globalRefreshKey, setGlobalRefreshKey] = useState(0);

  const triggerGlobalRefresh = () => {
    setGlobalRefreshKey(prevKey => prevKey + 1);
  };

  const fetchWishlist = async () => {
    const currentToken = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!currentToken) return;

    try {
      const items = await getWishlist(currentToken);
      setWishlist(items);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
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
          if (userData.role === 'client') {
            await fetchWishlist();
          }
        }
      } catch (e) {
        console.error("Failed to load user session", e);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setWishlist([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const addItemToWishlist = async (product: Product) => {
    if (!token) return;
    try {
      await addToWishlist(token, {
        productId: product.id,
        productName: product.name,
        productImage: product.thumbnailUrl,
        price: product.price,
      });
      await fetchWishlist();
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };

  const removeItemFromWishlist = async (productId: string) => {
    if (!token) return;
    try {
      await removeFromWishlist(token, productId);
      await fetchWishlist();
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
      if (userData.role === 'client') {
        await fetchWishlist();
      }
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
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setWishlist([]);
      router.replace("/login");
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    loading: isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    wishlist,
    fetchWishlist,
    addItemToWishlist,
    removeItemFromWishlist,
    // FIX: Expose refresh state and trigger
    globalRefreshKey,
    triggerGlobalRefresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};