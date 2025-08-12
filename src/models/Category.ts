import mongoose from 'mongoose';

export interface ICategory extends mongoose.Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: mongoose.Types.ObjectId;
  isActive: boolean;
  order: number;
  level: number;
}

const categorySchema = new mongoose.Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
categorySchema.index({ slug: 1, parent: 1, level: 1 });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema); 