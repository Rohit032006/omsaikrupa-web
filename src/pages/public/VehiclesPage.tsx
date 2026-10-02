import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, Info, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { VehicleIcon } from '../../components/VehicleIcon';

const vehicles = [
  {
    id: 1,
    name: 'Standard Sedan',
    capacity: 5,
    type: 'Sedan',
    routeInfo: 'Airport & City Transfers',
    description: 'Perfect for small families or business trips. Comfortable seating for 4 passengers plus driver.',
    features: ['Air Conditioning', 'Music System', '2 Luggage Bags', 'GPS Navigation']
  },
  {
    id: 2,
    name: 'Premium SUV',
    capacity: 6,
    type: 'SUV',
    routeInfo: 'Outstation & Hill Stations',
    description: 'Spacious interior with extra legroom. Ideal for long journeys and outstation trips.',
    features: ['Rear AC Vents', 'Extra Legroom', '4 Luggage Bags', 'Power Windows']
  },
  {
    id: 3,
    name: 'Tempo Traveller',
    capacity: 14,
    type: 'Traveller',
    routeInfo: 'Group Tours & Family Trips',
    description: 'Great for group tours and large families. Offers push-back seats for maximum comfort.',
    features: ['Pushback Seats', 'LED TV', 'Ample Luggage Space', 'Individual AC Vents']
  },
  {
    id: 4,
    name: 'Large Traveller',
    capacity: 17,
    type: 'Traveller',
    routeInfo: 'Pilgrimage & Inter-City',
    description: 'Extended version of traveller for larger groups looking for comfortable inter-city travel.',
    features: ['Reclining Seats', 'Entertainment System', 'Reading Lights', 'Large Boot Space']
  },
  {
    id: 5,
    name: 'Mini Bus',
    capacity: 20,
    type: 'Mini Bus',
    routeInfo: 'Corporate & Wedding Events',
    description: 'The ultimate choice for corporate outings, school trips, or large wedding parties.',
    features: ['Air Suspension', 'PA System', 'Overhead Storage', 'Wide Aisle']
  }
];

const VehiclesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 py-20 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-200 bg-white/10 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-white/20">
            Exclusive Transport Fleet
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">Our Modern Fleet</h1>
          <p className="text-lg max-w-2xl mx-auto text-orange-100 font-medium">
            Discover our wide range of meticulously maintained vehicles, configured for comfort, safety, and group journeys.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <div 
              key={vehicle.id} 
              className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl border border-gray-200/80 hover:border-orange-300 transition-all duration-300 hover:-translate-y-2 flex flex-col overflow-hidden"
            >
              {/* Vehicle SVG Showcase */}
              <div className="h-52 bg-gradient-to-b from-orange-50/60 via-slate-50/80 to-white flex items-center justify-center p-6 border-b border-gray-100">
                <div className="transform group-hover:scale-110 transition-transform duration-500">
                  <VehicleIcon type={vehicle.type} size="xl" />
                </div>
              </div>
              
              <div className="p-7 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-2xl font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {vehicle.name}
                    </h2>
                    <span className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-extrabold">
                      <Users className="w-3.5 h-3.5 mr-1" />
                      {vehicle.capacity} Seater
                    </span>
                  </div>
                  
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    {vehicle.description}
                  </p>
                  
                  <div className="mb-6">
                    <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Key Features</h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {vehicle.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-xs font-medium text-gray-700">
                          <Check className="w-3.5 h-3.5 text-emerald-500 mr-1.5 flex-shrink-0" />
                          <span className="truncate">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-100">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ideal For</span>
                    <p className="text-sm font-extrabold text-orange-600 tracking-tight">{vehicle.routeInfo}</p>
                  </div>
                  <button 
                    onClick={() => navigate('/search-vehicles')}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-orange-500/25 flex items-center gap-1.5"
                  >
                    <span>Book Ride</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehiclesPage;
