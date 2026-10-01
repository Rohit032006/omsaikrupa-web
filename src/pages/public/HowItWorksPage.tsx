import React from 'react';
import { Search, MousePointerClick, CalendarCheck, Car, ThumbsUp } from 'lucide-react';

const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      title: 'Enter Travel Details',
      description: 'Start by entering your pickup location, drop destination, date, and preferred time in our search bar.',
      icon: <Search className="w-10 h-10 text-white" />
    },
    {
      title: 'Choose a Vehicle',
      description: 'Browse our extensive fleet of sedans, SUVs, and travellers. Compare prices, capacities, and features to find your perfect match.',
      icon: <MousePointerClick className="w-10 h-10 text-white" />
    },
    {
      title: 'Confirm Booking',
      description: 'Review your trip details and confirm your booking. No advance payment required for most local trips!',
      icon: <CalendarCheck className="w-10 h-10 text-white" />
    },
    {
      title: 'Enjoy Your Ride',
      description: 'Our professional driver will arrive at your pickup location on time. Sit back, relax, and enjoy a comfortable journey.',
      icon: <Car className="w-10 h-10 text-white" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gray-900 py-16 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h1>
        <p className="text-xl max-w-2xl mx-auto px-4 text-gray-400">
          Booking a vehicle with Om Sai Krupa is easy, fast, and completely hassle-free. Follow these simple steps.
        </p>
      </div>

      {/* Steps Timeline */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-orange-100 transform md:-translate-x-1/2 hidden sm:block"></div>

          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={index} className={`relative flex flex-col sm:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Number Bubble */}
                <div className="absolute left-0 md:left-1/2 w-16 h-16 bg-orange-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center transform md:-translate-x-1/2 z-10 hidden sm:flex">
                  {step.icon}
                </div>

                {/* Mobile icon */}
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center sm:hidden mb-4 shadow-lg">
                  {step.icon}
                </div>

                {/* Content Box */}
                <div className={`w-full sm:w-[calc(100%-5rem)] md:w-[45%] ${index % 2 === 0 ? 'md:pl-8' : 'md:pr-8 text-left md:text-right'}`}>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                    <span className="text-orange-600 font-bold text-sm uppercase tracking-wider mb-2 block">Step {index + 1}</span>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-orange-50 py-16 text-center border-t border-orange-100">
        <div className="max-w-3xl mx-auto px-4">
          <ThumbsUp className="w-16 h-16 text-orange-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to book?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Experience the best in-class service with our well-maintained vehicles and professional drivers.
          </p>
          <a 
            href="/"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-md transition-colors"
          >
            Start Your Search
          </a>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
