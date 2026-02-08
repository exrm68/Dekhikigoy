import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Settings, LogOut, Trash2, Edit, Plus, Save, Film, Tv, TrendingUp, Image as ImageIcon, Link, RefreshCw } from 'lucide-react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Movie, Episode, AppSettings } from '../types';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('movies');
  const [user, setUser] = useState<User | null>(null);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Settings State
  const [settings, setSettings] = useState<AppSettings>({
    botUsername: '',
    channelLink: '',
    groupLink: '',
    noticeText: '',
    noticeLink: '',
    noticeEnabled: true,
    autoViewIncrement: true,
    enableTop10: true,
    enableStories: true,
    enableBanners: true,
    primaryColor: '#E50914',
    appName: 'StreamBox'
  });

  // Movie/Series Form State
  const [contentType, setContentType] = useState<'movie' | 'series'>('movie');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [category, setCategory] = useState('Exclusive');
  const [telegramCode, setTelegramCode] = useState('');
  const [year, setYear] = useState('2025');
  const [rating, setRating] = useState('9.0');
  const [quality, setQuality] = useState('4K HDR');
  const [description, setDescription] = useState('');
  const [initialViews, setInitialViews] = useState('0');
  
  // Top 10 State
  const [isTop10, setIsTop10] = useState(false);
  const [top10Position, setTop10Position] = useState('1');
  
  // Story State
  const [storyEnabled, setStoryEnabled] = useState(false);
  const [storyImage, setStoryImage] = useState('');
  const [storyOrder, setStoryOrder] = useState('1');
  
  // Banner State
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState('1');
  
  // Episode State (for Series)
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [newEpTitle, setNewEpTitle] = useState('');
  const [newEpSeason, setNewEpSeason] = useState('1');
  const [newEpNumber, setNewEpNumber] = useState('1');
  const [newEpDuration, setNewEpDuration] = useState('');
  const [newEpCode, setNewEpCode] = useState('');
  
  // Content Lists
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [seriesList, setSeriesList] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      if (activeTab === 'movies') fetchMovies();
      if (activeTab === 'series') fetchSeries();
      if (activeTab === 'settings') fetchSettings();
    }
  }, [user, activeTab]);

  // Fetch Functions
  const fetchMovies = async () => {
    try {
      const q = query(collection(db, "movies"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() })) as Movie[]
      setMovieList(list.filter(m => m.type !== 'series'));
    } catch (e) {
      console.error("Error fetching movies:", e);
    }
  };

  const fetchSeries = async () => {
    try {
      const q = query(collection(db, "movies"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() })) as Movie[];
      setSeriesList(list.filter(m => m.type === 'series'));
    } catch (e) {
      console.error("Error fetching series:", e);
    }
  };

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings({ ...settings, ...docSnap.data() });
      }
    } catch (e) {
      console.error("Error fetching settings:", e);
    }
  };

  // Form Reset
  const resetForm = () => {
    setTitle('');
    setThumbnail('');
    setCategory('Exclusive');
    setTelegramCode('');
    setYear('2025');
    setRating('9.0');
    setQuality('4K HDR');
    setDescription('');
    setInitialViews('0');
    setIsTop10(false);
    setTop10Position('1');
    setStoryEnabled(false);
    setStoryImage('');
    setStoryOrder('1');
    setIsFeatured(false);
    setFeaturedOrder('1');
    setEpisodes([]);
    setIsEditing(false);
    setEditId(null);
  };

  // Episode Management
  const handleAddEpisode = () => {
    if (!newEpTitle || !newEpCode) {
      alert('❌ Episode Title and Telegram Code are required!');
      return;
    }
    
    const newEp: Episode = {
      id: Date.now().toString(),
      number: parseInt(newEpNumber) || episodes.length + 1,
      season: parseInt(newEpSeason) || 1,
      title: newEpTitle,
      duration: newEpDuration || 'N/A',
      telegramCode: newEpCode
    };
    
    setEpisodes([...episodes, newEp].sort((a, b) => {
      if (a.season !== b.season) return a.season - b.season;
      return a.number - b.number;
    }));
    
    setNewEpTitle('');
    setNewEpNumber((parseInt(newEpNumber) + 1).toString());
    setNewEpDuration('');
    setNewEpCode('');
  };

  const removeEpisode = (id: string) => {
    setEpisodes(episodes.filter(ep => ep.id !== id));
  };

  const editEpisode = (ep: Episode) => {
    setNewEpTitle(ep.title);
    setNewEpSeason(ep.season.toString());
    setNewEpNumber(ep.number.toString());
    setNewEpDuration(ep.duration);
    setNewEpCode(ep.telegramCode);
    removeEpisode(ep.id);
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'config'), settings);
      setSuccessMsg('✅ Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert('❌ Error saving settings');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Publish Content
  const handlePublish = async () => {
    if (!title || !thumbnail) {
      alert('❌ Title and Thumbnail are required!');
      return;
    }
    
    if (contentType === 'movie' && !telegramCode) {
      alert('❌ Telegram Code is required for movies!');
      return;
    }
    
    if (contentType === 'series' && episodes.length === 0) {
      alert('❌ At least one episode is required for series!');
      return;
    }
    
    setLoading(true);
    try {
      const contentData: any = {
        title,
        thumbnail,
        category,
        telegramCode: telegramCode || '',
        year,
        rating: parseFloat(rating) || 9.0,
        quality,
        description,
        views: initialViews || '0',
        type: contentType,
        createdAt: serverTimestamp(),
        
        // Top 10
        isTop10,
        top10Position: isTop10 ? parseInt(top10Position) : null,
        
        // Story
        storyEnabled,
        storyImage: storyEnabled ? storyImage : null,
        storyOrder: storyEnabled ? parseInt(storyOrder) : null,
        
        // Banner
        isFeatured,
        featuredOrder: isFeatured ? parseInt(featuredOrder) : null,
        
        // Episodes (for series)
        episodes: contentType === 'series' ? episodes : null
      };
      
      if (isEditing && editId) {
        await updateDoc(doc(db, 'movies', editId), contentData);
        setSuccessMsg('✅ Content updated successfully!');
      } else {
        await addDoc(collection(db, 'movies'), contentData);
        setSuccessMsg('✅ Content published successfully!');
      }
      
      setTimeout(() => setSuccessMsg(''), 3000);
      resetForm();
      
      if (contentType === 'movie') {
        fetchMovies();
      } else {
        fetchSeries();
      }
    } catch (e) {
      alert('❌ Error publishing content');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Delete Content
  const handleDelete = async (id: string) => {
    if (!confirm('⚠️ Are you sure you want to delete this content?')) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'movies', id));
      setSuccessMsg('✅ Content deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      
      if (activeTab === 'movies') {
        fetchMovies();
      } else {
        fetchSeries();
      }
    } catch (e) {
      alert('❌ Error deleting content');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Edit Content
  const handleEdit = (content: Movie) => {
    setIsEditing(true);
    setEditId(content.id);
    setContentType(content.type || 'movie');
    setTitle(content.title);
    setThumbnail(content.thumbnail);
    setCategory(content.category);
    setTelegramCode(content.telegramCode);
    setYear(content.year || '2025');
    setRating(content.rating?.toString() || '9.0');
    setQuality(content.quality || '4K HDR');
    setDescription(content.description || '');
    setInitialViews(content.views || '0');
    setIsTop10(content.isTop10 || false);
    setTop10Position(content.top10Position?.toString() || '1');
    setStoryEnabled(content.storyEnabled || false);
    setStoryImage(content.storyImage || '');
    setStoryOrder(content.storyOrder?.toString() || '1');
    setIsFeatured(content.isFeatured || false);
    setFeaturedOrder(content.featuredOrder?.toString() || '1');
    setEpisodes(content.episodes || []);
    
    // Switch to appropriate tab
    setActiveTab(content.type === 'series' ? 'series' : 'movies');
  };

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    resetForm();
  };

  // Filter Content
  const getFilteredList = () => {
    const list = activeTab === 'series' ? seriesList : movieList;
    return list.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-zinc-900 rounded-2xl p-8 w-full max-w-md border border-zinc-800"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Admin Login</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-y-auto"
    >
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-zinc-900 rounded-2xl p-6 mb-4 border border-zinc-800">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <div className="flex gap-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-6 flex-wrap">
              <TabButton
                active={activeTab === 'movies'}
                onClick={() => setActiveTab('movies')}
                icon={<Film className="w-4 h-4" />}
                label="Movies"
              />
              <TabButton
                active={activeTab === 'series'}
                onClick={() => setActiveTab('series')}
                icon={<Tv className="w-4 h-4" />}
                label="Series"
              />
              <TabButton
                active={activeTab === 'top10'}
                onClick={() => setActiveTab('top10')}
                icon={<TrendingUp className="w-4 h-4" />}
                label="Top 10"
              />
              <TabButton
                active={activeTab === 'stories'}
                onClick={() => setActiveTab('stories')}
                icon={<ImageIcon className="w-4 h-4" />}
                label="Stories"
              />
              <TabButton
                active={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
                icon={<Settings className="w-4 h-4" />}
                label="Settings"
              />
            </div>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-green-500/10 border border-green-500 text-green-500 rounded-lg p-4 mb-4"
              >
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content Area */}
          <div className="space-y-4">
            {/* Movies Tab */}
            {activeTab === 'movies' && (
              <>
                <MovieSeriesForm
                  type="movie"
                  isEditing={isEditing}
                  loading={loading}
                  
                  title={title}
                  setTitle={setTitle}
                  thumbnail={thumbnail}
                  setThumbnail={setThumbnail}
                  category={category}
                  setCategory={setCategory}
                  telegramCode={telegramCode}
                  setTelegramCode={setTelegramCode}
                  year={year}
                  setYear={setYear}
                  rating={rating}
                  setRating={setRating}
                  quality={quality}
                  setQuality={setQuality}
                  description={description}
                  setDescription={setDescription}
                  initialViews={initialViews}
                  setInitialViews={setInitialViews}
                  
                  isTop10={isTop10}
                  setIsTop10={setIsTop10}
                  top10Position={top10Position}
                  setTop10Position={setTop10Position}
                  
                  storyEnabled={storyEnabled}
                  setStoryEnabled={setStoryEnabled}
                  storyImage={storyImage}
                  setStoryImage={setStoryImage}
                  storyOrder={storyOrder}
                  setStoryOrder={setStoryOrder}
                  
                  isFeatured={isFeatured}
                  setIsFeatured={setIsFeatured}
                  featuredOrder={featuredOrder}
                  setFeaturedOrder={setFeaturedOrder}
                  
                  onPublish={handlePublish}
                  onReset={resetForm}
                />

                <ContentList
                  type="movie"
                  list={getFilteredList()}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRefresh={fetchMovies}
                />
              </>
            )}

            {/* Series Tab */}
            {activeTab === 'series' && (
              <>
                <MovieSeriesForm
                  type="series"
                  isEditing={isEditing}
                  loading={loading}
                  
                  title={title}
                  setTitle={setTitle}
                  thumbnail={thumbnail}
                  setThumbnail={setThumbnail}
                  category={category}
                  setCategory={setCategory}
                  telegramCode={telegramCode}
                  setTelegramCode={setTelegramCode}
                  year={year}
                  setYear={setYear}
                  rating={rating}
                  setRating={setRating}
                  quality={quality}
                  setQuality={setQuality}
                  description={description}
                  setDescription={setDescription}
                  initialViews={initialViews}
                  setInitialViews={setInitialViews}
                  
                  isTop10={isTop10}
                  setIsTop10={setIsTop10}
                  top10Position={top10Position}
                  setTop10Position={setTop10Position}
                  
                  storyEnabled={storyEnabled}
                  setStoryEnabled={setStoryEnabled}
                  storyImage={storyImage}
                  setStoryImage={setStoryImage}
                  storyOrder={storyOrder}
                  setStoryOrder={setStoryOrder}
                  
                  isFeatured={isFeatured}
                  setIsFeatured={setIsFeatured}
                  featuredOrder={featuredOrder}
                  setFeaturedOrder={setFeaturedOrder}
                  
                  episodes={episodes}
                  newEpTitle={newEpTitle}
                  setNewEpTitle={setNewEpTitle}
                  newEpSeason={newEpSeason}
                  setNewEpSeason={setNewEpSeason}
                  newEpNumber={newEpNumber}
                  setNewEpNumber={setNewEpNumber}
                  newEpDuration={newEpDuration}
                  setNewEpDuration={setNewEpDuration}
                  newEpCode={newEpCode}
                  setNewEpCode={setNewEpCode}
                  onAddEpisode={handleAddEpisode}
                  onEditEpisode={editEpisode}
                  onRemoveEpisode={removeEpisode}
                  
                  onPublish={handlePublish}
                  onReset={resetForm}
                />

                <ContentList
                  type="series"
                  list={getFilteredList()}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRefresh={fetchSeries}
                />
              </>
            )}

            {/* Top 10 Tab */}
            {activeTab === 'top10' && (
              <Top10Management
                movies={movieList}
                series={seriesList}
                onRefresh={() => {
                  fetchMovies();
                  fetchSeries();
                }}
              />
            )}

            {/* Stories Tab */}
            {activeTab === 'stories' && (
              <StoryManagement
                movies={movieList}
                series={seriesList}
                onRefresh={() => {
                  fetchMovies();
                  fetchSeries();
                }}
              />
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <SettingsPanel
                settings={settings}
                setSettings={setSettings}
                loading={loading}
                onSave={handleSaveSettings}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
      active
        ? 'bg-red-600 text-white'
        : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

// Movie/Series Form Component
const MovieSeriesForm = ({
  type,
  isEditing,
  loading,
  title, setTitle,
  thumbnail, setThumbnail,
  category, setCategory,
  telegramCode, setTelegramCode,
  year, setYear,
  rating, setRating,
  quality, setQuality,
  description, setDescription,
  initialViews, setInitialViews,
  isTop10, setIsTop10,
  top10Position, setTop10Position,
  storyEnabled, setStoryEnabled,
  storyImage, setStoryImage,
  storyOrder, setStoryOrder,
  isFeatured, setIsFeatured,
  featuredOrder, setFeaturedOrder,
  episodes, newEpTitle, setNewEpTitle,
  newEpSeason, setNewEpSeason,
  newEpNumber, setNewEpNumber,
  newEpDuration, setNewEpDuration,
  newEpCode, setNewEpCode,
  onAddEpisode, onEditEpisode, onRemoveEpisode,
  onPublish, onReset
}: any) => (
  <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
    <h2 className="text-xl font-bold text-white mb-6">
      {isEditing ? 'Edit' : 'Add New'} {type === 'movie' ? 'Movie' : 'Series'}
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Basic Info */}
      <InputField label="Title *" value={title} onChange={setTitle} placeholder="Enter title" />
      <InputField label="Thumbnail URL *" value={thumbnail} onChange={setThumbnail} placeholder="https://..." />
      
      <SelectField
        label="Category"
        value={category}
        onChange={setCategory}
        options={['Exclusive', 'Korean Drama', 'Series', 'Action', 'Comedy', 'Horror', 'Romance']}
      />
      
      {type === 'movie' && (
        <InputField
          label="Telegram Code *"
          value={telegramCode}
          onChange={setTelegramCode}
          placeholder="22, 527, 72772"
          helperText="Only numbers - same code for Watch & Download"
        />
      )}
      
      <InputField label="Year" value={year} onChange={setYear} placeholder="2025" />
      <InputField label="Rating" value={rating} onChange={setRating} placeholder="9.0" type="number" step="0.1" />
      <InputField label="Quality" value={quality} onChange={setQuality} placeholder="4K HDR" />
      <InputField label="Initial Views" value={initialViews} onChange={setInitialViews} placeholder="0" type="number" />
    </div>

    <div className="mt-4">
      <TextAreaField
        label="Description"
        value={description}
        onChange={setDescription}
        placeholder="Enter description..."
        rows={3}
      />
    </div>

    {/* Features */}
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Top 10 */}
      <div className="bg-zinc-800 p-4 rounded-lg">
        <CheckboxField label="Add to Top 10" checked={isTop10} onChange={setIsTop10} />
        {isTop10 && (
          <InputField
            label="Position (1-10)"
            value={top10Position}
            onChange={setTop10Position}
            type="number"
            min="1"
            max="10"
            className="mt-2"
          />
        )}
      </div>

      {/* Story */}
      <div className="bg-zinc-800 p-4 rounded-lg">
        <CheckboxField label="Enable Story" checked={storyEnabled} onChange={setStoryEnabled} />
        {storyEnabled && (
          <>
            <InputField
              label="Story Image URL"
              value={storyImage}
              onChange={setStoryImage}
              placeholder="https://..."
              className="mt-2"
            />
            <InputField
              label="Story Order"
              value={storyOrder}
              onChange={setStoryOrder}
              type="number"
              className="mt-2"
            />
          </>
        )}
      </div>

      {/* Banner */}
      <div className="bg-zinc-800 p-4 rounded-lg">
        <CheckboxField label="Featured Banner" checked={isFeatured} onChange={setIsFeatured} />
        {isFeatured && (
          <InputField
            label="Banner Position"
            value={featuredOrder}
            onChange={setFeaturedOrder}
            type="number"
            className="mt-2"
          />
        )}
      </div>
    </div>

    {/* Episodes Section (for Series) */}
    {type === 'series' && (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Episodes</h3>
        
        <div className="bg-zinc-800 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <InputField
              label="Episode Title *"
              value={newEpTitle}
              onChange={setNewEpTitle}
              placeholder="Episode title"
            />
            <InputField
              label="Season"
              value={newEpSeason}
              onChange={setNewEpSeason}
              type="number"
              placeholder="1"
            />
            <InputField
              label="Episode Number"
              value={newEpNumber}
              onChange={setNewEpNumber}
              type="number"
              placeholder="1"
            />
            <InputField
              label="Duration"
              value={newEpDuration}
              onChange={setNewEpDuration}
              placeholder="45 min"
            />
            <InputField
              label="Telegram Code *"
              value={newEpCode}
              onChange={setNewEpCode}
              placeholder="65, 738"
              helperText="Watch & Download"
            />
            <div className="flex items-end">
              <button
                onClick={onAddEpisode}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Episode
              </button>
            </div>
          </div>
        </div>

        {/* Episodes List */}
        {episodes && episodes.length > 0 && (
          <div className="space-y-2">
            {episodes.map((ep) => (
              <div key={ep.id} className="bg-zinc-800 p-3 rounded-lg flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">
                    S{ep.season}E{ep.number}: {ep.title}
                  </p>
                  <p className="text-sm text-gray-400">
                    Duration: {ep.duration} | Code: {ep.telegramCode}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditEpisode(ep)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    <Edit className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => onRemoveEpisode(ep.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* Action Buttons */}
    <div className="mt-6 flex gap-3">
      <button
        onClick={onPublish}
        disabled={loading}
        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
      >
        <Upload className="w-5 h-5" />
        {loading ? 'Publishing...' : (isEditing ? 'Update' : 'Publish')}
      </button>
      <button
        onClick={onReset}
        className="px-6 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-medium"
      >
        Cancel
      </button>
    </div>
  </div>
);

// Content List Component
const ContentList = ({ type, list, searchTerm, setSearchTerm, onEdit, onDelete, onRefresh }: any) => (
  <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-white">
        {type === 'movie' ? 'Movies' : 'Series'} List ({list.length})
      </h2>
      <button
        onClick={onRefresh}
        className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
      >
        <RefreshCw className="w-5 h-5 text-white" />
      </button>
    </div>

    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
      className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
    />

    <div className="space-y-2 max-h-96 overflow-y-auto">
      {list.map((item: Movie) => (
        <div key={item.id} className="bg-zinc-800 p-4 rounded-lg flex items-center gap-4">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-16 h-24 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="text-white font-medium">{item.title}</h3>
            <p className="text-sm text-gray-400">
              {item.category} • {item.year} • ⭐ {item.rating}
            </p>
            {item.episodes && (
              <p className="text-sm text-gray-400">
                {item.episodes.length} Episodes
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Edit className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Top 10 Management Component
const Top10Management = ({ movies, series, onRefresh }: any) => {
  const allContent = [...movies, ...series].filter(item => item.isTop10);
  const sortedContent = allContent.sort((a, b) => 
    (a.top10Position || 0) - (b.top10Position || 0)
  );

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Top 10 Management</h2>
        <button
          onClick={onRefresh}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
        >
          <RefreshCw className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="space-y-3">
        {sortedContent.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No content added to Top 10 yet. Add content from Movies or Series tabs.
          </p>
        ) : (
          sortedContent.map((item: Movie) => (
            <div key={item.id} className="bg-zinc-800 p-4 rounded-lg flex items-center gap-4">
              <div className="bg-red-600 text-white font-bold text-xl w-12 h-12 rounded-lg flex items-center justify-center">
                {item.top10Position}
              </div>
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-16 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="text-white font-medium">{item.title}</h3>
                <p className="text-sm text-gray-400">
                  {item.type === 'series' ? 'Series' : 'Movie'} • {item.category}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Story Management Component
const StoryManagement = ({ movies, series, onRefresh }: any) => {
  const allContent = [...movies, ...series].filter(item => item.storyEnabled);
  const sortedContent = allContent.sort((a, b) => 
    (a.storyOrder || 0) - (b.storyOrder || 0)
  );

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Story Management</h2>
        <button
          onClick={onRefresh}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
        >
          <RefreshCw className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {sortedContent.length === 0 ? (
          <p className="col-span-full text-gray-400 text-center py-8">
            No stories enabled yet. Enable stories from Movies or Series tabs.
          </p>
        ) : (
          sortedContent.map((item: Movie) => (
            <div key={item.id} className="text-center">
              <div className="relative">
                <img
                  src={item.storyImage || item.thumbnail}
                  alt={item.title}
                  className="w-20 h-20 rounded-full object-cover border-4 border-red-600 mx-auto"
                />
                <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {item.storyOrder}
                </div>
              </div>
              <p className="text-white text-sm mt-2 truncate">{item.title}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Settings Panel Component
const SettingsPanel = ({ settings, setSettings, loading, onSave }: any) => (
  <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
    <h2 className="text-xl font-bold text-white mb-6">App Settings</h2>

    <div className="space-y-6">
      {/* Telegram Settings */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Telegram Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Bot Username (without @)"
            value={settings.botUsername}
            onChange={(val) => setSettings({ ...settings, botUsername: val })}
            placeholder="your_bot"
            helperText="Used for Watch/Download links"
          />
          <InputField
            label="Channel Link"
            value={settings.channelLink}
            onChange={(val) => setSettings({ ...settings, channelLink: val })}
            placeholder="https://t.me/yourchannel"
          />
          <InputField
            label="Group Link (Optional)"
            value={settings.groupLink || ''}
            onChange={(val) => setSettings({ ...settings, groupLink: val })}
            placeholder="https://t.me/yourgroup"
          />
        </div>
      </div>

      {/* Notice Bar Settings */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Notice Bar</h3>
        <div className="space-y-4">
          <CheckboxField
            label="Enable Notice Bar"
            checked={settings.noticeEnabled}
            onChange={(val) => setSettings({ ...settings, noticeEnabled: val })}
          />
          {settings.noticeEnabled && (
            <>
              <TextAreaField
                label="Notice Text"
                value={settings.noticeText || ''}
                onChange={(val) => setSettings({ ...settings, noticeText: val })}
                placeholder="Enter notice message..."
                rows={2}
              />
              <InputField
                label="Notice Telegram Link"
                value={settings.noticeLink || ''}
                onChange={(val) => setSettings({ ...settings, noticeLink: val })}
                placeholder="https://t.me/..."
                helperText="Where users go when clicking notice"
              />
            </>
          )}
        </div>
      </div>

      {/* Feature Toggles */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CheckboxField
            label="Enable Top 10 Feature"
            checked={settings.enableTop10}
            onChange={(val) => setSettings({ ...settings, enableTop10: val })}
          />
          <CheckboxField
            label="Enable Stories Feature"
            checked={settings.enableStories}
            onChange={(val) => setSettings({ ...settings, enableStories: val })}
          />
          <CheckboxField
            label="Enable Banners Feature"
            checked={settings.enableBanners}
            onChange={(val) => setSettings({ ...settings, enableBanners: val })}
          />
          <CheckboxField
            label="Auto View Increment"
            checked={settings.autoViewIncrement}
            onChange={(val) => setSettings({ ...settings, autoViewIncrement: val })}
          />
        </div>
      </div>

      {/* App Customization */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Customization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="App Name"
            value={settings.appName || ''}
            onChange={(val) => setSettings({ ...settings, appName: val })}
            placeholder="StreamBox"
          />
          <InputField
            label="Primary Color"
            value={settings.primaryColor || '#E50914'}
            onChange={(val) => setSettings({ ...settings, primaryColor: val })}
            type="color"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        {loading ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  </div>
);

// Form Helper Components
const InputField = ({ label, value, onChange, placeholder, type = 'text', helperText, className = '', ...props }: any) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-400 mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
      {...props}
    />
    {helperText && (
      <p className="text-xs text-gray-500 mt-1">{helperText}</p>
    )}
  </div>
);

const TextAreaField = ({ label, value, onChange, placeholder, rows = 3, ...props }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-2">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
      {...props}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-2">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const CheckboxField = ({ label, checked, onChange }: any) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-red-600 focus:ring-red-500"
    />
    <span className="text-white">{label}</span>
  </label>
);

export default AdminPanel;
