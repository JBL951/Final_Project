import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect() {
    if (this.socket?.connected) return this.socket;

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Connected to Socket.IO server');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Disconnected from Socket.IO server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Recipe-specific methods
  joinRecipe(recipeId: string) {
    if (this.socket) {
      this.socket.emit('join-recipe', recipeId);
    }
  }

  leaveRecipe(recipeId: string) {
    if (this.socket) {
      this.socket.emit('leave-recipe', recipeId);
    }
  }

  sendComment(recipeId: string, comment: any) {
    if (this.socket) {
      this.socket.emit('new-comment', { recipeId, comment });
    }
  }

  sendLike(recipeId: string, likes: number, likedBy: any) {
    if (this.socket) {
      this.socket.emit('recipe-liked', { recipeId, likes, likedBy });
    }
  }

  sendTyping(recipeId: string, username: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('user-typing', { recipeId, username, isTyping });
    }
  }
}

export const socketService = new SocketService();