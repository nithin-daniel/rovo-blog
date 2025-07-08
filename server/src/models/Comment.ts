import mongoose, { Schema, Document } from 'mongoose';
import { Comment as IComment } from '../../../shared/types';

export interface CommentDocument extends Omit<IComment, '_id' | 'author' | 'post' | 'replies'>, Document {
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
  replies: mongoose.Types.ObjectId[];
}

const commentSchema = new Schema<CommentDocument>({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isApproved: {
    type: Boolean,
    default: true
  },
  likeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ post: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parent: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ isApproved: 1 });

export const Comment = mongoose.model<CommentDocument>('Comment', commentSchema);