# TasteBase - Recipe Sharing Platform

## Overview

TasteBase is a full-stack recipe sharing and management platform built with React, Node.js/Express, and PostgreSQL. It allows users to create, share, and discover recipes with features like user authentication, recipe categorization, search functionality, and social interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with Shadcn/UI components
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **API Design**: RESTful endpoints with proper HTTP status codes
- **Middleware**: Custom authentication, CORS, and request logging

### Database Schema
- **Users Table**: id, username, email, password, createdAt
- **Recipes Table**: id, title, description, ingredients[], instructions[], tags[], imageUrl, cookTime, authorId, isPublic, likes, createdAt
- **Relationships**: One-to-many between users and recipes

## Key Components

### Authentication System
- JWT-based authentication with 7-day expiration
- Protected routes using custom middleware
- Password hashing with bcrypt (10 rounds)
- Automatic token refresh and logout on expiration

### Recipe Management
- CRUD operations for recipes with proper validation
- Privacy settings (public/private recipes)
- Image URL support for recipe photos
- Tag-based categorization system
- Rich recipe forms with dynamic ingredient/instruction lists

### Search and Discovery
- Text-based search across titles, descriptions, and ingredients
- Category filtering (breakfast, lunch, dinner, dessert, vegetarian)
- Public recipe browsing for community discovery
- Recipe liking functionality for social engagement

### Data Storage
- **Current**: In-memory storage with mock data for development
- **Planned**: PostgreSQL database with Drizzle ORM (schema already defined)
- **Configuration**: Database configuration ready via environment variables

## Data Flow

### Authentication Flow
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server validates credentials and returns JWT token
3. Client stores token and includes in Authorization header
4. Protected routes verify token via `authenticateToken` middleware

### Recipe Management Flow
1. User creates recipe via form submission to `/api/recipes`
2. Server validates data using Zod schemas
3. Recipe stored with author association
4. Client updates local cache via TanStack Query
5. Recipe appears in user's dashboard and public feed (if public)

### Search Flow
1. User enters search query via SearchBar component
2. Query sent to `/api/recipes/search` endpoint
3. Server performs case-insensitive search across relevant fields
4. Results returned and displayed in RecipeCard components

## External Dependencies

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Class Variance Authority**: Utility for component variants
- **TailwindCSS**: Utility-first CSS framework

### Database & ORM
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **Drizzle ORM**: Type-safe database toolkit
- **Drizzle Kit**: Database migration and schema management

### Authentication & Security
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Password hashing and comparison
- **Zod**: Schema validation and type safety

### Development Tools
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type safety and better developer experience
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with auto-reload
- **Database**: Currently in-memory, ready for PostgreSQL connection

### Production Build
- **Frontend**: Vite build to static files in `dist/public`
- **Backend**: ESBuild compilation to `dist/index.js`
- **Database**: PostgreSQL via environment variable configuration

### Hosting Strategy
- **Frontend**: Static hosting (Vercel, Netlify, or similar)
- **Backend**: Node.js hosting (Render, Railway, or similar)
- **Database**: PostgreSQL hosting (Neon, Supabase, or similar)

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `NODE_ENV`: Environment mode (development/production)

The application is currently using in-memory storage for development but has complete PostgreSQL schema definitions and is ready for database integration when needed.