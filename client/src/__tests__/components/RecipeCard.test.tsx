import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeCard } from '@/components/RecipeCard';
import { type RecipeWithAuthor } from '@shared/schema';

const mockRecipe: RecipeWithAuthor = {
  id: 1,
  title: 'Test Recipe',
  description: 'A delicious test recipe',
  ingredients: ['1 cup flour', '2 eggs'],
  instructions: ['Mix ingredients', 'Bake'],
  tags: ['test', 'quick'],
  imageUrl: 'https://example.com/image.jpg',
  cookTime: '30 minutes',
  authorId: 1,
  isPublic: true,
  likes: 5,
  createdAt: new Date('2024-01-01'),
  author: {
    id: 1,
    username: 'testuser'
  }
};

describe('RecipeCard', () => {
  it('renders recipe information correctly', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('A delicious test recipe')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('30 minutes')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onLike when like button is clicked', () => {
    const onLike = jest.fn();
    render(<RecipeCard recipe={mockRecipe} onLike={onLike} />);
    
    const likeButton = screen.getByRole('button');
    fireEvent.click(likeButton);
    
    expect(onLike).toHaveBeenCalledWith(1);
  });

  it('shows edit and delete buttons for personal variant', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    
    render(
      <RecipeCard 
        recipe={mockRecipe} 
        variant="personal" 
        onEdit={onEdit} 
        onDelete={onDelete} 
      />
    );
    
    expect(screen.getAllByRole('button')).toHaveLength(2); // Edit and Delete buttons
  });

  it('shows public badge for public recipes in personal variant', () => {
    render(<RecipeCard recipe={mockRecipe} variant="personal" />);
    
    expect(screen.getByText('Public')).toBeInTheDocument();
  });
});