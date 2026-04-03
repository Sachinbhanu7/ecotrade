import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import Premium from './pages/Premium';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Navbar from './components/Navbar';
import { Footer } from './components/Footer';
import useStore from './store/useStore';

function App() {
  const { user } = useStore();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/seller'} />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/seller'} />} />
          
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Navigate to="/" />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard/buyer" element={user ? <BuyerDashboard /> : <Navigate to="/login" />} />
          <Route path="/dashboard/seller" element={user?.role === 'seller' ? <SellerDashboard /> : <Navigate to="/login" />} />
          <Route path="/premium" element={<Premium />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
