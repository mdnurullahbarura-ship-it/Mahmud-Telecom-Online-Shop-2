/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors pt-20 pb-24 md:pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-8 group">
              <img 
                src="/assets/aistudio/1786432871461.jpg" 
                alt="Mahmud Telecom Logo" 
                className="h-12 w-12 rounded-xl object-cover shadow-md group-hover:scale-110 transition-transform"
              />
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                মাহমুদ <span className="text-indigo-600">টেলিকম</span>
              </span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 max-w-xs">
              সেরা দামে প্রিমিয়াম মোবাইল এবং ইলেকট্রনিক্স অ্যাক্সেসরিজ পান মাহমুদ টেলিকম-এ। আমরা বিশ্বাস এবং সেবায় প্রতিশ্রুতিবদ্ধ।
            </p>
            <div className="flex space-x-3">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              {['Home', 'Products', 'Categories', 'Contact', 'About'].map((link) => (
                <li key={link}>
                  <Link to={`/${link.toLowerCase()}`} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-gray-900 dark:text-white">Legal</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/legal/privacy-policy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/legal/terms-conditions" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/legal/refund-policy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-gray-900 dark:text-white">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                <span>মাহমুদ টেলিকম, মেইন রোড, বাংলাদেশ।</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <span>+৮৮০১-৮৪৬৬৫৫২৭০</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <span>support@mahmudtelecom.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            © {new Date().getFullYear()} মাহমুদ টেলিকম। সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
