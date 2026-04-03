import { Link } from 'react-router-dom';
import { ArrowRight, Recycle, TrendingUp, ShieldCheck, Star } from 'lucide-react';

const Landing = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-24 pb-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 font-medium text-sm mb-8 border border-green-100 shadow-sm transition-transform hover:scale-105 cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Bidding System Available
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            The Modern Way to <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">Trade Scrap Efficiently</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-10 leading-relaxed">
            Connect directly with verified industrial buyers and sellers. Transparent bidding, real-time notifications, and highly secure transactions to maximize your profits.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-800 transition-all hover:shadow-xl hover:shadow-slate-300 hover:-translate-y-1">
              Start Trading <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/premium" className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-full font-semibold text-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
              View Premium Plans
            </Link>
          </div>
          
          <div className="mt-16 flex items-center justify-center gap-8 opacity-60 grayscale hidden md:flex">
             <div className="text-xl font-bold tracking-widest text-slate-400">TATA STEEL</div>
             <div className="text-xl font-bold tracking-widest text-slate-400">RELIANCE</div>
             <div className="text-xl font-bold tracking-widest text-slate-400">VEDANTA</div>
             <div className="text-xl font-bold tracking-widest text-slate-400">ADITYA BIRLA</div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-slate-900 text-white py-16 border-y border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800">
             <div>
               <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-2">10k+</div>
               <div className="text-slate-400 font-medium">Verified Traders</div>
             </div>
             <div>
               <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-2">50kT</div>
               <div className="text-slate-400 font-medium">Scrap Recycled</div>
             </div>
             <div>
               <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-2">₹100M+</div>
               <div className="text-slate-400 font-medium">Total Volume</div>
             </div>
             <div>
               <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-2">24/7</div>
               <div className="text-slate-400 font-medium">Active Bidding</div>
             </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why choose EcoTrade?</h2>
            <p className="text-lg text-slate-500">We streamline the complex process of bulk waste trading through an intuitive, automated bidding matching engine.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <Recycle className="text-green-600 w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Verified Listings</h3>
              <p className="text-slate-500 leading-relaxed text-lg">Every scrap listing is manually reviewed and approved by our admins to ensure top-notch quality and zero spam on the platform.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transform md:-translate-y-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="text-blue-600 w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Live Bidding</h3>
              <p className="text-slate-500 leading-relaxed text-lg">Industrial buyers place competitive bids in real-time. Sellers instantly get notified on their dashboards to accept the absolute best offer.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="text-amber-600 w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Secure Network</h3>
              <p className="text-slate-500 leading-relaxed text-lg">Only KYC-verified enterprises get access to our premium trading network, ensuring your data, bids, and transactions remain strictly confidential.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Workflow */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
             <div className="flex-1">
               <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold text-sm mb-4">How it works</div>
               <h2 className="text-4xl font-bold text-slate-900 mb-6">A seamless trading experience</h2>
               <div className="space-y-8 mt-10">
                 <div className="flex gap-4">
                   <div className="bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                   <div>
                     <h4 className="text-xl font-bold text-slate-900 mb-2">Create & Verify</h4>
                     <p className="text-slate-500 text-lg">Sign up as a Buyer or Seller. Upload your KYC for quick verification.</p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                   <div>
                     <h4 className="text-xl font-bold text-slate-900 mb-2">List or Browse</h4>
                     <p className="text-slate-500 text-lg">Sellers post high-quality images and details of scrap batches. Buyers browse the live feed.</p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                   <div>
                     <h4 className="text-xl font-bold text-slate-900 mb-2">Live Bidding & Deal</h4>
                     <p className="text-slate-500 text-lg">Buyers place secure bids. Sellers review incoming offers and accept the top bid seamlessly.</p>
                   </div>
                 </div>
               </div>
             </div>
             <div className="flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-green-100 to-emerald-50 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
                <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80" alt="Scrap Processing" className="rounded-[3rem] shadow-2xl border-8 border-white object-cover h-[500px] w-full" />
             </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Trusted by Industry Leaders</h2>
            <p className="text-lg text-slate-500">Don't just take our word for it. Look at what top enterprises have achieved using our platform.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
               <div className="flex gap-1 mb-4">
                 {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
               </div>
               <p className="text-slate-700 text-lg italic mb-6">"Since joining EcoTrade, we've increased our scrap recovery returns by over 30%. The live bidding model gets us the fairest market prices."</p>
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">RJ</div>
                 <div>
                   <h4 className="font-bold text-slate-900">Rajesh Jindal</h4>
                   <p className="text-sm text-slate-500">Operation Head, Jindal Motors</p>
                 </div>
               </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
               <div className="flex gap-1 mb-4">
                 {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
               </div>
               <p className="text-slate-700 text-lg italic mb-6">"Finding high-quality industrial scrap in bulk was always a pain. The Admin verification on this platform ensures we only buy what we actually need."</p>
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">AK</div>
                 <div>
                   <h4 className="font-bold text-slate-900">Alok Kumar</h4>
                   <p className="text-sm text-slate-500">Procurement Manager, RecyCorp</p>
                 </div>
               </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
               <div className="flex gap-1 mb-4">
                 {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
               </div>
               <p className="text-slate-700 text-lg italic mb-6">"The premium enterprise plan is absolutely worth it. Zero commission means our heavy trades save us lakhs of rupees every month. Highly recommended."</p>
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">SM</div>
                 <div>
                   <h4 className="font-bold text-slate-900">Sonia Mehta</h4>
                   <p className="text-sm text-slate-500">Director, TechEco Waste</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
