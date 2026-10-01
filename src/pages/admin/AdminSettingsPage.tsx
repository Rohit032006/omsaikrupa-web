import React, { useState, useEffect } from 'react';
import { Save, Building, CreditCard, Shield, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsApi } from '../../services/api';

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<'company' | 'payment' | 'booking'>('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [companyName, setCompanyName] = useState('Om Sai Krupa');
  const [supportPhone, setSupportPhone] = useState('+91 8080959502');
  const [supportEmail, setSupportEmail] = useState('omsaikrupa@gmail.com');
  const [companyAddress, setCompanyAddress] = useState('Pune, Maharashtra, India');
  const [upiId, setUpiId] = useState('8080959502@kotakbank');
  const [merchantName, setMerchantName] = useState('Om Sai Krupa');
  const [minBookingAdvanceHours, setMinBookingAdvanceHours] = useState(2);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsApi.getAdmin().catch(() => settingsApi.get());
      if (res.data) {
        setCompanyName(res.data.companyName || 'Om Sai Krupa');
        setSupportPhone(res.data.supportPhone || '+91 8080959502');
        setSupportEmail(res.data.supportEmail || 'omsaikrupa@gmail.com');
        setCompanyAddress(res.data.companyAddress || 'Pune, Maharashtra, India');
        setUpiId(res.data.upiId || '8080959502@kotakbank');
        setMerchantName(res.data.merchantName || 'Om Sai Krupa');
        setMinBookingAdvanceHours(res.data.minBookingAdvanceHours ?? 2);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsApi.update({
        companyName,
        supportPhone,
        supportEmail,
        companyAddress,
        upiId,
        merchantName,
        minBookingAdvanceHours: Number(minBookingAdvanceHours),
      });
      toast.success('Settings saved to database successfully!');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System & Payment Settings</h1>
        <p className="text-xs text-gray-500">Changes made here directly update the customer payment QR and support details.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden min-h-[500px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-gray-50/70 border-r border-gray-100 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('company')}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'company' ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Building className="w-4 h-4 mr-2.5" /> Company Profile
          </button>
          <button 
            onClick={() => setActiveTab('payment')}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'payment' ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CreditCard className="w-4 h-4 mr-2.5" /> UPI & Payment
          </button>
          <button 
            onClick={() => setActiveTab('booking')}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'booking' ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Shield className="w-4 h-4 mr-2.5" /> Booking Rules
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 lg:p-8">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-400">Loading settings...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {activeTab === 'company' && (
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Company Information</h2>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Company / Brand Name</label>
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500" 
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Support Phone Number</label>
                      <input 
                        type="text" 
                        value={supportPhone}
                        onChange={(e) => setSupportPhone(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Support Email</label>
                      <input 
                        type="email" 
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500" 
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Office Address</label>
                    <textarea 
                      rows={3} 
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">UPI & QR Configuration</h2>
                  
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-xs text-orange-900">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <QrCode className="w-4 h-4 text-orange-600" /> Dynamic UPI QR Code
                    </p>
                    <p>The UPI ID below will be used to generate the customer Scan & Pay QR code on the payment page.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">UPI ID (VPA) *</label>
                    <input 
                      type="text" 
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="8080959502@kotakbank"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-orange-500" 
                      required
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Accepts GPay, PhonePe, Paytm, BHIM, etc.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Merchant / Payee Name</label>
                    <input 
                      type="text" 
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      placeholder="Om Sai Krupa"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500" 
                      required
                    />
                  </div>
                </div>
              )}

              {activeTab === 'booking' && (
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Booking Operations</h2>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Minimum Advance Booking Notice (Hours)</label>
                    <input 
                      type="number" 
                      min={0}
                      value={minBookingAdvanceHours}
                      onChange={(e) => setMinBookingAdvanceHours(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500" 
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Minimum hours required before pickup time.</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-1.5" /> {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
