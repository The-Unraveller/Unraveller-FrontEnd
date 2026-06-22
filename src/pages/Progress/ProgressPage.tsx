import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, BarChart3, BookOpen, TrendingUp, Award, Calendar, Target, Activity, Zap } from 'lucide-react';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import Seo from '../../components/seo/Seo';
import { getSkillMap, getPortfolio, getWeeklyReport } from '../../services/api';
import type { SkillMapDto, PortfolioEntryDto, WeeklyReportDto } from '../../services/api';
import { useGameStore } from '../../store/useGameStore';
import { ResponsiveContainer, RadarChart, PolarAngleAxis, PolarRadiusAxis, PolarGrid, Radar, Tooltip, LineChart, CartesianGrid, XAxis, YAxis, Line } from 'recharts';

import { PageLoader } from '../../components/common/PageLoader';

const ProgressPage = () => {
  const navigate = useNavigate();
  const { user } = useGameStore();
  const [skillMap, setSkillMap] = useState<SkillMapDto | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioEntryDto[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgressData = async () => {
      try {
        const [skillMapData, portfolioData, weeklyData] = await Promise.all([
          getSkillMap(),
          getPortfolio(),
          getWeeklyReport(),
        ]);
        setSkillMap(skillMapData);
        setPortfolio(portfolioData);
        setWeeklyReport(weeklyData);
      } catch (err) {
        console.error('Failed to load progress data:', err);
        toast.error('Không thể tải dữ liệu tiến độ.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProgressData();
  }, []);

  // Radar chart data
  const radarData = skillMap ? [
    { skill: 'Ngữ pháp', score: skillMap.currentAverage.grammar },
    { skill: 'Từ vựng', score: skillMap.currentAverage.vocabulary },
    { skill: 'Ngữ điệu', score: skillMap.currentAverage.tone },
    { skill: 'Tự nhiên', score: skillMap.currentAverage.naturalness },
    { skill: 'Mạch lạc', score: skillMap.currentAverage.clarity },
    { skill: 'Cấu trúc', score: skillMap.currentAverage.structure },
  ] : [];

  // Overall average
  const overallAverage = skillMap
    ? Math.round(
        (skillMap.currentAverage.grammar +
          skillMap.currentAverage.vocabulary +
          skillMap.currentAverage.tone +
          skillMap.currentAverage.naturalness +
          skillMap.currentAverage.clarity +
          skillMap.currentAverage.structure) / 6
      )
    : 0;

  if (isLoading) {
    return <PageLoader message="Đang giải mã dữ liệu tiến trình..." />;
  }

  return (
    <Layout isLoggedIn username={user?.username || 'Learner'} showBottomNav>
      <Seo 
        title="Tiến Trình Học Tập - The Unraveller" 
        description="Theo dõi sự tiến bộ về các kỹ năng tiếng Anh và lịch sử giải mã nhiệm vụ." 
        noIndex 
      />
      
      <div className="app-bg min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-5 pb-16">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center gap-1.5 text-text-secondary hover:text-white transition-colors text-sm font-semibold font-mono mb-4"
            >
              <ChevronLeft size={18} />
              Quay lại kịch bản
            </button>
            <h1 className="text-3xl font-bold text-white font-heading tracking-wide flex items-center gap-3">
              <Activity className="text-cyan-brand animate-pulse" size={28} />
              Tiến Trình Học Tập
            </h1>
            <p className="text-text-secondary text-sm mt-1">Phân tích chi tiết và theo dõi sự phát triển kỹ năng viết tiếng Anh của bạn.</p>
          </div>

          {/* Holographic Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* Overall Score */}
            <div className="ur-card border-purple-brand/20 bg-navy-2/45 p-6 shadow-md relative overflow-hidden flex items-center justify-between">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-brand via-purple-soft to-transparent"></div>
              <div>
                <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono mb-1">Điểm Trung Bình</h3>
                <p className="text-3xl font-black text-white font-mono drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]">
                  {overallAverage}<span className="text-xs text-text-muted">/100</span>
                </p>
              </div>
              <div className="p-3 bg-purple-brand/10 border border-purple-brand/35 rounded-xl shadow-glow-purple/5">
                <Award className="text-purple-soft" size={24} />
              </div>
            </div>

            {/* Scenarios Completed */}
            <div className="ur-card border-cyan-brand/20 bg-navy-2/45 p-6 shadow-md relative overflow-hidden flex items-center justify-between">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-brand via-cyan-soft to-transparent"></div>
              <div>
                <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono mb-1">Nhiệm Vụ Hoàn Thành</h3>
                <p className="text-3xl font-black text-cyan-brand font-mono drop-shadow-[0_0_8px_rgba(6,182,212,0.35)]">
                  {portfolio.length}
                </p>
              </div>
              <div className="p-3 bg-cyan-brand/10 border border-cyan-brand/35 rounded-xl shadow-glow-cyan/5">
                <BookOpen className="text-cyan-light" size={24} />
              </div>
            </div>

            {/* XP Balance */}
            <div className="ur-card border-xp-orange/20 bg-navy-2/45 p-6 shadow-md relative overflow-hidden flex items-center justify-between">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-xp-orange via-xp-yellow to-transparent"></div>
              <div>
                <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono mb-1">Tổng Số XP</h3>
                <p className="text-3xl font-black text-xp-orange font-mono drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]">
                  {(user?.xpBalance || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-xp-orange/10 border border-xp-orange/35 rounded-xl shadow-glow-xp/5">
                <Zap className="text-xp-yellow" size={24} />
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Skill Map Radar */}
            <div className="ur-card border-purple-brand/20 bg-navy-2/45 p-6 shadow-md relative">
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 font-mono uppercase tracking-wider">
                <BarChart3 size={16} className="text-purple-soft" />
                Bản đồ kỹ năng hiện tại
              </h3>
              {skillMap ? (
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(124, 58, 237, 0.15)" />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#a29fbd', fontFamily: 'Inter' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#636080' }} stroke="rgba(255, 255, 255, 0.05)" />
                      <Radar name="Điểm kỹ năng" dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f0c1e', 
                          borderColor: 'rgba(124, 58, 237, 0.3)', 
                          borderRadius: '12px', 
                          color: '#fff', 
                          fontSize: '11px', 
                          fontFamily: 'JetBrains Mono' 
                        }} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-text-muted font-mono text-xs">
                  Không có dữ liệu bản đồ kỹ năng.
                </div>
              )}
            </div>

            {/* Historical Trend Line */}
            <div className="ur-card border-cyan-brand/20 bg-navy-2/45 p-6 shadow-md relative">
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 font-mono uppercase tracking-wider">
                <TrendingUp size={16} className="text-cyan-brand" />
                Xu hướng tiến bộ
              </h3>
              {skillMap && Object.keys(skillMap.historicalTrend).length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={Object.entries(skillMap.historicalTrend).map(([date, avg]) => ({ date, avg }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#a29fbd', fontFamily: 'JetBrains Mono' }} stroke="rgba(255, 255, 255, 0.1)" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#a29fbd', fontFamily: 'JetBrains Mono' }} stroke="rgba(255, 255, 255, 0.1)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f0c1e', 
                          borderColor: 'rgba(6, 182, 212, 0.3)', 
                          borderRadius: '12px', 
                          color: '#fff', 
                          fontSize: '11px', 
                          fontFamily: 'JetBrains Mono' 
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="avg" 
                        stroke="#06b6d4" 
                        strokeWidth={3} 
                        dot={{ fill: '#06b6d4', stroke: '#080612', strokeWidth: 2, r: 4 }} 
                        activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-text-muted font-mono text-xs text-center p-6 leading-relaxed">
                  Hãy hoàn thành ít nhất một kịch bản học tập để vẽ biểu đồ xu hướng tiến trình.
                </div>
              )}
            </div>
          </div>

          {/* Weekly Report Module */}
          {weeklyReport && (
            <div className="ur-card border-purple-brand/20 bg-gradient-to-r from-navy-2 via-purple-brand/5 to-navy-2 p-6 shadow-md relative overflow-hidden mb-8">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-brand"></div>
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 font-mono uppercase tracking-wider pb-3 border-b border-white/5">
                <Calendar size={16} className="text-purple-soft" />
                Báo cáo hàng tuần
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <div className="text-[10px] text-text-secondary uppercase tracking-wider font-mono mb-1">Tuần từ ngày</div>
                  <div className="text-sm font-bold text-white font-mono">{weeklyReport.weekStartDate}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-secondary uppercase tracking-wider font-mono mb-1">Điểm trung bình</div>
                  <div className="text-sm font-bold text-cyan-light font-mono">{weeklyReport.averageScore.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-secondary uppercase tracking-wider font-mono mb-1">Số nhiệm vụ</div>
                  <div className="text-sm font-bold text-success font-mono">{weeklyReport.scenariosCompleted} kịch bản</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-secondary uppercase tracking-wider font-mono mb-1">Từ vựng mới</div>
                  <div className="text-sm font-bold text-xp-orange font-mono">+{weeklyReport.newVocabularyCount} từ</div>
                </div>
              </div>

              {weeklyReport.topErrorTypes.length > 0 && (
                <div className="mt-6 border-t border-white/5 pt-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3">Lỗi cần tập trung khắc phục</h4>
                  <div className="flex flex-wrap gap-2">
                    {weeklyReport.topErrorTypes.map((error, idx) => (
                      <span key={idx} className="badge badge-danger text-xs px-3 py-1 font-mono uppercase tracking-wider">
                        ⚠️ {error}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {weeklyReport.recommendedScenarios.length > 0 && (
                <div className="mt-5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3">Kịch bản gợi ý nâng cao điểm số</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {weeklyReport.recommendedScenarios.map((missionId) => (
                      <Link 
                        key={missionId}
                        to={`/game/${missionId}`} 
                        className="px-3.5 py-1.5 bg-cyan-brand/10 border border-cyan-brand/35 text-cyan-light rounded-full text-xs font-semibold font-mono hover:bg-cyan-brand/20 hover:border-cyan-brand hover:scale-[1.02] transition-all flex items-center gap-1.5"
                      >
                        <Target size={12} />
                        Nhiệm vụ #{missionId}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completed Missions Portfolio */}
          <div className="ur-card border-purple-brand/20 bg-navy-2/45 p-6 shadow-md relative">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 font-mono uppercase tracking-wider">
              <BookOpen size={16} className="text-purple-soft" />
              Lịch sử kịch bản đã giải mã
            </h3>
            {portfolio.length > 0 ? (
              <div className="space-y-4">
                {portfolio.map((entry) => {
                  const entryAvg = Math.round(
                    (entry.finalScores.grammar +
                      entry.finalScores.vocabulary +
                      entry.finalScores.tone +
                      entry.finalScores.naturalness +
                      entry.finalScores.clarity +
                      entry.finalScores.structure) / 6
                  );
                  
                  return (
                    <div 
                      key={entry.missionId} 
                      className="border border-white/5 bg-navy-3/30 rounded-xl p-5 hover:border-purple-brand/40 hover:bg-navy-3/40 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white font-heading text-base leading-snug mb-2">{entry.missionTitle}</h4>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="badge badge-purple text-[10px] font-mono uppercase">{entry.domain}</span>
                          <span className="badge badge-cyan text-[10px] font-mono uppercase">{entry.cefrLevel}</span>
                          <span className="text-[10px] text-text-muted font-mono">{entry.completedAt}</span>
                        </div>
                        <div className="mt-3 text-[10px] text-text-secondary font-mono">
                          Lượt hội thoại: <span className="text-white font-bold">{entry.turnsCount}</span> • Nhận được: <span className="text-xp-orange font-bold">+{entry.totalXp} XP</span>
                        </div>
                      </div>

                      {/* Mini skill scores visual bar */}
                      <div className="grid grid-cols-2 gap-3 text-xs w-full max-w-sm flex-shrink-0">
                        {[
                          { name: 'Ngữ pháp', val: entry.finalScores.grammar },
                          { name: 'Từ vựng', val: entry.finalScores.vocabulary },
                          { name: 'Độ tự nhiên', val: entry.finalScores.naturalness },
                        ].map((skill, sIdx) => (
                          <div key={sIdx} className="flex flex-col gap-1">
                            <div className="flex justify-between text-[9px] text-text-secondary font-mono">
                              <span className="truncate mr-1">{skill.name}</span>
                              <span className="font-bold text-white">{skill.val}</span>
                            </div>
                            <div className="w-full bg-navy/80 rounded-full h-1 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-brand rounded-full" 
                                style={{ width: `${skill.val}%` }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Average Score Badge */}
                      <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-[8px] text-text-muted font-mono uppercase tracking-wider">Điểm trung bình</div>
                          <div className={`text-2xl font-black font-mono leading-none mt-1 ${entryAvg >= 80 ? 'text-success drop-shadow-[0_0_5px_rgba(16,185,129,0.35)]' : entryAvg >= 60 ? 'text-warning' : 'text-danger'}`}>
                            {entryAvg}
                          </div>
                        </div>
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center bg-navy/40 shadow-inner ${entryAvg >= 80 ? 'border-success/20 text-success' : entryAvg >= 60 ? 'border-warning/20 text-warning' : 'border-danger/20 text-danger'}`}>
                          <Award size={20} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-navy-3/20 rounded-xl border border-white/5">
                <BookOpen size={44} className="mx-auto mb-4 text-text-muted opacity-40 animate-float" />
                <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto mb-4">Bạn chưa hoàn thành kịch bản nào để ghi nhận trong danh sách lịch sử giải mã.</p>
                <button 
                  onClick={() => navigate('/courses')} 
                  className="btn btn-primary btn-sm shadow-glow-purple"
                >
                  🚀 Giải mã kịch bản đầu tiên
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProgressPage;
