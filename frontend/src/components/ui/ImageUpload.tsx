import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Button from './Button';
import { toast } from './Toaster';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImage,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onImageUpload(data.imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setPreview(currentImage || '');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview('');
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Recipe Image
      </label>
      
      <div className="relative">
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Recipe preview"
              className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClick}
                  disabled={uploading}
                  className="bg-white text-gray-700"
                >
                  Change
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={uploading}
                  icon={X}
                  className="bg-white text-gray-700"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={handleClick}
            className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors"
          >
            <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600 text-center">
              Click to upload an image
            </p>
            <p className="text-gray-400 text-sm">
              PNG, JPG, WEBP up to 5MB
            </p>
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 animate-spin text-primary-600" />
              <span className="text-primary-600">Uploading...</span>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;