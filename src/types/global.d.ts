declare global {
  var mongoose: {
    conn: any;
    promise: any;
  };
}

export {};

// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'vendor';
  avatar?: string;
  isEmailVerified: boolean;
  addresses: Address[];
  wishlist: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  type: 'home' | 'work' | 'other';
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  category: Category;
  subcategory?: Category;
  brand: string;
  vendor: User;
  stock: number;
  sku: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  specifications: Record<string, any>;
  tags: string[];
  isActive: boolean;
  isFlashSale: boolean;
  flashSaleEndsAt?: string;
  flashSalePrice?: number;
  rating: number;
  reviewCount: number;
  shippingInfo: {
    freeShipping: boolean;
    shippingCost: number;
    estimatedDays: string;
  };
  warranty: string;
  returnPolicy: string;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: Category;
  isActive: boolean;
  order: number;
  level: number;
  createdAt: string;
  updatedAt: string;
}

// Order types
export interface Order {
  _id: string;
  user: User;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'stripe' | 'paypal' | 'cod';
  paymentIntentId?: string;
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  cancelledAt?: string;
  cancelledBy?: User;
  cancelledReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
}

// Review types
export interface Review {
  _id: string;
  user: User;
  product: Product;
  order: Order;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerified: boolean;
  helpful: number;
  reported: boolean;
  reportedBy?: User[];
  createdAt: string;
  updatedAt: string;
}

// Cart types
export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter types
export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  flashSale?: boolean;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProductForm {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand: string;
  stock: number;
  sku: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  specifications: Record<string, any>;
  tags: string[];
  isFlashSale: boolean;
  flashSaleEndsAt?: string;
  flashSalePrice?: number;
  shippingInfo: {
    freeShipping: boolean;
    shippingCost: number;
    estimatedDays: string;
  };
  warranty: string;
  returnPolicy: string;
}

export interface CheckoutForm {
  items: {
    product: string;
    quantity: number;
  }[];
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  paymentMethod: 'stripe' | 'paypal' | 'cod';
  notes?: string;
} 