interface Movie {
  id: number;
  title: string;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface TrendingMovie {
  searchTerm: string;
  movie_id: number;
  title: string;
  count: number;
  poster_url: string;
}

interface MovieDetails {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  } | null;
  budget: number;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  original_language: string;
  original_title: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface TrendingCardProps {
  movie: TrendingMovie;
  index: number;
}

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  avatar?: string;
  phone?: string;
}
interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  isApproved: boolean;
  thumbnailUrl: string;
}

 interface ProductDetails {
  id: string;
  name: string;
  description: string;
  category: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  modelUrl: string;
  thumbnailUrl: string;
  price: number;
  isApproved: boolean;
  customizable: {
    color: boolean;
    material: boolean;
  };
  tags: string[];
}
interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string; // or orderId
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingProducts: number;
  activeUsers: number;
}

// FIX: Update WishlistItem to match the flattened data structure from the API
interface WishlistItem {
  productId: string;
  addedAt: string;
  productName: string;
  price: number;
  productImage: string; // Renamed from thumbnailUrl and removed nesting
}