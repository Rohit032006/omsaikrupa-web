import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Share2, Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '../Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Logo variant="light" size="sm" />
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Premium vehicle booking service providing safe, comfortable, and reliable transportation solutions for all your travel needs.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Share2 size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Heart size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/vehicles" className="hover:text-white transition-colors">Our Fleet</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-3">
              <li><span className="hover:text-white transition-colors cursor-pointer">Airport Transfers</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Corporate Travel</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Outstation Trips</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Event Transportation</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={20} className="mr-3 text-orange-500 shrink-0 mt-1" />
                <span>123 Transport Nagar, Business District, City 400001</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-3 text-orange-500 shrink-0" />
                <span>+91 8080959502</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-3 text-orange-500 shrink-0" />
                <span>omsaikrupa@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Om Sai Krupa Vehicle Booking. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
