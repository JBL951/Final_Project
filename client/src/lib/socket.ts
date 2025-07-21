import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(): Socket {
    if (!this.socket || !this.isConnected) {
      this.socket = io(window.location.origin, {
        transports: ['websocket', 'polling'],
      });

      this.socket.on("connect", () => {
        console.log("Connected to server");
        this.isConnected = true;
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from server");
        this.isConnected = false;
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Recipe-specific socket methods
  joinRecipe(recipeId: number): void {
    if (this.socket) {
      this.socket.emit("join_recipe", recipeId);
    }
  }

  leaveRecipe(recipeId: number): void {
    if (this.socket) {
      this.socket.emit("leave_recipe", recipeId);
    }
  }

  notifyRecipeLiked(recipeId: number, likes: number): void {
    if (this.socket) {
      this.socket.emit("recipe_liked", { recipeId, likes });
    }
  }

  notifyNewRecipe(recipeData: any): void {
    if (this.socket) {
      this.socket.emit("new_recipe_created", recipeData);
    }
  }
}

export const socketService = new SocketService();