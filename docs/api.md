# TasteBase API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2023-11-01T12:00:00Z"
  }
}
```

#### POST /auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2023-11-01T12:00:00Z"
  }
}
```

#### GET /auth/me
Get current user information (Protected).

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2023-11-01T12:00:00Z"
  }
}
```

### Recipes

#### GET /recipes/public
Get all public recipes with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)

**Response:**
```json
{
  "success": true,
  "recipes": [
    {
      "id": "recipe-id",
      "title": "Delicious Pasta",
      "description": "A wonderful pasta dish",
      "ingredients": ["pasta", "tomato sauce", "cheese"],
      "instructions": ["Boil pasta", "Add sauce", "Serve"],
      "cooking_time": 30,
      "servings": 4,
      "tags": ["dinner", "italian"],
      "image_url": "https://example.com/image.jpg",
      "author": "johndoe",
      "likesCount": 5,
      "is_public": true,
      "created_at": "2023-11-01T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "hasMore": true
  }
}
```

#### GET /recipes/my
Get current user's recipes (Protected).

**Response:**
```json
{
  "success": true,
  "recipes": [
    {
      "id": "recipe-id",
      "title": "My Secret Recipe",
      "description": "Family recipe",
      "ingredients": ["ingredient1", "ingredient2"],
      "instructions": ["step1", "step2"],
      "cooking_time": 45,
      "servings": 6,
      "tags": ["family", "secret"],
      "image_url": "https://example.com/image.jpg",
      "is_public": false,
      "created_at": "2023-11-01T12:00:00Z"
    }
  ]
}
```

#### POST /recipes
Create a new recipe (Protected).

**Request Body:**
```json
{
  "title": "New Recipe",
  "description": "Description of the recipe",
  "ingredients": ["ingredient1", "ingredient2"],
  "instructions": ["step1", "step2"],
  "cookingTime": 30,
  "servings": 4,
  "tags": ["tag1", "tag2"],
  "imageUrl": "https://example.com/image.jpg",
  "isPublic": true
}
```

**Response:**
```json
{
  "success": true,
  "recipe": {
    "id": "new-recipe-id",
    "title": "New Recipe",
    "description": "Description of the recipe",
    "ingredients": ["ingredient1", "ingredient2"],
    "instructions": ["step1", "step2"],
    "cooking_time": 30,
    "servings": 4,
    "tags": ["tag1", "tag2"],
    "image_url": "https://example.com/image.jpg",
    "is_public": true,
    "author_id": "user-id",
    "created_at": "2023-11-01T12:00:00Z"
  }
}
```

#### GET /recipes/:id
Get a specific recipe by ID.

**Response:**
```json
{
  "success": true,
  "recipe": {
    "id": "recipe-id",
    "title": "Recipe Title",
    "description": "Recipe description",
    "ingredients": ["ingredient1", "ingredient2"],
    "instructions": ["step1", "step2"],
    "cooking_time": 30,
    "servings": 4,
    "tags": ["tag1", "tag2"],
    "image_url": "https://example.com/image.jpg",
    "author": "johndoe",
    "author_id": "user-id",
    "is_public": true,
    "created_at": "2023-11-01T12:00:00Z",
    "likesCount": 10,
    "comments": [
      {
        "id": "comment-id",
        "comment": "Great recipe!",
        "author": "jane",
        "created_at": "2023-11-01T13:00:00Z"
      }
    ]
  }
}
```

#### PUT /recipes/:id
Update a recipe (Protected - Owner only).

**Request Body:**
```json
{
  "title": "Updated Recipe",
  "description": "Updated description",
  "ingredients": ["updated ingredient1", "updated ingredient2"],
  "instructions": ["updated step1", "updated step2"],
  "cookingTime": 35,
  "servings": 5,
  "tags": ["updated tag1", "updated tag2"],
  "imageUrl": "https://example.com/updated-image.jpg",
  "isPublic": false
}
```

**Response:**
```json
{
  "success": true,
  "recipe": {
    "id": "recipe-id",
    "title": "Updated Recipe",
    "description": "Updated description",
    "ingredients": ["updated ingredient1", "updated ingredient2"],
    "instructions": ["updated step1", "updated step2"],
    "cooking_time": 35,
    "servings": 5,
    "tags": ["updated tag1", "updated tag2"],
    "image_url": "https://example.com/updated-image.jpg",
    "is_public": false,
    "author_id": "user-id",
    "created_at": "2023-11-01T12:00:00Z"
  }
}
```

#### DELETE /recipes/:id
Delete a recipe (Protected - Owner only).

**Response:**
```json
{
  "success": true,
  "message": "Recipe deleted successfully"
}
```

#### GET /recipes/search
Search recipes by query string.

**Query Parameters:**
- `q` (required): Search query
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)

**Response:**
```json
{
  "success": true,
  "recipes": [
    {
      "id": "recipe-id",
      "title": "Matching Recipe",
      "description": "Recipe that matches search",
      "ingredients": ["ingredient1", "ingredient2"],
      "instructions": ["step1", "step2"],
      "cooking_time": 30,
      "servings": 4,
      "tags": ["matching-tag"],
      "image_url": "https://example.com/image.jpg",
      "author": "johndoe",
      "likesCount": 3,
      "is_public": true,
      "created_at": "2023-11-01T12:00:00Z"
    }
  ],
  "query": "pasta",
  "pagination": {
    "page": 1,
    "limit": 12,
    "hasMore": false
  }
}
```

#### POST /recipes/:id/like
Like or unlike a recipe (Protected).

**Response:**
```json
{
  "success": true,
  "message": "Recipe liked",
  "liked": true
}
```

#### POST /recipes/:id/comment
Add a comment to a recipe (Protected).

**Request Body:**
```json
{
  "comment": "This recipe is amazing!"
}
```

**Response:**
```json
{
  "success": true,
  "comment": {
    "id": "comment-id",
    "comment": "This recipe is amazing!",
    "author": "johndoe",
    "created_at": "2023-11-01T14:00:00Z"
  }
}
```

### Users

#### GET /users/profile
Get current user's profile with statistics (Protected).

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2023-11-01T12:00:00Z",
    "stats": {
      "totalRecipes": 15,
      "publicRecipes": 10,
      "totalLikes": 25
    }
  }
}
```

#### GET /users/:id
Get public profile of a user by ID.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "username": "johndoe",
    "created_at": "2023-11-01T12:00:00Z",
    "recipes": [
      {
        "id": "recipe-id",
        "title": "Public Recipe",
        "description": "A public recipe",
        "image_url": "https://example.com/image.jpg",
        "created_at": "2023-11-01T12:00:00Z"
      }
    ],
    "stats": {
      "publicRecipes": 10
    }
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

## Rate Limiting

The API is rate-limited to 100 requests per 15-minute window per IP address.

## Real-time Features

### Socket.IO Events

The application uses Socket.IO for real-time features:

#### Client Events (Emit)
- `joinRecipe(recipeId)`: Join a recipe room for real-time updates
- `leaveRecipe(recipeId)`: Leave a recipe room
- `newComment(data)`: Broadcast new comment to room
- `recipeLiked(data)`: Broadcast like/unlike to room
- `typing(data)`: Broadcast typing indicator

#### Server Events (Listen)
- `commentAdded(comment)`: New comment added to recipe
- `likeUpdated(data)`: Recipe like count updated
- `userTyping(data)`: User typing indicator