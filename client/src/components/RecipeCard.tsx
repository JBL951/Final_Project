import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Edit, Trash2 } from "lucide-react";
import { type RecipeWithAuthor, type Recipe } from "@shared/schema";

interface RecipeCardProps {
  recipe: RecipeWithAuthor | Recipe;
  variant?: "public" | "personal";
  onLike?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function RecipeCard({ recipe, variant = "public", onLike, onEdit, onDelete }: RecipeCardProps) {
  const isPublicRecipe = "author" in recipe;
  const author = isPublicRecipe ? recipe.author : null;

  return (
    <Card className="overflow-hidden recipe-card-hover">
      <div className="relative">
        <img
          src={recipe.imageUrl || "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=400&h=240"}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
        {variant === "personal" && (
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant={recipe.isPublic ? "default" : "secondary"}>
              {recipe.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900 truncate">
            {recipe.title}
          </h3>
          {variant === "public" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike?.(recipe.id)}
              className="flex items-center space-x-1 text-gray-500 hover:text-primary"
            >
              <Heart className="h-4 w-4" />
              <span>{recipe.likes}</span>
            </Button>
          )}
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex items-center justify-between">
          {author && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {author.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">{author.username}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-gray-500">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{recipe.cookTime}</span>
            </div>
            
            {variant === "personal" && (
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(recipe.id)}
                  className="text-gray-400 hover:text-primary"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(recipe.id)}
                  className="text-gray-400 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
