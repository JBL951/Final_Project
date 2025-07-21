import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('initializes with no user when no token exists', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('sets user when token exists in localStorage', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    
    expect(result.current.user).toEqual(mockUser);
  });

  it('login sets user and token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    
    act(() => {
      result.current.login('test-token', mockUser);
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('token')).toBe('test-token');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('logout clears user and token', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
    
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    
    act(() => {
      result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});