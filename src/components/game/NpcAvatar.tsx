import * as React from 'react';

interface NpcAvatarProps {
  name: string;
  emoji: string;
  imageUrl?: string;
  isTyping: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * NpcAvatar — Hiển thị avatar NPC với typing animation khi NPC đang trả lời.
 * Hỗ trợ cả ảnh thực và emoji fallback.
 */
export const NpcAvatar: React.FC<NpcAvatarProps> = ({
  name,
  emoji,
  imageUrl,
  isTyping,
  size = 'md',
}) => {
  const sizeClass = {
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-14 h-14 rounded-2xl',
    lg: 'w-20 h-20 rounded-2xl',
  }[size];

  return (
    <div className="relative flex-shrink-0">
      {/* Avatar container */}
      <div
        className={`${sizeClass} border-2 overflow-hidden transition-all duration-300 ${
          isTyping
            ? 'border-cyan-brand shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-105'
            : 'border-purple-brand/40 shadow-none scale-100'
        }`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-brand/30 to-navy-3 flex items-center justify-center text-2xl select-none">
            {emoji}
          </div>
        )}
      </div>

      {/* Typing indicator dots */}
      {isTyping && (
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1
                     bg-navy-2 border border-cyan-brand/30 rounded-full px-2 py-1
                     animate-fade-in"
        >
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-cyan-brand rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 150}ms`,
                animationDuration: '700ms',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NpcAvatar;
