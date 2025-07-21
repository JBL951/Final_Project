# 📚 TasteBase API Documentation

## Base URL
```
Production: https://your-app.replit.app/api
Development: http://localhost:5000/api
```

## Authentication

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## Recipes

### Get Public Recipes
**GET** `/recipes/public`

**Response:**
```json
[
  {
    "id": 1,
    "title": "Creamy Garlic Pasta",
    "description": "A rich and creamy pasta dish with roasted garlic and fresh herbs",
    "ingredients": [
      "1 lb fettuccine pasta",
      "6 cloves garlic, minced",
      "1 cup heavy cream"
    ],
    "instructions": [
      "Cook pasta according to package directions until al dente",
      "Heat olive oil and butter in a large skillet over medium heat"
    ],
    "tags": ["pasta", "creamy", "garlic", "dinner", "italian"],
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141",
    "cookTime": "25 mins",
    "authorId": 2,
    "isPublic": true,
    "likes": 42,
    "createdAt": "2024-02-10T18:30:00Z",
    "author": {
      "id": 2,
      "username": "sarah_johnson"
    }
  }
]
```

### Get Recipe by ID
**GET** `/recipes/:id`

**Response:**
```json
{
  "id": 1,
  "title": "Creamy Garlic Pasta",
  "description": "A rich and creamy pasta dish with roasted garlic and fresh herbs",
  "ingredients": [
    "1 lb fettuccine pasta",
    "6 cloves garlic, minced",
    "1 cup heavy cream"
  ],
  "instructions": [
    "Cook pasta according to package directions until al dente",
    "Heat olive oil and butter in a large skillet over medium heat"
  ],
  "tags": ["pasta", "creamy", "garlic", "dinner", "italian"],
  "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141",
  "cookTime": "25 mins",
  "authorId": 2,
  "isPublic": true,
  "likes": 42,
  "createdAt": "2024-02-10T18:30:00Z",
  "author": {
    "id": 2,
    "username": "sarah_johnson"
  }
}
```

### Create Recipe
**POST** `/recipes`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Chocolate Chip Cookies",
  "description": "Classic homemade chocolate chip cookies",
  "ingredients": [
    "2 cups all-purpose flour",
    "1 tsp baking soda",
    "1 cup butter, softened",
    "3/4 cup brown sugar",
    "1/2 cup white sugar",
    "2 eggs",
    "2 tsp vanilla extract",
    "2 cups chocolate chips"
  ],
  "instructions": [
    "Preheat oven to 375°F",
    "Mix flour and baking soda in a bowl",
    "Cream butter and sugars until fluffy",
    "Beat in eggs and vanilla",
    "Gradually add flour mixture",
    "Stir in chocolate chips",
    "Drop onto ungreased cookie sheets",
    "Bake 9-11 minutes until golden brown"
  ],
  "tags": ["dessert", "cookies", "chocolate", "baking"],
  "cookTime": "30 mins",
  "isPublic": true,
  "imageUrl": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35"
}
```

**Response:**
```json
{
  "message": "Recipe created successfully",
  "recipe": {
    "id": 15,
    "title": "Chocolate Chip Cookies",
    "description": "Classic homemade chocolate chip cookies",
    "ingredients": [
      "2 cups all-purpose flour",
      "1 tsp baking soda"
    ],
    "instructions": [
      "Preheat oven to 375°F",
      "Mix flour and baking soda in a bowl"
    ],
    "tags": ["dessert", "cookies", "chocolate", "baking"],
    "imageUrl": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35",
    "cookTime": "30 mins",
    "authorId": 1,
    "isPublic": true,
    "likes": 0,
    "createdAt": "2024-02-20T10:15:00Z"
  }
}
```

### Update Recipe
**PUT** `/recipes/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Recipe Title",
  "description": "Updated description",
  "isPublic": false
}
```

**Response:**
```json
{
  "message": "Recipe updated successfully",
  "recipe": {
    "id": 15,
    "title": "Updated Recipe Title",
    "description": "Updated description",
    "ingredients": ["..."],
    "instructions": ["..."],
    "tags": ["..."],
    "imageUrl": "...",
    "cookTime": "30 mins",
    "authorId": 1,
    "isPublic": false,
    "likes": 0,
    "createdAt": "2024-02-20T10:15:00Z"
  }
}
```

### Delete Recipe
**DELETE** `/recipes/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Recipe deleted successfully"
}
```

### Get User's Recipes
**GET** `/recipes/my`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 15,
    "title": "Chocolate Chip Cookies",
    "description": "Classic homemade chocolate chip cookies",
    "ingredients": ["..."],
    "instructions": ["..."],
    "tags": ["dessert", "cookies", "chocolate", "baking"],
    "imageUrl": "...",
    "cookTime": "30 mins",
    "authorId": 1,
    "isPublic": true,
    "likes": 5,
    "createdAt": "2024-02-20T10:15:00Z"
  }
]
```

### Search Recipes
**GET** `/recipes/search?q={query}`

**Query Parameters:**
- `q` (string): Search query for title, description, ingredients, or tags

**Response:**
```json
[
  {
    "id": 1,
    "title": "Creamy Garlic Pasta",
    "description": "A rich and creamy pasta dish with roasted garlic and fresh herbs",
    "ingredients": ["..."],
    "instructions": ["..."],
    "tags": ["pasta", "creamy", "garlic", "dinner", "italian"],
    "imageUrl": "...",
    "cookTime": "25 mins",
    "authorId": 2,
    "isPublic": true,
    "likes": 42,
    "createdAt": "2024-02-10T18:30:00Z",
    "author": {
      "id": 2,
      "username": "sarah_johnson"
    }
  }
]
```

### Like Recipe
**POST** `/recipes/:id/like`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Recipe liked successfully",
  "recipe": {
    "id": 1,
    "title": "Creamy Garlic Pasta",
    "description": "...",
    "ingredients": ["..."],
    "instructions": ["..."],
    "tags": ["..."],
    "imageUrl": "...",
    "cookTime": "25 mins",
    "authorId": 2,
    "isPublic": true,
    "likes": 43,
    "createdAt": "2024-02-10T18:30:00Z"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "message": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "message": "Recipe not found"
}
```

### 409 Conflict
```json
{
  "error": "User already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting
- **Authentication endpoints**: 5 requests per minute per IP
- **Recipe endpoints**: 100 requests per minute per user
- **Search endpoints**: 30 requests per minute per IP

## Data Validation

### Recipe Schema
```typescript
{
  title: string (required, max 100 chars),
  description: string (required, max 500 chars),
  ingredients: string[] (required, min 1 item),
  instructions: string[] (required, min 1 item),
  tags: string[] (required, min 1 item),
  cookTime: string (required),
  isPublic: boolean (optional, default true),
  imageUrl: string (optional, must be valid URL)
}
```

### User Schema
```typescript
{
  username: string (required, 3-30 chars, alphanumeric + underscore),
  email: string (required, valid email format),
  password: string (required, min 8 chars)
}
```

## Socket.io Events

### Client Events (Emit)
- `join_user_room`: Join user-specific room for notifications
- `leave_user_room`: Leave user-specific room

### Server Events (Listen)
- `recipe_liked`: Recipe was liked by someone
- `new_recipe`: New public recipe was created
- `recipe_updated`: Recipe was updated
- `user_joined`: User joined the platform

## Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Unprocessable Entity
- `500`: Internal Server Error