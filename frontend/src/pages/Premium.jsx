import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  ShieldCheck,
  Zap,
  X,
  CreditCard,
  Lock,
  Copy,
  Sparkles,
} from 'lucide-react';
import useStore from '../store/useStore';
import axios from 'axios';
import { isKycVerified } from '../components/KycAccountGate';

/** Demo-only credentials — no real charges. */
const DEMO_CREDENTIALS = {
  cardName: 'Demo Customer',
  cardNumber: '4242424242424242',
  expiry: '12/30',
  cvv: '123',
};

const formatCardInput = (raw) => {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

const Premium = () => {
  const { user, setUser } = useStore();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paying, setPaying] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const openPaymentModal = () => {
    if (!user) {
      alert('Please login to subscribe!');
      navigate('/login');
      return;
    }
    if (user.isPremium) {
      alert('You already have Enterprise Pro.');
      return;
    }
    if (!isKycVerified(user)) {
      alert('Complete KYC verification (admin approval) before upgrading to Premium.');
      return;
    }
    setCardName('');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setShowPaymentModal(true);
  };

  const fillDemoCredentials = () => {
    setCardName(DEMO_CREDENTIALS.cardName);
    setCardNumber(formatCardInput(DEMO_CREDENTIALS.cardNumber));
    setExpiry(DEMO_CREDENTIALS.expiry);
    setCvv(DEMO_CREDENTIALS.cvv);
  };

  const copyDemoHint = () => {
    const text = `Name: ${DEMO_CREDENTIALS.cardName}\nCard: ${DEMO_CREDENTIALS.cardNumber}\nExpiry: ${DEMO_CREDENTIALS.expiry}\nCVV: ${DEMO_CREDENTIALS.cvv}`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const handlePay = async (e) => {
    e.preventDefault();
    const digits = cardNumber.replace(/\s/g, '');
    if (!cardName.trim() || digits.length !== 16 || !expiry.trim() || cvv.length < 3) {
      alert('Please fill all payment fields (use the demo values or your test data).');
      return;
    }

    setPaying(true);
    await new Promise((r) => setTimeout(r, 1400));

    try {
      const res = await axios.put(`http://localhost:5000/api/users/${user.id}/premium`);
      setUser(res.data.user);
      setShowPaymentModal(false);
      alert('Payment successful! Enterprise Pro is now active.');
      navigate(`/dashboard/${user.role}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not complete upgrade. Try again.');
    } finally {
      setPaying(false);
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
        {user && !isKycVerified(user) && (
          <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-950 text-left max-w-xl mx-auto">
            <strong className="font-semibold">KYC pending.</strong> Premium checkout unlocks after an admin approves your account from the admin panel.
          </div>
        )}
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
            <li className="flex items-center gap-3 text-slate-600"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> Basic Listings (up to 5/month)</li>
            <li className="flex items-center gap-3 text-slate-600"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> Standard Bidding</li>
            <li className="flex items-center gap-3 text-slate-600"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> 5% Commission fee</li>
          </ul>
          <button type="button" className="w-full py-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
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
            <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="w-5 h-5 text-amber-500 shrink-0" /> <span className="text-white font-medium">Verified Badge</span> on profile</li>
            <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="w-5 h-5 text-amber-500 shrink-0" /> Unlimited Listings</li>
            <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="w-5 h-5 text-amber-500 shrink-0" /> Priority in search results</li>
            <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="w-5 h-5 text-amber-500 shrink-0" /> 0% Commission fee</li>
            <li className="flex items-center gap-3 text-slate-300"><Zap className="w-5 h-5 text-amber-500 shrink-0" /> Instant SMS Alerts for bids</li>
          </ul>
          <button
            type="button"
            onClick={openPaymentModal}
            disabled={user?.isPremium || !!(user && !isKycVerified(user))}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {user?.isPremium ? 'Current Plan' : user && !isKycVerified(user) ? 'Complete KYC first' : 'Upgrade Now'}
          </button>
          <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
            Includes verified profile badge, unlimited monthly listings, buyer-side priority ranking, 0% platform fee on your accepted sales, and bid SMS to your listing number (configure Twilio on the server for real texts; otherwise the backend logs a demo message).
          </p>
        </div>
      </div>

      {showPaymentModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-payment-title"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200 relative">
            <button
              type="button"
              onClick={() => !paying && setShowPaymentModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 pt-10">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                Demo payment gateway
              </div>
              <h2 id="demo-payment-title" className="text-2xl font-extrabold text-slate-900 mb-1">
                Enterprise Pro
              </h2>
              <p className="text-slate-500 text-sm mb-6">Test checkout — no real money is charged.</p>

              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-6">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">Suggested demo credentials</p>
                <ul className="text-sm text-amber-950 space-y-1 font-mono">
                  <li><span className="text-amber-700 font-sans font-medium">Name:</span> {DEMO_CREDENTIALS.cardName}</li>
                  <li><span className="text-amber-700 font-sans font-medium">Card:</span> 4242 4242 4242 4242</li>
                  <li><span className="text-amber-700 font-sans font-medium">Expiry:</span> {DEMO_CREDENTIALS.expiry}</li>
                  <li><span className="text-amber-700 font-sans font-medium">CVV:</span> {DEMO_CREDENTIALS.cvv}</li>
                </ul>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="text-xs font-bold bg-amber-500 text-white px-3 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    Fill form with demo values
                  </button>
                  <button
                    type="button"
                    onClick={copyDemoHint}
                    className="text-xs font-bold bg-white text-amber-800 border border-amber-300 px-3 py-2 rounded-lg hover:bg-amber-100/80 transition-colors inline-flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-900 text-white mb-6">
                <span className="text-slate-300 text-sm font-medium">Total due</span>
                <span className="text-xl font-extrabold">₹999</span>
              </div>

              <form onSubmit={handlePay} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Name on card</label>
                  <input
                    type="text"
                    autoComplete="cc-name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder="As shown on card"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    Card number
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono tracking-wide"
                    placeholder="4242 4242 4242 4242"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Expiry</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value.replace(/[^\d/]/g, '').slice(0, 5))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      CVV
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono"
                      placeholder="123"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={paying}
                  className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg disabled:opacity-70 disabled:cursor-wait mt-2"
                >
                  {paying ? 'Processing…' : 'Pay ₹999 — Activate Pro'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Premium;
