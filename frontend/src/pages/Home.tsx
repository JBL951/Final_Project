import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Search, Users, Star } from 'lucide-react';
import RecipeCard from '../components/recipe/RecipeCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
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
  likesCount: number;
  is_public: boolean;
  created_at: string;
}

const Home: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await recipeAPI.getPublicRecipes(pageNum, 12);
      const newRecipes = response.data.recipes;

      if (pageNum === 1) {
        setRecipes(newRecipes);
      } else {
        setRecipes(prev => [...prev, ...newRecipes]);
      }

      setHasMore(response.data.pagination.hasMore);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecipes(nextPage);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center mb-6">
            <ChefHat className="h-16 w-16 text-primary-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary-600">TasteBase</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover, share, and organize your favorite recipes. Join our community of food lovers and never lose a recipe again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Cooking
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="outline" size="lg" className="w-full sm:w-auto" icon={Search}>
                Browse Recipes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose TasteBase?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ChefHat className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Recipe Management</h3>
              <p className="text-gray-600">
                Create, edit, and organize your recipes with our intuitive interface. Add photos, tags, and detailed instructions.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-secondary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Share your creations with the community and discover amazing recipes from fellow food enthusiasts.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-accent-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
              <p className="text-gray-600">
                Find recipes by ingredients, cooking time, or dietary preferences. Never wonder what to cook again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Recipes Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Recipes</h2>
          <Link to="/search">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No recipes yet</h3>
            <p className="text-gray-500">Be the first to share a recipe with the community!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  loading={loadingMore}
                >
                  Load More Recipes
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Home;