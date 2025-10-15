import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut, Settings, Menu, X, LayoutDashboard } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { User } from '@/services';

export default function WhimsicalHeader() {
  const navigate = useNavigate();
  const { getCartCount, setIsCartOpen } = useCart();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const adminStatus = await User.isAdmin();
      setIsAdmin(adminStatus);
    } catch (error) {
      console.log('Not authenticated');
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    try {
      await User.signOut();
      setUser(null);
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const cartCount = getCartCount();

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-[#F56949] via-[#FEC37D] to-[#F56949] shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="text-5xl transition-transform group-hover:scale-110 group-hover:rotate-12">
              🥄
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-white text-shadow-sm">
                Ladle & Spoon
              </h1>
              <p className="text-sm text-white/80">Soup & Baked Goods</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className="px-6 py-2 rounded-full text-white font-medium hover:bg-[#BC5B22]/30 transition-all"
            >
              Home
            </Link>
            <Link
              to="/order"
              className="px-6 py-2 rounded-full text-white font-medium hover:bg-[#BC5B22]/30 transition-all"
            >
              Menu
            </Link>
            {user && (
              <Link
                to="/my-orders"
                className="px-6 py-2 rounded-full text-white font-medium hover:bg-[#BC5B22]/30 transition-all"
              >
                My Orders
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-12 h-12 rounded-full bg-[#F8F3F0]/30 hover:bg-[#F8F3F0]/50 flex items-center justify-center transition-all hover:scale-110"
            >
              <ShoppingCart className="w-6 h-6 text-white" />
              {cartCount > 0 && (
                <span className="cart-badge">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-12 h-12 rounded-full bg-[#F8F3F0]/30 hover:bg-[#F8F3F0]/50 flex items-center justify-center transition-all hover:scale-110"
                >
                  <UserIcon className="w-6 h-6 text-white" />
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl z-20 overflow-hidden animate-scale-in">
                      <div className="p-4 bg-gradient-to-r from-[#FEC37D] to-[#E6B85C]">
                        <p className="font-semibold text-[#8B4513] truncate">
                          {user.email}
                        </p>
                        {user.full_name && (
                          <p className="text-sm text-[#654321] truncate">{user.full_name}</p>
                        )}
                      </div>
                      <div className="py-2">
                        {isAdmin && (
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-all border-b border-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <LayoutDashboard className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-blue-600">Admin Panel</span>
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[#FEC37D]/30 transition-all"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-5 h-5 text-[#654321]" />
                          <span className="font-medium text-[#8B4513]">Settings</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F56949]/10 transition-all text-left"
                        >
                          <LogOut className="w-5 h-5 text-[#F56949]" />
                          <span className="font-medium text-[#F56949]">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:block px-6 py-2 rounded-full bg-[#F8F3F0] text-[#F56949] font-semibold hover:shadow-lg transition-all hover:scale-105"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden w-12 h-12 rounded-full bg-[#F8F3F0]/30 hover:bg-[#F8F3F0]/50 flex items-center justify-center transition-all"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden pb-4 animate-fade-in">
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                className="px-6 py-3 rounded-2xl text-white font-medium hover:bg-[#BC5B22]/30 transition-all"
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
              <Link
                to="/order"
                className="px-6 py-3 rounded-2xl text-white font-medium hover:bg-[#BC5B22]/30 transition-all"
                onClick={() => setShowMobileMenu(false)}
              >
                Menu
              </Link>
              {user && (
                <Link
                  to="/my-orders"
                  className="px-6 py-3 rounded-2xl text-white font-medium hover:bg-[#BC5B22]/30 transition-all"
                  onClick={() => setShowMobileMenu(false)}
                >
                  My Orders
                </Link>
              )}
              {!user && (
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-2xl bg-[#F8F3F0] text-[#F56949] font-semibold hover:shadow-lg transition-all text-center"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
