import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useStore from '../store/useStore';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    kycPhone: '',
    kycIdType: 'PAN',
    kycIdNumber: '',
    kycIdNumber: '',
    kycAddress: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useStore();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    const phoneDigits = formData.kycPhone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }
    try {
      const res = await axios.post('/api/auth/register', {
        ...formData,
        kycPhone: phoneDigits,
      });
      setUser(res.data.user);
      navigate(res.data.user.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/seller');
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
      setError(typeof errMsg === 'string' ? errMsg : 'Registration failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <UserPlus className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Create an Account</h2>
          <p className="text-center text-slate-500 mb-8">Join the network to start trading scrap.</p>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company / Full Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                placeholder="Acme Recycling..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                placeholder="hello@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                placeholder="Create a strong password"
              />
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">KYC verification</h3>
              <p className="text-xs text-slate-500 mb-4">Required for trading. An admin will review before you can list or bid.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Registered phone</label>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    minLength={10}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    title="Enter exactly 10 digits"
                    value={formData.kycPhone}
                    onChange={(e) => setFormData({ ...formData, kycPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Government ID type</label>
                    <select
                      value={formData.kycIdType}
                      onChange={(e) => setFormData({ ...formData, kycIdType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none bg-white"
                    >
                      <option value="PAN">PAN</option>
                      <option value="Aadhaar">Aadhaar</option>
                      <option value="Driving License">Driving License</option>
                      <option value="GSTIN">GSTIN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ID number</label>
                    <input
                      type="text"
                      required
                      value={formData.kycIdNumber}
                      onChange={(e) => setFormData({ ...formData, kycIdNumber: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                      placeholder="As on document"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business / correspondence address</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.kycAddress}
                    onChange={(e) => setFormData({ ...formData, kycAddress: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 resize-none"
                    placeholder="Street, city, state, PIN"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">I want to...</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer text-center px-4 py-3 rounded-xl border-2 transition-all ${formData.role === 'buyer' ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" className="hidden" name="role" value="buyer" checked={formData.role === 'buyer'} onChange={(e) => setFormData({...formData, role: e.target.value})} />
                  <span className={`font-semibold ${formData.role === 'buyer' ? 'text-green-700' : 'text-slate-600'}`}>Buy Scrap</span>
                </label>
                <label className={`cursor-pointer text-center px-4 py-3 rounded-xl border-2 transition-all ${formData.role === 'seller' ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" className="hidden" name="role" value="seller" checked={formData.role === 'seller'} onChange={(e) => setFormData({...formData, role: e.target.value})} />
                  <span className={`font-semibold ${formData.role === 'seller' ? 'text-green-700' : 'text-slate-600'}`}>Sell Scrap</span>
                </label>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-md mt-6 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account? <Link to="/login" className="text-green-600 font-semibold hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
