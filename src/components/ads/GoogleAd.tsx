import * as React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

interface GoogleAdProps {
  className?: string;
  /**
   * banner  - full-width leaderboard banner (default, used on Missions / Course pages)
   * sidebar - vertical 200×200 unit (used in panel columns)
   * slim    - compact single-line strip, good below the game chat
   */
  type?: 'banner' | 'sidebar' | 'slim';
}

const GoogleAd: React.FC<GoogleAdProps> = ({ className = '', type = 'banner' }) => {
  const { user } = useGameStore();

  // Premium VIP users enjoy 100% ad-free experience
  if (user?.isPremium) return null;

  /* ── SLIM (game footer) ─────────────────────────────── */
  if (type === 'slim') {
    return (
      <div className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#0a071b]/60 border border-purple-brand/15 relative overflow-hidden ${className}`}>
        <span className="text-[7px] font-mono text-purple-light/40 select-none tracking-widest shrink-0">AD</span>
        <div className="flex-1 flex justify-center overflow-hidden">
          <iframe
            src="https://ad.a-ads.com/2412852?size=728x90"
            style={{ width: '100%', maxWidth: '468px', height: '60px', border: 0, padding: 0, overflow: 'hidden', backgroundColor: 'transparent' }}
            title="A-ADS Ad"
            scrolling="no"
          />
        </div>
        <Link to="/premium" className="shrink-0">
          <button className="px-3 py-1 bg-gradient-brand text-white text-[9px] font-black uppercase rounded-lg hover:shadow-glow-purple transition-all font-mono tracking-widest active:scale-95 whitespace-nowrap">
            Tắt QC
          </button>
        </Link>
      </div>
    );
  }

  /* ── SIDEBAR ────────────────────────────────────────── */
  if (type === 'sidebar') {
    return (
      <div className={`p-4 rounded-2xl bg-black/55 border border-purple-brand/20 text-center flex flex-col items-center justify-between min-h-[340px] relative overflow-hidden backdrop-blur-md shadow-glow-purple/5 ${className}`}>
        <div className="w-full flex items-center justify-between border-b border-white/5 pb-2 mb-3">
          <span className="text-[7px] font-mono text-purple-light/50 tracking-widest uppercase">SPONSORED BY A-ADS</span>
          <span title="Quảng cáo tài trợ" className="cursor-help">
            <Info size={10} className="text-white/20" />
          </span>
        </div>

        <div className="w-full flex justify-center items-center py-2 bg-[#090717]/40 rounded-xl border border-white/5 min-h-[210px] overflow-hidden">
          <iframe
            src="https://ad.a-ads.com/2412853?size=200x200"
            style={{ width: '200px', height: '200px', border: 0, padding: 0, overflow: 'hidden', backgroundColor: 'transparent' }}
            title="A-ADS Sidebar"
            scrolling="no"
          />
        </div>

        <div className="w-full mt-3 pt-3 border-t border-white/5">
          <p className="text-[9px] text-white/40 mb-2 font-sans leading-relaxed">
            Nâng cấp VIP để ẩn toàn bộ quảng cáo & nhận lượt chơi không giới hạn.
          </p>
          <Link to="/premium" className="w-full block">
            <button className="w-full py-2 bg-gradient-brand text-white text-[10px] font-black uppercase rounded-lg hover:shadow-glow-purple transition-all font-mono tracking-widest active:scale-95">
              Tắt Quảng Cáo (VIP)
            </button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── BANNER (default, Missions/Course pages) ────────── */
  return (
    <div className={`px-4 py-3 rounded-2xl bg-[#0a071b]/60 border border-purple-brand/20 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
      <span className="absolute top-1.5 right-3 text-[7px] font-mono text-purple-light/40 select-none tracking-widest">
        QUẢNG CÁO TÀI TRỢ
      </span>

      {/* Live A-ADS iframe */}
      <div className="flex-1 flex justify-center overflow-hidden rounded-xl">
        <iframe
          src="https://ad.a-ads.com/2412852?size=728x90"
          style={{ width: '100%', maxWidth: '728px', height: '90px', border: 0, padding: 0, overflow: 'hidden', backgroundColor: 'transparent' }}
          title="A-ADS Leaderboard Banner"
          scrolling="no"
        />
      </div>

      <Link to="/premium" className="shrink-0">
        <button className="px-4 py-2 bg-gradient-brand text-white text-[10px] font-black uppercase rounded-xl tracking-widest hover:shadow-glow-purple transition-all font-mono active:scale-95 whitespace-nowrap">
          Tắt Quảng Cáo ⚡
        </button>
      </Link>
    </div>
  );
};

export default GoogleAd;
