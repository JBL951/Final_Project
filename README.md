# TasteBase - Recipe Sharing Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

> A modern, full-stack recipe sharing and management platform built with React, Node.js, and Supabase.

## 🚀 Live Demo

**Frontend:** [https://tastebase.netlify.app](https://tastebase.netlify.app)  
**Backend API:** [https://tastebase-api.render.com](https://tastebase-api.render.com)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Recipe Management**: Create, edit, delete, and organize personal recipes
- **Public/Private Recipes**: Control recipe visibility and sharing
- **Advanced Search**: Search recipes by ingredients, titles, or tags
- **Real-time Comments**: Live commenting system with Socket.IO
- **Recipe Likes**: Like and bookmark favorite recipes
- **Responsive Design**: Fully responsive UI for all devices
- **Image Support**: Add images to recipes via URL

### Technical Features
- **Real-time Updates**: Live comments and likes using Socket.IO
- **Input Validation**: Comprehensive client and server-side validation
- **Security**: JWT authentication, password hashing, rate limiting
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Testing**: Unit and integration tests with Jest and React Testing Library
- **Documentation**: Comprehensive API and user documentation

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Socket.IO Client** - Real-time communication
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

### Database & Infrastructure
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security** - Fine-grained access control
- **Netlify** - Frontend deployment
- **Render** - Backend deployment

## 📸 Screenshots

### Homepage
![Homepage](https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop)

### Recipe Dashboard
![Dashboard](https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop)

### Recipe Detail
![Recipe Detail](https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop)

### Create Recipe
![Create Recipe](https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tastebase.git
   cd tastebase
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   
   **Backend** (create `backend/.env`):
   ```env
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # Supabase Configuration
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_KEY=your-supabase-service-key
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

   **Frontend** (create `frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Set up Supabase database**
   
   Run the following SQL in your Supabase SQL editor:
   ```sql
   -- Create users table
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     username VARCHAR(30) UNIQUE NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Create recipes table
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

   -- Create recipe_likes table
   CREATE TABLE recipe_likes (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(recipe_id, user_id)
   );

   -- Create recipe_comments table
   CREATE TABLE recipe_comments (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     comment TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;

   -- Create policies (add your RLS policies here)
   ```

5. **Start the development servers**
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server (in a new terminal)
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
tastebase/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # Basic UI components
│   │   │   ├── layout/      # Layout components
│   │   │   ├── recipe/      # Recipe-specific components
│   │   │   └── auth/        # Authentication components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── dist/                # Build output
├── backend/                 # Node.js backend application
│   ├── routes/             # API route handlers
│   ├── middleware/         # Custom middleware
│   ├── config/            # Configuration files
│   ├── socket/            # Socket.IO handlers
│   ├── __tests__/         # Test files
│   └── server.js          # Main server file
├── docs/                   # Documentation
│   ├── api.md             # API documentation
│   ├── architecture.md    # Architecture overview
│   └── user-guide.md      # User guide
└── README.md              # This file
```

## 📚 API Documentation

Comprehensive API documentation is available in [`docs/api.md`](docs/api.md).

### Quick API Reference

- **Authentication**: `POST /api/auth/login`, `POST /api/auth/register`
- **Recipes**: `GET /api/recipes/public`, `POST /api/recipes`, `GET /api/recipes/:id`
- **Search**: `GET /api/recipes/search?q=query`
- **Social**: `POST /api/recipes/:id/like`, `POST /api/recipes/:id/comment`

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Test Coverage
- **Backend**: Unit tests for API routes, authentication, and validation
- **Frontend**: Component tests, integration tests, and user interaction tests
- **E2E**: End-to-end testing with Cypress (optional)

## 🚀 Deployment

### Frontend Deployment (Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy with automatic builds on push

### Environment Variables for Production
Ensure all environment variables are properly set in your deployment platforms.

## 🤝 Contributing

We welcome contributions to TasteBase! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Development**: React, TypeScript, Tailwind CSS
- **Backend Development**: Node.js, Express, Socket.IO
- **Database Design**: PostgreSQL, Supabase
- **DevOps**: Netlify, Render, GitHub Actions

## 🔮 Future Enhancements

- [ ] Recipe ratings and reviews
- [ ] Meal planning features
- [ ] Recipe collections/cookbooks
- [ ] Advanced search filters
- [ ] Recipe import from external sites
- [ ] Mobile app (React Native)
- [ ] Recipe sharing via social media
- [ ] Nutritional information
- [ ] Recipe scaling calculator
- [ ] Shopping list generator

## 📞 Support

If you encounter any issues or have questions:

- **Documentation**: Check the [docs](docs/) folder
- **Issues**: Open an issue on GitHub
- **Discussions**: Join our community discussions

---

**Made with ❤️ by the TasteBase team**

*Happy cooking and sharing! 🍳*