import mongoose, { Schema, Document } from 'mongoose';
import { Tag as ITag } from '../../shared/types';

export interface TagDocument extends Omit<ITag, '_id'>, Document {
  generateSlug(): void;
}

const tagSchema = new Schema<TagDocument>({
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    unique: true,
    trim: true,
    maxlength: [30, 'Tag name cannot exceed 30 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  postCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
tagSchema.index({ slug: 1 });
tagSchema.index({ name: 1 });

// Pre-save middleware
tagSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.generateSlug();
  }
  next();
});

// Instance method to generate slug
tagSchema.methods.generateSlug = function(): void {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const Tag = mongoose.model<TagDocument>('Tag', tagSchema);