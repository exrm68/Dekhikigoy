import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Zap, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, doc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

import { Movie, Category, AppSettings } from './types';
import { CATEGORIES } from './constants';

import MovieTile from './components/MovieTile';
import Sidebar from './components/Sidebar';
import MovieDetails from './components/MovieDetails';
import Banner from './components/Banner';
import StoryCircle from './components/StoryCircle';
import TrendingRow from './components/TrendingRow';
import StoryViewer from './components/StoryViewer';
import BottomNav from './components/BottomNav';
import Explore from './components/Explore';
import Watchlist from './components/Watchlist';
import NoticeBar from './components/NoticeBar';
import SplashScreen from './components/SplashScreen';
import AdminPanel from './components/AdminPanel';

type Tab = 'home' | 'search' | 'favorites';

const App: React.FC = () => {
  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // State
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    botUsername: '',
    channelLink: '',
    groupLink: '',
    noticeText: '⚠️ আপনার পছন্দের মুভি বা সিরিজ খুঁজে পাচ্ছেন না? রিকোয়েস্ট বাটনে ক্লিক করুন।',
    noticeLink: '',
    noticeEnabled: true,
    autoViewIncrement: true,
    enableTop10: true,
    enableStories: true,
    enableBanners: true,
    primaryColor: '#E50914',
    appName: 'StreamBox'
  });
  
  // Navigation & Scroll State
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  // 🔐 Secret Admin Access State
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Category State
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  // Story State
  const [viewingStory, setViewingStory] = useState<Movie | null>(null);
  
  // Banner State
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // 🔐 Secret Admin Access Handler
  const handleLogoTap = () => {
    setTapCount(prev => prev + 1);
    
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    tapTimeoutRef.current = setTimeout(() => {
      setTapCount(0);
    }, 2000);
  };

  // Check for admin access (5-7 taps)
  useEffect(() => {
    if (tapCount >= 5 && tapCount <= 7) {
      setIsAdminOpen(true);
      setTapCount(0);
      // @ts-ignore
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    }
  }, [tapCount]);

  // Initialize & Fetch Data
  useEffect(() => {
    // 1. Fetch Movies from Firestore
    const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
    
    const unsubscribeMovies = onSnapshot(q, (snapshot) => {
      const fetchedMovies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Movie[];
      
      setMovies(fetchedMovies);
    }, (error) => {
      console.warn("Firestore movies fetch failed:", error);
      setMovies([]);
    });

    // 2. Fetch Settings from Firestore
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'config'), (doc) => {
      if (doc.exists()) {
        setAppSettings(prevSettings => ({
          ...prevSettings,
          ...doc.data()
        }));
      }
    }, (error) => {
      console.warn("Settings fetch failed:", error);
    });

    // 3. Handle Splash Screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    // 4. Load Favorites
    const savedFavs = localStorage.getItem('streambox_favs');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    // 5. Telegram Config
    // @ts-ignore
    if (window.Telegram?.WebApp) {
      // @ts-ignore
      window.Telegram.WebApp.expand();
      // @ts-ignore
      window.Telegram.WebApp.setHeaderColor('#000000');
      // @ts-ignore
      window.Telegram.WebApp.setBackgroundColor('#000000');
    }

    return () => {
      clearTimeout(timer);
      unsubscribeMovies();
      unsubscribeSettings();
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    };
  }, []);

  // Scroll Handling for Bottom Nav
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        setIsNavVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Save Favorites
  useEffect(() => {
    localStorage.setItem('streambox_favs', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle Favorite
  const toggleFavorite = (movieId: string) => {
    setFavorites(prev =>
      prev.includes(movieId)
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  // Filter Movies
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      if (activeCategory === 'All') return true;
      if (activeCategory === 'Favorites') return favorites.includes(movie.id);
      return movie.category === activeCategory;
    });
  }, [movies, activeCategory, favorites]);

  // Top 10 Movies
  const top10Movies = useMemo(() => {
    if (!appSettings.enableTop10) return [];
    return movies
      .filter(m => m.isTop10)
      .sort((a, b) => (a.top10Position || 0) - (b.top10Position || 0))
      .slice(0, 10);
  }, [movies, appSettings.enableTop10]);

  // Story Items
  const storyItems = useMemo(() => {
    if (!appSettings.enableStories) return [];
    return movies
      .filter(m => m.storyEnabled)
      .sort((a, b) => (a.storyOrder || 0) - (b.storyOrder || 0));
  }, [movies, appSettings.enableStories]);

  // Featured Banners
  const featuredBanners = useMemo(() => {
    if (!appSettings.enableBanners) return [];
    return movies
      .filter(m => m.isFeatured)
      .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0))
      .slice(0, 5);
  }, [movies, appSettings.enableBanners]);

  // Banner Auto Rotation
  useEffect(() => {
    if (featuredBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % featuredBanners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [featuredBanners.length]);

  // Handle Channel Link
  const handleChannelLink = () => {
    if (!appSettings.channelLink) return;
    
    // @ts-ignore
    if (window.Telegram?.WebApp) {
      // @ts-ignore
      window.Telegram.WebApp.openTelegramLink(appSettings.channelLink);
    } else {
      window.open(appSettings.channelLink, '_blank');
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black via-black/95 to-transparent px-4 py-3 flex justify-between items-center">
        <motion.div
          onClick={handleLogoTap}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <Zap className="w-7 h-7 text-red-600 fill-red-600" />
          <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {appSettings.appName || 'StreamBox'}
          </span>
        </motion.div>

        {appSettings.channelLink && (
          <button
            onClick={handleChannelLink}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Main Content */}
      <div className="pt-16">
        {activeTab === 'home' && (
          <>
            {/* Notice Bar */}
            <div className="px-4">
              <NoticeBar
                noticeText={appSettings.noticeText}
                noticeLink={appSettings.noticeLink}
                enabled={appSettings.noticeEnabled}
              />
            </div>

            {/* Stories */}
            {storyItems.length > 0 && (
              <div className="px-4 mb-6">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                  {storyItems.map((item, idx) => (
                    <StoryCircle
                      key={item.id}
                      image={item.storyImage || item.thumbnail}
                      title={item.title}
                      onClick={() => setViewingStory(item)}
                      gradient={idx % 2 === 0}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Banner */}
            {featuredBanners.length > 0 && (
              <div className="mb-6">
                <Banner
                  movie={featuredBanners[currentBannerIndex]}
                  onPlayClick={() => setSelectedMovie(featuredBanners[currentBannerIndex])}
                />
              </div>
            )}

            {/* Top 10 */}
            {top10Movies.length > 0 && (
              <div className="mb-6">
                <TrendingRow
                  movies={top10Movies}
                  onMovieClick={setSelectedMovie}
                />
              </div>
            )}

            {/* Categories */}
            <div className="px-4 mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Movies Grid */}
            <div className="px-4 grid grid-cols-3 gap-3">
              {filteredMovies.map(movie => (
                <MovieTile
                  key={movie.id}
                  movie={movie}
                  onClick={() => setSelectedMovie(movie)}
                  isFavorite={favorites.includes(movie.id)}
                  onToggleFavorite={() => toggleFavorite(movie.id)}
                />
              ))}
            </div>

            {filteredMovies.length === 0 && (
              <div className="px-4 py-20 text-center">
                <p className="text-gray-400">No content found</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'search' && (
          <Explore
            movies={movies}
            onMovieClick={setSelectedMovie}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {activeTab === 'favorites' && (
          <Watchlist
            movies={movies.filter(m => favorites.includes(m.id))}
            onMovieClick={setSelectedMovie}
            onRemove={toggleFavorite}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isVisible={isNavVisible}
      />

      {/* Movie Details */}
      <AnimatePresence>
        {selectedMovie && (
          <MovieDetails
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
            botUsername={appSettings.botUsername || ''}
            channelLink={appSettings.channelLink || ''}
          />
        )}
      </AnimatePresence>

      {/* Story Viewer */}
      <AnimatePresence>
        {viewingStory && (
          <StoryViewer
            movie={viewingStory}
            onClose={() => setViewingStory(null)}
            onViewMovie={() => {
              setSelectedMovie(viewingStory);
              setViewingStory(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Admin Panel */}
      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel onClose={() => setIsAdminOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
