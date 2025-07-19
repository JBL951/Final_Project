import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RecipeCard } from '../../components/RecipeCard';
import { type RecipeWithAuthor } from '@shared/schema';

// Mock the UI components
vi.mock('../../components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

vi.mock('../../components/ui/avatar', () => ({
  Avatar: ({ children }: any) => <div>{children}</div>,
  AvatarFallback: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../../components/ui/badge', () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));

const mockRecipe: RecipeWithAuthor = {
  id: 1,
  title: 'Test Recipe',
  description: 'A delicious test recipe for unit testing',
  ingredients: ['1 cup flour', '2 eggs'],
  instructions: ['Mix ingredients', 'Cook for 20 minutes'],
  tags: ['test', 'easy'],
  imageUrl: 'https://example.com/test-image.jpg',
  cookTime: '30 minutes',
  authorId: 1,
  isPublic: true,
  likes: 5,
  createdAt: new Date('2024-01-01'),
  author: {
    id: 1,
    username: 'testuser',
  },
};

describe('RecipeCard', () => {
  it('renders recipe information correctly', () => {
    render(<RecipeCard recipe={mockRecipe} variant="public" />);

    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('A delicious test recipe for unit testing')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('30 minutes')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays recipe image with correct src and alt', () => {
    render(<RecipeCard recipe={mockRecipe} variant="public" />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://example.com/test-image.jpg');
    expect(image).toHaveAttribute('alt', 'Test Recipe');
  });

  it('shows like button for public variant', () => {
    const mockOnLike = vi.fn();
    render(<RecipeCard recipe={mockRecipe} variant="public" onLike={mockOnLike} />);

    const likeButton = screen.getByRole('button');
    expect(likeButton).toBeInTheDocument();
    
    fireEvent.click(likeButton);
    expect(mockOnLike).toHaveBeenCalledWith(1);
  });

  it('shows edit and delete buttons for personal variant', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();
    
    render(
      <RecipeCard 
        recipe={mockRecipe} 
        variant="personal" 
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2); // Edit and Delete buttons

    fireEvent.click(buttons[0]); // Edit button
    expect(mockOnEdit).toHaveBeenCalledWith(1);

    fireEvent.click(buttons[1]); // Delete button
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('displays public/private badge for personal variant', () => {
    render(<RecipeCard recipe={mockRecipe} variant="personal" />);

    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('displays private badge when recipe is not public', () => {
    const privateRecipe = { ...mockRecipe, isPublic: false };
    render(<RecipeCard recipe={privateRecipe} variant="personal" />);

    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('uses fallback image when imageUrl is not provided', () => {
    const recipeWithoutImage = { ...mockRecipe, imageUrl: null };
    render(<RecipeCard recipe={recipeWithoutImage} variant="public" />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('unsplash.com'));
  });

  it('displays author avatar with correct fallback', () => {
    render(<RecipeCard recipe={mockRecipe} variant="public" />);

    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of username
  });
});