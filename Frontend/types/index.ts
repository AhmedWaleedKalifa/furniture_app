// This is the single source of truth for your application types.

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'client' | 'company' | 'admin';
  createdAt?: string; // This is optional, which is correct
  isVerified?: boolean;
  avatar?: string;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  isApproved: boolean;
  thumbnailUrl: string;
  companyId?: string;
  company?: {
    displayName: string;
  };
  createdAt: string;
}

export interface ProductDetails extends Product {
  dimensions: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  modelUrl: string;
  customizable: {
    color: boolean;
    material: boolean;
  };
  tags: string[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  totalAmount: number;
  items: OrderItem[];
  totalPrice: number;
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  orderNumber?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
}

export interface AdminStats {
  users: {
    total: number;
    client: number;
    company: number;
    admin: number;
  };
  products: {
    total: number;
    pending: number;
    approved: number;
  };
  engagement: {
    totalViews: number;
    totalPlacements: number;
    totalWishlists: number;
    averageViews: number;
    averagePlacements: number;
    averageWishlists: number;
  };
  recentActivity: {
    newProducts: number;
    newUsers: number;
  };
}


export interface WishlistItem {
  productId: string;
  addedAt: string;
  productName: string;
  price: number;
  productImage: string;
}