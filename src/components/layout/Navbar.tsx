import {
  BarChart3,
  LogOut,
  Menu,
  PieChart,
  User,
  Wallet,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className='bg-navy-700 text-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center'>
            <Link to='/' className='flex items-center'>
              <Wallet className='h-8 w-8 text-teal-500' />
              <span className='ml-2 text-xl font-semibold'>FinTrack</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className='hidden md:block'>
            <div className='flex items-center space-x-4'>
              <Link
                to='/'
                className='px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors duration-200'
              >
                Dashboard
              </Link>
              <Link
                to='/accounts'
                className='px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors duration-200'
              >
                Accounts
              </Link>
              <Link
                to='/transactions'
                className='px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors duration-200'
              >
                Transactions
              </Link>
              <Link
                to='/reports'
                className='px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors duration-200'
              >
                Reports
              </Link>
            </div>
          </div>

          <div className='hidden md:block'>
            <div className='flex items-center'>
              <div className='relative' ref={dropdownRef}>
                <div
                  className='flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors duration-200 cursor-pointer'
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <User className='h-5 w-5 mr-1' />
                  <span>{user?.username || 'User'}</span>
                </div>

                {showDropdown && (
                  <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10'>
                    <button
                      onClick={handleLogout}
                      className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                    >
                      <LogOut className='h-4 w-4 mr-2' />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <button
              onClick={toggleMenu}
              className='inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-gray-700 focus:outline-none'
            >
              {isMenuOpen ? (
                <X className='h-6 w-6' />
              ) : (
                <Menu className='h-6 w-6' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className='md:hidden'>
          <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
            <Link
              to='/'
              className='block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-white transition-colors duration-200'
              onClick={() => setIsMenuOpen(false)}
            >
              <div className='flex items-center'>
                <BarChart3 className='h-5 w-5 mr-2' />
                Dashboard
              </div>
            </Link>
            <Link
              to='/accounts'
              className='block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-white transition-colors duration-200'
              onClick={() => setIsMenuOpen(false)}
            >
              <div className='flex items-center'>
                <Wallet className='h-5 w-5 mr-2' />
                Accounts
              </div>
            </Link>
            <Link
              to='/transactions'
              className='block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-white transition-colors duration-200'
              onClick={() => setIsMenuOpen(false)}
            >
              <div className='flex items-center'>
                <BarChart3 className='h-5 w-5 mr-2' />
                Transactions
              </div>
            </Link>
            <Link
              to='/reports'
              className='block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-white transition-colors duration-200'
              onClick={() => setIsMenuOpen(false)}
            >
              <div className='flex items-center'>
                <PieChart className='h-5 w-5 mr-2' />
                Reports
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className='flex items-center w-full px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-white transition-colors duration-200'
            >
              <LogOut className='h-5 w-5 mr-2' />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
