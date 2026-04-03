import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useStore from '../store/useStore';
import { IndianRupee, MapPin, Tag, Filter, LockKeyhole, Crown, X, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const BuyerDashboard = () => {
  const [items, setItems] = useState([]);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const { user } = useStore();

  const fetchData = async () => {
    try {
      const itemsRes = await axios.get('http://localhost:5000/api/items/approved');
      setItems(itemsRes.data);
      const bidsRes = await axios.get(`http://localhost:5000/api/bids/buyer/${user.id}`);
      setBids(bidsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBid = async (itemId) => {
    if (!bidAmount) return;

    try {
      await axios.post('http://localhost:5000/api/bids', {
        itemId,
        buyerId: user.id,
        buyerName: user.name,
        amount: Number(bidAmount)
      });
      setBidAmount('');
      fetchData();
      alert("Bid Placed Successfully! Returning to view.");
    } catch (error) {
      alert("Failed to place bid");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Available Scrap Listings</h1>
          <p className="text-slate-500">Browse verified listings and place your competitive bids.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Metal', 'Plastic', 'Copper', 'E-Waste', 'Paper'].map(cat => (
            <button 
              key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 ${filter === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {filter === cat && <Filter className="w-3.5 h-3.5" />} {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.filter(i => filter === 'All' ? true : i.category.toLowerCase() === filter.toLowerCase()).map(item => {
          const myBids = bids.filter(b => b.itemId === item.id);
          const hasWinningBid = myBids.some(b => b.status === 'accepted');
          const isSold = item.status === 'sold' && !hasWinningBid;
          const isLocked = item.isPremium && !user.isPremium;

          return (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all" onClick={() => !isLocked && setSelectedItem(item)}>
              {isLocked && (
                 <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center cursor-default" onClick={e => e.stopPropagation()}>
                   <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                     <LockKeyhole className="w-8 h-8 text-amber-600" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">Premium Listing</h3>
                   <p className="text-sm text-slate-600 mb-6 font-medium">This high-value scrap batch is reserved exclusively for Premium members.</p>
                   <Link to="/premium" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                     <Crown className="w-4 h-4" /> Upgrade to View
                   </Link>
                 </div>
              )}
              
              <div className={`h-56 overflow-hidden relative ${isLocked ? 'blur-sm' : ''}`}>
                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="px-3 py-1 bg-white/95 backdrop-blur text-xs font-bold rounded-full shadow border border-white/20 text-slate-800 flex items-center gap-1 uppercase tracking-wide">
                    {item.category}
                  </span>
                  {item.isPremium && (
                    <span className="px-3 py-1 bg-amber-500/90 text-white backdrop-blur text-xs font-bold rounded-full shadow flex items-center gap-1 uppercase">
                      <Crown className="w-3 h-3" /> Premium
                    </span>
                  )}
                </div>
                {hasWinningBid && (
                  <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-lg rotate-12 text-lg">
                      BID ACCEPTED 🎉
                    </span>
                  </div>
                )}
                {isSold && (
                  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
                    <span className="px-5 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-2xl tracking-widest uppercase">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{item.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="line-clamp-1">{item.address}</span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100">
                   {myBids.length > 0 ? (
                      <div className="flex justify-between items-center bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl border border-blue-100">
                        <span className="font-bold text-sm">Your Bid: ₹{Math.max(...myBids.map(b => b.amount)).toLocaleString()}</span>
                        <span className="text-xs uppercase font-bold bg-blue-200/50 px-2 py-0.5 rounded">{myBids[0].status}</span>
                      </div>
                   ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-medium">Click to view details</span>
                        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">View & Bid</button>
                      </div>
                   )}
                </div>
              </div>
            </div>
          );
        })}
        {items.filter(i => filter === 'All' ? true : i.category.toLowerCase() === filter.toLowerCase()).length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Info className="w-8 h-8 text-slate-400"/>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No items found</h3>
            <p className="text-slate-500 font-medium">No verified scrap listings available in this category right now.</p>
          </div>
        )}
      </div>

      {/* AMAZON-STYLE PRODUCT DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[95vh] overflow-y-auto flex flex-col md:flex-row relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 z-20 text-slate-400 hover:bg-slate-100 hover:text-slate-900 p-2 rounded-full transition-colors"><X className="w-6 h-6"/></button>
            
            {/* Lhs Image */}
            <div className="w-full md:w-1/2 bg-slate-100 flex items-center justify-center relative min-h-[300px] md:min-h-full">
               <img src={selectedItem.images[0]} alt={selectedItem.title} className="absolute inset-0 w-full h-full object-cover" />
               {selectedItem.isPremium && (
                  <div className="absolute top-6 left-6 bg-amber-500 text-white px-4 py-1.5 rounded-full shadow-lg font-bold flex items-center gap-2 uppercase tracking-wide text-sm">
                    <Crown className="w-4 h-4"/> Verified Premium Scrap
                  </div>
               )}
            </div>

            {/* Rhs Details & Bidding panel */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
               <div className="mb-2 flex items-center gap-2 text-sm font-bold text-green-600 uppercase tracking-widest"><Tag className="w-4 h-4"/> {selectedItem.category}</div>
               <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{selectedItem.title}</h2>
               
               <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-8 mt-2">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Seller Notes & Description</h4>
                 <p className="text-slate-700 leading-relaxed text-sm">{selectedItem.description}</p>
               </div>

               <div className="grid grid-cols-1 gap-4 mb-8">
                 <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
                    <div className="bg-slate-100 p-3 rounded-xl"><Crown className="w-5 h-5 text-slate-600"/></div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Vendor</p>
                      <p className="font-bold text-slate-800">{selectedItem.sellerName}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
                    <div className="bg-slate-100 p-3 rounded-xl"><MapPin className="w-5 h-5 text-slate-600"/></div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Pickup Location</p>
                      <p className="font-medium text-slate-800 text-sm">{selectedItem.address}</p>
                    </div>
                 </div>
               </div>
               
               <div className="mt-auto border-t border-slate-200 pt-8">
                 {(() => {
                   const myBids = bids.filter(b => b.itemId === selectedItem.id);
                   const hasWinningBid = myBids.some(b => b.status === 'accepted');
                   const isSold = selectedItem.status === 'sold' && !hasWinningBid;

                   if (hasWinningBid) return <div className="bg-green-100 border border-green-300 text-green-800 p-6 rounded-2xl text-center"><h3 className="text-2xl font-bold mb-2">🎉 Deal Finalized!</h3><p>The seller accepted your bid of ₹{myBids.find(b=>b.status==='accepted').amount.toLocaleString()}. They will contact you shortly.</p></div>;
                   if (isSold) return <div className="bg-slate-100 border border-slate-300 text-slate-600 p-6 rounded-2xl text-center"><h3 className="text-2xl font-bold">Sold Out</h3><p>This item has already been secured by another buyer.</p></div>;
                   
                   return (
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900 text-lg">Place Your Binding Bid</h4>
                        {myBids.length > 0 && <p className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block mb-2">You currently have {myBids.length} active bid(s) placed.</p>}
                        <div className="flex gap-4">
                          <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><IndianRupee className="w-5 h-5" /></span>
                            <input 
                              type="number" 
                              placeholder="Amount in Rupees"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-slate-900 focus:ring-0 outline-none text-lg font-bold placeholder:font-normal placeholder:text-slate-400 transition-colors"
                            />
                          </div>
                          <button 
                            onClick={() => handleBid(selectedItem.id)}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-800 transition-transform active:scale-95 shadow-xl hover:shadow-2xl"
                          >
                            Submit Bid
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 text-center mt-4">By placing a bid, you agree to the Terms of Service. Bids cannot be retracted once the seller accepts.</p>
                      </div>
                   );
                 })()}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
