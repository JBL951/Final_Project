import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export class AuthService {
  private tokenKey = "tastebase_token";

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/login", data);
    const result = await response.json();
    
    if (result.token) {
      this.setToken(result.token);
    }
    
    return result;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/register", data);
    const result = await response.json();
    
    if (result.token) {
      this.setToken(result.token);
    }
    
    return result;
  }

  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get current user");
    }

    return response.json();
  }

  logout(): void {
    this.removeToken();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
