import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Play, Star, CheckCircle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Seo from '../../components/seo/Seo';
import { getMissions, checkMissionAccess } from '../../services/api';
import { toast } from 'react-toastify';
import { useGameStore } from '../../store/useGameStore';
import GoogleAd from '../../components/ads/GoogleAd';

const Missions = () => {
  const navigate = useNavigate();
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [loadingAccess, setLoadingAccess] = useState<number | null>(null);
  const { user } = useGameStore();

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
      try {
        const data = await getMissions();
        if (data && data.length > 0) {
          const sortedMissions = [...data].sort((a, b) => a.id - b.id);
          const transformed = sortedMissions.map((m) => {
            let stars = 0;
            if (user?.missionProgresses) {
              const progress = user.missionProgresses.find(p => p.missionId === m.id);
              if (progress?.status === 'Completed') {
                if (progress.currentSuspicion < 25) stars = 3;
                else if (progress.currentSuspicion < 50) stars = 2;
                else stars = 1;
              }
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
                locked = false;
              }
            }

            return {
              id: m.id,
              stage: m.stage.toUpperCase(),
              title: m.title,
              desc: (m.description || m.goal || '').replace(/\*/g, ''),
              img: m.imageUrl || (m.id === 1 ? '/scenario_coffee.png' : m.id === 2 ? '/scenario_classroom.png' : m.id === 5 ? '/scenario_detective.png' : ''),
              locked: locked,
              stars: stars,
              grammarTarget: m.grammarTarget
            };
          });
          setCoursesList(transformed);
        }
      } catch (err) {
        console.error('Failed to fetch missions:', err);
      }
    };

    loadMissions();
  }, [user]);

  return (
    <Layout isLoggedIn username={user?.username || 'Agent'}>
      <Seo title="Chọn kịch bản học tập" description="Chọn từ 5+ kịch bản học tập thực tế" canonical="/courses" noIndex />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Chọn kịch bản học tập</h1>
          <p className="text-text-secondary">Chọn một tình huống thực tế để luyện tập tiếng Anh qua chat với NPC.</p>
        </div>

        {/* Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesList.map((course) => (
            <div
              key={course.id}
              className={`bg-white rounded-xl border ${course.locked ? 'border-gray-200 opacity-60' : 'border-gray-200 hover:border-accent hover:shadow-md'} transition-all overflow-hidden`}
            >
              {/* Image */}
              <div className="h-40 bg-gray-100 relative overflow-hidden">
                {course.img && !course.locked ? (
                  <img src={course.img} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Lock size={32} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded border border-gray-200">
                    {course.stage}
                  </span>
                </div>
                {course.locked && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                    <Lock size={40} className="text-gray-500" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text-primary mb-2">{course.title}</h3>
                  <p className="text-sm text-text-secondary mb-3 leading-relaxed">{course.desc}</p>

                  {course.grammarTarget && !course.locked && (
                    <div className="bg-accent/5 border border-accent/10 rounded-lg p-3 mb-3">
                      <div className="text-xs font-semibold text-accent mb-1 uppercase tracking-wide">
                        Mục tiêu ngữ pháp
                      </div>
                      <p className="text-sm text-text-primary">{course.grammarTarget}</p>
                    </div>
                  )}

                  {/* Stars */}
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3].map((i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i <= course.stars ? 'text-warning fill-warning' : 'text-gray-300'}
                      />
                    ))}
                    {course.locked && course.stars === 0 && (
                      <span className="text-xs text-text-muted ml-2">Khóa</span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleCardClick(course.id, course.locked)}
                  disabled={course.locked || loadingAccess === course.id}
                  className={`mt-4 w-full py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                    course.locked
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : loadingAccess === course.id
                      ? 'bg-accent/50 text-white cursor-wait'
                      : 'bg-accent text-white hover:bg-accent-dark'
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

        {/* Premium CTA */}
        {(!user?.isPremium) && (
          <div className="mt-12 bg-gradient-to-r from-accent/5 to-accent/10 border border-accent/20 rounded-xl p-6 text-center">
            <h3 className="text-lg font-bold text-text-primary mb-2">Nâng cấp lên Premium</h3>
            <p className="text-text-secondary mb-4 max-w-2xl mx-auto">
              Mở khóa tất cả 6 kịch bản, bao gồm cả những kịch bản nâng cao, và trở tên thành thạo với hơn 50+ nhiệm vụ.
            </p>
            <Link
              to="/premium"
              className="inline-block px-6 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-colors"
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
