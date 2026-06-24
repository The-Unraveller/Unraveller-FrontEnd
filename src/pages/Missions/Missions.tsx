import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Star } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Seo from '../../components/seo/Seo';
import { getMissions, checkMissionAccess, getUserProfile } from '../../services/api';
import { getOptimizedImageUrl } from '../../utils/image';
import type { SubTaskDto, MissionDto } from '../../services/api';
import { toast } from 'react-toastify';
import { useGameStore } from '../../store/useGameStore';
import GoogleAd from '../../components/ads/GoogleAd';
import { SubTaskChecklist } from '../../components/game/SubTaskChecklist';
import { PageLoader } from '../../components/common/PageLoader';
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
  subTasks: SubTaskDto[];
}

const Missions = () => {
  const navigate = useNavigate();
  const [rawMissions, setRawMissions] = useState<MissionDto[]>([]);
  const [loadingAccess, setLoadingAccess] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useGameStore();

  const coursesList = useMemo<CourseCard[]>(() => {
    if (!rawMissions || rawMissions.length === 0) return [];
    const sortedMissions = [...rawMissions].sort((a, b) => a.id - b.id);
    return sortedMissions.map((m) => ({
      id: m.id,
      stage: m.stage.toUpperCase(),
      title: m.title,
      desc: (m.description || m.goal || '').replace(/\*/g, ''),
      img: getOptimizedImageUrl(m.imageUrl || (m.id === 1 ? '/scenario_coffee.png' : m.id === 2 ? '/scenario_classroom.png' : m.id === 5 ? '/scenario_detective.png' : '')),
      locked: getMissionLockStatus(m.id, user),
      stars: getMissionStars(m.id, user),
      completed: isMissionCompleted(m.id, user),
      grammarTarget: m.grammarTarget,
      difficulty: m.difficulty,
      diffColor: getDifficultyColor(m.difficulty),
      xpReward: m.xpReward,
      domain: (m.domain ?? 0) as MissionDomain,
      subTasks: m.subTasks || [],
    }));
  }, [rawMissions, user]);

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
      setIsLoading(true);
      
      // Fetch user profile silently in the background to update status
      getUserProfile()
        .then((profile) => {
          setUser(profile);
        })
        .catch((profileErr) => {
          console.error('Failed to sync user profile:', profileErr);
        });

      try {
        const data = await getMissions();
        if (data) {
          setRawMissions(data);
        }
      } catch (err) {
        console.error('Failed to fetch missions:', err);
        toast.error('Không thể tải danh sách nhiệm vụ.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <PageLoader message="Đang tải danh sách nhiệm vụ..." />;
  }

  return (
    <Layout isLoggedIn username={user?.username || 'User'}>
      <Seo title="Chọn kịch bản học tập" description="Chọn từ 5+ kịch bản học tập thực tế" canonical="/courses" noIndex />
      <div className="max-w-screen-xl mx-auto px-4 py-8">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
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
                            src={getOptimizedImageUrl(course.img)} 
                            alt={course.title} 
                            className={`w-full h-full object-cover ${course.locked ? 'blur-[3px] opacity-25 grayscale' : 'transition-transform duration-500 hover:scale-105'}`} 
                            width={320}
                            height={160}
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
                          <h3 className="text-lg font-bold text-white mb-3 font-heading">{course.title}</h3>

                          {course.grammarTarget && !course.locked && (
                            <div className="bg-gradient-to-br from-purple-brand/15 to-cyan-brand/10 border border-purple-brand/50 rounded-xl p-4 mb-4 shadow-[inset_0_0_15px_rgba(124,58,237,0.15)]">
                              <div className="text-[11px] font-bold text-cyan-brand mb-2 uppercase tracking-wider font-mono flex items-center gap-1.5">
                                <span>🎯</span> Mục tiêu ngữ pháp
                              </div>
                              <p className="text-sm text-white/85 font-body leading-relaxed font-medium">{course.grammarTarget}</p>
                            </div>
                          )}

                          {course.subTasks && course.subTasks.length > 0 && !course.locked && (
                            <div className="mb-4">
                              <div className="text-[11px] font-bold text-cyan-brand mb-2 uppercase tracking-wider font-mono flex items-center gap-1.5">
                                <span>📝</span> Nhiệm vụ con
                                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-purple-brand/20 border border-purple-brand/30 text-purple-soft font-mono">
                                  {course.subTasks.filter(st => st.isCompleted).length}/{course.subTasks.length}
                                </span>
                              </div>
                              <SubTaskChecklist subTasks={course.subTasks} compact />
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
