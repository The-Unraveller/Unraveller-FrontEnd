import * as React from 'react';

interface PageLoaderProps {
  message?: string;
  fullscreen?: boolean;
}

/**
 * PageLoader — Thành phần hiển thị hiệu ứng tải trang đồng bộ với PageTransitionLoader.
 * Sử dụng để hiển thị trạng thái chờ tải dữ liệu của từng trang cụ thể (Game, Dashboard, Profile, v.v.).
 */
export const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = 'Đang tải dữ liệu...',
  fullscreen = true
}) => {
  const containerClass = fullscreen 
    ? "min-h-screen flex flex-col items-center justify-center bg-navy text-white animate-fade-in"
    : "w-full py-20 flex flex-col items-center justify-center text-white animate-fade-in";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-6">
        {/* Holographic glowing spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-purple-brand/20 border-t-purple-brand rounded-full animate-spin" />
          <div className="absolute inset-2 border-2 border-cyan-brand/20 border-b-cyan-brand rounded-full animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
          <div className="absolute inset-4 flex items-center justify-center text-xl animate-pulse">
            🔮
          </div>
        </div>

        {/* Dynamic loading text matching project brand */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h2 className="text-xs font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-brand font-heading uppercase animate-pulse">
            {message}
          </h2>
          <p className="text-[9px] font-mono text-text-muted uppercase tracking-[0.3em]">
            THE UNRAVELLER
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
