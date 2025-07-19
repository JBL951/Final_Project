import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Navigation } from '../../components/Navigation';

// Mock the hooks and components
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('wouter', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  useLocation: () => ['/'],
}));

vi.mock('../../components/SearchBar', () => ({
  SearchBar: () => <input placeholder="Search recipes, ingredients..." />,
}));

vi.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, asChild, ...props }: any) => {
    if (asChild) {
      return <div {...props}>{children}</div>;
    }
    return <button onClick={onClick} {...props}>{children}</button>;
  },
}));

vi.mock('../../components/ui/avatar', () => ({
  Avatar: ({ children }: any) => <div>{children}</div>,
  AvatarFallback: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../../components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div onClick={onClick}>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
}));

import { useAuth } from '../../hooks/useAuth';

const mockUseAuth = useAuth as any;

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders TasteBase logo', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: vi.fn(),
      isAuthenticated: false,
    });

    render(<Navigation />);
    expect(screen.getByText('TasteBase')).toBeInTheDocument();
  });

  it('shows Sign In button when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: vi.fn(),
      isAuthenticated: false,
    });

    render(<Navigation />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('shows navigation items when user is authenticated', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
      isAuthenticated: true,
    });

    render(<Navigation />);

    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('My Recipes')).toBeInTheDocument();
    expect(screen.getByText('Add Recipe')).toBeInTheDocument();
  });

  it('shows search bar when user is authenticated', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
      isAuthenticated: true,
    });

    render(<Navigation />);

    expect(screen.getByPlaceholderText('Search recipes, ingredients...')).toBeInTheDocument();
  });

  it('displays user avatar and username when authenticated', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
      isAuthenticated: true,
    });

    render(<Navigation />);

    expect(screen.getByText('T')).toBeInTheDocument(); // Avatar fallback
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('calls logout function when logout is clicked', () => {
    const mockLogout = vi.fn();
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isAuthenticated: true,
    });

    render(<Navigation />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('has correct navigation links', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
      isAuthenticated: true,
    });

    render(<Navigation />);

    const discoverLink = screen.getByText('Discover').closest('a');
    const recipesLink = screen.getByText('My Recipes').closest('a');
    const addRecipeLink = screen.getByText('Add Recipe').closest('a');

    expect(discoverLink).toHaveAttribute('href', '/');
    expect(recipesLink).toHaveAttribute('href', '/dashboard');
    expect(addRecipeLink).toHaveAttribute('href', '/create');
  });
});