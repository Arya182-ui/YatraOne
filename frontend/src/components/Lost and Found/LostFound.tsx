
import React, { useState, useCallback } from 'react';
import { lostFoundAPI } from '../../lib/api';
import { useQuery } from '@tanstack/react-query';
import { LostFoundItem } from '../../types';
import { Loader2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import app from '../../lib/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const LostFound: React.FC = () => {
  // React Query for fetching items
  const {
    data: items = [],
    isLoading: loading,
    isError,
    error
  } = useQuery<LostFoundItem[]>({
    queryKey: ['lostFoundItems'],
    queryFn: lostFoundAPI.getItems,
  });
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'lost' | 'found'>('lost');
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  // Removed commentMap, not used in table UI
  const { user } = useAuth();

  // Form state
  const [form, setForm] = useState({
    type: 'lost',
    category: '',
    itemName: '',
    description: '',
    color: '',
    brand: '',
    busId: '',
    routeId: '',
    stopId: '',
    location: '',
    images: [] as File[],
    contactInfo: { preferredMethod: 'email' as 'email' | 'phone' | 'both', email: '', phone: '', anonymous: false },
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Category options
  const categoryOptions = [
    '',
    'Electronics',
    'Clothing',
    'Bag',
    'Wallet',
    'Keys',
    'Books',
    'Jewelry',
    'Water Bottle',
    'ID Card',
    'Other',
  ];
  const [formLoading, setFormLoading] = useState(false);
  // Remove local formSuccess/formError, use toast only



  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let checked = false;
    if (type === 'checkbox') checked = (e.target as HTMLInputElement).checked;
    if (name === 'contactInfo.preferredMethod') {
      setForm(f => ({
        ...f,
        contactInfo: {
          ...f.contactInfo,
          preferredMethod: value as 'email' | 'phone' | 'both',
        },
      }));
    } else if (name.startsWith('contactInfo.')) {
      setForm(f => ({
        ...f,
        contactInfo: {
          ...f.contactInfo,
          [name.replace('contactInfo.', '')]: type === 'checkbox' ? checked : value,
        },
      }));
    } else if (name === 'images') {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        // Validate all images ≤ 5MB
        const validFiles: File[] = [];
        const previews: string[] = [];
        for (let i = 0; i < files.length; i++) {
          if (files[i].size > 5 * 1024 * 1024) {
            toast.error('Each image must be ≤ 5MB.');
            return;
          }
          validFiles.push(files[i]);
          previews.push(URL.createObjectURL(files[i]));
        }
        setForm(f => ({ ...f, images: validFiles }));
        setImagePreviews(previews);
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Debounced submit handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFormSubmit = useCallback(
    debounce(async () => {
      setFormLoading(true);
      if (!user) {
        toast.error('You must be logged in to report an item.');
        setFormLoading(false);
        return;
      }
      try {
        // Upload images to Firebase Storage and get URLs
        let imageUrls: string[] = [];
        if (form.images && form.images.length > 0) {
          const storage = getStorage(app);
          imageUrls = await Promise.all(
            form.images.map(async (file) => {
              const storageRef = ref(storage, `lostfound/${user.id}/${Date.now()}_${file.name}`);
              await uploadBytes(storageRef, file);
              return await getDownloadURL(storageRef);
            })
          );
        }
        // Prepare payload with all required fields
        const payload = {
          ...form,
          type: formType,
          reporterId: user.id,
          status: "open" as "open",
          images: imageUrls,
        };
        await lostFoundAPI.reportItem(payload);
        toast.success('Item reported successfully!');
        setShowForm(false);
        setForm({
          type: 'lost', category: '', itemName: '', description: '', color: '', brand: '', busId: '', routeId: '', stopId: '', location: '', images: [], contactInfo: { preferredMethod: 'email', email: '', phone: '', anonymous: false },
        });
        setImagePreviews([]);
  // Refresh list
  // React Query will refetch automatically if needed
      } catch (err: any) {
        toast.error('Failed to report item.');
      } finally {
        setFormLoading(false);
      }
    }, 500, { leading: true, trailing: false }),
    [user, form, formType, app]
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLoading) debouncedFormSubmit();
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Animated glassy gradient background, like dashboard */}
      <div className="pointer-events-none select-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120vw] h-96 bg-gradient-to-r from-blue-300/30 via-purple-300/20 to-pink-300/30 blur-3xl animate-gradient-wave rounded-full"></div>
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-40 animate-pulse"
            style={{
              width: `${12 + Math.random() * 16}px`,
              height: `${12 + Math.random() * 16}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle at 50% 50%, #fff7, #fff0 70%)`,
              filter: 'blur(1.5px)',
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      <div className="flex-1 flex flex-col items-center justify-start py-10 px-2 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Lost &amp; Found</h1>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-xl">Report and find lost or found items on your transit journey. Help us reunite people with their belongings!</p>
        </div>
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-2xl">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg text-lg transition w-full sm:w-auto" onClick={() => { setShowForm(true); setFormType('lost'); }}>Report Lost Item</button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg text-lg transition w-full sm:w-auto" onClick={() => { setShowForm(true); setFormType('found'); }}>Report Found Item</button>
        </div>
        {showForm && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2 sm:px-0">
            <motion.form
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onSubmit={handleFormSubmit}
              className="relative w-full max-w-xs sm:max-w-sm md:max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 px-4 sm:px-8 py-8 flex flex-col gap-5 animate-fadeIn max-h-[80vh] overflow-y-auto mt-16 mb-8"
              style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
            >
              <button type="button" onClick={() => setShowForm(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold focus:outline-none">&times;</button>
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2 tracking-tight">Report {formType === 'lost' ? 'Lost' : 'Found'} Item</h2>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-2" />

              <div className="flex flex-col gap-3">
                {/* Image upload */}
                <label className="flex flex-col gap-2">
                  <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200"><ImageIcon className="w-5 h-5" /> Upload Images (max 5MB each, optional)</span>
                  <input
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={handleFormChange}
                    className={`input-modern ${formLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={formLoading}
                  />
                  {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {imagePreviews.map((src, idx) => (
                        <img key={idx} src={src} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                      ))}
                    </div>
                  )}
                </label>
                <input name="itemName" value={form.itemName} onChange={handleFormChange} required placeholder="Item Name" className={`input-modern ${form.itemName ? 'border-green-400' : ''} ${formLoading ? 'opacity-60 cursor-not-allowed' : ''}`} disabled={formLoading} />
                <textarea name="description" value={form.description} onChange={handleFormChange} required placeholder="Description" className={`input-modern min-h-[70px] resize-vertical ${form.description ? 'border-green-400' : ''} ${formLoading ? 'opacity-60 cursor-not-allowed' : ''}`} disabled={formLoading} />
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    required
                    className={`input-modern flex-1 ${form.category ? 'border-green-400' : ''} ${formLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={formLoading}
                  >
                    <option value="" disabled>Select Category</option>
                    {categoryOptions.slice(1).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <input name="color" value={form.color} onChange={handleFormChange} placeholder="Color" className={`input-modern flex-1 ${form.color ? 'border-green-400' : ''} ${formLoading ? 'opacity-60 cursor-not-allowed' : ''}`} disabled={formLoading} />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input name="brand" value={form.brand} onChange={handleFormChange} placeholder="Brand" className={`input-modern flex-1 ${form.brand ? 'border-green-400' : ''} ${formLoading ? 'opacity-60 cursor-not-allowed' : ''}`} disabled={formLoading} />
                  <input name="location" value={form.location} onChange={handleFormChange} placeholder="Location (bus/stop)" className={`input-modern flex-1 ${form.location ? 'border-green-400' : ''} ${formLoading ? 'opacity-60 cursor-not-allowed' : ''}`} disabled={formLoading} />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    name="contactInfo.email"
                    value={form.contactInfo.email}
                    onChange={handleFormChange}
                    placeholder="Your Email"
                    className={`input-modern flex-1 ${form.contactInfo.email ? 'border-green-400' : ''} ${formLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    type="email"
                    pattern="^[^@\s]+@[^@\s]+\.[^@\s]+$"
                    required={form.contactInfo.preferredMethod === 'email' || form.contactInfo.preferredMethod === 'both'}
                    disabled={formLoading}
                  />
                  <input
                    name="contactInfo.phone"
                    value={form.contactInfo.phone}
                    onChange={handleFormChange}
                    placeholder="Your Phone"
                    className={`input-modern flex-1 ${form.contactInfo.phone ? 'border-green-400' : ''} ${formLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    type="tel"
                    pattern="^[0-9\-\+\s]{8,15}$"
                    required={form.contactInfo.preferredMethod === 'phone' || form.contactInfo.preferredMethod === 'both'}
                    disabled={formLoading}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-gray-700 dark:text-gray-300 text-sm">Preferred Contact:</span>
                    <select
                      name="contactInfo.preferredMethod"
                      value={form.contactInfo.preferredMethod}
                      onChange={handleFormChange}
                      className={`input-modern w-auto px-3 py-2 ${formLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                      required
                      disabled={formLoading}
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2 sm:mt-0">
                    <input type="checkbox" name="contactInfo.anonymous" checked={form.contactInfo.anonymous} onChange={handleFormChange} className="accent-blue-600" disabled={formLoading} />
                    Report anonymously
                  </label>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mt-2" />
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  disabled={formLoading}
                  aria-busy={formLoading}
                >
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Submit'}
                </button>
                <button
                  type="button"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 py-3 rounded-xl font-semibold shadow transition text-lg"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          </div>
        )}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between w-full max-w-4xl">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="font-semibold text-gray-700 dark:text-gray-200 text-lg">Show:</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-base font-semibold shadow"
              style={{ minWidth: 120 }}
            >
              <option value="all">All</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>
        </div>
        <div className="w-full max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" /> Loading items...</div>
          ) : isError ? (
            <div className="flex items-center gap-2 text-red-500 justify-center py-12"><AlertTriangle className="w-5 h-5" /> {(error as any)?.message || 'Failed to fetch lost & found items.'}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(items as LostFoundItem[])
                .filter((item: LostFoundItem) => filterType === 'all' ? true : item.type === filterType)
                .sort((a: LostFoundItem, b: LostFoundItem) => (b.dateReported || '').localeCompare(a.dateReported || ''))
                .map((item: LostFoundItem) => (
                  <div
                    key={item.id}
                    className="rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 p-6 flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${item.type === 'lost' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{item.type.toUpperCase()}</span>
                      <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${item.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{item.status}</span>
                    </div>
                    <div className="w-full flex flex-col items-center justify-center">
                      {item.images && item.images.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-2 w-full justify-center">
                          {item.images.map((img: string, idx: number) => (
                            <img key={idx} src={img} alt="item" className="w-40 h-40 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow bg-gray-100 dark:bg-gray-800" />
                          ))}
                        </div>
                      ) : (
                        <div className="w-40 h-40 flex items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 text-center text-sm font-medium">Image not provided by reporter</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="font-extrabold text-xl text-gray-900 dark:text-white mb-1">{item.itemName}</div>
                      <div className="text-gray-700 dark:text-gray-300 text-base leading-relaxed line-clamp-3"><span className="font-semibold">Description:</span> {item.description}</div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-700 dark:text-gray-300 mt-2">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-semibold">Category:</span> <span>{item.category || '-'}</span>
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-semibold">Color:</span> <span>{item.color || '-'}</span>
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-semibold">Brand:</span> <span>{item.brand || '-'}</span>
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-semibold">Location:</span> <span>{item.location || '-'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                      <span><span className="font-semibold">Reported:</span> {item.dateReported ? new Date(item.dateReported).toLocaleString() : '-'}</span>
                      <a href={`mailto:${item.contactInfo.email}`} className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-1 rounded-lg font-semibold transition">Contact</a>
                    </div>
                  </div>
                ))}
              {(items as LostFoundItem[]).filter((item: LostFoundItem) => filterType === 'all' ? true : item.type === filterType).length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-500 bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow border border-gray-200 dark:border-gray-700">No items found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LostFound;
