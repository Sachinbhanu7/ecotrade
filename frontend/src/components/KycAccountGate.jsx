import axios from 'axios';
import useStore from '../store/useStore';
import { ShieldCheck, Clock, XCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

/** Matches backend `isKycApproved`: legacy users without KYC submission stay active. */
export function isKycVerified(user) {
  if (!user || user.role === 'admin') return true;
  if (user.kycStatus === 'approved') return true;
  if (!user.kycSubmittedAt && (user.kycStatus == null || user.kycStatus === undefined)) return true;
  return false;
}

/**
 * Blocks buyer/seller dashboards until admin approves KYC.
 */
export default function KycAccountGate({ children }) {
  const { user, setUser } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  if (!user || isKycVerified(user)) {
    return children;
  }

  const refreshStatus = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${user.id}`);
      setUser(res.data.user);
    } catch {
      alert('Could not refresh. Try again shortly.');
    } finally {
      setRefreshing(false);
    }
  };

  const pending = user.kycStatus === 'pending' || !user.kycStatus;
  const rejected = user.kycStatus === 'rejected';

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-10 text-center">
        {pending && (
          <>
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-3">KYC verification in progress</h1>
            <p className="text-slate-600 leading-relaxed mb-2">
              Your account is registered and your KYC details are with our team. An admin must approve your profile before you can list scrap or place bids.
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Submitted: {user.kycSubmittedAt ? new Date(user.kycSubmittedAt).toLocaleString() : '—'}
            </p>
          </>
        )}
        {rejected && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-3">KYC not approved</h1>
            <p className="text-slate-600 leading-relaxed mb-4">
              {user.kycRejectionReason || 'Your verification could not be completed. Please contact support.'}
            </p>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch">
          <button
            type="button"
            onClick={refreshStatus}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold px-6 py-3 rounded-xl hover:bg-slate-800 disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Checking…' : 'Refresh approval status'}
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100 text-left">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            KYC on file
          </h2>
          <dl className="grid gap-2 text-sm text-slate-700">
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Phone</dt><dd className="font-medium text-right">{user.kycPhone || '—'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">ID type</dt><dd className="font-medium text-right">{user.kycIdType || '—'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">ID number</dt><dd className="font-medium text-right font-mono">{user.kycIdNumber || '—'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Address</dt><dd className="font-medium text-right max-w-xs">{user.kycAddress || '—'}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
