import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService, type User, type LoginData, type RegisterData } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      if (!authService.isAuthenticated()) {
        return null;
      }
      
      try {
        return await authService.getCurrentUser();
      } catch (error) {
        authService.logout();
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => authService.login(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      toast({
        title: "Account created!",
        description: "Welcome to TasteBase!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const logout = () => {
    authService.logout();
    queryClient.setQueryData(["/api/auth/me"], null);
    queryClient.clear();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isAuthenticated: !!user,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
}
