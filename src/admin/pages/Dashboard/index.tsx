/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { db } from '../../../services/firebase/config';
import { Order, Product, OrderStatus } from '../../../types';
import { motion } from 'motion/react';

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className="flex items-center text-xs font-bold text-green-500">
          <ArrowUpRight className="w-3 h-3 mr-1" />
          {trend}
        </span>
      )}
    </div>
    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{value}</h3>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStock: 0,
    totalCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const productsSnap = await getDocs(collection(db, 'products'));
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const usersSnap = await getDocs(collection(db, 'users'));

        const products = productsSnap.docs.map(doc => doc.data() as Product);
        const orders = ordersSnap.docs.map(doc => doc.data() as Order);

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === OrderStatus.PENDING).length,
          lowStock: products.filter(p => p.stockQuantity < 5).length,
          totalCustomers: usersSnap.size
        });

        // Recent orders
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
        const recentSnap = await getDocs(q);
        setRecentOrders(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Order));
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-500">Welcome back, Admin!</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800">
          <Clock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon={Package} 
          color="text-blue-600" 
          trend="+12%"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={ShoppingCart} 
          color="text-green-500" 
          trend="+5%"
        />
        <StatCard 
          title="Pending Orders" 
          value={stats.pendingOrders} 
          icon={TrendingUp} 
          color="text-amber-500" 
        />
        <StatCard 
          title="Low Stock" 
          value={stats.lowStock} 
          icon={AlertTriangle} 
          color="text-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-10">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-gray-800 pb-4">
                  <th className="pb-4">Order ID</th>
                  <th className="pb-4">Customer</th>
                  <th className="pb-4">Total</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-6 font-bold text-gray-900 dark:text-white">#{order.orderNumber}</td>
                    <td className="py-6">
                      <p className="font-bold text-gray-900 dark:text-white">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.mobileNumber}</p>
                    </td>
                    <td className="py-6 font-bold text-gray-900 dark:text-white">৳{order.total.toLocaleString()}</td>
                    <td className="py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        order.status === OrderStatus.PENDING ? 'bg-amber-100 text-amber-600' :
                        order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Stats */}
        <div className="space-y-10">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-10 text-white shadow-xl shadow-blue-500/20">
            <h2 className="text-xl font-bold mb-6">Quick Overview</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Store Status</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Total Revenue</span>
                <span className="font-bold text-lg">৳১২,৫০,০০০</span>
              </div>
            </div>
            <button className="w-full mt-10 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-gray-50 transition-colors">
              Manage Store Settings
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Top Categories</h2>
            <div className="space-y-4">
              {['Mobiles', 'Accessories', 'Electronics'].map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{cat}</span>
                  <div className="flex-1 mx-4 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${80 - (i * 20)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{80 - (i * 20)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
