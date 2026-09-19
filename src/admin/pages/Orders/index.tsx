/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore';
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  CheckCircle2, 
  Truck, 
  XCircle,
  Clock,
  ChevronRight,
  Filter
} from 'lucide-react';
import { db } from '../../../services/firebase/config';
import { Order, OrderStatus } from '../../../types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Order));
    } catch (error) {
      toast.error('Orders fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: Date.now()
      });
      toast.success('Order status updated!');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      toast.error('Status update failed');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.mobileNumber.includes(searchQuery);
    
    const matchesFilter = filterStatus === 'all' || o.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-amber-100 text-amber-600';
      case OrderStatus.CONFIRMED: return 'bg-blue-100 text-blue-600';
      case OrderStatus.PROCESSING: return 'bg-purple-100 text-purple-600';
      case OrderStatus.SHIPPED: return 'bg-indigo-100 text-indigo-600';
      case OrderStatus.DELIVERED: return 'bg-green-100 text-green-600';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <p className="text-gray-500">Track and manage customer orders</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-4 md:p-10">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search by ID, name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <Filter className="w-5 h-5 text-gray-400" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 md:w-48 h-12 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Status</option>
              {Object.values(OrderStatus).map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-gray-800 pb-4">
                <th className="pb-4">Order ID</th>
                <th className="pb-4">Customer</th>
                <th className="pb-4">Date</th>
                <th className="pb-4">Total</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-6 font-bold text-gray-900 dark:text-white">#{o.orderNumber}</td>
                  <td className="py-6">
                    <p className="font-bold text-gray-900 dark:text-white">{o.customerName}</p>
                    <p className="text-xs text-gray-500">{o.mobileNumber}</p>
                  </td>
                  <td className="py-6 text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-6 font-bold text-gray-900 dark:text-white">৳{o.total.toLocaleString()}</td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-6 text-right">
                    <button 
                      onClick={() => setSelectedOrder(o)}
                      className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Order Details</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">ID: #{selectedOrder.orderNumber}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <XCircle className="w-8 h-8" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Customer & Shipping */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Order Status Management</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.values(OrderStatus).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                              selectedOrder.status === status 
                                ? getStatusColor(status) + ' border-transparent'
                                : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-4">Shipping Information</h4>
                      <div className="space-y-3 text-sm">
                        <p className="flex justify-between">
                          <span className="text-gray-400">Name:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedOrder.customerName}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-400">Phone:</span>
                          <span className="font-bold text-blue-600">{selectedOrder.mobileNumber}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-400">Address:</span>
                          <span className="font-bold text-gray-900 dark:text-white text-right ml-4">
                            {selectedOrder.address}, {selectedOrder.area}, {selectedOrder.district}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center space-x-2">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Ordered Items</span>
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-50 dark:border-gray-800">
                          <img src={item.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                          <div className="ml-4 flex-1">
                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-500">৳{item.price.toLocaleString()} x {item.quantity}</p>
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white ml-4">৳{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-8 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm opacity-80">
                          <span>Subtotal</span>
                          <span>৳{selectedOrder.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm opacity-80">
                          <span>Delivery</span>
                          <span>৳{selectedOrder.shippingCost.toLocaleString()}</span>
                        </div>
                        <div className="pt-3 border-t border-white/20 flex justify-between">
                          <span className="font-bold">Total Amount</span>
                          <span className="text-2xl font-black">৳{selectedOrder.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
