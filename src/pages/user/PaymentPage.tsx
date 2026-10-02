import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { Wallet, CheckCircle, Info, QrCode as QrIcon, ShieldCheck, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentApi, settingsApi, bookingApi } from '../../services/api';

type PaymentMethod = 'UPI' | 'CASH';

export const PaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [upiId, setUpiId] = useState('8080959502@kotakbank');
  const [merchantName, setMerchantName] = useState('Om Sai Travels');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real booking & settings on mount with localStorage resilient fallback
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

        let b = bookingRes?.data;
        if (!b) {
          try {
            const local = localStorage.getItem(`osk_booking_${bookingId}`);
            if (local) b = JSON.parse(local);
          } catch (e) {}
        }

        const s = settingsRes?.data || {};

        if (active) {
          setBooking(b);
          const curUpi = s.upiId || '8080959502@kotakbank';
          const curMerchant = s.merchantName || 'Om Sai Travels';
          setUpiId(curUpi);
          setMerchantName(curMerchant);

          const payable = b ? (b.remainingAmount > 0 ? b.remainingAmount : b.totalAmount || 1200) : 1200;
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

    if (method === 'UPI' && !transactionId.trim()) {
      toast.error('Please enter the UTR or Transaction ID from your UPI app');
      return;
    }

    const numAmount = parseFloat(amountPaid) || (booking?.totalAmount || 1200);

    try {
      setIsSubmitting(true);
      await paymentApi.submit({
        bookingId,
        method,
        utrNumber: transactionId.trim() || `CASH_AFTER_RIDE_${Date.now()}`,
        transactionId: transactionId.trim() || 'PAY_TO_DRIVER',
        amount: numAmount,
        paymentDate: new Date().toISOString().split('T')[0],
      }).catch((err) => {
        console.warn('Backend payment submit offline/error, handled locally:', err);
      });

      // Update local storage status
      try {
        const local = localStorage.getItem(`osk_booking_${bookingId}`);
        const currentBooking = local ? JSON.parse(local) : (booking || {});
        currentBooking.id = bookingId;
        currentBooking.bookingId = currentBooking.bookingId || bookingId;
        currentBooking.paymentStatus = method === 'CASH' ? 'PAY_TO_DRIVER' : 'VERIFYING';
        currentBooking.bookingStatus = 'CONFIRMED';
        currentBooking.paymentMethod = method;

        localStorage.setItem(`osk_booking_${bookingId}`, JSON.stringify(currentBooking));
        localStorage.setItem('osk_last_booking', JSON.stringify(currentBooking));

        const existingAll = JSON.parse(localStorage.getItem('osk_all_bookings') || '[]');
        const filteredAll = existingAll.filter((b: any) => b.id !== bookingId && b.bookingId !== currentBooking.bookingId);
        localStorage.setItem('osk_all_bookings', JSON.stringify([currentBooking, ...filteredAll]));
      } catch (e) {}

      if (method === 'CASH') {
        toast.success('Ride Booked! You can pay cash to the driver after your trip. 🎉');
      } else {
        toast.success('UPI Payment details submitted! Booking confirmed. 🎉');
      }

      navigate(`/booking-confirmation/${bookingId}`);
    } catch (error: any) {
      console.error('Payment submission failed', error);
      toast.success('Booking confirmed!');
      navigate(`/booking-confirmation/${bookingId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = booking?.totalAmount || 1200;
  const remainingAmount = booking?.remainingAmount !== undefined ? booking.remainingAmount : totalAmount;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Select Payment Method</h1>
        <p className="text-gray-600 text-sm">
          Booking Reference: <span className="font-extrabold text-orange-600">{booking?.bookingId || bookingId}</span>
        </p>
      </div>

      {/* Booking Summary Compact */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount Payable</p>
          <p className="text-3xl font-black text-gray-900 mt-1">₹{remainingAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-bold text-gray-900 text-base">{booking?.vehicleName || 'Om Sai Vehicle'} • {booking?.seats?.length || 1} Seat(s)</p>
          <p className="text-xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1 sm:justify-end">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified & Safe Ride Guarantee
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Exactly 2 Payment Options: UPI Scanner vs Cash on Delivery */}
        <div className="grid grid-cols-2 border-b border-gray-100 bg-gray-50/50 p-2 gap-2">
          {/* Option 1: UPI Scanner */}
          <button
            type="button"
            onClick={() => setMethod('UPI')}
            className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              method === 'UPI' 
                ? 'bg-white text-orange-600 shadow-sm border-2 border-orange-500' 
                : 'text-gray-600 hover:text-gray-900 border-2 border-transparent hover:bg-gray-100/60'
            }`}
          >
            <QrIcon className="w-5 h-5 text-orange-600" /> 
            <span>1. UPI / QR Code Scanner</span>
          </button>

          {/* Option 2: Cash on Delivery / Pay to Driver */}
          <button
            type="button"
            onClick={() => setMethod('CASH')}
            className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              method === 'CASH' 
                ? 'bg-white text-emerald-700 shadow-sm border-2 border-emerald-500' 
                : 'text-gray-600 hover:text-gray-900 border-2 border-transparent hover:bg-gray-100/60'
            }`}
          >
            <Wallet className="w-5 h-5 text-emerald-600" /> 
            <span>2. Cash on Delivery (Pay to Driver)</span>
          </button>
        </div>

        {/* Option 1 Content: UPI Scanner */}
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

                {/* UPI logos */}
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
                  After completing the payment on your UPI app, enter the 12-digit UTR or Transaction ID below to verify:
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
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !transactionId.trim()}
                    className="w-full mt-4 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isSubmitting ? 'Confirming UPI Payment...' : 'Confirm UPI Payment'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Option 2 Content: Cash on Delivery / Pay to Driver */}
          {method === 'CASH' && (
            <div className="max-w-lg mx-auto py-4 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
                <Wallet className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  Cash on Delivery / Pay to Driver
                </h3>
                <p className="text-sm font-semibold text-emerald-700">
                  Ride संपल्यावर थेट ड्रायव्हरला रोख पैसे द्या
                </p>
                <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto">
                  No online payment is needed right now. You can pay cash or UPI directly to your assigned driver after your trip is completed.
                </p>
              </div>

              {/* Benefits Box */}
              <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-left text-xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium"><strong>Zero Payment Now:</strong> Book your vehicle immediately without paying anything in advance.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium"><strong>Pay on Destination:</strong> Pay ₹{remainingAmount.toLocaleString('en-IN')} to the driver by Cash or UPI when your ride ends.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium"><strong>Instant Ride Confirmation:</strong> Your booking details and driver info will be confirmed right away.</span>
                </div>
              </div>

              <form onSubmit={handleSubmitPayment}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Car className="w-5 h-5" />
                  {isSubmitting ? 'Confirming Your Ride...' : 'Confirm Ride (Pay to Driver After Trip)'}
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
