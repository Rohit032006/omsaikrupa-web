import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, Shield, Clock, MapPin, 
  Calendar as CalendarIcon, Users, CheckCircle, 
  ThumbsUp, Star, Plane, Sparkles, ArrowRight
} from 'lucide-react';
import { VehicleIcon } from '../../components/VehicleIcon';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  // const setBookingSearch = useBookingStore(state => state.setBookingSearch);
  const [activeTab, setActiveTab] = useState<'airport-pickup' | 'airport-drop' | 'local' | 'outstation'>('airport-pickup');
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [passengers, setPassengers] = useState('2');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // setBookingSearch({ type: activeTab, pickup, drop, date, time, passengers });
    navigate('/search-vehicles');
  };

  const tabs = [
    { id: 'airport-pickup', label: 'Airport Pickup' },
    { id: 'airport-drop', label: 'Airport Drop' },
    { id: 'local', label: 'Local Trip' },
    { id: 'outstation', label: 'Outstation' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 to-red-600 pt-20 pb-32 px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="max-w-4xl mx-auto pt-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Book Your Ride with Om Sai Travels
          </h1>
          <p className="text-xl sm:text-2xl font-medium text-orange-100 mb-12">
            Safe, comfortable and reliable vehicle booking for airport transfers and travel
          </p>
        </div>
      </section>

      {/* Booking Search Card overlapping hero */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 mb-16">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={pickup}
                  onChange={e => setPickup(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 py-2.5 px-3 focus:ring-orange-500 focus:border-orange-500" 
                  placeholder="City, Airport, etc."
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Drop Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={drop}
                  onChange={e => setDrop(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 py-2.5 px-3 focus:ring-orange-500 focus:border-orange-500" 
                  placeholder="Destination"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 py-2.5 px-3 focus:ring-orange-500 focus:border-orange-500" 
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="time" 
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 py-2.5 px-3 focus:ring-orange-500 focus:border-orange-500" 
                  required
                />
              </div>
            </div>

            <div className="relative flex flex-col justify-end">
              <button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors"
              >
                Search Vehicles
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-orange-600 bg-orange-100 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Why Om Sai Travels
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Designed for Seamless Journeys</h2>
            <p className="text-gray-500 max-w-xl mx-auto mt-2 text-sm">Safe, punctual and top-rated vehicle rental experience across Maharashtra.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'Safe & Reliable',
                desc: 'Government verified drivers and rigorously sanitised, maintained vehicles.',
                color: 'text-emerald-600',
                bg: 'bg-emerald-500/10',
                border: 'hover:border-emerald-300',
              },
              {
                icon: Plane,
                title: 'Airport Transfers',
                desc: 'Punctual door-to-door pickups and drop-offs to Pune and Mumbai international airports.',
                color: 'text-sky-600',
                bg: 'bg-sky-500/10',
                border: 'hover:border-sky-300',
              },
              {
                icon: Car,
                title: 'Multiple Capacities',
                desc: 'From 5-seater sedans to 20-seater luxury mini coaches with luggage room.',
                color: 'text-orange-600',
                bg: 'bg-orange-500/10',
                border: 'hover:border-orange-300',
              },
              {
                icon: Clock,
                title: '24/7 Dedicated Support',
                desc: 'Round-the-clock roadside assistance and real-time helpline for your trips.',
                color: 'text-purple-600',
                bg: 'bg-purple-500/10',
                border: 'hover:border-purple-300',
              },
            ].map((f, i) => {
              const IconComponent = f.icon;
              return (
                <div 
                  key={i} 
                  className={`group relative p-7 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl ${f.border} transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col justify-between`}
                >
                  <div>
                    <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-5 ${f.color} group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-sm`}>
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vehicle Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-orange-600 bg-orange-100 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Fleet Options
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Our Premium Fleet</h2>
            <p className="text-base text-gray-500 max-w-xl mx-auto">Choose the ideal seating capacity with flight-style visual seat reservation.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { cap: '5', name: 'Sedan', highlight: 'AC & Pushback', subtitle: '4 Passengers + Driver' },
              { cap: '6', name: 'SUV', highlight: 'Spacious & Boot Space', subtitle: '5 Passengers + Driver' },
              { cap: '14', name: 'Traveller', highlight: 'Luxury Pushback', subtitle: '13 Passengers + Driver' },
              { cap: '17', name: 'Traveller Large', highlight: 'Executive Comfort', subtitle: '16 Passengers + Driver' },
              { cap: '20', name: 'Mini Bus', highlight: 'Air Suspension', subtitle: '19 Passengers + Driver' }
            ].map((v, i) => (
              <div 
                key={i} 
                className="group relative bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-2xl hover:border-orange-300 transition-all duration-300 hover:-translate-y-2 flex flex-col overflow-hidden"
              >
                {/* Vehicle Showcase Header */}
                <div className="p-6 text-center flex-grow flex flex-col items-center">
                  <div className="w-full py-4 px-2 mb-4 bg-gradient-to-b from-orange-50/60 to-slate-50/80 rounded-xl border border-orange-100/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <VehicleIcon type={v.name} size="xl" />
                  </div>
                  
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold mb-2">
                    <Users className="w-3.5 h-3.5 mr-1" /> {v.cap} Seater
                  </span>

                  <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {v.name}
                  </h3>
                  <p className="text-gray-400 text-xs mt-0.5 mb-4">{v.subtitle}</p>

                  <div className="w-full pt-3 border-t border-gray-100 mt-auto">
                    <p className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold">Features</p>
                    <p className="text-sm font-extrabold text-orange-600 tracking-tight">{v.highlight}</p>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/vehicles')}
                  className="w-full py-3.5 bg-gray-50 group-hover:bg-orange-600 text-gray-700 group-hover:text-white font-bold text-xs uppercase tracking-wider border-t border-gray-100 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>View & Book</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Simple and hassle-free booking process</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line for md screens */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-orange-100 -translate-y-1/2 z-0"></div>
            
            <div className="relative z-10 bg-white p-6 text-center rounded-xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 border-4 border-white shadow-md">1</div>
              <h3 className="text-xl font-bold mb-2">Search</h3>
              <p className="text-gray-600">Enter your pickup and drop locations, date and time.</p>
            </div>
            
            <div className="relative z-10 bg-white p-6 text-center rounded-xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 border-4 border-white shadow-md">2</div>
              <h3 className="text-xl font-bold mb-2">Select</h3>
              <p className="text-gray-600">Choose from our wide range of vehicles that suits your needs.</p>
            </div>
            
            <div className="relative z-10 bg-white p-6 text-center rounded-xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 border-4 border-white shadow-md">3</div>
              <h3 className="text-xl font-bold mb-2">Book</h3>
              <p className="text-gray-600">Confirm your booking and get instant confirmation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us / Stats */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-lg text-gray-400">We are committed to providing the best travel experience</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex justify-center mb-4"><ThumbsUp className="w-10 h-10 text-orange-500" /></div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-gray-400">Happy Customers</div>
            </div>
            <div>
              <div className="flex justify-center mb-4"><Car className="w-10 h-10 text-orange-500" /></div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-gray-400">Vehicles</div>
            </div>
            <div>
              <div className="flex justify-center mb-4"><Clock className="w-10 h-10 text-orange-500" /></div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
            <div>
              <div className="flex justify-center mb-4"><Shield className="w-10 h-10 text-orange-500" /></div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-gray-400">Safe</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready for your journey?</h2>
          <p className="text-xl text-orange-100 mb-8">Book your transfer now and enjoy a comfortable ride with Om Sai Travels.</p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-white text-orange-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-full text-lg shadow-lg transition-transform hover:scale-105"
          >
            Book Your Transfer Now →
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
