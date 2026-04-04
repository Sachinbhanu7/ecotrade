import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, LayoutDashboard, LogOut, CheckCircle, XCircle, Crown, Users, TrendingUp, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.user.role === 'admin') {
        localStorage.setItem('admin_auth', 'true');
        setAuth(true);
        navigate('/dashboard');
      } else {
        setError('Unauthorized access');
      }
    } catch (err) {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 border-t-4 border-amber-500">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-700">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-amber-500/10 rounded-full">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-2">Admin Portal</h2>
        <p className="text-slate-400 text-center mb-8 text-sm">Use your administrative credentials</p>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-6">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin Email" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-white placeholder:text-slate-500" />
          <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-white placeholder:text-slate-500" />
          <button type="submit" className="w-full bg-amber-500 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-400 transition-colors mt-4">Authenticate</button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ setAuth }) => {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [allBids, setAllBids] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalItems: 0, pendingApprovals: 0, totalBids: 0 });
  
  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'users', 'bids', or item object

  const fetchData = async () => {
    try {
      const itemsRes = await axios.get('/api/items');
      setItems(itemsRes.data);
      const statsRes = await axios.get('/api/stats');
      setStats(statsRes.data);
      const usersRes = await axios.get('/api/users');
      setUsers(usersRes.data);
      const bidsRes = await axios.get('/api/bids');
      setAllBids(bidsRes.data);
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    fetchData();
    const intc = setInterval(fetchData, 3000);
    return () => clearInterval(intc);
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/api/items/${id}/status`, { status });
      fetchData();
      if(activeModal?.id === id) setActiveModal({...activeModal, status});
    } catch(e) { alert("Action failed"); }
  };

  const handlePremiumToggle = async (id) => {
    try {
      await axios.put(`/api/items/${id}/premium`);
      fetchData();
      if(activeModal?.id === id) setActiveModal({...activeModal, isPremium: !activeModal.isPremium});
    } catch(e) { alert("Action failed"); }
  };

  const pendingItems = items.filter(i => i.status === 'pending');
  const otherItems = items.filter(i => i.status !== 'pending');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 pb-12">
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            <span className="font-bold text-lg tracking-tight">EcoTrade Admin Control</span>
          </div>
          <button onClick={() => { localStorage.removeItem('admin_auth'); setAuth(false); }} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <div className="text-slate-400 text-sm font-medium mb-2">Pending Approvals</div>
            <div className="text-4xl font-bold text-amber-500">{stats.pendingApprovals}</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 opacity-80">
            <div className="text-slate-400 text-sm font-medium mb-2">Total Items Listed</div>
            <div className="text-4xl font-bold text-blue-400">{stats.totalItems}</div>
          </div>
          <div onClick={() => setActiveModal('bids')} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 cursor-pointer hover:bg-slate-700/50 hover:border-green-500/50 transition-all group">
            <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2 group-hover:text-green-300">Active Bids <TrendingUp className="w-4 h-4" /></div>
            <div className="text-4xl font-bold text-green-400">{stats.totalBids}</div>
          </div>
          <div onClick={() => setActiveModal('users')} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 cursor-pointer hover:bg-slate-700/50 hover:border-purple-500/50 transition-all group">
            <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2 group-hover:text-purple-300">Registered Users <Users className="w-4 h-4" /></div>
            <div className="text-4xl font-bold text-purple-400">{stats.totalUsers}</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-amber-400"><LayoutDashboard className="w-5 h-5"/> Pending Approvals ({pendingItems.length})</h2>
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden mb-12 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800 border-b border-slate-700 text-slate-400 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Seller & Contact</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {pendingItems.map(item => (
                  <tr key={item.id} onClick={() => setActiveModal(item)} className="hover:bg-slate-700/50 transition-colors cursor-pointer cursor-zoom-in">
                    <td className="px-6 py-4 min-w-[300px]">
                      <div className="flex items-start gap-4">
                        <img src={item.images[0]} className="w-16 h-16 rounded-lg object-cover bg-slate-700 shrink-0" alt=""/>
                        <div>
                          <div className="font-bold text-white mb-1">{item.title} <span className="px-2 py-0.5 bg-slate-700 rounded text-[10px] ml-2 text-slate-300">{item.category}</span></div>
                          <div className="text-xs text-slate-500 italic max-w-sm line-clamp-2">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-300">{item.sellerName}</div>
                      <div className="text-xs text-slate-400 mt-1">📞 {item.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300">{formatDistanceToNow(new Date(item.createdAt), {addSuffix:true})}</div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleStatusUpdate(item.id, 'approved')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-md transition-colors text-xs font-bold border border-green-500/20"><CheckCircle className="w-3.5 h-3.5"/> Approve</button>
                        <button onClick={() => handleStatusUpdate(item.id, 'rejected')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition-colors text-xs font-bold border border-red-500/20"><XCircle className="w-3.5 h-3.5"/> Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingItems.length === 0 && (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">No pending approvals. Queue is clear! 🎉</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-400"><Database className="w-5 h-5"/> Manage All Listings ({otherItems.length})</h2>
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800 border-b border-slate-700 text-slate-400 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Item Snapshot</th>
                  <th className="px-6 py-4">Status & Visiblity</th>
                  <th className="px-6 py-4 text-right">Control Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {otherItems.map(item => (
                  <tr key={item.id} onClick={() => setActiveModal(item)} className="hover:bg-slate-700/50 transition-colors cursor-pointer cursor-zoom-in">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={item.images[0]} className="w-10 h-10 rounded-lg object-cover bg-slate-700" alt=""/>
                        <div>
                          <div className="font-bold text-white leading-tight">{item.title}</div>
                          <div className="text-[10px] text-slate-500">{item.sellerName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.status === 'approved' ? 'bg-green-500/20 text-green-400' : item.status === 'sold' ? 'bg-slate-700 text-slate-300' : 'bg-red-500/20 text-red-400'}`}>
                          {item.status}
                        </span>
                        {item.isPremium && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 flex items-center gap-1">
                            <Crown className="w-3 h-3"/> Premium
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handlePremiumToggle(item.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-xs font-bold border ${item.isPremium ? 'bg-slate-700 border-slate-600 text-slate-400 hover:text-white' : 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'}`}>
                          <Crown className="w-3.5 h-3.5"/> {item.isPremium ? 'Remove Premium' : 'Mark Premium'}
                        </button>
                        {item.status === 'approved' && (
                          <button onClick={() => handleStatusUpdate(item.id, 'rejected')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition-colors text-xs font-bold border border-red-500/20">
                            Revoke
                          </button>
                        )}
                        {item.status === 'rejected' && (
                          <button onClick={() => handleStatusUpdate(item.id, 'approved')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-md transition-colors text-xs font-bold border border-green-500/20">
                            Re-Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {otherItems.length === 0 && (
                  <tr><td colSpan="3" className="px-6 py-12 text-center text-slate-500">No managed items yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ALL MODALS COMPONENT ENGINE */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* ITEM DETAIL MODAL */}
            {typeof activeModal === 'object' && (
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-2/5 border-r border-slate-700">
                   <div className="relative h-64 md:h-full bg-slate-900 overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
                     <img src={activeModal.images[0]} alt={activeModal.title} className="absolute inset-0 w-full h-full object-cover opacity-90" />
                     <div className="absolute top-4 left-4 flex gap-2">
                       <span className="px-3 py-1 bg-slate-900/80 backdrop-blur text-xs font-bold rounded shadow border border-slate-600 text-white uppercase">{activeModal.category}</span>
                       <span className={`px-3 py-1 backdrop-blur text-xs font-bold rounded shadow border uppercase ${activeModal.status === 'approved' ? 'bg-green-500/90 text-white border-green-400' : activeModal.status === 'pending' ? 'bg-amber-500/90 text-white border-amber-400' : 'bg-red-500/90 text-white border-red-400'}`}>{activeModal.status}</span>
                     </div>
                   </div>
                </div>
                <div className="w-full md:w-3/5 p-8 relative">
                   <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-6 h-6"/></button>
                   <h2 className="text-3xl font-extrabold text-white mb-2">{activeModal.title}</h2>
                   <p className="text-slate-400 mb-6 leading-relaxed bg-slate-900 border border-slate-700 p-4 rounded-xl">{activeModal.description}</p>
                   
                   <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                       <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Seller Identity</p>
                       <p className="font-medium text-slate-200">{activeModal.sellerName}</p>
                       <p className="text-sm text-slate-400 font-mono mt-1">📞 {activeModal.phone}</p>
                     </div>
                     <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                       <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Pickup Location</p>
                       <p className="text-sm text-slate-300">{activeModal.address}</p>
                       <p className="text-xs text-slate-500 mt-2">Listed {formatDistanceToNow(new Date(activeModal.createdAt), {addSuffix:true})}</p>
                     </div>
                   </div>

                   <hr className="border-slate-700 my-6" />
                   
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg text-white">Active Bids</h3>
                     <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded">{allBids.filter(b => b.itemId === activeModal.id).length} Orders</span>
                   </div>
                   <div className="space-y-3 mb-8 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                     {allBids.filter(b => b.itemId === activeModal.id).map(bid => (
                       <div key={bid.id} className={`flex justify-between items-center p-3 rounded-lg border ${bid.status === 'accepted' ? 'bg-green-500/10 border-green-500/20' : bid.status === 'rejected' ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-700/40 border-slate-600'}`}>
                         <div>
                           <span className="font-bold text-slate-200">₹{bid.amount.toLocaleString()}</span>
                           <p className="text-xs text-slate-400">By: {bid.buyerName}</p>
                         </div>
                         <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${bid.status === 'accepted' ? 'text-green-400 bg-green-500/20' : bid.status === 'rejected' ? 'text-red-400 bg-red-500/20' : 'text-slate-400 bg-slate-700'}`}>{bid.status}</span>
                       </div>
                     ))}
                     {allBids.filter(b => b.itemId === activeModal.id).length === 0 && <p className="text-sm text-slate-500 italic">No bids placed on this item yet.</p>}
                   </div>

                   <div className="flex gap-3">
                      {activeModal.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatusUpdate(activeModal.id, 'approved')} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors">Approve Listing</button>
                          <button onClick={() => handleStatusUpdate(activeModal.id, 'rejected')} className="flex-1 bg-red-600/20 hover:bg-red-500/30 border border-red-500/50 text-red-500 font-bold py-3 rounded-xl transition-colors">Decline Listing</button>
                        </>
                      )}
                      {(activeModal.status === 'approved' || activeModal.status === 'rejected') && (
                          <button onClick={() => handlePremiumToggle(activeModal.id)} className={`flex-1 font-bold py-3 rounded-xl transition-colors border flex justify-center items-center gap-2 ${activeModal.isPremium ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-amber-500 hover:bg-amber-400 border-amber-500 text-slate-900'}`}>
                            <Crown className="w-5 h-5"/> {activeModal.isPremium ? 'Remove Premium Status' : 'Mark as Premium Only'}
                          </button>
                      )}
                   </div>
                </div>
              </div>
            )}

            {/* USERS MODAL */}
            {activeModal === 'users' && (
               <div className="p-8 relative">
                 <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X className="w-6 h-6"/></button>
                 <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Users className="text-purple-400"/> Registered Users Directory</h2>
                 <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-800 text-slate-400 uppercase text-xs border-b border-slate-700">
                        <tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Premium Status</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                         {users.map(u => (
                           <tr key={u.id}>
                             <td className="px-6 py-4 font-bold text-white">{u.name}</td>
                             <td className="px-6 py-4 text-slate-400">{u.email}</td>
                             <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${u.role === 'seller' ? 'bg-blue-500/20 text-blue-400' : u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>{u.role}</span></td>
                             <td className="px-6 py-4">{u.isPremium ? <span className="text-amber-400 text-xs font-bold flex items-center gap-1"><Crown className="w-3 h-3"/> Active</span> : <span className="text-slate-500 text-xs">-</span>}</td>
                           </tr>
                         ))}
                      </tbody>
                    </table>
                 </div>
               </div>
            )}

            {/* BIDS MODAL */}
            {activeModal === 'bids' && (
               <div className="p-8 relative">
                 <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X className="w-6 h-6"/></button>
                 <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><TrendingUp className="text-green-400"/> All Bids Tracking</h2>
                 <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-800 text-slate-400 uppercase text-xs border-b border-slate-700">
                        <tr><th className="px-6 py-4">Bid Amount</th><th className="px-6 py-4">Buyer</th><th className="px-6 py-4">Item Target</th><th className="px-6 py-4">Status</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                         {allBids.map(b => {
                           const targetItem = items.find(i => i.id === b.itemId);
                           return (
                             <tr key={b.id}>
                               <td className="px-6 py-4 font-bold text-green-400">₹{b.amount.toLocaleString()}</td>
                               <td className="px-6 py-4 text-slate-300">{b.buyerName}</td>
                               <td className="px-6 py-4 text-slate-400 line-clamp-1">{targetItem ? targetItem.title : b.itemId}</td>
                               <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${b.status === 'accepted' ? 'bg-green-500/20 text-green-400' : b.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>{b.status}</span></td>
                             </tr>
                           );
                         })}
                         {allBids.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No bids tracked globally.</td></tr>}
                      </tbody>
                    </table>
                 </div>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Generic Layout Dashboard icon wrapper for the headers
const Database = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>;

function App() {
  const [auth, setAuth] = useState(localStorage.getItem('admin_auth') === 'true');

  return (
    <Routes>
      <Route path="/" element={!auth ? <Login setAuth={setAuth} /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={auth ? <Dashboard setAuth={setAuth} /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;
