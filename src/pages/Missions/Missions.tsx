import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Star } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Seo from '../../components/seo/Seo';
import { getMissions, checkMissionAccess, getUserProfile } from '../../services/api';
import { toast } from 'react-toastify';
import { useGameStore } from '../../store/useGameStore';
import GoogleAd from '../../components/ads/GoogleAd';
import {
  getMissionLockStatus,
  getMissionStars,
  isMissionCompleted,
  getDifficultyColor,
  getDomainLabel,
  getDomainIcon,
  MissionDomain,
} from '../../utils/missionUtils';

interface CourseCard {
  id: number;
  stage: string;
  title: string;
  desc: string;
  img: string;
  locked: boolean;
  stars: number;
  completed: boolean;
  grammarTarget: string;
  difficulty: string;
  diffColor: string;
  xpReward: number;
  domain: MissionDomain;
}

const Missions = () => {
  const navigate = useNavigate();
  const [coursesList, setCoursesList] = useState<CourseCard[]>([]);
  const [loadingAccess, setLoadingAccess] = useState<number | null>(null);
  const { user, setUser } = useGameStore();

  const handleCardClick = async (id: number, locked: boolean) => {
    if (locked) return;
    if (user?.isPremium) {
      navigate(`/game/${id}`);
      return;
    }
    setLoadingAccess(id);
    try {
      const access = await checkMissionAccess(id);
      if (access.isAccessible) {
        navigate(`/game/${id}`);
      } else {
        toast.error(access.message);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Không thể kiểm tra truy cập');
    } finally {
      setLoadingAccess(null);
    }
  };

  useEffect(() => {
    const loadMissions = async () => {
      // Sync user profile silently — don't block mission loading on failure
      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (profileErr) {
        console.error('Failed to sync user profile:', profileErr);
      }

      // Always attempt to fetch and render missions
      try {
        const data = await getMissions();
        if (data && data.length > 0) {
          const sortedMissions = [...data].sort((a, b) => a.id - b.id);
          // Re-read the latest user from store after profile sync
          const latestUser = useGameStore.getState().user;
          const transformed = sortedMissions.map((m) => ({
            id: m.id,
            stage: m.stage.toUpperCase(),
            title: m.title,
            desc: (m.description || m.goal || '').replace(/\*/g, ''),
            img: m.imageUrl || (m.id === 1 ? '/scenario_coffee.png' : m.id === 2 ? '/scenario_classroom.png' : m.id === 5 ? '/scenario_detective.png' : ''),
            locked: getMissionLockStatus(m.id, latestUser),
            stars: getMissionStars(m.id, latestUser),
            completed: isMissionCompleted(m.id, latestUser),
            grammarTarget: m.grammarTarget,
            difficulty: m.difficulty,
            diffColor: getDifficultyColor(m.difficulty),
            xpReward: m.xpReward,
            domain: (m.domain ?? 0) as MissionDomain,
          }));
          setCoursesList(transformed);
        }
      } catch (err) {
        console.error('Failed to fetch missions:', err);
        toast.error('Không thể tải danh sách nhiệm vụ.');
      }
    };

    loadMissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout isLoggedIn username={user?.username || 'User'}>
      <Seo title="Chọn kịch bản học tập" description="Chọn từ 5+ kịch bản học tập thực tế" canonical="/courses" noIndex />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Chọn kịch bản học tập</h1>
          <p className="text-text-secondary">Chọn một tình huống thực tế để luyện tập tiếng Anh qua chat với NPC.</p>
        </div>

        <div className="space-y-8">
          {[MissionDomain.Professional, MissionDomain.Academic, MissionDomain.Social].map((domain) => {
            const domainMissions = coursesList.filter((course) => course.domain === domain);
            if (domainMissions.length === 0) return null;

            return (
              <div key={domain} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getDomainIcon(domain)}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white font-heading">{getDomainLabel(domain)}</h2>
                    <p className="text-xs text-text-secondary">
                      {domain === MissionDomain.Professional
                        ? 'Viết email, phỏng vấn, thuyết phục và xử lý tình huống công việc.'
                        : domain === MissionDomain.Academic
                          ? 'Biện luận, viết học thuật và tư duy phản biện bằng tiếng Anh.'
                          : 'Giao tiếp xã hội, làm theo chỉ dẫn và xử lý tình huống đời thường.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {domainMissions.map((course) => (
                    <div
                      key={course.id}
                      className={`ur-card ur-card-hover border-purple-brand/20 transition-all overflow-hidden flex flex-col ${
                        course.locked ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="h-40 bg-navy-3/80 relative overflow-hidden border-b border-purple-brand/20">
                        {course.img ? (
                          <img 
                            src={course.img} 
                            alt={course.title} 
                            className={`w-full h-full object-cover ${course.locked ? 'blur-[3px] opacity-25 grayscale' : 'transition-transform duration-500 hover:scale-105'}`} 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-navy-3/90">
                            <Lock size={32} className="text-purple-brand/50" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="badge badge-purple text-[10px] uppercase font-mono">
                            {course.stage}
                          </span>
                        </div>
                        {course.locked && (
                          <div className="absolute inset-0 bg-navy/60 backdrop-blur-[2px] flex items-center justify-center">
                            <Lock size={40} className="text-purple-brand/80 drop-shadow-[0_0_12px_rgba(124,58,237,0.6)]" />
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-2 font-heading">{course.title}</h3>
                          <p className="text-xs text-text-secondary mb-4 leading-relaxed font-body">{course.desc}</p>

                          {course.grammarTarget && !course.locked && (
                            <div className="bg-purple-brand/10 border border-purple-brand/35 rounded-xl p-3.5 mb-4 shadow-[inset_0_0_10px_rgba(124,58,237,0.1)]">
                              <div className="text-[10px] font-bold text-cyan-brand mb-1.5 uppercase tracking-wider font-mono">
                                Mục tiêu ngữ pháp
                              </div>
                              <p className="text-xs text-text-secondary font-body leading-relaxed">{course.grammarTarget}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-1 mt-2">
                            {[1, 2, 3].map((i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i <= course.stars ? 'text-warning fill-warning drop-shadow-[0_0_4px_rgba(245,158,11,0.6)]' : 'text-white/10'}
                              />
                            ))}
                            {course.locked && course.stars === 0 && (
                              <span className="text-[10px] text-text-muted ml-2 font-mono uppercase">Khóa</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCardClick(course.id, course.locked)}
                          disabled={course.locked || loadingAccess === course.id}
                          className={`mt-5 w-full btn btn-sm transition-all duration-300 font-semibold tracking-wider font-mono uppercase ${
                            course.locked
                              ? 'bg-navy-3/80 border border-white/10 text-white/30 cursor-not-allowed'
                              : loadingAccess === course.id
                                ? 'bg-purple-brand/50 text-white/50 cursor-wait'
                                : 'btn-primary shadow-glow-purple hover:scale-[1.02]'
                          }`}
                        >
                          {loadingAccess === course.id ? (
                            'Đang kiểm tra...'
                          ) : course.locked ? (
                            'Khóa'
                          ) : (
                            'Bắt đầu'
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {(!user?.isPremium) && (
          <div className="mt-12 relative overflow-hidden rounded-2xl border border-purple-brand/40 bg-gradient-to-r from-navy-2 via-purple-brand/10 to-navy-2 p-8 text-center shadow-[0_0_30px_rgba(124,58,237,0.1)]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-brand"></div>
            <h3 className="text-lg font-bold text-white mb-2 font-heading tracking-wide">⚡ NÂNG CẤP LÊN PREMIUM VIP</h3>
            <p className="text-sm text-text-secondary mb-6 max-w-2xl mx-auto leading-relaxed font-body">
              Mở khóa tất cả 6 kịch bản, bao gồm cả những kịch bản nâng cao, nhận gấp đôi XP và có trợ lý AI Coach cao cấp phân tích chuyên sâu.
            </p>
            <Link
              to="/premium"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-brand text-white rounded-full font-bold text-sm hover:shadow-glow-purple hover:scale-[1.03] transition-all duration-300"
            >
              Xem gói Premium
            </Link>
          </div>
        )}

        <GoogleAd className="mt-8" />
      </div>
    </Layout>
  );
};

export default Missions;
