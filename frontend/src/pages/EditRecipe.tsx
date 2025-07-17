import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import RecipeForm from '../components/recipe/RecipeForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from '../components/ui/Toaster';
import { recipeAPI } from '../services/api';

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cooking_time: number;
  servings: number;
  tags: string[];
  image_url?: string;
  is_public: boolean;
}

const EditRecipe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRecipe(id);
    }
  }, [id]);

  const fetchRecipe = async (recipeId: string) => {
    try {
      setLoading(true);
      const response = await recipeAPI.getRecipe(recipeId);
      setRecipe(response.data.recipe);
    } catch (error: any) {
      toast.error('Failed to fetch recipe');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Recipe not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <ChefHat className="h-12 w-12 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Recipe</h1>
        <p className="text-gray-600 mt-2">
          Update your recipe details
        </p>
      </div>

      <RecipeForm recipe={recipe} isEditing={true} />
    </div>
  );
};

export default EditRecipe;