import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Auth from '@/pages/Auth';

// Mock the hooks
jest.mock('wouter', () => ({
  useLocation: () => ['/', jest.fn()],
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Auth Component', () => {
  beforeEach(() => {
    // Reset fetch mock
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  it('renders login form by default', () => {
    render(<Auth />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('switches to register form', async () => {
    const user = userEvent.setup();
    render(<Auth />, { wrapper: createWrapper() });
    
    await user.click(screen.getByText('Create account'));
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('submits login form with valid data', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        token: 'test-token',
        user: { id: 1, username: 'testuser', email: 'test@example.com' }
      }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(<Auth />, { wrapper: createWrapper() });
    
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
      }));
    });
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<Auth />, { wrapper: createWrapper() });
    
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });
});