import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Star, BookOpen, Flame, ShoppingBag, HelpCircle, Users, Lock, Play, Shield, Cpu, Activity
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Seo from '../../components/seo/Seo';
import { getMissions } from '../../services/api';
import { useGameStore } from '../../store/useGameStore';
import GoogleAd from '../../components/ads/GoogleAd';

const sidebarItems = [
  { icon: FileText, label: 'Báo cáo', id: 'report', to: '/report' },
  { icon: Star, label: 'Điểm số', id: 'score', to: '/score' },
  { icon: BookOpen, label: 'Kịch bản', id: 'scenario', to: '/courses' },
  { icon: Flame, label: 'Chuỗi ngày', id: 'streak', to: '/streak' },
  { icon: ShoppingBag, label: 'Cửa hàng', id: 'market', to: '/market' },
  { icon: HelpCircle, label: 'Hướng dẫn', id: 'guide', to: '/guide' },
  { icon: Users, label: 'Bạn bè', id: 'friends', to: '/friends' },
];

const courses = [
  {
    id: 1,
    stage: 'STAGE 1',
    title: 'Giao tiếp tại Quán Cà phê',
    desc: 'Luyện tập gọi món, trò chuyện ngắn và tiếng Anh giao tiếp trong quán cà phê.',
    img: '/scenario_coffee.png',
    locked: false,
    stars: 3,
    grammarTarget: "Sử dụng câu nói lịch sự với 'Would like' hoặc động từ khuyết thiếu 'Could/May'."
  },
  {
    id: 2,
    stage: 'STAGE 2',
    title: 'Làm theo Chỉ dẫn',
    desc: 'Lắng nghe cẩn thận, hiểu nhiệm vụ và thực hiện với độ chính xác cao.',
    img: '/scenario_classroom.png',
    locked: false,
    stars: 2,
    grammarTarget: "Sử dụng câu mệnh lệnh (Imperatives) hoặc thể bị động (Passive voice) để xác nhận nhiệm vụ."
  },
  {
    id: 3,
    stage: 'STAGE 3',
    title: 'Tranh luận & Đàm phán',
    desc: 'Luyện tập bảo vệ quan điểm và đạt được thỏa thuận bằng tiếng Anh.',
    img: '',
    locked: true,
    stars: 0,
    grammarTarget: "Sử dụng câu điều kiện loại 1 (If... will...) hoặc loại 2 (If... would...) để đàm phán."
  },
  {
    id: 4,
    stage: 'STAGE 4',
    title: 'Phỏng vấn Xin việc',
    desc: 'Vượt qua buổi phỏng vấn xin việc bằng tiếng Anh với vốn từ vựng chuyên nghiệp và tự tin.',
    img: '',
    locked: true,
    stars: 0,
    grammarTarget: "Sử dụng câu phức chứa mệnh đề quan hệ (Relative Clauses) hoặc liên từ (Because, Although)."
  },
  {
    id: 5,
    stage: 'STAGE 5',
    title: 'Báo cáo Điều tra',
    desc: 'Mô tả hiện trường vụ án và phá giải các bí ẩn bằng văn bản tiếng Anh.',
    img: '/scenario_detective.png',
    locked: false,
    stars: 0,
    grammarTarget: "Sử dụng trạng từ mô tả (Descriptive Adverbs) và thì Quá khứ đơn (Past Simple) để báo cáo chứng cứ."
  },
  {
    id: 6,
    stage: 'STAGE 6',
    title: 'Nhập vai Nâng cao',
    desc: 'Xử lý các tình huống phức tạp có nhiều nhân vật với mục tiêu đa lớp.',
    img: '',
    locked: true,
    stars: 0,
    grammarTarget: "Sử dụng câu giả định (Subjunctive Mood) hoặc lối nói gián tiếp (Reported Speech) ở trình độ cao."
  },
];

interface CourseItem {
  id: number;
  stage: string;
  title: string;
  desc: string;
  img: string;
  locked: boolean;
  stars: number;
  grammarTarget: string;
}

const CourseCard = ({
  course,
  onClick,
}: {
  course: CourseItem;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      id={`course-card-${course.id}`}
      className={`ur-card relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300 flex-1 min-h-[360px] ${
        course.locked
          ? 'opacity-60 cursor-not-allowed border-white/5 bg-black/20'
          : 'cursor-pointer border-purple-500/25 hover:border-cyan-brand/50 hover:shadow-[0_8px_32px_rgba(6,182,212,0.15)] hover:-translate-y-1.5'
      }`}
    >
      {/* Visual Header / Image Box */}
      <div className="relative h-40 overflow-hidden flex-shrink-0 bg-[#16122d]">
        {course.img && !course.locked ? (
          <>
            <img
              src={course.img}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1e] to-transparent opacity-80" />
            <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-cyan-brand/80 backdrop-blur-sm flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-transform duration-200 active:scale-90">
              <Play size={12} className="text-black fill-black ml-0.5" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-950/15 via-[#1a1640]/40 to-[#0f0c1e] relative overflow-hidden">
            {/* Holographic decor */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--cyan) 1px, transparent 0)', backgroundSize: '12px 12px' }} />
            {course.locked ? (
              <>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-red-500/20 bg-red-950/10 flex items-center justify-center">
                    <Lock size={20} className="text-red-400/60" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <BookOpen size={24} className="text-purple-brand/35 mb-2" />
                <span className="text-[9px] font-mono text-purple-brand/50 uppercase tracking-widest">PHÂN KHU DỮ LIỆU // BẢO MẬT</span>
              </>
            )}
          </div>
        )}

        {/* Stage Badge (Top-left) */}
        <span className="absolute top-3 left-3 text-[10px] font-black text-cyan-brand bg-black/60 px-2.5 py-0.5 rounded-md border border-cyan-brand/30 backdrop-blur-md font-mono tracking-wider">
          {course.stage}
        </span>

        {/* Node Status Badge (Top-right) */}
        <span className={`absolute top-3 right-3 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border backdrop-blur-md flex items-center gap-1 ${
          course.locked 
            ? 'text-red-400 border-red-500/20 bg-black/60' 
            : 'text-emerald-400 border-emerald-500/30 bg-black/60 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${course.locked ? 'bg-red-500' : 'bg-emerald-400 animate-pulse'}`} />
          {course.locked ? 'ĐÃ MÃ HÓA' : 'HOẠT ĐỘNG'}
        </span>
      </div>

      {/* Main Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-white text-base font-black tracking-normal leading-snug line-clamp-1">{course.title}</h3>
          <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mt-0.5">{course.desc}</p>
        </div>

        {/* Decryption Syntax constraint */}
        {course.grammarTarget && !course.locked && (
          <div className="mt-2 p-2.5 rounded-lg bg-black/45 border border-cyan-brand/20 text-[11px] font-mono text-cyan-brand shadow-[inset_0_1px_4px_rgba(6,182,212,0.05)]">
            <span className="font-extrabold uppercase tracking-wider text-[9px] text-cyan-brand/80 block mb-1.5 flex items-center gap-1">
              <Cpu size={10} />
              MỤC TIÊU GIẢI MÃ CÚ PHÁP:
            </span>
            <span className="text-white/80 font-sans leading-relaxed block">{course.grammarTarget}</span>
          </div>
        )}

        {/* Rating & Action Panel */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between mt-auto">
          {/* Star ratings */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={
                  i < course.stars 
                    ? 'text-[#f5c842] fill-[#f5c842] drop-shadow-[0_0_6px_rgba(245,200,66,0.6)]' 
                    : 'text-white/10 fill-white/5'
                }
              />
            ))}
          </div>

          {/* Inline CTA Button */}
          {course.locked ? (
            <div className="text-[10px] font-mono text-white/35 flex items-center gap-1 font-bold">
              <Lock size={10} className="text-white/30" />
              ĐANG KHÓA
            </div>
          ) : (
            <div className="text-[10px] font-mono text-cyan-brand hover:text-cyan-300 font-extrabold flex items-center gap-0.5 group">
              GIẢI MÃ NÚT MẠNG
              <Play size={8} fill="currentColor" className="ml-0.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Missions = () => {
  const navigate = useNavigate();
  const [coursesList, setCoursesList] = useState<CourseItem[]>(courses);
  const { user } = useGameStore();

  useEffect(() => {
    getMissions()
      .then((data) => {
        if (data && data.length > 0) {
          const sortedMissions = [...data].sort((a, b) => a.id - b.id);
          const transformed = sortedMissions.map((m, idx) => {
            const progress = user?.missionProgresses?.find(p => p.missionId === m.id);
            let stars = 0;
            if (progress && progress.status === 'Completed') {
              if (progress.currentSuspicion < 25) stars = 3;
              else if (progress.currentSuspicion < 50) stars = 2;
              else stars = 1;
            }

            let locked = m.locked;
            if (user?.isPremium) {
              locked = false;
            } else {
              if (m.id > 3) {
                locked = true;
              } else if (m.id === 2) {
                const step1Completed = user?.missionProgresses?.some(p => p.missionId === 1 && p.status === 'Completed');
                locked = !step1Completed;
              } else if (m.id === 3) {
                const step2Completed = user?.missionProgresses?.some(p => p.missionId === 2 && p.status === 'Completed');
                locked = !step2Completed;
              } else {
                locked = false; // Course 1 is always unlocked
              }
            }

            return {
              id: m.id,
              stage: m.stage.toUpperCase(),
              title: m.title,
              desc: ((m.description || m.goal) || '').replace(/\*/g, ''),
              img: m.imageUrl || (idx === 0 ? '/scenario_coffee.png' : idx === 1 ? '/scenario_classroom.png' : idx === 4 ? '/scenario_detective.png' : ''),
              locked: locked,
              stars: stars,
              grammarTarget: m.grammarTarget
            };
          });
          setCoursesList(transformed);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch missions:', err);
      });
  }, [user]);

  return (
    <Layout isLoggedIn username={user?.username || 'Agent'}>
      <Seo title="Chon Kich Ban Hoc Tap" description="Chon tu 5+ kich ban hoc tap thuc te: quan ca phe, phong van xin viec, tham tu dieu tra. Moi nhiem vu de cao ky nang nghe, noi, doc, viet tieng Anh." keywords="kich ban, nhiem vu, hoc tap, ky nang tieng Anh, quan ca phe, phong van" canonical="/courses" noIndex />
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* ── Main Content Dashboard ── */}
        <div className="min-w-0">
          {/* Holographic Header Panel */}
          <div className="gradient-card border border-purple-500/20 rounded-2xl p-6 mb-6 relative overflow-hidden backdrop-blur-xl bg-black/25">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-brand/10 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-brand/20 via-cyan-brand/40 to-purple-brand/20" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-cyan-brand font-mono text-[10px] uppercase tracking-widest font-black">
                  <Activity size={10} className="animate-pulse" />
                  NHẬT KÝ HỆ THỐNG: HOẠT ĐỘNG // TIẾN TRÌNH GIẢI MÃ CỔNG MẠNG ĐANG CHẠY
                </div>
                <h1 className="text-white text-2xl font-black mt-1 tracking-normal uppercase">
                  Cổng Kết Nối Đặc Vụ:&nbsp;
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] via-[#7c3aed] to-cyan-brand">
                    {user?.username || 'AGENT_GUEST'}
                  </span>
                </h1>
                <p className="text-white/45 text-xs mt-1 leading-relaxed max-w-xl">
                  Hãy chọn một nút mạng bảo mật bên dưới để bắt đầu vượt qua bộ lọc ngôn ngữ của hệ thống. Các nút bảo mật cấp cao yêu cầu tuân thủ đúng mục tiêu ngữ pháp tương ứng.
                </p>
              </div>

              {/* Dashboard Stats */}
              <div className="flex gap-3 w-full md:w-auto">
                <div className="flex-1 md:flex-none bg-black/45 rounded-xl p-3 border border-white/5 min-w-[125px]">
                  <div className="text-white/40 text-[8px] font-mono uppercase tracking-widest font-bold">TỔNG ĐIỂM XP</div>
                  <div className="text-[#f5c842] text-lg font-black flex items-baseline gap-1 mt-0.5 font-mono">
                    {user?.xpBalance.toLocaleString() || '0'}
                    <span className="text-[10px] text-white/40 font-normal">XP</span>
                  </div>
                </div>
                <div className="flex-1 md:flex-none bg-black/45 rounded-xl p-3 border border-white/5 min-w-[125px]">
                  <div className="text-white/40 text-[8px] font-mono uppercase tracking-widest font-bold">TRÌNH ĐỘ CEFR</div>
                  <div className="text-cyan-brand text-lg font-black mt-0.5 font-mono">
                    {user?.englishLevel || 'A1'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Unified Mission Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {coursesList.map((c) => (
              <CourseCard key={c.id} course={c} onClick={() => !c.locked && navigate(`/game/${c.id}`)} />
            ))}
          </div>

          {/* Premium Banner */}
          <div className="gradient-card border border-[#f5c842]/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl bg-black/25 mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f5c842]/5 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#f5c842]/30 to-transparent" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-[#f5c842] font-mono text-[9px] uppercase tracking-widest font-black">
                  <Shield size={10} className="animate-pulse" />
                  MỨC ĐỘ MẬT // PHÁT HIỆN HÀNH TRÌNH NÂNG CẤP ĐẶC QUYỀN TRUY CẬP
                </div>
                <h3 className="text-white text-lg font-black mt-1 uppercase tracking-tight">
                  Nâng Cấp Đặc Vụ Giải Mã Bậc Thầy
                </h3>
                <p className="text-white/45 text-xs mt-1 max-w-2xl leading-relaxed">
                  Sở hữu quyền truy cập tối cao (Root) vào hơn 50+ máy chủ bảo mật toàn cầu, vượt qua các đợt quét an ninh chuyên sâu không giới hạn với năng lượng vô hạn, nhận phản hồi sửa lỗi nâng cao từ AI bản xứ và hiển thị huy hiệu danh hiệu Cybernetic vàng huyền thoại trên hồ sơ của bạn.
                </p>
              </div>
              <Link
                to="/premium"
                className="w-full md:w-auto text-center py-2.5 px-6 bg-gradient-to-r from-[#f5c842] to-amber-600 hover:from-amber-400 hover:to-amber-600 text-black font-black text-xs rounded-xl tracking-widest uppercase transition-all duration-300 shadow-[0_4px_16px_rgba(245,200,66,0.15)] hover:shadow-[0_4px_22px_rgba(245,200,66,0.3)] shrink-0 active:scale-95 border border-[#f5c842]/30"
              >
                NÂNG CẤP NGAY
              </Link>
            </div>
          </div>

          {/* Google Ad Block */}
          <GoogleAd className="mb-8 animate-fade-in" />
        </div>
      </div>
    </Layout>
  );
};

export default Missions;
