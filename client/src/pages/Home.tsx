import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";
import { Link } from "wouter";
import { RecipeCard } from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { type RecipeWithAuthor } from "@shared/schema";

interface HomeProps {
  searchQuery?: string;
}

export default function Home({ searchQuery }: HomeProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const queryClient = useQueryClient();
  const { socket, notifyRecipeLiked } = useSocket();

  const categories = ["All", "Breakfast", "Lunch", "Dinner", "Dessert", "Vegetarian"];

  // Fetch recipes
  const { data: recipes = [], isLoading } = useQuery<RecipeWithAuthor[]>({
    queryKey: searchQuery ? ["/api/recipes/search", searchQuery] : ["/api/recipes/public"],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/recipes/search?q=${encodeURIComponent(searchQuery)}`
        : "/api/recipes/public";
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch recipes");
      return response.json();
    },
  });

  // Like recipe mutation
  const likeMutation = useMutation({
    mutationFn: async (recipeId: number) => {
      const token = authService.getToken();
      if (!token) throw new Error("Authentication required");
      
      const response = await fetch(`/api/recipes/${recipeId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to like recipe");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes/public"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes/search"] });
    },
  });

  // Filter recipes by category
  const filteredRecipes = recipes.filter(recipe => {
    if (selectedCategory === "All") return true;
    return recipe.tags.some(tag => 
      tag.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  });

  // Sort recipes
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.likes - a.likes;
      case "cookTime":
        return parseInt(a.cookTime) - parseInt(b.cookTime);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleLike = (recipeId: number) => {
    likeMutation.mutate(recipeId);
  };

  // Real-time updates using Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleRecipeFeedUpdate = (data: any) => {
      queryClient.setQueryData(["/api/recipes/public"], (oldData: RecipeWithAuthor[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(recipe => 
          recipe.id === data.recipeId 
            ? { ...recipe, likes: data.likes }
            : recipe
        );
      });
    };

    const handleNewRecipeAvailable = (recipeData: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes/public"] });
    };

    socket.on("recipe_feed_update", handleRecipeFeedUpdate);
    socket.on("new_recipe_available", handleNewRecipeAvailable);

    return () => {
      socket.off("recipe_feed_update", handleRecipeFeedUpdate);
      socket.off("new_recipe_available", handleNewRecipeAvailable);
    };
  }, [socket, queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading recipes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        {!searchQuery && (
          <section className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Recipes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Share your culinary creations and explore thousands of recipes from home cooks around the world
            </p>
          </section>
        )}

        {/* Search Results Header */}
        {searchQuery && (
          <section className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Search Results for "{searchQuery}"
            </h2>
            <p className="text-gray-600">
              Found {sortedRecipes.length} recipe{sortedRecipes.length !== 1 ? 's' : ''}
            </p>
          </section>
        )}

        {/* Filter and Sort Section */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "primary-button" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="latest">Sort by Latest</option>
                <option value="popular">Sort by Popular</option>
                <option value="cookTime">Sort by Cook Time</option>
              </select>
            </div>
          </div>
        </section>

        {/* Recipe Grid */}
        <section className="mb-12">
          {sortedRecipes.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No recipes found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? "Try a different search term or browse all recipes"
                    : "Be the first to share a recipe!"
                  }
                </p>
                <Button asChild className="primary-button">
                  <Link href="/create">Create Recipe</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedRecipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                  <RecipeCard
                    recipe={recipe}
                    variant="public"
                    onLike={handleLike}
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
