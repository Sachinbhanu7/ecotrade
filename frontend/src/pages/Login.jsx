import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useStore from '../store/useStore';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setUser(res.data.user);
      if (res.data.user.role === 'admin') {
        window.location.href = '/admin-panel';
      } else {
        navigate(res.data.user.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/seller');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Invalid credentials';
      setError(typeof errMsg === 'string' ? errMsg : 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <LogIn className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-center text-slate-500 mb-8">Enter your credentials to access your account.</p>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-md mt-4"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account? <Link to="/register" className="text-green-600 font-semibold hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
