import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, Copy, Check, Home, Shield, Calendar, Activity, Zap, Cpu, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import Seo from '../../components/seo/Seo';
import { getCertificateByToken } from '../../services/api';
import type { CertificateDto } from '../../services/api';

const CourseCertificate = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [cert, setCert] = useState<CertificateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError('');

    getCertificateByToken(token)
      .then((data) => {
        setCert(data);
      })
      .catch((err) => {
        console.error('Failed to load certificate:', err);
        setError('Không tìm thấy chứng chỉ hoặc mã xác minh không hợp lệ.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const copyShareLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        toast.success('Đã sao chép link chứng chỉ thành công!');
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(() => {
        toast.error('Không thể sao chép liên kết.');
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0c1e] text-white flex flex-col items-center justify-center font-mono">
        <RefreshCw className="w-8 h-8 text-cyan-brand animate-spin mb-3" />
        <p className="text-xs uppercase tracking-widest text-cyan-brand animate-pulse">[Đang xác thực token chứng nhận...]</p>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-[#0f0c1e] text-white flex flex-col items-center justify-center px-4 font-mono">
        <div className="w-full max-w-md p-6 bg-black/40 border border-red-500/30 rounded-2xl text-center shadow-[0_0_24px_rgba(239,68,68,0.1)]">
          <span className="text-4xl block mb-4">⚠️</span>
          <h2 className="text-red-400 font-black text-lg mb-2 uppercase">LỖI XÁC THỰC MÃ MẠNG</h2>
          <p className="text-white/60 text-xs leading-relaxed mb-6">
            {error || 'Mã token chứng chỉ không tồn tại hoặc đã bị thu hồi khỏi hệ thống.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 px-4 bg-white/5 border border-white/10 hover:border-cyan-brand/50 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2"
          >
            <Home size={14} /> Quay lại Trang chủ
          </button>
        </div>
      </div>
    );
  }

  const completeDateStr = cert.completedAt 
    ? new Date(cert.completedAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) 
    : 'Không rõ';

  return (
    <>
      <Seo 
        title={`Chung Nhan Hoan Thanh: ${cert.mission.title}`} 
        description={`Chung chi giai ma nut mang hoan toan hop le cap cho Dac vu ${cert.user.username}`} 
        keywords="chung chi, giai ma, the unraveller, tieng anh, game" 
        canonical={`/certificate/${token}`} 
        noIndex={false} 
      />
      <div className="min-h-screen bg-[#06040d] text-white flex flex-col items-center justify-center py-10 px-4 relative overflow-hidden font-mono selection:bg-cyan-brand/35">
        
        {/* Holographic glowing backgrounds */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-brand/5 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-brand/5 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(6,182,212,0.02)_1px,transparent_0)] bg-[size:24px_24px] pointer-events-none" />

        {/* Scanline Sweep animation */}
        <div className="absolute inset-x-0 h-0.5 bg-cyan-brand/10 shadow-[0_0_8px_rgba(6,182,212,0.4)] animate-scanline pointer-events-none" />

        {/* Main Certificate Outer Box */}
        <div className="w-full max-w-3xl relative z-10 animate-fade-in">
          
          {/* Certificate Board */}
          <div className="ur-card rounded-3xl p-6 md:p-10 border border-purple-500/25 bg-black/45 backdrop-blur-xl relative overflow-hidden shadow-[0_0_50px_rgba(124,58,237,0.15)] flex flex-col items-center">
            
            {/* Top Glowing Ribbon Bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-brand via-cyan-brand to-purple-brand" />

            {/* Corner Decorative Tech Brackets */}
            <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-cyan-brand/40" />
            <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-cyan-brand/40" />
            <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-cyan-brand/40" />
            <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-cyan-brand/40" />

            {/* HUD Status Readouts */}
            <div className="w-full flex justify-between items-center text-[8px] text-cyan-brand/60 uppercase tracking-widest border-b border-white/5 pb-3 mb-6">
              <span>[ĐẶC VỤ GIẢI MÃ: HOẠT ĐỘNG]</span>
              <span>TOKEN: CERT-{cert.mission.id}-{cert.user.username.toUpperCase().substring(0, 5)}</span>
              <span>HỆ THỐNG XÁC MINH CƠ SỞ DỮ LIỆU</span>
            </div>

            {/* Shield / Logo Icon */}
            <div className="w-16 h-16 rounded-full bg-cyan-brand/10 border border-cyan-brand/30 flex items-center justify-center text-3xl mb-5 shadow-[0_0_20px_rgba(6,182,212,0.2)] relative">
              <Shield size={28} className="text-cyan-brand" />
              <div className="absolute inset-0 rounded-full border border-cyan-brand/20 animate-ping" style={{ animationDuration: '3s' }} />
            </div>

            {/* Certificate Heading */}
            <h1 className="text-xl md:text-2xl font-black uppercase text-center tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-white drop-shadow-[0_2px_8px_rgba(6,182,212,0.4)] leading-normal py-1">
              Chứng Nhận Giải Mã Nút Mạng
            </h1>
            <p className="text-[10px] text-purple-soft/60 uppercase tracking-widest mt-1 text-center font-bold">
              THE UNRAVELLER // CYBERNETIC COGNITIVE ACADEMY
            </p>

            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-purple-brand to-transparent my-6" />

            {/* Content Body */}
            <div className="text-center space-y-4 max-w-xl">
              <p className="text-xs text-white/50 uppercase tracking-wide">XÁC THỰC RẰNG ĐẶC VỤ</p>
              
              <h2 className="text-2xl md:text-3xl font-black tracking-normal text-white uppercase bg-clip-text bg-gradient-to-b from-white to-white/70">
                {cert.user.username}
              </h2>
              
              <p className="text-xs text-white/60 leading-relaxed font-sans max-w-md mx-auto">
                Đạt trình độ đánh giá <span className="text-cyan-brand font-bold font-mono text-sm border border-cyan-brand/30 px-1.5 py-0.5 rounded bg-cyan-brand/5">{cert.user.englishLevel}</span>, đã xâm nhập thành công và giải mã bộ lọc ngôn ngữ tại máy chủ:
              </p>

              {/* Scenario Card */}
              <div className="my-5 p-4 rounded-2xl bg-gradient-to-br from-purple-950/20 via-black/45 to-[#15122d] border border-purple-500/20 relative shadow-[inset_0_1px_4px_rgba(124,58,237,0.1)]">
                <span className="absolute top-2.5 left-3 text-[8px] font-bold text-purple-soft/50 font-mono tracking-widest uppercase">STAGE ID: {cert.mission.stage}</span>
                <span className="absolute top-2.5 right-3 text-[8px] font-bold text-emerald-400/70 font-mono flex items-center gap-0.5"><Activity size={8} /> ĐÃ GIẢI MÃ</span>
                
                <h3 className="text-white text-base font-black mt-3 mb-1">{cert.mission.title}</h3>
                <p className="text-white/45 text-[10px] italic font-sans max-w-sm mx-auto">{cert.mission.goal}</p>

                {/* Achievement metrics */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-white/5 text-xs text-left font-mono">
                  <div className="flex items-center gap-2">
                    <Zap size={13} className="text-[#f5c842]" />
                    <div>
                      <span className="text-[8px] text-white/30 block uppercase leading-none">THƯỞNG XP</span>
                      <span className="text-[#f5c842] font-extrabold text-[11px]">+{cert.xpEarned} XP</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu size={13} className="text-cyan-brand" />
                    <div>
                      <span className="text-[8px] text-white/30 block uppercase leading-none">ĐỘ PHỨC TẠP</span>
                      <span className="text-cyan-brand font-extrabold text-[11px] uppercase">{cert.mission.difficulty}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grammar Achieved Badge */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-cyan-brand/20 text-left">
                <div className="text-[8px] font-extrabold font-mono text-cyan-brand/80 flex items-center gap-1 mb-1 uppercase tracking-widest">
                  <Sparkles size={8} className="animate-pulse" />
                  MỤC TIÊU NGỮ PHÁP ĐÃ ĐẠT:
                </div>
                <p className="text-white/80 text-xs leading-relaxed font-sans font-medium">
                  {cert.mission.grammarTarget}
                </p>
              </div>
            </div>

            <div className="w-full border-t border-white/5 mt-6 pt-5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono">
              {/* Token Display */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <span className="text-[8px] text-white/30 uppercase tracking-widest">MÃ CHỨNG CHỈ (BLOCK TOKEN)</span>
                <span className="text-cyan-brand font-black tracking-wider text-[11px] select-all bg-black/45 border border-cyan-brand/10 px-2 py-0.5 rounded mt-0.5">
                  {cert.token}
                </span>
              </div>

              {/* Signed & Date */}
              <div className="flex flex-col items-center md:items-end text-center md:text-right">
                <span className="text-[8px] text-white/30 uppercase tracking-widest">NGÀY CẤP CHỨNG NHẬN</span>
                <span className="text-white/70 font-semibold mt-0.5 flex items-center gap-1">
                  <Calendar size={11} className="text-purple-soft/50" />
                  {completeDateStr}
                </span>
              </div>
            </div>

            {/* Signature Label */}
            <div className="text-center mt-6 text-[8px] font-mono text-white/20 uppercase tracking-wider">
              Bảo mật mã hóa xác minh tự động bởi The Unraveller AI Evaluation Protocol v2.5.1
            </div>

          </div>

          {/* Action Row */}
          <div className="flex justify-center gap-4 mt-6 flex-wrap">
            <button
              onClick={copyShareLink}
              className={`py-3 px-6 rounded-xl text-xs font-bold uppercase transition-all duration-300 flex items-center gap-2 shadow-lg ${
                copied 
                  ? 'bg-emerald-600 text-white shadow-emerald-600/10' 
                  : 'bg-cyan-brand hover:bg-cyan-300 text-black shadow-cyan-brand/10 hover:shadow-cyan-brand/20 active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} /> ĐÃ SAO CHÉP LINK
                </>
              ) : (
                <>
                  <Copy size={14} /> CHIA SẺ CHỨNG CHỈ
                </>
              )}
            </button>
            
            <button
              onClick={() => navigate('/courses')}
              className="py-3 px-6 bg-[#181335] hover:bg-[#201a47] border border-purple-500/20 hover:border-purple-500/40 text-purple-soft hover:text-white rounded-xl text-xs font-bold uppercase transition-all duration-300 flex items-center gap-2 active:scale-95"
            >
              <Activity size={14} /> Màn chơi / Kịch bản
            </button>

            <button
              onClick={() => navigate('/')}
              className="py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-xl text-xs font-bold uppercase transition-all duration-300 flex items-center gap-2 active:scale-95"
            >
              <Home size={14} /> Trang chủ
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default CourseCertificate;
