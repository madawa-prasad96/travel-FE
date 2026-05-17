import { Link } from 'react-router-dom';
import { Plane, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-amber-400 p-2 rounded-lg transform group-hover:rotate-12 transition-transform">
                <Plane className="w-6 h-6 text-white fill-current" />
              </div>
              <span className="text-2xl font-bold text-white">
                BeeTravel
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Your premium travel companion for exploring the hidden gems and breathtaking landscapes. Experience the world with comfort and style.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-amber-400 hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-amber-400 hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-amber-400 hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { label: 'Home', to: '/' },
                { label: 'About Us', to: '/about' },
                { label: 'Reserve a Vehicle', to: '/reserve' },
                { label: 'Gallery', to: '/gallery' },
                { label: 'Contact Us', to: '/contact' }
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.to}
                    className="text-sm hover:text-amber-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-sm text-gray-400">+1 (234) 567-890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-sm text-gray-400">hello@beetravel.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Newsletter</h3>
            <p className="text-sm text-gray-400 mb-4">Subscribe to get latest travel updates and offers.</p>
            <form className="space-y-3">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
              <button className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-amber-500/20 text-sm">
                Subscribe Now
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} BeeTravel. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-amber-400">Privacy Policy</a>
            <a href="#" className="hover:text-amber-400">Terms of Service</a>
            <a href="#" className="hover:text-amber-400">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
