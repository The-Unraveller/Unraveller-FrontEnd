import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BarChart3, BookOpen, TrendingUp, Award, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { getSkillMap, getPortfolio, getWeeklyReport } from '../../services/api';
import type { SkillMapDto, PortfolioEntryDto, WeeklyReportDto } from '../../services/api';
import { useGameStore } from '../../store/useGameStore';
import { ResponsiveContainer, RadarChart, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, LineChart, CartesianGrid, XAxis, YAxis, Line } from 'recharts';

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
    { skill: 'Grammar', score: skillMap.currentAverage.grammar },
    { skill: 'Vocabulary', score: skillMap.currentAverage.vocabulary },
    { skill: 'Tone', score: skillMap.currentAverage.tone },
    { skill: 'Naturalness', score: skillMap.currentAverage.naturalness },
    { skill: 'Clarity', score: skillMap.currentAverage.clarity },
    { skill: 'Structure', score: skillMap.currentAverage.structure },
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="text-text-secondary">Đang tải tiến độ...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar isLoggedIn username={user?.username || 'Learner'} />
      <div className="min-h-screen bg-bg-secondary py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors text-sm mb-4"
            >
              <ChevronLeft size={18} />
              Quay lại kịch bản
            </button>
            <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
              <BarChart3 className="text-accent" />
              Writing Progress
            </h1>
            <p className="text-text-secondary mt-2">Track your improvement across all writing skills</p>
          </div>

          {/* Overall Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Award className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Overall Score</h3>
                  <p className="text-2xl font-bold text-accent">{overallAverage}/100</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Scenarios Completed</h3>
                  <p className="text-2xl font-bold text-green-600">{portfolio.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">XP Balance</h3>
                  <p className="text-2xl font-bold text-blue-600">{user?.xpBalance || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Skill Map */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <BarChart3 size={20} />
                Current Skill Map
              </h3>
              {skillMap && (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="Skills" dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Historical Trend */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <TrendingUp size={20} />
                Progress Trend
              </h3>
              {skillMap && Object.keys(skillMap.historicalTrend).length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={Object.entries(skillMap.historicalTrend).map(([date, avg]) => ({ date, avg }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="avg" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-text-secondary">
                  Complete scenarios to see your progress trend.
                </div>
              )}
            </div>
          </div>

          {/* Weekly Report */}
          {weeklyReport && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
              <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Calendar size={20} />
                Weekly Report
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-text-secondary mb-1">Week of</div>
                  <div className="font-semibold text-text-primary">{weeklyReport.weekStartDate}</div>
                </div>
                <div>
                  <div className="text-sm text-text-secondary mb-1">Average Score</div>
                  <div className="font-semibold text-accent">{weeklyReport.averageScore.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-sm text-text-secondary mb-1">Scenarios Completed</div>
                  <div className="font-semibold text-green-600">{weeklyReport.scenariosCompleted}</div>
                </div>
                <div>
                  <div className="text-sm text-text-secondary mb-1">New Vocabulary</div>
                  <div className="font-semibold text-blue-600">{weeklyReport.newVocabularyCount}</div>
                </div>
              </div>
              {weeklyReport.topErrorTypes.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-text-primary mb-3">Top Error Types to Focus On</h4>
                  <div className="flex flex-wrap gap-2">
                    {weeklyReport.topErrorTypes.map((error, idx) => (
                      <span key={idx} className="px-3 py-1 bg-warning/10 text-warning rounded-full text-sm">
                        {error}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {weeklyReport.recommendedScenarios.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-text-primary mb-2">Recommended Scenarios</h4>
                  <div className="flex flex-wrap gap-2">
                    {weeklyReport.recommendedScenarios.map((missionId) => (
                      <span key={missionId} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                        Mission #{missionId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Portfolio */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
              <BookOpen size={20} />
              Completed Missions
            </h3>
            {portfolio.length > 0 ? (
              <div className="space-y-4">
                {portfolio.map((entry) => (
                  <div key={entry.missionId} className="border border-gray-200 rounded-lg p-4 hover:border-accent transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-text-primary">{entry.missionTitle}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-text-secondary rounded">{entry.domain}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-text-secondary rounded">{entry.cefrLevel}</span>
                          <span className="text-xs text-text-muted">{entry.completedAt}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent">
                          {Math.round(
                            (entry.finalScores.grammar +
                              entry.finalScores.vocabulary +
                              entry.finalScores.tone +
                              entry.finalScores.naturalness +
                              entry.finalScores.clarity +
                              entry.finalScores.structure) / 6
                          )}
                        </div>
                        <div className="text-xs text-text-muted">average</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-text-secondary">Grammar</div>
                        <div className={`font-semibold ${entry.finalScores.grammar >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.finalScores.grammar}
                        </div>
                      </div>
                      <div>
                        <div className="text-text-secondary">Vocabulary</div>
                        <div className={`font-semibold ${entry.finalScores.vocabulary >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.finalScores.vocabulary}
                        </div>
                      </div>
                      <div>
                        <div className="text-text-secondary">Naturalness</div>
                        <div className={`font-semibold ${entry.finalScores.naturalness >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.finalScores.naturalness}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-text-muted">
                      Turns: {entry.turnsCount} • XP: {entry.totalXp}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-text-secondary">
                <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                <p>No completed missions yet.</p>
                <button onClick={() => navigate('/courses')} className="mt-4 px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors">
                  Start Learning
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProgressPage;
