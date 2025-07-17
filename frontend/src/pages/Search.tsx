import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter } from 'lucide-react';
import RecipeCard from '../components/recipe/RecipeCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
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

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query: string, pageNum = 1) => {
    if (!query.trim()) return;

    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await recipeAPI.searchRecipes(query, pageNum, 12);
      const newRecipes = response.data.recipes;

      if (pageNum === 1) {
        setRecipes(newRecipes);
        setPage(1);
      } else {
        setRecipes(prev => [...prev, ...newRecipes]);
      }

      setHasMore(response.data.pagination.hasMore);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      performSearch(searchQuery.trim());
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(searchQuery, nextPage);
  };

  const currentQuery = searchParams.get('q');

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Recipes</h1>
        <p className="text-gray-600 mb-8">
          Find recipes by ingredients, titles, or tags
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex space-x-4">
            <Input
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search for recipes..."
              className="flex-1"
              icon={SearchIcon}
            />
            <Button type="submit" icon={SearchIcon}>
              Search
            </Button>
          </div>
        </form>
      </div>

      {currentQuery && (
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Search results for "{currentQuery}"
          </h2>
          {!loading && (
            <p className="text-gray-600 mt-1">
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : currentQuery ? (
        recipes.length === 0 ? (
          <div className="text-center py-12">
            <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No recipes found</h3>
            <p className="text-gray-500">Try searching with different keywords</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  loading={loadingMore}
                >
                  Load More Results
                </Button>
              </div>
            )}
          </>
        )
      ) : (
        <div className="text-center py-12">
          <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Start searching</h3>
          <p className="text-gray-500">Enter ingredients, recipe names, or tags to find recipes</p>
        </div>
      )}
    </div>
  );
};

export default Search;