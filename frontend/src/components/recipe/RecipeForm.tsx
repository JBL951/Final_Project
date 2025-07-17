import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Upload, X } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { toast } from '../ui/Toaster';
import { recipeAPI } from '../../services/api';

interface Recipe {
  id?: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cooking_time: number;
  servings: number;
  tags: string[];
  image_url?: string;
  is_public: boolean;
}

interface RecipeFormProps {
  recipe?: Recipe;
  isEditing?: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ recipe, isEditing = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Recipe>({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    cooking_time: 30,
    servings: 4,
    tags: [],
    image_url: '',
    is_public: true,
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (recipe) {
      setFormData(recipe);
    }
  }, [recipe]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.ingredients.filter(i => i.trim()).length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }

    if (formData.instructions.filter(i => i.trim()).length === 0) {
      newErrors.instructions = 'At least one instruction is required';
    }

    if (formData.cooking_time < 1) {
      newErrors.cooking_time = 'Cooking time must be at least 1 minute';
    }

    if (formData.servings < 1) {
      newErrors.servings = 'Servings must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const cleanedData = {
        ...formData,
        ingredients: formData.ingredients.filter(i => i.trim()),
        instructions: formData.instructions.filter(i => i.trim()),
        cookingTime: formData.cooking_time,
        isPublic: formData.is_public,
      };

      if (isEditing && recipe?.id) {
        await recipeAPI.updateRecipe(recipe.id, cleanedData);
        toast.success('Recipe updated successfully!');
      } else {
        await recipeAPI.createRecipe(cleanedData);
        toast.success('Recipe created successfully!');
      }

      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  const addField = (field: 'ingredients' | 'instructions') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeField = (field: 'ingredients' | 'instructions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateField = (field: 'ingredients' | 'instructions', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Recipe Title"
              value={formData.title}
              onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
              error={errors.title}
              required
              placeholder="Enter recipe title"
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Description"
              type="textarea"
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              error={errors.description}
              required
              placeholder="Describe your recipe"
              rows={3}
            />
          </div>

          <div>
            <Input
              label="Cooking Time (minutes)"
              type="number"
              value={formData.cooking_time.toString()}
              onChange={(value) => setFormData(prev => ({ ...prev, cooking_time: parseInt(value) || 0 }))}
              error={errors.cooking_time}
              required
            />
          </div>

          <div>
            <Input
              label="Servings"
              type="number"
              value={formData.servings.toString()}
              onChange={(value) => setFormData(prev => ({ ...prev, servings: parseInt(value) || 0 }))}
              error={errors.servings}
              required
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Image URL (optional)"
              value={formData.image_url || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, image_url: value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingredients <span className="text-error-500">*</span>
          </label>
          <div className="space-y-2">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={ingredient}
                  onChange={(value) => updateField('ingredients', index, value)}
                  placeholder={`Ingredient ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeField('ingredients', index)}
                  disabled={formData.ingredients.length === 1}
                  icon={Minus}
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addField('ingredients')}
              icon={Plus}
            >
              Add Ingredient
            </Button>
          </div>
          {errors.ingredients && (
            <p className="text-sm text-error-600 mt-1">{errors.ingredients}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instructions <span className="text-error-500">*</span>
          </label>
          <div className="space-y-2">
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-sm text-gray-500 mt-3 min-w-[24px]">{index + 1}.</span>
                <Input
                  type="textarea"
                  value={instruction}
                  onChange={(value) => updateField('instructions', index, value)}
                  placeholder={`Step ${index + 1}`}
                  className="flex-1"
                  rows={2}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeField('instructions', index)}
                  disabled={formData.instructions.length === 1}
                  icon={Minus}
                  className="mt-1"
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addField('instructions')}
              icon={Plus}
            >
              Add Instruction
            </Button>
          </div>
          {errors.instructions && (
            <p className="text-sm text-error-600 mt-1">{errors.instructions}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="primary" className="flex items-center space-x-1">
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-primary-600"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Input
              value={tagInput}
              onChange={setTagInput}
              onKeyPress={handleTagInputKeyPress}
              placeholder="Add a tag (e.g., dinner, vegetarian)"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addTag}
              disabled={!tagInput.trim()}
            >
              Add Tag
            </Button>
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Make this recipe public
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Public recipes can be viewed and liked by other users
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {isEditing ? 'Update Recipe' : 'Create Recipe'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default RecipeForm;