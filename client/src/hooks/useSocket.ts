import { useEffect, useState } from "react";
import { socketService } from "@/lib/socket";
import type { Socket } from "socket.io-client";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = socketService.connect();
    setSocket(socketInstance);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);

    // Cleanup on unmount
    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
    };
  }, []);

  return {
    socket,
    isConnected,
    joinRecipe: (recipeId: number) => socketService.joinRecipe(recipeId),
    leaveRecipe: (recipeId: number) => socketService.leaveRecipe(recipeId),
    notifyRecipeLiked: (recipeId: number, likes: number) => 
      socketService.notifyRecipeLiked(recipeId, likes),
    notifyNewRecipe: (recipeData: any) => 
      socketService.notifyNewRecipe(recipeData),
  };
}