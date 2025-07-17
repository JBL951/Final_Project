import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Users, Heart, Edit2, User as UserIcon, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { toast } from '../components/ui/Toaster';
import { recipeAPI } from '../services/api';

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cooking_time: number;
  servings: number;
  tags: string[];
  image_url?: string;
  author: string;
  author_id: string;
  is_public: boolean;
  created_at: string;
  likesCount: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  comment: string;
  author: string;
  created_at: string;
}

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchRecipe(id);
    }
  }, [id]);

  useEffect(() => {
    if (socket && recipe) {
      socket.emit('joinRecipe', recipe.id);

      socket.on('commentAdded', (newComment: Comment) => {
        setComments(prev => [...prev, newComment]);
      });

      socket.on('likeUpdated', (data) => {
        setLiked(data.liked);
        setLikesCount(data.likesCount);
      });

      socket.on('userTyping', (data) => {
        if (data.isTyping) {
          setTypingUsers(prev => [...prev.filter(u => u !== data.username), data.username]);
        } else {
          setTypingUsers(prev => prev.filter(u => u !== data.username));
        }
      });

      return () => {
        socket.emit('leaveRecipe', recipe.id);
        socket.off('commentAdded');
        socket.off('likeUpdated');
        socket.off('userTyping');
      };
    }
  }, [socket, recipe]);

  const fetchRecipe = async (recipeId: string) => {
    try {
      setLoading(true);
      const response = await recipeAPI.getRecipe(recipeId);
      const recipeData = response.data.recipe;
      setRecipe(recipeData);
      setLikesCount(recipeData.likesCount);
      setComments(recipeData.comments || []);
    } catch (error) {
      toast.error('Failed to fetch recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user || !recipe) {
      toast.error('Please login to like recipes');
      return;
    }

    try {
      const response = await recipeAPI.likeRecipe(recipe.id);
      const newLiked = response.data.liked;
      setLiked(newLiked);
      setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

      if (socket) {
        socket.emit('recipeLiked', {
          recipeId: recipe.id,
          liked: newLiked,
          likesCount: newLiked ? likesCount + 1 : likesCount - 1
        });
      }
    } catch (error) {
      toast.error('Failed to update like status');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !recipe || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await recipeAPI.addComment(recipe.id, commentText.trim());
      const newComment = response.data.comment;
      
      setComments(prev => [...prev, newComment]);
      setCommentText('');

      if (socket) {
        socket.emit('newComment', {
          recipeId: recipe.id,
          id: newComment.id,
          comment: newComment.comment,
          author: newComment.author,
          created_at: newComment.created_at
        });
      }

      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleTyping = (value: string) => {
    setCommentText(value);
    
    if (socket && user && recipe) {
      socket.emit('typing', {
        recipeId: recipe.id,
        username: user.username,
        isTyping: value.length > 0
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Recipe not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Recipe Header */}
      <Card className="overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            {recipe.image_url ? (
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-64 md:h-80 object-cover"
              />
            ) : (
              <div className="w-full h-64 md:h-80 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                <span className="text-6xl">🍳</span>
              </div>
            )}
          </div>
          <div className="md:w-1/2 p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
              {user && user.id === recipe.author_id && (
                <Link to={`/edit-recipe/${recipe.id}`}>
                  <Button variant="outline" size="sm" icon={Edit2}>
                    Edit
                  </Button>
                </Link>
              )}
            </div>
            
            <p className="text-gray-600 mb-4">{recipe.description}</p>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <Clock size={20} className="text-gray-500" />
                <span className="text-sm text-gray-600">{recipe.cooking_time} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users size={20} className="text-gray-500" />
                <span className="text-sm text-gray-600">{recipe.servings} servings</span>
              </div>
              <div className="flex items-center space-x-1">
                <UserIcon size={20} className="text-gray-500" />
                <span className="text-sm text-gray-600">by {recipe.author}</span>
              </div>
            </div>

            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.tags.map((tag, index) => (
                  <Badge key={index} variant="primary" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {recipe.is_public && user && user.id !== recipe.author_id && (
              <Button
                onClick={handleLike}
                variant={liked ? "primary" : "outline"}
                icon={Heart}
                className="w-full"
              >
                {liked ? 'Unlike' : 'Like'} ({likesCount})
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Ingredients and Instructions */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-primary-600 font-bold">•</span>
                <span className="text-gray-700">{ingredient}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-1">
                  {index + 1}
                </span>
                <span className="text-gray-700">{instruction}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Comments Section */}
      {recipe.is_public && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Comments ({comments.length})
          </h2>

          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex space-x-3">
                <Input
                  value={commentText}
                  onChange={handleTyping}
                  placeholder="Add a comment..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  loading={submittingComment}
                  icon={Send}
                >
                  Post
                </Button>
              </div>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-center">
                <Link to="/login" className="text-primary-600 hover:text-primary-700">
                  Login
                </Link>{' '}
                to add comments
              </p>
            </div>
          )}

          {typingUsers.length > 0 && (
            <div className="mb-4 text-sm text-gray-500">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}

          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-primary-200 pl-4 py-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <UserIcon size={16} className="text-gray-500" />
                    <span className="font-medium text-gray-900">{comment.author}</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.comment}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default RecipeDetail;