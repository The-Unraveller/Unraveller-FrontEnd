import React from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Trophy, XCircle, ChevronLeft, RotateCcw, Award, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/common/Button';

const Result = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-spy-black text-spy-green font-mono flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Matrix Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none select-none text-[8px] leading-tight">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i}>{Math.random().toString(36).substring(2).repeat(10)}</div>
        ))}
      </div>

      <div className={`w-full max-w-4xl border-2 p-12 bg-spy-black relative shadow-2xl ${isSuccess ? 'border-spy-green shadow-spy-green/10' : 'border-spy-red shadow-spy-red/10'}`}>
        <header className="text-center mb-16">
          <div className="flex justify-center mb-8 scale-150">
            {isSuccess ? <Trophy className="text-spy-green w-16 h-16 animate-bounce" /> : <XCircle className="text-spy-red w-16 h-16 animate-pulse" />}
          </div>
          <h1 className={`text-6xl font-black mb-4 uppercase tracking-tighter ${isSuccess ? 'text-spy-green' : 'text-spy-red'}`}>
            MISSION {isSuccess ? 'SUCCESSFUL' : 'TERMINATED'}
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 opacity-80">
            Operation ID: UNRAV_CH0{id}_A / Security Level: Confidential
          </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-8">
            <h2 className="text-sm font-black uppercase text-white flex items-center gap-3 border-b border-spy-green/20 pb-2">
              <Award className="text-spy-green" /> PERFORMANCE LOG
            </h2>
            <div className="space-y-4">
              <StatItem label="LANGUAGE_ACCURACY" value={isSuccess ? "85%" : "32%"} />
              <StatItem label="SOCIAL_ENGINEERING" value={isSuccess ? "A+" : "D-"} />
              <StatItem label="SUSPICION_LEVEL" value={isSuccess ? "LOW" : "MAXIMUM"} />
              <StatItem label="XP_EARNED" value={isSuccess ? "+250 XP" : "+50 XP"} />
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-sm font-black uppercase text-white flex items-center gap-3 border-b border-spy-green/20 pb-2">
              <AlertTriangle className="text-spy-red" /> LINGUISTIC FEEDBACK
            </h2>
            <div className="space-y-4 p-6 bg-spy-green/5 border border-spy-green/10">
              {isSuccess ? (
                <div className="space-y-4">
                  <div className="text-[10px] text-spy-green flex items-center gap-2"><CheckCircle size={14} /> EXCELLENT_CONTROL</div>
                  <p className="text-[10px] leading-relaxed uppercase text-gray-500 italic">Your use of formal English successfully bypasses the AI's internal sensors. Target objective has been completed without raising alarms.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-[10px] text-spy-red flex items-center gap-2"><AlertTriangle size={14} /> ERROR_DETECTED</div>
                  <p className="text-[10px] leading-relaxed uppercase text-gray-500 italic">Incorrect verb usage and missing articles detected in transmission. Security units were alerted due to erratic speech patterns. Suggested: Study chapter 2 of linguistic protocol.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="flex flex-col md:flex-row gap-6 justify-center">
          <Button onClick={() => navigate(`/game/${id}`)} variant="outline" className="px-12 py-5 border-spy-blue text-spy-blue hover:bg-spy-blue">
            <RotateCcw size={16} /> RETRY_OP
          </Button>
          <Button onClick={() => navigate('/missions')} variant="primary" className="px-12 py-5">
            <ChevronLeft size={16} /> RETURN_TO_HQ
          </Button>
        </footer>
      </div>
    </div>
  );
};

const StatItem = ({ label, value }: any) => (
  <div className="flex justify-between items-center text-[10px] uppercase font-black">
    <span className="text-gray-600">{label}:</span>
    <span className="text-spy-green border-b border-spy-green/20">{value}</span>
  </div>
);

export default Result;
