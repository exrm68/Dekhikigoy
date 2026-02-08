import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Star, X, Download, Send } from 'lucide-react';
import { Movie, Episode } from '../types';

interface MovieDetailsProps {
  movie: Movie;
  onClose: () => void;
  botUsername: string;
  channelLink: string;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, onClose, botUsername, channelLink }) => {
  const [activeTab, setActiveTab] = useState<'episodes' | 'info'>('episodes');
  const [selectedSeason, setSelectedSeason] = useState<number>(1);

  // ✅ Telegram Link Handler - একই code Watch এবং Download উভয়ের জন্য
  const handleTelegramLink = (code: string) => {
    if (!code || !botUsername) {
      alert('⚠️ Invalid configuration. Please contact admin.');
      return;
    }
    
    const url = `https://t.me/${botUsername}?start=${code}`;
    
    // @ts-ignore
    if (window.Telegram?.WebApp) {
      // @ts-ignore
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  // ✅ Channel Link Handler
  const handleChannelLink = () => {
    if (!channelLink) return;
    
    // @ts-ignore
    if (window.Telegram?.WebApp) {
      // @ts-ignore
      window.Telegram.WebApp.openTelegramLink(channelLink);
    } else {
      window.open(channelLink, '_blank');
    }
  };

  const isSeries = movie.type === 'series' || (movie.episodes && movie.episodes.length > 0);

  // ✅ Group episodes by season
  const episodesBySeason = useMemo(() => {
    if (!movie.episodes) return {};
    const groups: Record<number, Episode[]> = {};
    movie.episodes.forEach(ep => {
      const s = ep.season || 1;
      if (!groups[s]) groups[s] = [];
      groups[s].push(ep);
    });
    Object.keys(groups).forEach(season => {
      groups[Number(season)].sort((a, b) => a.number - b.number);
    });
    return groups;
  }, [movie.episodes]);

  const availableSeasons = Object.keys(episodesBySeason).map(Number).sort((a, b) => a - b);
  const currentEpisodes = episodesBySeason[selectedSeason] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col h-full overflow-y-auto"
    >
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-[60vh]">
        <img
          src={movie.thumbnail}
          alt={movie.title}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-4">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all"
        >
          <X size={22} />
        </button>
        
        {channelLink && (
          <button
            onClick={handleChannelLink}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all"
          >
            <Send size={18} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 pb-24">
        {/* Movie Info */}
        <div className="mt-32 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">{movie.title}</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-yellow-400 font-medium">
              <Star size={16} className="fill-current" />
              {movie.rating}
            </span>
            <span className="text-gray-400">{movie.year}</span>
            <span className="text-gray-400">{movie.quality}</span>
            <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded">
              {movie.category}
            </span>
          </div>
        </div>

        {/* Action Buttons for Single Movies */}
        {!isSeries && movie.telegramCode && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => handleTelegramLink(movie.telegramCode)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Play size={20} className="fill-current" />
              Watch Now
            </button>
            <button
              onClick={() => handleTelegramLink(movie.telegramCode)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Download size={20} />
              Download
            </button>
          </div>
        )}

        {/* Tabs for Series */}
        {isSeries && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('episodes')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === 'episodes'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-gray-400'
              }`}
            >
              Episodes
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === 'info'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-gray-400'
              }`}
            >
              Info
            </button>
          </div>
        )}

        {/* Episodes Tab */}
        {isSeries && activeTab === 'episodes' && (
          <div>
            {/* Season Selector */}
            {availableSeasons.length > 1 && (
              <div className="mb-4">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {availableSeasons.map(season => (
                    <option key={season} value={season}>
                      Season {season}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Episodes List */}
            <div className="space-y-3">
              {currentEpisodes.map((episode) => (
                <div
                  key={episode.id}
                  className="bg-zinc-900 rounded-lg p-4 border border-zinc-800"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">
                        Episode {episode.number}: {episode.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Duration: {episode.duration}
                      </p>
                    </div>
                  </div>

                  {/* Episode Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTelegramLink(episode.telegramCode)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <Play size={16} className="fill-current" />
                      Watch
                    </button>
                    <button
                      onClick={() => handleTelegramLink(episode.telegramCode)}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Tab */}
        {(activeTab === 'info' || !isSeries) && (
          <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
            <h2 className="text-lg font-bold text-white mb-3">Description</h2>
            <p className="text-gray-300 leading-relaxed">
              {movie.description || 'No description available.'}
            </p>

            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">Category</p>
                  <p className="text-white font-medium">{movie.category}</p>
                </div>
                <div>
                  <p className="text-gray-400">Year</p>
                  <p className="text-white font-medium">{movie.year}</p>
                </div>
                <div>
                  <p className="text-gray-400">Rating</p>
                  <p className="text-white font-medium">⭐ {movie.rating}</p>
                </div>
                <div>
                  <p className="text-gray-400">Quality</p>
                  <p className="text-white font-medium">{movie.quality}</p>
                </div>
                {isSeries && (
                  <div>
                    <p className="text-gray-400">Total Episodes</p>
                    <p className="text-white font-medium">
                      {movie.episodes?.length || 0}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MovieDetails;
