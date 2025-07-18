import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
  id: number;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  imageUrl?: string;
  cookTime: string;
  authorId: mongoose.Types.ObjectId;
  isPublic: boolean;
  likes: number;
  createdAt: Date;
}

const RecipeSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    maxlength: [100, 'Title must be less than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Recipe description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description must be less than 1000 characters'],
  },
  ingredients: {
    type: [String],
    required: [true, 'At least one ingredient is required'],
    validate: {
      validator: function(v: string[]) {
        return v && v.length > 0;
      },
      message: 'At least one ingredient is required',
    },
  },
  instructions: {
    type: [String],
    required: [true, 'At least one instruction is required'],
    validate: {
      validator: function(v: string[]) {
        return v && v.length > 0;
      },
      message: 'At least one instruction is required',
    },
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(v: string[]) {
        return v.length <= 20;
      },
      message: 'Maximum 20 tags allowed',
    },
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  cookTime: {
    type: String,
    required: [true, 'Cook time is required'],
    trim: true,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Likes cannot be negative'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add virtual for id to match existing interface
RecipeSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

RecipeSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Index for search functionality
RecipeSchema.index({ 
  title: 'text', 
  description: 'text', 
  ingredients: 'text', 
  tags: 'text' 
});

// Index for public recipes
RecipeSchema.index({ isPublic: 1, createdAt: -1 });

// Index for user recipes
RecipeSchema.index({ authorId: 1, createdAt: -1 });

export default mongoose.model<IRecipe>('Recipe', RecipeSchema);