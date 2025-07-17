import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ChefHat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { toast } from '../components/ui/Toaster';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <ChefHat className="h-16 w-16 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to TasteBase
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>

        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              required
              icon={Mail}
              placeholder="Enter your email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              required
              icon={Lock}
              placeholder="Enter your password"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;