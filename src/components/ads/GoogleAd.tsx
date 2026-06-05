import * as React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Link } from 'react-router-dom';
import { Shield, ExternalLink, Info } from 'lucide-react';

interface GoogleAdProps {
  className?: string;
  type?: 'banner' | 'sidebar';
}

const GoogleAd: React.FC<GoogleAdProps> = ({ className = '', type = 'banner' }) => {
  const { user } = useGameStore();

  // Premium VIP users enjoy 100% ad-free experience
  if (user?.isPremium) return null;

  if (type === 'sidebar') {
    return (
      <div className={`p-4 rounded-2xl bg-black/55 border border-purple-brand/20 text-center flex flex-col items-center justify-between min-h-[340px] relative overflow-hidden backdrop-blur-md shadow-glow-purple/5 ${className}`}>
        {/* Ad Tag Header */}
        <div className="w-full flex items-center justify-between border-b border-white/5 pb-2 mb-3">
          <span className="text-[7px] font-mono text-purple-light/50 tracking-widest uppercase">SPONSORED BY A-ADS</span>
          <span title="Quảng cáo tài trợ hiển thị ngẫu nhiên" className="cursor-help">
            <Info size={10} className="text-white/20" />
          </span>
        </div>
        
        {/* Live A-ADS 200x200 Widget Iframe */}
        <div className="w-full flex justify-center items-center py-2 bg-[#090717]/40 rounded-xl border border-white/5 min-h-[210px] overflow-hidden">
          <iframe 
            src="https://ad.a-ads.com/2412853?size=200x200" 
            style={{ width: '200px', height: '200px', border: 0, padding: 0, overflow: 'hidden', backgroundColor: 'transparent' }}
            title="A-ADS Sidebar Advertising Widget"
            scrolling="no"
          />
        </div>

        {/* CTA Upgrade to Premium */}
        <div className="w-full mt-3 pt-3 border-t border-white/5">
          <p className="text-[9px] text-white/40 mb-2 font-sans leading-relaxed">
            Nâng cấp VIP chỉ với 199K để ẩn toàn bộ quảng cáo & nhận lượt chơi không giới hạn.
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

  return (
    <div className={`p-5 rounded-3xl bg-[#0a071b]/60 border border-purple-brand/25 relative overflow-hidden shadow-glow-purple/5 backdrop-blur-md flex flex-col xl:flex-row justify-between items-center gap-5 ${className}`}>
      {/* Horizontal Header Banner Tag */}
      <span className="absolute top-1.5 right-3 text-[7px] font-mono text-purple-light/40 select-none tracking-widest">
        QUẢNG CÁO TÀI TRỢ // LIVE AD NETWORK
      </span>
      
      {/* Description & Branding */}
      <div className="flex items-start gap-4 flex-1 w-full xl:w-auto mt-2 xl:mt-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-brand/20 to-purple-soft/10 border border-purple-brand/30 flex items-center justify-center text-xl flex-shrink-0 animate-pulse-slow">
          🛸
        </div>
        <div>
          <h4 className="text-white text-sm font-black font-heading tracking-wide uppercase flex items-center gap-1.5">
            Mạng Lưới Giải Mã Quảng Cáo Freemium
            <span className="text-[9px] font-mono text-cyan-brand bg-cyan-brand/10 border border-cyan-brand/20 px-1.5 py-0.5 rounded uppercase">LIVE</span>
          </h4>
          <p className="text-white/45 text-xs mt-1 leading-relaxed font-sans max-w-xl">
            Tài khoản miễn phí được tài trợ bởi mạng lưới quảng cáo phi tập trung. Bạn có thể ủng hộ dự án khởi nghiệp bằng cách tương tác, hoặc mua gói Premium VIP để gỡ bỏ quảng cáo hoàn toàn.
          </p>
        </div>
      </div>

      {/* Live A-ADS 728x90 Widget Iframe */}
      <div className="flex-shrink-0 bg-[#080516]/50 p-2 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden max-w-full">
        <iframe 
          src="https://ad.a-ads.com/2412852?size=728x90" 
          style={{ width: '728px', height: '90px', border: 0, padding: 0, overflow: 'hidden', backgroundColor: 'transparent' }}
          title="A-ADS Horizontal Leaderboard Banner Widget"
          scrolling="no"
        />
      </div>

      {/* VIP Conversion CTA */}
      <Link to="/premium" className="w-full xl:w-auto flex-shrink-0">
        <button className="w-full xl:w-auto px-6 py-3 bg-gradient-brand text-white text-xs font-black uppercase rounded-2xl tracking-widest hover:shadow-glow-purple transition-all font-mono active:scale-95 shadow-[0_4px_20px_rgba(124,58,237,0.15)] flex items-center justify-center gap-1">
          Nâng Cấp VIP <ExternalLink size={12} />
        </button>
      </Link>
    </div>
  );
};

export default GoogleAd;
