import mongoose, { Schema, Document } from 'mongoose';
import { Category as ICategory } from '../../../shared/types';

export interface CategoryDocument extends Omit<ICategory, '_id'>, Document {
  generateSlug(): void;
}

const categorySchema = new Schema<CategoryDocument>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  color: {
    type: String,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color'],
    default: '#6366f1'
  },
  postCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ name: 1 });

// Pre-save middleware
categorySchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.generateSlug();
  }
  next();
});

// Instance method to generate slug
categorySchema.methods.generateSlug = function(): void {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const Category = mongoose.model<CategoryDocument>('Category', categorySchema);