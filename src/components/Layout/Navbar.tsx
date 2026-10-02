import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '../Logo';
import { useAuthStore } from '../../store/authStore';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, openLoginModal } = useAuthStore();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Vehicles', path: '/vehicles' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/80 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/">
              <Logo size="sm" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-orange-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <Link
                  to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
                >
                  My Dashboard
                </Link>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
                >
                  Log in
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 border-t border-gray-200 pt-4 px-3 space-y-2">
              {isAuthenticated ? (
                <Link
                  to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="block w-full text-center bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  My Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    openLoginModal();
                  }}
                  className="block w-full text-center bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Log in
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
