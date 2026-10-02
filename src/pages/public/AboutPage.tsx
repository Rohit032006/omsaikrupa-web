import React from 'react';
import { Shield, Clock, Heart, Award, Users, Car } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-orange-600 py-20 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">About Om Sai Travels</h1>
        <p className="text-xl max-w-3xl mx-auto px-4 text-orange-100">
          Your trusted partner for safe, reliable, and comfortable journeys across the region.
        </p>
      </div>

      {/* Mission Section */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2 pr-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
              At Om Sai Travels, our mission is to redefine travel by providing a seamless, stress-free transportation experience. We believe that every journey should be as comfortable and enjoyable as the destination itself.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Since our inception, we have been committed to delivering high-quality vehicle booking services, specializing in airport transfers, local sightseeing, and outstation trips. Our customer-first approach ensures that you always travel with peace of mind.
            </p>
          </div>
          <div className="lg:w-1/2 mt-10 lg:mt-0">
            <div className="bg-gray-100 p-8 rounded-2xl flex items-center justify-center text-9xl">
              🛣️
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that drive us to deliver excellence every single day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Safety First</h3>
              <p className="text-gray-600">Rigorous vehicle maintenance and verified professional drivers.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reliability</h3>
              <p className="text-gray-600">Punctual service you can count on, 24 hours a day, 7 days a week.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Comfort</h3>
              <p className="text-gray-600">Modern, clean, and spacious vehicles equipped for your comfort.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Affordability</h3>
              <p className="text-gray-600">Transparent pricing with no hidden charges or surge pricing.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          <div>
            <div className="flex justify-center mb-4"><Users className="w-12 h-12 text-gray-400" /></div>
            <div className="text-5xl font-extrabold text-gray-900 mb-2">10k+</div>
            <div className="text-lg font-medium text-gray-500">Happy Passengers</div>
          </div>
          <div>
            <div className="flex justify-center mb-4"><Car className="w-12 h-12 text-gray-400" /></div>
            <div className="text-5xl font-extrabold text-gray-900 mb-2">50+</div>
            <div className="text-lg font-medium text-gray-500">Modern Vehicles</div>
          </div>
          <div>
            <div className="flex justify-center mb-4"><Award className="w-12 h-12 text-gray-400" /></div>
            <div className="text-5xl font-extrabold text-gray-900 mb-2">5+</div>
            <div className="text-lg font-medium text-gray-500">Years of Experience</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
