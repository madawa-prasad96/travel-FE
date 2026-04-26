import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Plane } from 'lucide-react';
import { cn } from '../utils/cn';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/about' },
    { label: 'Reserve a Vehicle', to: '/reserve' },
    { label: 'Gallery', to: '/gallery' },
    { label: 'Contact Us', to: '/contact' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-amber-400 p-2 rounded-lg transform group-hover:rotate-12 transition-transform">
              <Plane className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              BeeTravel
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'text-gray-600 hover:text-amber-500 font-medium transition-colors text-sm',
                  isActive(to) && 'text-amber-600 font-bold'
                )}
              >
                {label}
              </Link>
            ))}

            {/* Plan a Tour CTA */}
            <Link
              to="/plan"
              className={cn(
                'px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-semibold shadow-lg shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 text-sm whitespace-nowrap',
                isActive('/plan') && 'bg-amber-600'
              )}
            >
              Plan a Tour
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-1 shadow-lg">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'block px-4 py-2 rounded-lg hover:bg-amber-50 text-gray-700 hover:text-amber-600 font-medium transition-colors',
                isActive(to) && 'bg-amber-50 text-amber-600'
              )}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t">
            <Link
              to="/plan"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-center transition-colors"
            >
              Plan a Tour
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
