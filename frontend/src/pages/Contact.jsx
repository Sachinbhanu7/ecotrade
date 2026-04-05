import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({ company: '', email: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });
    try {
      await axios.post('/api/contact', formData);
      setStatus({ loading: false, success: true, error: null });
      setFormData({ company: '', email: '', message: '' });
      setTimeout(() => setStatus(s => ({ ...s, success: false })), 5000);
    } catch (err) {
      setStatus({ loading: false, success: false, error: 'Failed to send message.' });
    }
  };
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-slate-900 text-center">Contact Us</h1>
      
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-12">
          
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h2>
            <p className="text-slate-600 mb-8">
              Have questions about EcoTrade or need help with a large industrial scrap transaction? Our corporate support team is here to help you.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Email</h3>
                  <p className="text-slate-600">support@ecotrade.com</p>
                  <p className="text-slate-600">b2b-deals@ecotrade.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Phone</h3>
                  <p className="text-slate-600">+91 1800-123-4567 (Toll Free)</p>
                  <p className="text-sm text-slate-500 mt-1">Mon-Fri from 9am to 6pm IST</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Corporate HQ</h3>
                  <p className="text-slate-600">EcoTrade Commodities Pvt Ltd.<br/>42, Silicon Valley Park, BKC<br/>Mumbai, Maharashtra 400051</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {status.success && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">Message sent successfully!</div>
              )}
              {status.error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">{status.error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input type="text" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Your Company Ltd" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none" placeholder="john@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea required rows="4" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none" placeholder="How can we help?"></textarea>
              </div>
              <button type="submit" disabled={status.loading} className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50">
                {status.loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Contact;
