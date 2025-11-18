/**
 * SSO Callback Page
 * Handles OAuth callback from PingID
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/auth-service';
import { toast } from 'sonner';

export default function CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Handle error from SSO provider
      if (error) {
        console.error('SSO error:', error);
        toast.error('SSO authentication failed');
        navigate('/login', { replace: true });
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        console.error('Missing code or state parameter');
        toast.error('Invalid callback parameters');
        navigate('/login', { replace: true });
        return;
      }

      try {
        // Exchange code for tokens
        const { accessToken, refreshToken } = await authService.handleSSOCallback(code, state);

        // Store tokens
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        // Redirect to dashboard
        toast.success('Login successful');
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Callback handling failed:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
