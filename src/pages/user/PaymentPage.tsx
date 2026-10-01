import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { Wallet, Landmark, CreditCard, CheckCircle, Info, QrCode as QrIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentApi, settingsApi, bookingApi } from '../../services/api';

type PaymentMethod = 'UPI' | 'CASH' | 'BANK_TRANSFER' | 'CARD';

export const PaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [upiId, setUpiId] = useState('8080959502@kotakbank');
  const [merchantName, setMerchantName] = useState('Om Sai Krupa');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real booking & settings on mount
  useEffect(() => {
    let active = true;

    const initData = async () => {
      if (!bookingId) return;
      try {
        setLoading(true);
        const [bookingRes, settingsRes] = await Promise.all([
          bookingApi.getById(bookingId).catch(() => ({ data: null })),
          settingsApi.get().catch(() => ({ data: {} })),
        ]);

        const b = bookingRes.data;
        const s = settingsRes.data || {};

        if (active) {
          setBooking(b);
          const curUpi = s.upiId || '8080959502@kotakbank';
          const curMerchant = s.merchantName || 'Om Sai Krupa';
          setUpiId(curUpi);
          setMerchantName(curMerchant);

          const payable = b ? (b.remainingAmount > 0 ? b.remainingAmount : b.totalAmount) : 1200;
          setAmountPaid(payable.toString());

          // Generate dynamic UPI QR
          const bookingRef = b?.bookingId || bookingId;
          const upiString = `upi://pay?pa=${curUpi}&pn=${encodeURIComponent(curMerchant)}&am=${payable}&cu=INR&tn=${bookingRef}`;
          const qrData = await QRCode.toDataURL(upiString, {
            width: 280,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
          });
          setQrCodeUrl(qrData);
        }
      } catch (err) {
        console.error('Failed to load payment details:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    initData();

    return () => {
      active = false;
    };
  }, [bookingId]);

  // Re-generate QR if amount changes
  useEffect(() => {
    if (!upiId || !bookingId) return;
    const numAmount = parseFloat(amountPaid) || 100;
    const bookingRef = booking?.bookingId || bookingId;
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${numAmount}&cu=INR&tn=${bookingRef}`;
    QRCode.toDataURL(upiString, {
      width: 280,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    }).then(url => setQrCodeUrl(url)).catch(console.error);
  }, [amountPaid, upiId, merchantName, bookingId, booking]);

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;

    const numAmount = parseFloat(amountPaid);
    if (!numAmount || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (method === 'UPI' && !transactionId.trim()) {
      toast.error('Please enter the UTR or Transaction ID from your UPI app');
      return;
    }

    try {
      setIsSubmitting(true);
      await paymentApi.submit({
        bookingId,
        method,
        utrNumber: transactionId.trim() || `OFFLINE-${Date.now()}`,
        transactionId: transactionId.trim(),
        amount: numAmount,
        paymentDate: new Date().toISOString().split('T')[0],
      });
      toast.success('Payment submitted! Awaiting admin verification.');
      navigate(`/booking-confirmation/${bookingId}`);
    } catch (error: any) {
      console.error('Payment submission failed', error);
      toast.error(error?.response?.data?.error || 'Failed to submit payment details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = booking?.totalAmount || 1200;
  const remainingAmount = booking?.remainingAmount !== undefined ? booking.remainingAmount : totalAmount;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Details</h1>
        <p className="text-gray-600 text-sm">
          Booking Reference: <span className="font-extrabold text-orange-600">{booking?.bookingId || bookingId}</span>
        </p>
      </div>

      {/* Booking Summary Compact */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount Payable</p>
          <p className="text-3xl font-black text-gray-900 mt-1">₹{remainingAmount.toLocaleString('en-IN')}</p>
          {remainingAmount < totalAmount && (
            <p className="text-xs text-green-700 font-semibold mt-1">
              (₹{(totalAmount - remainingAmount).toLocaleString('en-IN')} already paid of total ₹{totalAmount.toLocaleString('en-IN')})
            </p>
          )}
        </div>
        <div className="text-left sm:text-right">
          <p className="font-bold text-gray-900 text-base">{booking?.vehicleName || 'Vehicle'} • {booking?.seats?.length || 1} Seat(s)</p>
          <p className="text-xs text-gray-500 mt-0.5">Advance & partial payments accepted.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Payment Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto bg-gray-50/50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setMethod('UPI')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              method === 'UPI' ? 'bg-white text-orange-600 shadow-sm border border-orange-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <QrIcon className="w-4 h-4 text-orange-600" /> UPI / QR Code
          </button>
          <button
            type="button"
            onClick={() => setMethod('CASH')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              method === 'CASH' ? 'bg-white text-orange-600 shadow-sm border border-orange-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-600" /> Cash at Office
          </button>
          <button
            type="button"
            onClick={() => setMethod('BANK_TRANSFER')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              method === 'BANK_TRANSFER' ? 'bg-white text-orange-600 shadow-sm border border-orange-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Landmark className="w-4 h-4 text-blue-600" /> Bank Transfer
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {method === 'UPI' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* QR Code Left Column */}
              <div className="flex flex-col items-center justify-center p-6 bg-orange-50/40 rounded-2xl border border-orange-100/60">
                <h3 className="font-bold text-gray-900 mb-1">Scan & Pay via UPI</h3>
                <p className="text-xs text-gray-500 mb-4 text-center">
                  Scan this QR code with any UPI App (GPay, PhonePe, Paytm, BHIM)
                </p>

                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 mb-4">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="UPI QR Code" className="w-56 h-56 object-contain rounded-xl" />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-xs text-gray-400">
                      Generating QR...
                    </div>
                  )}
                </div>

                <div className="text-center space-y-1">
                  <p className="text-xs font-mono font-bold text-gray-800 bg-white px-3 py-1.5 rounded-lg border border-gray-200 inline-block">
                    UPI ID: {upiId}
                  </p>
                  <p className="text-[11px] text-gray-500 font-semibold">{merchantName}</p>
                </div>

                {/* UPI logos placeholder */}
                <div className="flex items-center gap-2 mt-4 text-[11px] font-bold text-gray-600">
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded">GPay</span>
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded">PhonePe</span>
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded">Paytm</span>
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded">BHIM</span>
                </div>
              </div>

              {/* Transaction Form Right Column */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Enter Transaction Details</h3>
                <p className="text-xs text-gray-500 mb-6">
                  After paying in your UPI app, enter the 12-digit UTR or Transaction ID here to confirm your booking.
                </p>

                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      UTR / Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 301234567890 or 8080959502"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Found in payment receipt in GPay / PhonePe / Paytm.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Amount Paid (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      min="1"
                      className="w-full px-4 py-2.5 text-xs font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {parseFloat(amountPaid) < remainingAmount && (
                      <p className="mt-1 text-[11px] text-orange-700 font-semibold flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        Partial payment recorded. Remaining ₹{(remainingAmount - (parseFloat(amountPaid) || 0)).toLocaleString('en-IN')} can be paid later.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50 text-gray-700"
                      readOnly
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !transactionId.trim()}
                    className="w-full mt-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isSubmitting ? 'Confirming Payment...' : 'Confirm Payment'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {method === 'CASH' && (
            <div className="max-w-md mx-auto py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Wallet className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Pay Cash at Om Sai Krupa Office</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                You can visit our booking office in Pune or pay directly to the driver before the start of the trip.
              </p>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-left text-xs space-y-1">
                <p className="font-bold text-gray-900">Office Helpline: +91 8080959502</p>
                <p className="text-gray-500">Email: omsaikrupa@gmail.com</p>
                <p className="text-gray-500">Address: Pune, Maharashtra, India</p>
              </div>
              <form onSubmit={handleSubmitPayment}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Cash on Pickup'}
                </button>
              </form>
            </div>
          )}

          {method === 'BANK_TRANSFER' && (
            <div className="max-w-md mx-auto py-6 space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Landmark className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Bank NEFT / IMPS Transfer</h3>
                <p className="text-xs text-gray-500">Transfer directly to our current account.</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">Beneficiary:</span><span className="font-bold text-gray-900">Om Sai Krupa Tours</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Bank Name:</span><span className="font-bold text-gray-900">Kotak Mahindra Bank</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Account Number:</span><span className="font-mono font-bold text-gray-900">8080959502</span></div>
                <div className="flex justify-between"><span className="text-gray-500">IFSC Code:</span><span className="font-mono font-bold text-gray-900">KKBK0000001</span></div>
                <div className="flex justify-between"><span className="text-gray-500">UPI ID:</span><span className="font-mono font-bold text-orange-600">8080959502@kotakbank</span></div>
              </div>

              <form onSubmit={handleSubmitPayment} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Bank Reference Number / UTR *</label>
                  <input
                    required
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter IMPS/NEFT ref"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !transactionId.trim()}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Bank Transfer Details'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
