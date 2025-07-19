import { useEffect, useRef } from 'react';
import { socketService } from '@/lib/socket';
import { useAuth } from './useAuth';

export function useSocket() {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef(socketService);

  useEffect(() => {
    if (isAuthenticated) {
      socketRef.current.connect();
    } else {
      socketRef.current.disconnect();
    }

    return () => {
      socketRef.current.disconnect();
    };
  }, [isAuthenticated]);

  return socketService;
}