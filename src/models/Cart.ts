import mongoose from 'mongoose';

export interface ICart extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  items: Array<{
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }>;
  total: number;
  itemCount: number;
}

const cartSchema = new mongoose.Schema<ICart>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
  total: {
    type: Number,
    default: 0,
    min: 0,
  },
  itemCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
cartSchema.index({ user: 1 });

// Calculate total and item count before saving
cartSchema.pre('save', function(next) {
  this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
  next();
});

export default mongoose.models.Cart || mongoose.model<ICart>('Cart', cartSchema); 