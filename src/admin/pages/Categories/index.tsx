/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Grid, Plus, Trash2, Loader2, X } from 'lucide-react';
import { db } from '../../../services/firebase/config';
import { Category } from '../../../types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', slug: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Category));
    } catch (error) {
      toast.error('Categories fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'categories'), newCat);
      toast.success('Category added!');
      setIsModalOpen(false);
      setNewCat({ name: '', slug: '' });
      fetchCategories();
    } catch (error) {
      toast.error('Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast.success('Category deleted!');
      fetchCategories();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-gray-500">Manage product categories</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          </div>
        ) : (
          categories.map((cat) => (
            <motion.div 
              key={cat.id}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/10 text-blue-600">
                  <Grid className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{cat.slug}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(cat.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Category</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Category Name</label>
                  <input
                    required
                    value={newCat.name}
                    onChange={(e) => setNewCat(prev => ({ ...prev, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') }))}
                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g. Mobile Phones"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Slug</label>
                  <input
                    required
                    value={newCat.slug}
                    readOnly
                    className="w-full h-14 px-6 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border-none text-sm text-gray-400 italic"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Save Category
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategories;
