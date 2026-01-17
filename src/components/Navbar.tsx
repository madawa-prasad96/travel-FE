import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Assuming react-router-dom will be set up
import { Menu, X, Plane } from 'lucide-react';
import { cn } from '../utils/cn';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={cn("text-gray-600 hover:text-amber-500 font-medium transition-colors", isActive('/') && "text-amber-600 font-bold")}
            >
              Home
            </Link>
            <Link 
              to="/plan" 
              className={cn("text-gray-600 hover:text-amber-500 font-medium transition-colors", isActive('/plan') && "text-amber-600 font-bold")}
            >
              Plan a Tour
            </Link>
            <Link 
              to="/about" 
              className={cn("text-gray-600 hover:text-amber-500 font-medium transition-colors", isActive('/about') && "text-amber-600 font-bold")}
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className={cn("text-gray-600 hover:text-amber-500 font-medium transition-colors", isActive('/contact') && "text-amber-600 font-bold")}
            >
              Contact Us
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
             <button className="px-4 py-2 text-gray-600 hover:text-amber-600 font-medium transition-colors">
               Log In
             </button>
             <button className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-semibold shadow-lg shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
               Register
             </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-2 shadow-lg animate-in slide-in-from-top-5">
           <Link to="/" className="block px-4 py-2 rounded-lg hover:bg-amber-50 text-gray-700 hover:text-amber-600 font-medium">Home</Link>
           <Link to="/plan" className="block px-4 py-2 rounded-lg hover:bg-amber-50 text-gray-700 hover:text-amber-600 font-medium">Plan a Tour</Link>
           <Link to="/about" className="block px-4 py-2 rounded-lg hover:bg-amber-50 text-gray-700 hover:text-amber-600 font-medium">About Us</Link>
           <Link to="/contact" className="block px-4 py-2 rounded-lg hover:bg-amber-50 text-gray-700 hover:text-amber-600 font-medium">Contact Us</Link>
           <div className="pt-4 border-t grid gap-2">
              <button className="w-full py-2 border border-gray-200 rounded-lg text-gray-600 font-medium">Log In</button>
              <button className="w-full py-2 bg-amber-500 text-white rounded-lg font-medium">Register</button>
           </div>
        </div>
      )}
    </nav>
  );
};
