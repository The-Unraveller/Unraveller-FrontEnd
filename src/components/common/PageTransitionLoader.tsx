import * as React from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransitionLoader — Màn hình tải trang mượt mà (simulated loading screen)
 * kích hoạt khi người dùng chuyển trang để tạo trải nghiệm mượt mà, đồng bộ.
 */
export const PageTransitionLoader: React.FC = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Tránh hiện loading screen khi load lần đầu (để dành cho auth initializing)
    // Hoặc có thể hiện luôn để tạo hiệu ứng chuyển tiếp mượt mà.
    setShouldRender(true);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 450); // Màn hình loading hiển thị 450ms

    const destroyTimer = setTimeout(() => {
      setShouldRender(false);
    }, 750); // 300ms transition fade-out

    return () => {
      clearTimeout(timer);
      clearTimeout(destroyTimer);
    };
  }, [location.pathname]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-navy/95 backdrop-blur-md transition-opacity duration-300 pointer-events-none ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-6 pointer-events-auto">
        {/* Holographic glowing outer ring spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-purple-brand/20 border-t-purple-brand rounded-full animate-spin" />
          <div className="absolute inset-2 border-2 border-cyan-brand/20 border-b-cyan-brand rounded-full animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
          <div className="absolute inset-4 flex items-center justify-center text-xl animate-pulse">
            🔮
          </div>
        </div>

        {/* Dynamic Glowing Text */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h2 className="text-xs font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-brand font-heading uppercase animate-pulse">
            Đang tải dữ liệu
          </h2>
          <p className="text-[9px] font-mono text-text-muted uppercase tracking-[0.3em]">
            THE UNRAVELLER
          </p>
        </div>

        {/* Glow neon progress indicator */}
        <div className="w-44 h-1 bg-white/5 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-brand rounded-full transition-all duration-[450ms] ease-out"
            style={{
              width: visible ? '100%' : '0%',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PageTransitionLoader;
