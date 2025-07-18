# 🍽️ TasteBase - Recipe Sharing Platform

A full-stack recipe sharing and management platform built with the MERN stack, allowing users to create, share, and discover amazing recipes from home cooks around the world.

## 🚀 Live Demo

- **Application**: [TasteBase Live Demo](https://tastebase.vercel.app)
- **Demo Video**: [Watch the 7-minute demo](https://youtu.be/demo-video-link)

## ✨ Features

### 🔐 Authentication & User Management
- Secure user registration and login with JWT
- Protected routes for authenticated users
- User profile management
- Password hashing with bcrypt

### 📝 Recipe Management
- Create, read, update, and delete recipes
- Rich recipe forms with ingredients and step-by-step instructions
- Image upload support for recipe photos
- Privacy settings (public/private recipes)
- Recipe categorization with tags

### 🔍 Discovery & Search
- Browse public recipes from all users
- Advanced search by ingredients, titles, and tags
- Filter recipes by categories (breakfast, lunch, dinner, dessert, vegetarian)
- Sort by latest, popularity, or cooking time

### 📊 User Dashboard
- Personal recipe collection management
- Recipe statistics (total recipes, likes, public recipes)
- Quick edit and delete actions
- Recipe publishing status management

### 💖 Social Features
- Like recipes from other users
- Recipe sharing functionality
- Author attribution and profiles
- Community recipe discovery

### 📱 Responsive Design
- Mobile-first responsive design
- Touch-friendly interface
- Optimized for all screen sizes
- Modern, clean UI with TailwindCSS

## 🛠️ Tech Stack

### Frontend
- **React** - UI library with functional components and hooks
- **TypeScript** - Type safety and better development experience
- **Wouter** - Lightweight client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **TanStack Query** - Data fetching and state management
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Zod** - Request validation
- **CORS** - Cross-origin resource sharing

### Database
- **In-Memory Storage** - For development and demo
- **MongoDB** - Production database (integration ready)
- **Mongoose** - MongoDB ODM (documentation included)

### Development Tools
- **Vite** - Fast development server and build tool
- **ESBuild** - Fast TypeScript compilation
- **Drizzle Kit** - Database migrations
- **Jest** - Testing framework
- **React Testing Library** - Component testing

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tastebase.git
   cd tastebase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   JWT_SECRET=your-super-secret-jwt-key
   DATABASE_URL=your-mongodb-connection-string
   PORT=5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open [http://localhost:5000](http://localhost:5000) in your browser

### Demo Account
For testing purposes, you can use these demo credentials:
- **Email**: john@example.com
- **Password**: password123

## 📖 API Documentation

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Recipes
- `GET /api/recipes/public` - Get all public recipes
- `GET /api/recipes/my` - Get user's recipes (authenticated)
- `GET /api/recipes/:id` - Get specific recipe
- `POST /api/recipes` - Create new recipe (authenticated)
- `PUT /api/recipes/:id` - Update recipe (authenticated)
- `DELETE /api/recipes/:id` - Delete recipe (authenticated)
- `GET /api/recipes/search?q=query` - Search recipes
- `POST /api/recipes/:id/like` - Like a recipe (authenticated)

For detailed API documentation, see [docs/api.md](docs/api.md).

## 🏗️ Architecture

