import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { CommentSection } from "@/components/CommentSection";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { type RecipeWithAuthor } from "@shared/schema";
import { Heart, Bookmark, Share2, Clock, Users, ChefHat } from "lucide-react";

export default function RecipeDetail() {
  const [, params] = useRoute("/recipe/:id");
  const recipeId = params?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const socket = useSocket();

  // Fetch recipe details
  const { data: recipe, isLoading } = useQuery<RecipeWithAuthor>({
    queryKey: ["/api/recipes", recipeId],
    queryFn: async () => {
      const response = await fetch(`/api/recipes/${recipeId}`);
      if (!response.ok) throw new Error("Failed to fetch recipe");
      return response.json();
    },
    enabled: !!recipeId,
  });

  // Like recipe mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
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
      queryClient.invalidateQueries({ queryKey: ["/api/recipes", recipeId] });
      toast({
        title: "Recipe liked!",
        description: "Thank you for your support!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to like recipe",
        variant: "destructive",
      });
    },
  });

  // Socket.IO real-time like updates
  useEffect(() => {
    if (!socket.isSocketConnected() || !recipeId) return;

    socket.joinRecipe(recipeId);

    const handleLikeUpdate = ({ likes }: { likes: number }) => {
      queryClient.setQueryData(["/api/recipes", recipeId], (old: any) => {
        if (old) {
          return { ...old, likes };
        }
        return old;
      });
    };

    const socketInstance = socket.getSocket();
    if (socketInstance) {
      socketInstance.on('like-updated', handleLikeUpdate);
    }

    return () => {
      socket.leaveRecipe(recipeId);
      if (socketInstance) {
        socketInstance.off('like-updated', handleLikeUpdate);
      }
    };
  }, [socket, recipeId, queryClient]);

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe?.title,
        text: recipe?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Recipe link has been copied to clipboard.",
      });
    }
  };

  if (isLoading) {
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

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Recipe not found</h2>
              <p className="text-gray-600">The recipe you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="overflow-hidden">
          {/* Recipe Header */}
          <div className="relative">
            <img
              src={recipe.imageUrl || "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&h=400"}
              alt={recipe.title}
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-4xl font-bold mb-2">{recipe.title}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {recipe.author.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{recipe.author.username}</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{recipe.cookTime}</span>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Recipe Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className="flex items-center space-x-2 primary-button"
                >
                  <Heart className="h-4 w-4" />
                  <span>Like ({recipe.likes})</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>Save</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                Created {new Date(recipe.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Recipe Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Instructions</h2>
                  <ol className="space-y-4">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Badge className="primary-button px-3 py-1 text-sm font-medium">
                          {index + 1}
                        </Badge>
                        <p className="text-gray-700 flex-1">{instruction}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Ingredients
                  </h3>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <ChefHat className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Recipe Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Cook Time</span>
                      <span className="font-medium">{recipe.cookTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Likes</span>
                      <span className="font-medium">{recipe.likes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Author</span>
                      <span className="font-medium">{recipe.author.username}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <CommentSection recipeId={recipeId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
