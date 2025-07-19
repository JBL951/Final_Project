import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  id: number;
  text: string;
  recipeId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema({
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [500, 'Comment must be less than 500 characters'],
  },
  recipeId: {
    type: Schema.Types.ObjectId,
    ref: 'Recipe',
    required: [true, 'Recipe ID is required'],
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add virtual for id to match existing interface
CommentSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

CommentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Index for recipe comments
CommentSchema.index({ recipeId: 1, createdAt: -1 });

export default mongoose.model<IComment>('Comment', CommentSchema);