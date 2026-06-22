import * as React from 'react';

/**
 * ConfettiEffect — Hiệu ứng confetti khi user thắng game.
 * Sử dụng pure CSS animation, không cần thư viện ngoài.
 * Tự động unmount sau khi animation kết thúc.
 */
export const ConfettiEffect: React.FC = () => {
  const COLORS = ['#7C3AED', '#06B6D4', '#F59E0B', '#10B981', '#EC4899', '#F97316'];
  const PIECES = 36;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
    >
      {Array.from({ length: PIECES }).map((_, i) => {
        const color = COLORS[i % COLORS.length];
        const isCircle = i % 3 === 0;
        const size = 6 + Math.floor(Math.random() * 7); // 6–12px
        const left = Math.random() * 100;
        const delay = Math.random() * 0.9;
        const duration = 1.6 + Math.random() * 1.2;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: '-12px',
              width: `${size}px`,
              height: `${size}px`,
              background: color,
              borderRadius: isCircle ? '50%' : '2px',
              animation: `confetti-fall ${duration}s ${delay}s ease-in forwards`,
              opacity: 1,
            }}
          />
        );
      })}
    </div>
  );
};

export default ConfettiEffect;
