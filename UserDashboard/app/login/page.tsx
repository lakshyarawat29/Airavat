'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { ThemeContext, useTheme, getThemeClasses } from '@/hooks/use-theme';

export default function LoginPage() {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Submitting login form:', formData);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        console.log('Login successful, redirecting to dashboard');
        // Redirect to dashboard on successful login
        router.push('/');
      } else {
        console.log('Login failed:', data.error);
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} flex items-center justify-center p-4 transition-colors duration-500`}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div
          className={`absolute inset-0 ${themeClasses.gradientOverlay} transition-colors duration-500`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 ${themeClasses.particleColor} rounded-full animate-pulse transition-colors duration-500`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Airavat
          </h1>
          <p
            className={`text-lg ${themeClasses.mutedText} transition-colors duration-300`}
          >
            Secure Authentication
          </p>
        </div>

        {/* Login Card */}
        <Card
          className={`${themeClasses.cardBg} ${themeClasses.cardBorder} shadow-xl transition-all duration-300 hover:shadow-2xl`}
        >
          <CardHeader className="text-center">
            <CardTitle
              className={`text-2xl ${themeClasses.text} transition-colors duration-300`}
            >
              Welcome Back
            </CardTitle>
            <CardDescription
              className={`${themeClasses.mutedText} transition-colors duration-300`}
            >
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className={`${themeClasses.text} transition-colors duration-300`}
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`${themeClasses.inputBg} ${themeClasses.cardBorder} ${themeClasses.text} transition-all duration-300 focus:ring-2 focus:ring-cyan-500`}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className={`${themeClasses.text} transition-colors duration-300`}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`${themeClasses.inputBg} ${themeClasses.cardBorder} ${themeClasses.text} pr-10 transition-all duration-300 focus:ring-2 focus:ring-cyan-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.mutedText} hover:text-gray-600 transition-colors duration-200`}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-3 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Demo Credentials:
              </h3>
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p>
                  <strong>Email:</strong> user@airavat.com
                </p>
                <p>
                  <strong>Password:</strong> password
                </p>
              </div>
            </div>

            {/* Registration Link */}
            <div className="mt-4 text-center">
              <p
                className={`text-sm ${themeClasses.mutedText} transition-colors duration-300`}
              >
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/register')}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
                >
                  Register here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p
            className={`text-sm ${themeClasses.mutedText} transition-colors duration-300`}
          >
            Protected by Airavat's multi-agent security architecture
          </p>
        </div>
      </div>
    </div>
  );
}
