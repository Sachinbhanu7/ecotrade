import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { LogOut, LayoutDashboard, Crown, Recycle, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useStore();

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <Recycle className="h-8 w-8 text-green-600" />
            <span className="font-bold text-xl tracking-tight text-slate-800">EcoTrade</span>
          </Link>
          
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link to="/premium" className="flex items-center gap-2 text-amber-500 hover:text-amber-600 font-medium transition-colors">
                  <Crown className="w-4 h-4" />
                  Premium Plans
                </Link>
                <Link to="/dashboard/buyer" className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors">
                  Explore Listings
                </Link>
                <Link 
                  to={`/dashboard/${user.role}`} 
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="h-6 w-px bg-slate-200"></div>
                <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 border-dashed">
                  <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm text-slate-600 font-semibold flex items-center gap-1.5">
                    {user.name} 
                    {user.isPremium && (
                      <>
                        <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" title="Enterprise Pro" />
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified Enterprise" />
                      </>
                    )}
                  </span>
                  <button 
                    onClick={logout}
                    className="flex items-center justify-center ml-2 p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Login</Link>
                <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full font-medium shadow-md shadow-green-200 transition-all active:scale-95">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
