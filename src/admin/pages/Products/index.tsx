/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Loader2,
  X,
  Check
} from 'lucide-react';
import { db } from '../../../services/firebase/config';
import { uploadToCloudinary } from '../../../services/cloudinary';
import { Product } from '../../../types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product));
    } catch (error) {
      toast.error('Products fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(e.target.files[0]);
      setCurrentProduct(prev => ({
        ...prev,
        images: [...(prev?.images || []), url]
      }));
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    try {
      if (currentProduct.id) {
        // Update
        const productRef = doc(db, 'products', currentProduct.id);
        await updateDoc(productRef, {
          ...currentProduct,
          updatedAt: Date.now()
        });
        toast.success('Product updated!');
      } else {
        // Create
        await addDoc(collection(db, 'products'), {
          ...currentProduct,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        toast.success('Product created!');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error('Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted!');
      fetchProducts();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">পণ্য ব্যবস্থাপনা</h1>
          <p className="text-gray-500">আপনার ইনভেন্টরি এবং স্টক ম্যানেজ করুন</p>
        </div>
        <button 
          onClick={() => { setCurrentProduct({ images: [], isFeatured: false, isPopular: false, status: 'active' }); setIsModalOpen(true); }}
          className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 hover:scale-105 transition-transform flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>নতুন পণ্য যুক্ত করুন</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-4 md:p-10">
        {/* Search & Filters */}
        <div className="relative mb-10 max-w-md">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-gray-800 pb-4">
                  <th className="pb-4">পণ্য</th>
                  <th className="pb-4">ক্যাটাগরি</th>
                  <th className="pb-4">মূল্য</th>
                  <th className="pb-4">স্টক</th>
                  <th className="pb-4">স্ট্যাটাস</th>
                  <th className="pb-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-6">
                      <div className="flex items-center space-x-4">
                        <img src={p.images[0]} className="w-12 h-12 rounded-xl object-cover" alt="" />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{p.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 text-gray-500">{p.category}</td>
                    <td className="py-6 font-bold text-gray-900 dark:text-white">৳{p.price.toLocaleString()}</td>
                    <td className="py-6">
                      <span className={`font-bold ${p.stockQuantity < 5 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        p.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-6 text-right space-x-2">
                      <button 
                        onClick={() => { setCurrentProduct(p); setIsModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentProduct?.id ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Product Name</label>
                      <input
                        required
                        value={currentProduct?.name || ''}
                        onChange={(e) => setCurrentProduct(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full h-12 px-6 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="e.g. iPhone 15 Pro"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</label>
                        <select
                          required
                          value={currentProduct?.category || ''}
                          onChange={(e) => setCurrentProduct(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Select Category</option>
                          <option value="mobile">Mobile</option>
                          <option value="accessories">Accessories</option>
                          <option value="electronics">Electronics</option>
                          <option value="electric">Electric</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Brand</label>
                        <input
                          required
                          value={currentProduct?.brand || ''}
                          onChange={(e) => setCurrentProduct(prev => ({ ...prev, brand: e.target.value }))}
                          className="w-full h-12 px-6 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Price (৳)</label>
                        <input
                          type="number"
                          required
                          value={currentProduct?.price || ''}
                          onChange={(e) => setCurrentProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                          className="w-full h-12 px-6 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Stock</label>
                        <input
                          type="number"
                          required
                          value={currentProduct?.stockQuantity || ''}
                          onChange={(e) => setCurrentProduct(prev => ({ ...prev, stockQuantity: Number(e.target.value) }))}
                          className="w-full h-12 px-6 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Images & Flags */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Images</label>
                      <div className="grid grid-cols-3 gap-4">
                        {currentProduct?.images?.map((img, i) => (
                          <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-50">
                            <img src={img} className="w-full h-full object-cover" alt="" />
                            <button 
                              type="button"
                              onClick={() => setCurrentProduct(prev => ({ ...prev, images: prev?.images?.filter((_, idx) => idx !== i) }))}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                          {uploading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                          ) : (
                            <>
                              <Plus className="w-6 h-6 text-gray-400" />
                              <span className="text-[8px] font-bold text-gray-400 uppercase mt-1">Add Image</span>
                            </>
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={currentProduct?.isFeatured || false} 
                          onChange={(e) => setCurrentProduct(prev => ({ ...prev, isFeatured: e.target.checked }))}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                        />
                        <span className="text-sm font-bold text-gray-500 group-hover:text-gray-900">Featured</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={currentProduct?.isPopular || false} 
                          onChange={(e) => setCurrentProduct(prev => ({ ...prev, isPopular: e.target.checked }))}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                        />
                        <span className="text-sm font-bold text-gray-500 group-hover:text-gray-900">Popular</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Short Description</label>
                  <textarea
                    required
                    value={currentProduct?.shortDescription || ''}
                    onChange={(e) => setCurrentProduct(prev => ({ ...prev, shortDescription: e.target.value }))}
                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={2}
                  />
                </div>
              </form>

              <div className="p-8 border-t border-gray-100 dark:border-gray-800 flex justify-end space-x-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
                >
                  Save Product
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
