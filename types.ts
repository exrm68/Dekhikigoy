export interface Episode {
  id: string;
  number: number;
  season: number;
  title: string;
  duration: string;
  telegramCode: string;          // ✅ একই code Watch এবং Download উভয়ের জন্য
}

export interface Movie {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  telegramCode: string;          // ✅ একই code Watch এবং Download উভয়ের জন্য (Required)
  rating: number;
  views: string;
  year?: string;
  quality?: string;
  description?: string;
  episodes?: Episode[];          // ✅ যদি Series হয় তাহলে episodes থাকবে
  isPremium?: boolean;
  createdAt?: any;
  
  // Top 10 Features
  isTop10?: boolean;             // Top 10 এ আছে কিনা
  top10Position?: number;        // Top 10 এ কত নাম্বার (1-10)
  
  // Story Features
  storyEnabled?: boolean;        // Story তে দেখাবে কিনা
  storyImage?: string;           // Story Circle এ যে ছবি দেখাবে
  storyOrder?: number;           // Story তে কত নাম্বারে
  
  // Banner Features
  isFeatured?: boolean;          // Main Banner এ দেখাবে কিনা
  featuredOrder?: number;        // Banner এ কত নাম্বার পজিশনে
  
  // Content Type
  type?: 'movie' | 'series';     // ✅ Movie নাকি Series identify করার জন্য
}

export interface AppSettings {
  botUsername: string;           // ✅ Telegram Bot Username (without @)
  channelLink: string;           // ✅ Telegram Channel Link
  groupLink?: string;            // ✅ Telegram Group Link (Optional)
  noticeText?: string;           // ✅ Notice bar এ যা লেখা দেখাবে
  noticeLink?: string;           // ✅ Notice bar click করলে কোথায় যাবে (Telegram link)
  noticeEnabled?: boolean;       // ✅ Notice bar দেখাবে কিনা
  autoViewIncrement?: boolean;   // Auto view count বাড়াবে কিনা
  
  // Premium Settings
  enableTop10?: boolean;         // Top 10 feature চালু আছে কিনা
  enableStories?: boolean;       // Story feature চালু আছে কিনা
  enableBanners?: boolean;       // Banner feature চালু আছে কিনা
  primaryColor?: string;         // Theme color
  appName?: string;              // App এর নাম
}

export type Category = 'Exclusive' | 'Korean Drama' | 'Series' | 'All' | 'Favorites' | string;
