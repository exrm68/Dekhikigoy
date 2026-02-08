import React from 'react';
import { BellRing, MessageSquarePlus } from 'lucide-react';

interface NoticeBarProps {
  noticeText?: string;
  noticeLink?: string;
  enabled?: boolean;
}

const NoticeBar: React.FC<NoticeBarProps> = ({ 
  noticeText = '⚠️ আপনার পছন্দের মুভি বা সিরিজ খুঁজে পাচ্ছেন না? চিন্তার কারণ নেই! রিকোয়েস্ট বাটনে ক্লিক করুন।',
  noticeLink = 'https://t.me/your_channel',
  enabled = true
}) => {
  if (!enabled) return null;

  const handleClick = () => {
    if (!noticeLink) return;
    
    // @ts-ignore
    if (window.Telegram?.WebApp) {
      // @ts-ignore
      window.Telegram.WebApp.openTelegramLink(noticeLink);
    } else {
      window.open(noticeLink, '_blank');
    }
  };

  return (
    <div className="w-full mb-6 px-1 relative z-20 overflow-hidden">
      <div className="relative overflow-hidden rounded-xl bg-[#111] border-l-4 border-[#FFD700] shadow-lg shadow-[#FFD700]/5 flex items-center py-2.5 px-3 gap-3">
        {/* Icon Box */}
        <div className="bg-[#FFD700]/10 p-2 rounded-full shrink-0 animate-pulse">
          <BellRing size={16} className="text-[#FFD700]" />
        </div>

        {/* Text Content (Marquee) */}
        <div className="flex-1 overflow-hidden relative h-5 flex items-center mask-image-fade">
          <div className="animate-[marquee_20s_linear_infinite] whitespace-nowrap flex items-center gap-8">
            <p className="text-xs font-medium text-gray-200">
              {noticeText}
            </p>
            <p className="text-xs font-medium text-gray-200">
              {noticeText}
            </p>
          </div>
        </div>

        {/* Request Button */}
        <button 
          onClick={handleClick}
          className="bg-white/10 text-[#FFD700] text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#FFD700] hover:text-black transition-colors flex items-center gap-1 shrink-0 border border-[#FFD700]/20"
        >
          <MessageSquarePlus size={12} />
          REQ
        </button>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .mask-image-fade {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}</style>
    </div>
  );
};

export default NoticeBar;
