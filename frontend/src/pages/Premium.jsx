import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldCheck, Zap } from 'lucide-react';
import useStore from '../store/useStore';
import axios from 'axios';

const Premium = () => {
  const { user, setUser } = useStore();
  const navigate = useNavigate();

  const handleDemoPayment = async () => {
    if (!user) {
      alert("Please login to subscribe!");
      navigate('/login');
      return;
    }
    
    // Simulate payment delay
    alert("DEMO: Redirecting to Payment Gateway (Stripe/Razorpay)...");
    
    try {
      const res = await axios.put(`http://localhost:5000/api/users/${user.id}/premium`);
      setUser(res.data.user);
      alert("Payment Successful! Premium Activated. You now have unlimited access.");
      navigate(`/dashboard/${user.role}`);
    } catch(err) {
      alert("Failed to upgrade account.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
          Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">Premium</span>
        </h1>
        <p className="text-xl text-slate-500">
          Get verified badge, lower commission fees, and priority matching for your scrap trades.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Basic Trading</h3>
            <p className="text-slate-500 h-10">Good for small scale sellers and occasional buyers.</p>
          </div>
          <div className="mb-8">
            <span className="text-5xl font-extrabold text-slate-900">Free</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-slate-600"><CheckCircle className="w-5 h-5 text-green-500" /> Basic Listings (up to 5/month)</li>
            <li className="flex items-center gap-3 text-slate-600"><CheckCircle className="w-5 h-5 text-green-500" /> Standard Bidding</li>
            <li className="flex items-center gap-3 text-slate-600"><CheckCircle className="w-5 h-5 text-green-500" /> 5% Commission fee</li>
          </ul>
          <button className="w-full py-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
            Current Plan
          </button>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative flex flex-col overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-400 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
            Most Popular
          </div>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">Enterprise Pro <ShieldCheck className="w-5 h-5 text-amber-500" /></h3>
            <p className="text-slate-400 h-10">For industrial businesses and high-volume traders.</p>
          </div>
          <div className="mb-8 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-white">₹999</span>
            <span className="text-slate-400 font-medium">/month</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="w-5 h-5 text-amber-500" /> <span className="text-white font-medium">Verified Badge</span> on profile</li>
            <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="w-5 h-5 text-amber-500" /> Unlimited Listings</li>
            <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="w-5 h-5 text-amber-500" /> Priority in search results</li>
            <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="w-5 h-5 text-amber-500" /> 0% Commission fee</li>
            <li className="flex items-center gap-3 text-slate-300"><Zap className="w-5 h-5 text-amber-500" /> Instant SMS Alerts for bids</li>
          </ul>
          <button 
            onClick={handleDemoPayment}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-amber-500/25"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Premium;
