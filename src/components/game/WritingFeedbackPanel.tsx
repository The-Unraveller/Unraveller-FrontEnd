import type { WritingFeedbackDto, WritingScoreDto, CorrectionDto } from '../../services/api';
import { Bar, XAxis, YAxis, PolarAngleAxis, PolarRadiusAxis, PolarGrid, RadarChart, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AlertCircle, CheckCircle, Lightbulb, FileText, Award, BarChart } from 'lucide-react';

interface WritingFeedbackPanelProps {
  feedback: WritingFeedbackDto;
  missionTitle: string;
}

const skillTranslation: Record<string, string> = {
  grammar: 'Ngữ pháp',
  vocabulary: 'Từ vựng',
  naturalness: 'Tự nhiên',
  clarity: 'Rõ ràng',
  structure: 'Cấu trúc',
  tone: 'Sắc thái',
  Grammar: 'Ngữ pháp',
  Vocabulary: 'Từ vựng',
  Naturalness: 'Tự nhiên',
  Clarity: 'Rõ ràng',
  Structure: 'Cấu trúc',
  Tone: 'Sắc thái'
};

const WritingFeedbackPanel: React.FC<WritingFeedbackPanelProps> = ({ feedback, missionTitle }) => {
  const { scores, corrections, rewriteSuggestion, summary } = feedback;

  // Transform scores for radar chart (excluding Tone per design decision)
  const radarData = [
    { skill: 'Ngữ pháp', score: scores.grammar, fullMark: 100 },
    { skill: 'Từ vựng', score: scores.vocabulary, fullMark: 100 },
    { skill: 'Tự nhiên', score: scores.naturalness, fullMark: 100 },
    { skill: 'Rõ ràng', score: scores.clarity, fullMark: 100 },
    { skill: 'Cấu trúc', score: scores.structure, fullMark: 100 },
  ];

  // Overall average (5 dimensions, tone excluded)
  const overallAverage = Math.round(
    (scores.grammar + scores.vocabulary + scores.naturalness + scores.clarity + scores.structure) / 5
  );

  // Color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]';
    if (score >= 60) return 'text-warning drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]';
    return 'text-danger drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto p-4 bg-transparent">
      {/* Header */}
      <div className="ur-card bg-navy-3/45 border-purple-brand/20 p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Award size={18} className="text-cyan-brand" />
          <h3 className="font-bold text-white font-heading">AI Coach Nhận Xét</h3>
        </div>
        <p className="text-[11px] text-text-secondary font-mono uppercase tracking-wider">{missionTitle}</p>
        <div className="mt-4 flex items-center justify-center">
          <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-purple-brand/40 flex flex-col items-center justify-center bg-navy-2/40 shadow-[0_0_15px_rgba(124,58,237,0.15)]">
            <div className="text-3xl font-black text-cyan-brand font-mono drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]">{overallAverage}</div>
            <div className="text-[9px] text-text-secondary text-center uppercase tracking-wider font-mono">Trung bình</div>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="ur-card bg-navy-3/45 border-purple-brand/20 p-4 shadow-sm">
        <h4 className="text-xs font-semibold text-cyan-brand uppercase tracking-wider mb-3 flex items-center gap-2 font-mono">
          <BarChart size={16} />
          Phân Tích Kỹ Năng
        </h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(124, 58, 237, 0.2)" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 9, fill: '#a29fbd' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#636080' }} stroke="rgba(255,255,255,0.05)" />
              <Radar name="Kỹ năng" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} />
              <Tooltip contentStyle={{ backgroundColor: '#0f0c1e', borderColor: 'rgba(124,58,237,0.3)', borderRadius: '8px', color: '#fff' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart Scores */}
      <div className="ur-card bg-navy-3/45 border-purple-brand/20 p-4 shadow-sm">
        <h4 className="text-xs font-semibold text-cyan-brand uppercase tracking-wider mb-3 font-mono">Điểm Số Chi Tiết</h4>
        <div className="space-y-3">
          {Object.entries(scores)
            .filter(([key]) => key !== 'tone')
            .map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <div className="w-20 text-[10px] text-text-secondary font-mono">{skillTranslation[key] || key}</div>
              <div className="flex-1 bg-navy-3 border border-white/5 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${value}%`, backgroundColor: getBarColor(value) }}
                />
              </div>
              <div className={`w-8 text-right text-xs font-bold font-mono ${getScoreColor(value)}`}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-purple-brand/10 border border-purple-brand/35 rounded-xl p-4 shadow-[inset_0_0_10px_rgba(124,58,237,0.1)]">
          <h4 className="text-xs font-semibold text-purple-soft mb-2 flex items-center gap-2 font-mono uppercase tracking-wider">
            <FileText size={16} />
            Tóm Tắt Nhận Xét
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed font-body">{summary}</p>
        </div>
      )}

      {/* Corrections */}
      {corrections && corrections.length > 0 && (
        <div className="ur-card bg-navy-3/45 border-purple-brand/20 p-4 shadow-sm">
          <h4 className="text-xs font-semibold text-cyan-brand uppercase tracking-wider mb-3 flex items-center gap-2 font-mono">
            <AlertCircle size={16} className="text-warning" />
            Lỗi Cần Sửa ({corrections.length})
          </h4>
          <div className="space-y-4">
            {corrections.map((corr: CorrectionDto, idx: number) => (
              <div key={idx} className="border-l-2 border-warning pl-3 py-1 bg-navy-3/30 rounded-r-lg p-2.5">
                <div className="text-[10px] text-cyan-light font-mono mb-1.5 uppercase tracking-wider">{skillTranslation[corr.axis] || corr.axis}</div>
                <div className="text-xs text-red-400 mb-1 font-body">
                  <span className="line-through">"{corr.original}"</span>
                </div>
                <div className="text-xs text-success mb-2 font-body font-semibold">
                  <span>→</span> "{corr.corrected}"
                </div>
                <div className="text-[11px] text-text-secondary italic bg-navy-3 border border-purple-brand/20 p-2.5 rounded-lg leading-relaxed">
                  💡 {corr.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rewrite Suggestion */}
      {rewriteSuggestion && (
        <div className="bg-success/10 border border-success/30 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-success mb-2 flex items-center gap-2 font-mono uppercase tracking-wider">
            <CheckCircle size={16} />
            Gợi Ý Viết Lại Từ AI
          </h4>
          <p className="text-xs text-white leading-relaxed italic font-body">"{rewriteSuggestion}"</p>
        </div>
      )}

      {/* No corrections */}
      {corrections && corrections.length === 0 && !summary && (
        <div className="bg-success/10 border border-success/30 rounded-xl p-4 text-center">
          <CheckCircle size={24} className="mx-auto text-success mb-2" />
          <p className="text-xs text-white font-mono uppercase tracking-wider">Tuyệt vời! Không phát hiện lỗi cần sửa.</p>
        </div>
      )}
    </div>
  );
};

export default WritingFeedbackPanel;
