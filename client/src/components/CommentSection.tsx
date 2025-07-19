import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { authService } from '@/lib/auth';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send } from 'lucide-react';
import type { CommentWithAuthor } from '@shared/schema';

interface CommentSectionProps {
  recipeId: string;
}

export function CommentSection({ recipeId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const socket = useSocket();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery<CommentWithAuthor[]>({
    queryKey: ['/api/recipes', recipeId, 'comments'],
    queryFn: async () => {
      const response = await fetch(`/api/recipes/${recipeId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      const token = authService.getToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`/api/recipes/${recipeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json();
    },
    onSuccess: (newComment) => {
      queryClient.setQueryData(
        ['/api/recipes', recipeId, 'comments'],
        (old: CommentWithAuthor[] = []) => [newComment, ...old]
      );
      setNewComment('');
      toast({
        title: 'Comment added!',
        description: 'Your comment has been posted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add comment',
        variant: 'destructive',
      });
    },
  });

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket.isSocketConnected()) return;

    socket.joinRecipe(recipeId);

    // Listen for new comments
    const handleNewComment = (comment: CommentWithAuthor) => {
      queryClient.setQueryData(
        ['/api/recipes', recipeId, 'comments'],
        (old: CommentWithAuthor[] = []) => [comment, ...old]
      );
    };

    // Listen for typing indicators
    const handleUserTyping = ({ username, isTyping: typing }: { username: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (typing && !prev.includes(username)) {
          return [...prev, username];
        } else if (!typing) {
          return prev.filter(u => u !== username);
        }
        return prev;
      });
    };

    const socketInstance = socket.getSocket();
    if (socketInstance) {
      socketInstance.on('comment-added', handleNewComment);
      socketInstance.on('user-typing', handleUserTyping);
    }

    return () => {
      socket.leaveRecipe(recipeId);
      if (socketInstance) {
        socketInstance.off('comment-added', handleNewComment);
        socketInstance.off('user-typing', handleUserTyping);
      }
    };
  }, [socket, recipeId, queryClient]);

  // Handle typing indicator
  useEffect(() => {
    if (!socket.isSocketConnected() || !user) return;

    const timeoutId = setTimeout(() => {
      if (isTyping) {
        socket.sendTyping(recipeId, user.username, false);
        setIsTyping(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [newComment, socket, recipeId, user, isTyping]);

  const handleCommentChange = (value: string) => {
    setNewComment(value);
    
    if (!isTyping && value.trim() && socket.isSocketConnected() && user) {
      socket.sendTyping(recipeId, user.username, true);
      setIsTyping(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    addCommentMutation.mutate(newComment.trim());
  };

  if (!isAuthenticated) {
    return (
      <Card className="mt-8">
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Sign in to view and add comments</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => handleCommentChange(e.target.value)}
              placeholder="Share your thoughts about this recipe..."
              rows={3}
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {typingUsers.length > 0 && (
                  <span>
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </span>
                )}
              </div>
              <Button
                type="submit"
                disabled={!newComment.trim() || addCommentMutation.isPending}
                className="primary-button"
              >
                <Send className="h-4 w-4 mr-2" />
                {addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {comment.author.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {comment.author.username}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}