import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useStore from '../store/useStore';
import { Plus, Check, X, Clock, Box, User, LayoutDashboard, Crown, MapPin, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PickupLocationMap, { reverseGeocodePick } from '../components/PickupLocationMap';
import KycAccountGate from '../components/KycAccountGate';

const SellerDashboard = () => {
  const [items, setItems] = useState([]);
  const [bids, setBids] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('MyListings'); // MyListings, Profile
  const { user } = useStore();

  const [formData, setFormData] = useState({
    title: '', category: 'Metal', description: '', address: '', phone: '', images: '', lat: null, lng: null,
  });

  const fetchData = async () => {
    try {
      const itemsRes = await axios.get(`/api/items/seller/${user.id}`);
      setItems(itemsRes.data);
      const bidsRes = await axios.get(`/api/bids/seller/${user.id}`);
      setBids(bidsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Polling for fast live feel
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, images: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMapLocationPick = async (lat, lng) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
    try {
      const name = await reverseGeocodePick(lat, lng);
      if (name) {
        setFormData((prev) => ({
          ...prev,
          lat,
          lng,
          address: prev.address.trim() ? prev.address : name,
        }));
      }
    } catch {
      /* keep coords only */
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (formData.lat == null || formData.lng == null) {
      alert('Please tap the map to set the pickup location.');
      return;
    }
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }
    try {
      await axios.post('/api/items', {
        ...formData,
        phone: phoneDigits,
        sellerId: user.id,
        sellerName: user.name,
        images: [formData.images || 'https://dummyimage.com/800x600/e2e8f0/1e293b?text=Scrap'] // Default image for demo fallback
      });
      setShowAddModal(false);
      setFormData({ title: '', category: 'Metal', description: '', address: '', phone: '', images: '', lat: null, lng: null });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add listing');
    }
  };

  const handleBidAction = async (bidId, status) => {
    try {
      await axios.put(`/api/bids/${bidId}/status`, { status });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update bid');
    }
  };

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const listingsThisMonth = items.filter(
    (i) => typeof i.createdAt === 'string' && i.createdAt.slice(0, 7) === ym,
  ).length;
  const atListingCap = !user.isPremium && listingsThisMonth >= 5;

  return (
    <KycAccountGate>
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Dashboard Navigation */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4 overflow-x-auto gap-4">
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('MyListings')} className={`flex flex-shrink-0 items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-colors ${activeTab === 'MyListings' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
            <LayoutDashboard className="w-5 h-5" /> My Listings
          </button>
          <button onClick={() => setActiveTab('Profile')} className={`flex flex-shrink-0 items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-colors ${activeTab === 'Profile' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
            <User className="w-5 h-5" /> Seller Profile
          </button>
        </div>
        
        {activeTab === 'MyListings' && (
          atListingCap ? (
            <Link
              to="/premium"
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 shadow-sm transition-colors shrink-0"
            >
              <Crown className="w-5 h-5" /> Upgrade for unlimited listings
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 shadow-sm transition-colors shrink-0"
            >
              <Plus className="w-5 h-5" /> Add Listing
            </button>
          )
        )}
      </div>

      {activeTab === 'Profile' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
          <div className="w-24 h-24 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4">
            {user.name.charAt(0)}
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-1">{user.name}</h2>
          <p className="text-slate-500 font-medium mb-6">{user.email}</p>
          
          <div className="flex justify-center gap-4 mb-8">
            <span className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest">Verified Seller Vendor</span>
            {user.isPremium && (
              <>
                <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 uppercase tracking-widest">
                  <Crown className="w-4 h-4" /> Enterprise Pro
                </span>
                <span className="bg-emerald-50 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 uppercase tracking-widest border border-emerald-200">
                  <ShieldCheck className="w-4 h-4" /> Verified badge
                </span>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-slate-400 font-bold mb-1 uppercase text-xs">Total Active Listings</p>
              <p className="text-3xl font-extrabold text-slate-900">{items.length}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <p className="text-blue-600/80 font-bold mb-1 uppercase text-xs">Total Bids Received</p>
              <p className="text-3xl font-extrabold text-blue-700">{bids.length}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 col-span-2 lg:col-span-1">
              <p className="text-green-600/80 font-bold mb-1 uppercase text-xs">Successful Sales</p>
              <p className="text-3xl font-extrabold text-green-700">{items.filter(i => i.status === 'sold').length}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'MyListings' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!user.isPremium && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Basic plan:</span>{' '}
                {listingsThisMonth}/5 new listings this month.
                {atListingCap ? (
                  <> Cap reached — <Link to="/premium" className="text-amber-700 font-bold hover:underline">upgrade to Enterprise Pro</Link> for unlimited listings, 0% commission, and SMS bid alerts.</>
                ) : (
                  <> Enterprise Pro removes the cap and lowers your platform fee to 0%.</>
                )}
              </div>
            )}
            {user.isPremium && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
                <span className="font-semibold">Enterprise Pro active:</span> unlimited listings, 0% platform commission on accepted bids, priority placement for buyers, and SMS alerts to your listing phone when buyers bid.
              </div>
            )}
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Box className="w-5 h-5" /> Manage Live Market Items</h2>
            {items.map(item => {
              const itemBids = bids.filter(b => b.itemId === item.id).sort((a,b) => b.amount - a.amount);
              
              return (
                <div key={item.id} className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 relative overflow-hidden ${item.status === 'sold' && 'opacity-60'}`}>
                  {item.status === 'sold' && (
                    <div className="absolute inset-0 bg-slate-100/50 z-10 pointer-events-none flex items-center justify-center">
                       <span className="rotate-12 bg-slate-900 text-white font-bold text-2xl uppercase tracking-widest px-8 py-3 rounded-2xl shadow-xl">SOLD OFF</span>
                    </div>
                  )}

                  <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200 relative">
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                        item.status === 'approved' ? 'bg-green-100 text-green-700' :
                        item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        item.status === 'sold' ? 'bg-slate-200 text-slate-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">{item.description}</p>
                    {item.lat != null && item.lng != null && (
                      <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        Map location saved ({item.lat.toFixed(4)}, {item.lng.toFixed(4)})
                      </p>
                    )}
                    {item.status === 'approved' && itemBids.length > 0 && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Live Unresolved Bids</h4>
                        <div className="space-y-3">
                          {itemBids.map(bid => (
                            <div key={bid.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                              <div>
                                <div className="font-semibold text-slate-800">₹{bid.amount.toLocaleString()}</div>
                                <div className="text-xs text-slate-500">Buyer • {formatDistanceToNow(new Date(bid.createdAt), {addSuffix: true})}</div>
                                {bid.status === 'accepted' && bid.commissionPct != null && (
                                  <div className="text-xs text-slate-600 mt-1.5 font-medium">
                                    Platform fee {bid.commissionPct}%: ₹{(bid.commissionAmount ?? 0).toLocaleString()} · You receive ₹{(bid.netToSeller ?? bid.amount).toLocaleString()}
                                  </div>
                                )}
                              </div>
                              
                              {bid.status === 'pending' ? (
                                <div className="flex gap-2 relative z-20 shrink-0">
                                  <button type="button" onClick={() => handleBidAction(bid.id, 'accepted')} className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"><Check className="w-4 h-4" /></button>
                                  <button type="button" onClick={() => handleBidAction(bid.id, 'rejected')} className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <span className={`text-xs font-bold uppercase shrink-0 ${bid.status === 'accepted' ? 'text-green-600' : 'text-red-500'}`}>{bid.status}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {item.status === 'pending' && <p className="text-sm text-amber-600 font-medium flex items-center gap-1 mt-4"><Clock className="w-4 h-4" /> Awaiting Admin Approval</p>}
                  </div>
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 border-dashed">
                <p className="text-slate-500 font-medium mb-4">You haven't listed any scrap yet.</p>
                {atListingCap ? (
                  <Link to="/premium" className="text-amber-600 font-semibold hover:underline">Upgrade to list (monthly cap reached)</Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="text-green-600 font-semibold hover:underline"
                  >
                    Create your first listing
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl sticky top-24">
              <h3 className="font-bold text-xl mb-6">Real-time Performance</h3>
              <div className="space-y-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-slate-400 text-sm font-medium mb-1">Total Market Listings</div>
                  <div className="text-3xl font-bold">{items.length}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-slate-400 text-sm font-medium mb-1">Unresolved Bids</div>
                  <div className="text-3xl font-bold">{bids.filter(b => b.status === 'pending').length}</div>
                </div>
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                  <div className="text-green-300 text-sm font-medium mb-1">Deals Closed (Sold)</div>
                  <div className="text-3xl font-bold text-green-400">{items.filter(i => i.status === 'sold').length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Add Scrap Listing</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. 500kg Iron Scrap" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none">
                    <option>Metal</option>
                    <option>Plastic</option>
                    <option>Copper</option>
                    <option>E-Waste</option>
                    <option>Paper</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input required type="tel" inputMode="numeric" pattern="[0-9]{10}" minLength={10} maxLength={10} title="Please enter exactly 10 digits" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none" placeholder="10-digit number" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                  Pickup location on map
                </label>
                <p className="text-xs text-slate-500 mb-2">Tap the map to drop a pin (OpenStreetMap). If the address field is empty, we fill it from the map.</p>
                <PickupLocationMap
                  lat={formData.lat}
                  lng={formData.lng}
                  onPick={handleMapLocationPick}
                  height={240}
                />
                {formData.lat != null && formData.lng != null && (
                  <p className="text-xs text-slate-600 mt-2 font-mono">
                    {formData.lat.toFixed(5)}, {formData.lng.toFixed(5)}
                  </p>
                )}
                <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">Pickup Address</label>
                <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none" rows="2" placeholder="Street, landmark, or full address (editable)..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none" rows="3" placeholder="Condition, weight estimate, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload Image File</label>
                <input required type="file" accept="image/*" onChange={handleImageUpload} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                {formData.images && <img src={formData.images} alt="Preview" className="mt-4 h-32 object-cover rounded-xl border border-slate-200" />}
              </div>
              <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors mt-6 shadow-md">
                Submit for Approval
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
    </KycAccountGate>
  );
};

export default SellerDashboard;
