import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { RecipeCard } from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Recipe } from "@shared/schema";
import { ChefHat, Heart, Users, Plus } from "lucide-react";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch user's recipes
  const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes/my"],
    queryFn: async () => {
      const token = authService.getToken();
      if (!token) throw new Error("Authentication required");
      
      const response = await fetch("/api/recipes/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch recipes");
      return response.json();
    },
  });

  // Delete recipe mutation
  const deleteMutation = useMutation({
    mutationFn: async (recipeId: number) => {
      const token = authService.getToken();
      if (!token) throw new Error("Authentication required");
      
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to delete recipe");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes/my"] });
      toast({
        title: "Recipe deleted",
        description: "Your recipe has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete recipe",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (recipeId: number) => {
    navigate(`/create?edit=${recipeId}`);
  };

  const handleDelete = (recipeId: number) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      deleteMutation.mutate(recipeId);
    }
  };

  // Calculate stats
  const totalRecipes = recipes.length;
  const totalLikes = recipes.reduce((sum, recipe) => sum + recipe.likes, 0);
  const publicRecipes = recipes.filter(recipe => recipe.isPublic).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Recipe Dashboard</h1>
          <p className="text-gray-600">Manage your recipes and track your cooking journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-primary to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total Recipes</p>
                  <p className="text-3xl font-bold">{totalRecipes}</p>
                </div>
                <ChefHat className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-secondary to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total Likes</p>
                  <p className="text-3xl font-bold">{totalLikes}</p>
                </div>
                <Heart className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-accent to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Public Recipes</p>
                  <p className="text-3xl font-bold">{publicRecipes}</p>
                </div>
                <Users className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Recipes Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Recipes</CardTitle>
              <Button asChild className="primary-button">
                <Link href="/create">
                  <Plus className="h-4 w-4 mr-2" />
                  New Recipe
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recipes.length === 0 ? (
              <div className="text-center py-12">
                <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No recipes yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start your culinary journey by creating your first recipe!
                </p>
                <Button asChild className="primary-button">
                  <Link href="/create">Create Your First Recipe</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    variant="personal"
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
