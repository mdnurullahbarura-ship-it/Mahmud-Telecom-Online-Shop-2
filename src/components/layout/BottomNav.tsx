/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Search, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useLanguage } from '../../context/LanguageContext';

const BottomNav: React.FC = () => {
  const { getTotalItems } = useCartStore();
  const { t } = useLanguage();

  const navItems = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/categories', icon: Grid, label: t('nav.categories') },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/cart', icon: ShoppingCart, label: t('nav.cart'), badge: getTotalItems() },
    { to: '/account', icon: User, label: t('nav.account') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 safe-area-bottom shadow-[0_-4px_12px_rgba(0,0,0,0.05)] transition-colors">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `inline-flex flex-col items-center justify-center px-5 group transition-colors ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            <div className="relative">
              <item.icon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] whitespace-nowrap">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
