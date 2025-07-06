// This is the single source of truth for your application types.

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'client' | 'company' | 'admin';
  createdAt?: FirestoreTimestamp | string;  isVerified?: boolean;
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
  createdAt: FirestoreTimestamp | string;
  tags?:string[];
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
  createdAt: FirestoreTimestamp | string;  orderNumber?: string;
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
  addedAt: FirestoreTimestamp | string;  productName: string;
  price: number;
  productImage: string;
}

export interface TicketMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderType: 'user' | 'agent' | 'system';
    message: string;
    timestamp: FirestoreTimestamp | string;  }
  export interface SupportTicket {
    id: string;
   userId: string;
   userName: string;
   userEmail: string;
    subject: string;

   description: string; // The initial message/description
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    category: string;
   messages: TicketMessage[]; // The array of all replies
   createdAt: FirestoreTimestamp | string;   }
  export type FirestoreTimestamp = { _seconds: number; _nanoseconds: number; };