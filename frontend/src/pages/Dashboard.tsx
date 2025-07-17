import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/recipe/RecipeCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { toast } from '../components/ui/Toaster';
import { recipeAPI } from '../services/api';

interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  cooking_time: number;
  servings: number;
  tags: string[];
  author: string;
  is_public: boolean;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMyRecipes();
  }, []);

  const fetchMyRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipeAPI.getMyRecipes();
      setRecipes(response.data.recipes);
    } catch (error) {
      toast.error('Failed to fetch your recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recipeToDelete) return;

    setDeleting(true);
    try {
      await recipeAPI.deleteRecipe(recipeToDelete.id);
      setRecipes(recipes.filter(recipe => recipe.id !== recipeToDelete.id));
      toast.success('Recipe deleted successfully');
      setDeleteModalOpen(false);
      setRecipeToDelete(null);
    } catch (error) {
      toast.error('Failed to delete recipe');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your recipes and create new culinary masterpieces
          </p>
        </div>
        <Link to="/create-recipe">
          <Button icon={Plus} size="lg">
            Create Recipe
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Recipes</p>
              <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-success-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Public Recipes</p>
              <p className="text-2xl font-bold text-gray-900">
                {recipes.filter(recipe => recipe.is_public).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <EyeOff className="h-8 w-8 text-warning-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Private Recipes</p>
              <p className="text-2xl font-bold text-gray-900">
                {recipes.filter(recipe => !recipe.is_public).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Recipes</h2>
        
        {recipes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No recipes yet</h3>
            <p className="text-gray-500 mb-6">Start building your recipe collection!</p>
            <Link to="/create-recipe">
              <Button icon={Plus}>Create Your First Recipe</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="relative group">
                <RecipeCard
                  recipe={recipe}
                  showAuthor={false}
                  showPrivacyStatus={true}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <Link to={`/edit-recipe/${recipe.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit2}
                        className="!p-2 h-8 w-8 bg-white shadow-md"
                      />
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteClick(recipe)}
                      className="!p-2 h-8 w-8 bg-white shadow-md text-error-600 hover:text-error-700 hover:bg-error-50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Recipe"
        footer={
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              loading={deleting}
            >
              Delete Recipe
            </Button>
          </div>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete "{recipeToDelete?.title}"? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Dashboard;