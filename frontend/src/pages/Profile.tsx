import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, BookOpen, Eye, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import { userAPI } from '../services/api';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  created_at: string;
  stats: {
    totalRecipes: number;
    publicRecipes: number;
    totalLikes: number;
  };
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      setProfile(response.data.user);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Profile</h1>
        <p className="text-gray-600">
          Manage your account and view your cooking statistics
        </p>
      </div>

      <Card className="p-8">
        <div className="flex items-center space-x-6 mb-8">
          <div className="bg-primary-100 rounded-full p-6">
            <User className="h-16 w-16 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{profile.username}</h2>
            <div className="flex items-center space-x-2 text-gray-600 mt-2">
              <Mail size={16} />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 mt-1">
              <Calendar size={16} />
              <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary-50 rounded-lg p-6 text-center">
            <BookOpen className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary-800 mb-1">
              {profile.stats.totalRecipes}
            </p>
            <p className="text-primary-600 text-sm">Total Recipes</p>
          </div>

          <div className="bg-success-50 rounded-lg p-6 text-center">
            <Eye className="h-8 w-8 text-success-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-success-800 mb-1">
              {profile.stats.publicRecipes}
            </p>
            <p className="text-success-600 text-sm">Public Recipes</p>
          </div>

          <div className="bg-secondary-50 rounded-lg p-6 text-center">
            <Heart className="h-8 w-8 text-secondary-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-secondary-800 mb-1">
              {profile.stats.totalLikes}
            </p>
            <p className="text-secondary-600 text-sm">Total Likes</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Username</span>
            <span className="font-medium">{profile.username}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Email</span>
            <span className="font-medium">{profile.email}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Member Since</span>
            <span className="font-medium">
              {new Date(profile.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-600">Account Status</span>
            <span className="bg-success-100 text-success-800 px-3 py-1 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;