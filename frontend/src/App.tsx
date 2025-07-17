import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { Toaster } from './components/ui/Toaster';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RecipeDetail from './pages/RecipeDetail';
import CreateRecipe from './pages/CreateRecipe';
import EditRecipe from './pages/EditRecipe';
import Profile from './pages/Profile';
import Search from './pages/Search';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ui/ErrorBoundary';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ErrorBoundary>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/recipe/:id" element={<RecipeDetail />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/create-recipe"
                    element={
                      <ProtectedRoute>
                        <CreateRecipe />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/edit-recipe/:id"
                    element={
                      <ProtectedRoute>
                        <EditRecipe />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <Toaster />
            </div>
          </Router>
        </ErrorBoundary>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;