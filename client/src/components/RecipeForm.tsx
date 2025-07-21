import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Upload } from "lucide-react";
import { insertRecipeSchema, type InsertRecipe } from "@shared/schema";
import { z } from "zod";

const recipeFormSchema = insertRecipeSchema.omit({
  ingredients: true,
  instructions: true,
  tags: true,
}).extend({
  tagsString: z.string().optional(),
});

type RecipeFormData = z.infer<typeof recipeFormSchema>;

interface RecipeFormProps {
  initialData?: Partial<InsertRecipe>;
  onSubmit: (data: InsertRecipe) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RecipeForm({ initialData, onSubmit, onCancel, isLoading }: RecipeFormProps) {
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients || [""]);
  const [instructions, setInstructions] = useState<string[]>(initialData?.instructions || [""]);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");

  console.log("RecipeForm: Component rendered with props:", { initialData, isLoading });

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      cookTime: initialData?.cookTime || "",
      imageUrl: initialData?.imageUrl || "",
      isPublic: initialData?.isPublic ?? true,
    },
  });

  console.log("RecipeForm: Form errors:", form.formState.errors);
  console.log("RecipeForm: Form is valid:", form.formState.isValid);

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (data: RecipeFormData) => {
    console.log("RecipeForm: Form submission started");
    console.log("RecipeForm: Raw form data:", data);

    const filteredIngredients = ingredients.filter(ing => ing.trim());
    const filteredInstructions = instructions.filter(inst => inst.trim());

    // Custom validation for ingredients and instructions
    if (filteredIngredients.length === 0) {
      console.log("RecipeForm: Validation failed - no ingredients");
      return;
    }

    if (filteredInstructions.length === 0) {
      console.log("RecipeForm: Validation failed - no instructions");
      return;
    }

    console.log("RecipeForm: Validation passed, submitting...");
    onSubmit({
      ...data,
      ingredients: filteredIngredients,
      instructions: filteredInstructions,
      tags,
    });
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {initialData ? "Edit Recipe" : "Create New Recipe"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form 
          onSubmit={(e) => {
            console.log("RecipeForm: Form submit event triggered");
            form.handleSubmit(handleSubmit)(e);
          }} 
          className="space-y-6"
        >
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Recipe Title</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Enter recipe title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="cookTime">Cook Time</Label>
              <Input
                id="cookTime"
                {...form.register("cookTime")}
                placeholder="e.g., 30 minutes"
              />
              {form.formState.errors.cookTime && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.cookTime.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Brief description of your recipe"
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Image URL */}
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              {...form.register("imageUrl")}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter an image URL for your recipe
            </p>
          </div>

          {/* Ingredients */}
          <div>
            <Label>Ingredients</Label>
            {ingredients.filter(ing => ing.trim()).length === 0 && (
              <p className="text-sm text-destructive mt-1">
                At least one ingredient is required
              </p>
            )}
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder="e.g., 2 cups flour"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredient}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <Label>Instructions</Label>
            {instructions.filter(inst => inst.trim()).length === 0 && (
              <p className="text-sm text-destructive mt-1">
                At least one instruction step is required
              </p>
            )}
            <div className="space-y-2">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Badge variant="secondary" className="mt-2">
                    {index + 1}
                  </Badge>
                  <Textarea
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder="Step description..."
                    rows={2}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInstruction(index)}
                    className="text-destructive hover:text-destructive mt-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addInstruction}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex items-center space-x-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer">
                  {tag}
                  <X
                    className="h-3 w-3 ml-1"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={form.watch("isPublic")}
              onCheckedChange={(checked) => form.setValue("isPublic", checked)}
            />
            <Label htmlFor="isPublic">
              Make recipe public (others can view and search)
            </Label>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center space-x-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="primary-button"
              onClick={(e) => {
                console.log("RecipeForm: Save Recipe button clicked!");
                // Don't prevent default - let the form handle it
              }}
            >
              {isLoading ? "Saving..." : "Save Recipe"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}