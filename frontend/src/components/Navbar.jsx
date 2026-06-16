import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiPackage, FiLogOut, FiShield } from 'react-icons/fi';
import VOGLogo from './VOGLogo';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3">
            <VOGLogo size={42} />
            <span className="text-lg font-extrabold text-gray-900">VOG<span className="text-primary-600"> Company Limited</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Home</Link>
            <Link to="/products" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Shop</Link>
            <Link to="/colors" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Colors</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative text-gray-600 hover:text-primary-600 transition-colors">
              <FiShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-primary-200" />
                  ) : (
                    <FiUser className="w-6 h-6" />
                  )}
                  <span className="hidden md:block text-sm font-medium">{user.name?.split(' ')[0]}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fadeIn" onMouseLeave={() => setDropdownOpen(false)}>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                      <FiUser className="w-4 h-4" /> Profile
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                      <FiPackage className="w-4 h-4" /> My Orders
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                        <FiShield className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={() => { logout(); setDropdownOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full">
                      <FiLogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4">Sign In</Link>
            )}

            <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fadeIn">
            <Link to="/" className="block py-2 text-gray-600 font-medium" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/products" className="block py-2 text-gray-600 font-medium" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link to="/colors" className="block py-2 text-gray-600 font-medium" onClick={() => setMenuOpen(false)}>Colors</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
