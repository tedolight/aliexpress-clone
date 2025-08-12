import mongoose from 'mongoose';

export interface IProduct extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  subcategory?: mongoose.Types.ObjectId;
  brand: string;
  vendor: mongoose.Types.ObjectId;
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
  flashSaleEndsAt?: Date;
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
}

const productSchema = new mongoose.Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0,
  },
  originalPrice: {
    type: Number,
    required: [true, 'Original price is required'],
    min: 0,
  },
  images: [{
    type: String,
    required: [true, 'At least one product image is required'],
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor is required'],
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: 0,
    default: 0,
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: 0,
  },
  dimensions: {
    length: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    height: { type: Number, required: true, min: 0 },
  },
  specifications: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  isFlashSale: {
    type: Boolean,
    default: false,
  },
  flashSaleEndsAt: {
    type: Date,
  },
  flashSalePrice: {
    type: Number,
    min: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  shippingInfo: {
    freeShipping: {
      type: Boolean,
      default: false,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedDays: {
      type: String,
      default: '7-14 days',
    },
  },
  warranty: {
    type: String,
    default: 'No warranty',
  },
  returnPolicy: {
    type: String,
    default: 'No returns',
  },
}, {
  timestamps: true,
});

// Index for search functionality
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Index for filtering
productSchema.index({ category: 1, brand: 1, price: 1, rating: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema); 