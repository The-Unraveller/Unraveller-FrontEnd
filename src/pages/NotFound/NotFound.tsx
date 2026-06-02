import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Terminal, RefreshCw, ChevronLeft } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useGameStore } from '../../store/useGameStore';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useGameStore();

  return (
    <Layout isLoggedIn={!!user} username={user?.username}>
      <div className="max-w-screen-md mx-auto px-6 py-16 text-center font-mono">
        {/* Animated Security Shield Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse relative">
            <ShieldAlert size={48} className="text-red-500" />
            <div className="absolute inset-0 border border-red-500/10 rounded-3xl scale-125 animate-ping opacity-30" />
          </div>
        </div>

        {/* Error Code & Title */}
        <div className="mb-4">
          <span className="px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            MÃ LỖI: 404_SECURE_GATEWAY_BLOCKED
          </span>
        </div>

        <h1 className="text-white text-3xl md:text-4xl font-black tracking-widest uppercase mb-4 leading-tight">
          KẾT NỐI BỊ <span className="text-red-500 animate-pulse">NGẮT QUÃNG</span>
        </h1>

        <p className="text-white/60 text-sm leading-relaxed max-w-lg mx-auto mb-10">
          Hệ thống tường lửa bảo mật của <strong className="text-white">The Unraveller</strong> đã chặn yêu cầu này.
          Đường dẫn bạn đang truy cập không tồn tại hoặc đã bị mã hóa bảo mật từ chối quyền truy cập.
        </p>

        {/* Simulated Hack Log Console */}
        <div className="ur-card p-6 bg-black/60 border border-red-500/25 rounded-2xl max-w-md mx-auto mb-10 text-left relative overflow-hidden shadow-[0_4px_24px_rgba(239,68,68,0.05)]">
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-red-500/30 via-red-500 to-red-500/30" />
          
          <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-red-400 uppercase tracking-widest border-b border-white/5 pb-2">
            <Terminal size={12} />
            HỒ SƠ GIAO THỨC HỆ THỐNG
          </div>

          <div className="space-y-1.5 text-[11px] font-semibold text-red-500/70">
            <p className="flex justify-between">
              <span>STATUS:</span>
              <span className="text-red-500 font-bold">404_NOT_FOUND</span>
            </p>
            <p className="flex justify-between">
              <span>GATEWAY:</span>
              <span>LOCAL_SEC_PORT_443</span>
            </p>
            <p className="flex justify-between">
              <span>IP_SOURCE:</span>
              <span>127.0.0.1 (AUTHORIZED)</span>
            </p>
            <p className="flex justify-between">
              <span>DIAGNOSTIC:</span>
              <span className="animate-pulse">COGNITIVE_LINK_MISMATCH</span>
            </p>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold uppercase transition-all text-xs font-mono tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.55)] border border-red-500/40 flex items-center gap-2 group w-full sm:w-auto justify-center"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Vượt rào & Quay lại Trang chủ
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 hover:border-white/20 font-bold uppercase transition-all text-xs font-mono tracking-wider flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <RefreshCw size={14} />
            Quay lại trang trước
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
