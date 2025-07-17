import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Eye, Heart, User } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  cooking_time: number;
  servings: number;
  tags: string[];
  author: string;
  likesCount?: number;
  is_public: boolean;
  created_at: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  showAuthor?: boolean;
  showPrivacyStatus?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  showAuthor = true, 
  showPrivacyStatus = false 
}) => {
  return (
    <Card hover className="overflow-hidden">
      <Link to={`/recipe/${recipe.id}`}>
        <div className="aspect-video bg-gray-200 overflow-hidden">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
              <span className="text-4xl">🍳</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 hover:text-primary-600 transition-colors">
              {recipe.title}
            </h3>
            {showPrivacyStatus && (
              <Badge variant={recipe.is_public ? 'success' : 'warning'} size="sm">
                {recipe.is_public ? 'Public' : 'Private'}
              </Badge>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock size={16} />
                <span>{recipe.cooking_time} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users size={16} />
                <span>{recipe.servings} servings</span>
              </div>
            </div>
            
            {recipe.likesCount !== undefined && (
              <div className="flex items-center space-x-1">
                <Heart size={16} />
                <span>{recipe.likesCount}</span>
              </div>
            )}
          </div>
          
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="primary" size="sm">
                  {tag}
                </Badge>
              ))}
              {recipe.tags.length > 3 && (
                <Badge variant="gray" size="sm">
                  +{recipe.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          {showAuthor && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <User size={16} />
                <span>by {recipe.author}</span>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(recipe.created_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
};

export default RecipeCard;