import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecipeRatingProps {
  recipeId: number;
  currentRating?: number;
  onRatingSubmit?: (rating: number, review: string) => void;
}

export function RecipeRating({ recipeId, currentRating = 0, onRatingSubmit }: RecipeRatingProps) {
  const [rating, setRating] = useState(currentRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoverRating(starRating);
  };

  const handleSubmit = async () => {
    if (!onRatingSubmit || rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onRatingSubmit(rating, review);
      setReview("");
    } catch (error) {
      console.error("Failed to submit rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Rate this Recipe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none hover:scale-110 transition-transform"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <Star
                className={`w-6 h-6 ${
                  star <= displayRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Click to rate'}
          </span>
        </div>

        {/* Review Text */}
        {rating > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Share your thoughts (optional)</label>
            <Textarea
              placeholder="Tell others what you thought about this recipe..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        )}

        {/* Submit Button */}
        {rating > 0 && onRatingSubmit && (
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        )}

        {/* Rating Display */}
        {currentRating > 0 && !onRatingSubmit && (
          <div className="text-center py-2">
            <p className="text-sm text-gray-600">
              You rated this recipe {currentRating} star{currentRating !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}