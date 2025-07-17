import React from 'react';
import { ChefHat } from 'lucide-react';
import RecipeForm from '../components/recipe/RecipeForm';

const CreateRecipe: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <ChefHat className="h-12 w-12 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Recipe</h1>
        <p className="text-gray-600 mt-2">
          Share your culinary creation with the world
        </p>
      </div>

      <RecipeForm />
    </div>
  );
};

export default CreateRecipe;