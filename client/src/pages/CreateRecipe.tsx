import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { RecipeForm } from "@/components/RecipeForm";
import { authService } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type InsertRecipe, type Recipe } from "@shared/schema";

export default function CreateRecipe() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  
  // Get edit ID from URL params
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const editId = urlParams.get('edit');
  const isEditing = !!editId;

  // Fetch recipe for editing
  const { data: recipe, isLoading: isLoadingRecipe } = useQuery<Recipe>({
    queryKey: ["/api/recipes", editId],
    queryFn: async () => {
      const token = authService.getToken();
      if (!token) throw new Error("Authentication required");
      
      const response = await fetch(`/api/recipes/${editId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch recipe");
      return response.json();
    },
    enabled: isEditing,
  });

  // Create recipe mutation
  const createMutation = useMutation({
    mutationFn: async (recipeData: InsertRecipe) => {
      const token = authService.getToken();
      if (!token) throw new Error("Authentication required");
      
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recipeData),
      });
      
      if (!response.ok) throw new Error("Failed to create recipe");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes/public"] });
      toast({
        title: "Recipe created!",
        description: "Your recipe has been successfully created.",
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create recipe",
        variant: "destructive",
      });
    },
  });

  // Update recipe mutation
  const updateMutation = useMutation({
    mutationFn: async (recipeData: InsertRecipe) => {
      const token = authService.getToken();
      if (!token) throw new Error("Authentication required");
      
      const response = await fetch(`/api/recipes/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recipeData),
      });
      
      if (!response.ok) throw new Error("Failed to update recipe");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes/public"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes", editId] });
      toast({
        title: "Recipe updated!",
        description: "Your recipe has been successfully updated.",
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update recipe",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertRecipe) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (isEditing && isLoadingRecipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading recipe...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <RecipeForm
          initialData={recipe}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </div>
  );
}
