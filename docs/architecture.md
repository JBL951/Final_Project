# TasteBase Architecture Documentation

## System Overview

TasteBase is a full-stack web application built with a modern MERN-like architecture, featuring a React frontend, Node.js/Express backend, and Supabase database. The application provides recipe management, sharing, and social features with real-time capabilities.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│ (Node.js/Express)│◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ - React Router  │    │ - REST API      │    │ - PostgreSQL    │
│ - Tailwind CSS  │    │ - Socket.IO     │    │ - Row Level     │
│ - Axios         │    │ - JWT Auth      │    │   Security      │
│ - Socket.IO     │    │ - Validation    │    │ - Real-time     │
│   Client        │    │ - Error Handling│    │   Subscriptions │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

### Frontend
- **React 18**: Modern UI library with hooks and context
- **TypeScript**: Type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Router**: Client-side routing and navigation
- **Axios**: HTTP client for API communication
- **Socket.IO Client**: Real-time bidirectional communication
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation for form inputs

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Socket.IO**: Real-time communication server
- **JWT**: JSON Web Token for authentication
- **bcryptjs**: Password hashing
- **Express Validator**: Input validation middleware
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Morgan**: HTTP request logging
- **Rate Limiting**: API rate limiting protection

### Database
- **Supabase**: Backend-as-a-service with PostgreSQL
- **Row Level Security**: Fine-grained access control
- **Real-time subscriptions**: Live data updates
- **Database migrations**: Version-controlled schema changes

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Recipes Table
```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  ingredients TEXT[] NOT NULL,
  instructions TEXT[] NOT NULL,
  cooking_time INTEGER NOT NULL,
  servings INTEGER NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Recipe Likes Table
```sql
CREATE TABLE recipe_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id, user_id)
);
```

### Recipe Comments Table
```sql
CREATE TABLE recipe_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Authentication & Authorization

### JWT Authentication
- **Token Generation**: JWT tokens are created upon successful login/registration
- **Token Storage**: Tokens are stored in localStorage on the client side
- **Token Validation**: Middleware validates tokens on protected routes
- **Token Expiration**: Tokens expire after 7 days for security

### Row Level Security (RLS)
- **Users**: Users can only access their own profile data
- **Recipes**: Users can view public recipes and their own private recipes
- **Likes**: Users can like/unlike public recipes
- **Comments**: Users can comment on public recipes

## API Architecture

### RESTful Design
- **Resource-based URLs**: `/api/recipes`, `/api/users`, `/api/auth`
- **HTTP Methods**: GET, POST, PUT, DELETE for CRUD operations
- **Status Codes**: Proper HTTP status codes for different scenarios
- **JSON Responses**: Consistent JSON response format

### Middleware Stack
1. **Helmet**: Security headers
2. **CORS**: Cross-origin resource sharing
3. **Rate Limiting**: API rate limiting
4. **Morgan**: Request logging
5. **Body Parsing**: JSON and URL-encoded data
6. **Authentication**: JWT token validation
7. **Validation**: Input validation and sanitization
8. **Error Handling**: Centralized error handling

## Real-time Features

### Socket.IO Implementation
- **Connection Management**: User connections tracked by socket ID
- **Room-based Communication**: Users join recipe-specific rooms
- **Event Broadcasting**: Real-time updates for comments and likes
- **Typing Indicators**: Live typing status for comments

### Real-time Events
- **Comments**: New comments appear instantly for all users viewing a recipe
- **Likes**: Like counts update in real-time across all connected clients
- **Typing**: Typing indicators show when users are composing comments

## Security Measures

### Authentication Security
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Secrets**: Strong secret keys for token signing
- **Token Expiration**: Automatic token expiration
- **Rate Limiting**: Protection against brute force attacks

### Input Validation
- **Server-side Validation**: Express Validator for all inputs
- **Client-side Validation**: React Hook Form with Zod schemas
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **XSS Protection**: Input sanitization and output encoding

### API Security
- **CORS Configuration**: Restricted origin policies
- **Helmet Middleware**: Security headers
- **Rate Limiting**: Request throttling
- **Error Handling**: Secure error messages

## File Structure

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   ├── recipe/          # Recipe-specific components
│   │   └── auth/            # Authentication components
│   ├── contexts/            # React contexts
│   ├── pages/              # Page components
│   ├── services/           # API service layer
│   └── utils/              # Utility functions
├── public/                 # Static assets
└── dist/                   # Build output
```

### Backend Structure
```
backend/
├── routes/                 # API route handlers
├── middleware/            # Custom middleware
├── config/               # Configuration files
├── socket/               # Socket.IO handlers
├── __tests__/            # Test files
└── server.js             # Main server file
```

## Data Flow

### User Registration/Login
1. User submits credentials via React form
2. Frontend validates input and sends to backend
3. Backend validates, hashes password, creates JWT
4. JWT returned to frontend and stored in localStorage
5. User state updated in React context

### Recipe Creation
1. User fills out recipe form with validation
2. Form data sent to backend API
3. Backend validates and inserts into database
4. Recipe data returned to frontend
5. User redirected to dashboard with updated recipe list

### Real-time Comments
1. User types comment in recipe detail page
2. Typing event sent via Socket.IO
3. Comment submitted to REST API
4. API validates and stores comment
5. New comment broadcast to all users in recipe room
6. Comment appears in real-time for all connected users

## Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Lazy loading of route components
- **Memoization**: React.memo for expensive components
- **Debouncing**: Search input debouncing
- **Image Optimization**: Responsive images and lazy loading
- **Bundle Optimization**: Vite build optimizations

### Backend Optimizations
- **Database Indexing**: Indexes on frequently queried columns
- **Connection Pooling**: Efficient database connections
- **Caching**: Response caching for public data
- **Pagination**: Efficient data loading with pagination
- **Query Optimization**: Efficient SQL queries

## Deployment Architecture

### Frontend Deployment
- **Build Process**: Vite production build
- **Static Hosting**: Netlify or Vercel deployment
- **Environment Variables**: Runtime configuration
- **CDN**: Content delivery network for assets

### Backend Deployment
- **Container**: Docker containerization
- **Hosting**: Render or Railway deployment
- **Environment Variables**: Secure configuration
- **Process Management**: PM2 for production

### Database Deployment
- **Managed Service**: Supabase hosted PostgreSQL
- **Backups**: Automated database backups
- **Scaling**: Vertical and horizontal scaling options
- **Monitoring**: Database performance monitoring

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API integration testing
- **E2E Tests**: End-to-end user journey testing
- **Accessibility Tests**: WCAG compliance testing

### Backend Testing
- **Unit Tests**: Function and middleware testing
- **Integration Tests**: API endpoint testing
- **Authentication Tests**: JWT and auth flow testing
- **Database Tests**: Database operation testing

## Error Handling

### Frontend Error Handling
- **Global Error Boundary**: React error boundary
- **API Error Handling**: Axios interceptors
- **User Feedback**: Toast notifications
- **Validation Errors**: Form validation feedback

### Backend Error Handling
- **Global Error Middleware**: Centralized error handling
- **Validation Errors**: Input validation feedback
- **Database Errors**: Connection and query error handling
- **Authentication Errors**: JWT and auth error handling

## Future Enhancements

### Planned Features
- **Image Upload**: Direct image upload to cloud storage
- **Recipe Ratings**: Star rating system for recipes
- **Recipe Collections**: User-created recipe collections
- **Meal Planning**: Weekly meal planning feature
- **Recipe Sharing**: Social sharing capabilities
- **Advanced Search**: Filters and faceted search
- **Recipe Import**: Import from external recipe websites
- **Mobile App**: React Native mobile application

### Technical Improvements
- **Caching**: Redis caching layer
- **Search**: Elasticsearch for advanced search
- **Notifications**: Push notifications
- **Analytics**: User behavior analytics
- **Performance**: Further performance optimizations
- **Security**: Additional security measures
- **Testing**: Improved test coverage
- **Documentation**: Enhanced API documentation