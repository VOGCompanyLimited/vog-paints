import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';
import VOGLogo from './VOGLogo';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <VOGLogo size={42} />
              <span className="text-xl font-extrabold text-white">VOG<span className="text-primary-400"> Company Limited</span></span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">Your trusted paint marketplace. Quality paints at affordable prices.</p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors"><FiFacebook className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors"><FiTwitter className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors"><FiInstagram className="w-4 h-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-primary-400 transition-colors">Shop All</Link></li>
              <li><Link to="/colors" className="hover:text-primary-400 transition-colors">Color Guide</Link></li>
              <li><Link to="/products?category=Interior%20Paint" className="hover:text-primary-400 transition-colors">Interior Paints</Link></li>
              <li><Link to="/products?category=Exterior%20Paint" className="hover:text-primary-400 transition-colors">Exterior Paints</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/orders" className="hover:text-primary-400 transition-colors">Track Order</Link></li>
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Shipping Info</Link></li>
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Returns</Link></li>
              <li><Link to="/" className="hover:text-primary-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><FiMapPin className="w-4 h-4 text-primary-400" /> Accra, Ghana</li>
              <li className="flex items-center gap-2"><FiPhone className="w-4 h-4 text-primary-400" /> +233 50 123 4567</li>
              <li className="flex items-center gap-2"><FiMail className="w-4 h-4 text-primary-400" /> info@paintmarket.gh</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">&copy; 2024 VOG Company Limited. All rights reserved. Prices in GHS.</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
