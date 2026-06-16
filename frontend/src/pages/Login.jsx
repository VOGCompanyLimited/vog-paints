import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';
import VOGLogo from '../components/VOGLogo';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
  }, [user]);

  const adminLogin = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/dev-login', { email: 'admin@paintmarket.gh' });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/admin';
    } catch (err) {
      toast.error('Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4">
              <VOGLogo size={72} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to VOG Company Limited</h1>
            <p className="text-gray-500 mt-1">Sign in to start shopping</p>
          </div>
          <GoogleLoginButton />
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-sm text-gray-400">or</span></div>
          </div>
          <button onClick={adminLogin} disabled={loading} className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50">
            {loading ? 'Signing in...' : 'Admin Login (Dev Mode)'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
