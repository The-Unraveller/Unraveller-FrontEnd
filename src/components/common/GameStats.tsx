import * as React from 'react';

interface XPBarProps {
  current: number;
  max: number;
  label?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const XPBar: React.FC<XPBarProps> = ({
  current,
  max,
  label = true,
  size = 'md',
  className = '',
}) => {
  const pct = Math.min(100, Math.round((current / max) * 100));

  return (
    <div className={`${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold text-white/50">XP</span>
          <span className="text-xs font-bold text-xp-orange">
            {current.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      )}
      <div className={`xp-bar-track ${size === 'sm' ? 'h-1.5' : 'h-2'}`}>
        <div
          className="xp-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

interface StreakBadgeProps {
  count: number;
  className?: string;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ count, className = '' }) => (
  <div className={`streak-counter ${className}`}>
    <span className="text-streak-fire text-base leading-none">🔥</span>
    <span className="text-xp-orange font-bold text-sm">{count}</span>
    <span className="text-white/50 text-xs">ngày</span>
  </div>
);

interface StatPillProps {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
}

export const StatPill: React.FC<StatPillProps> = ({ icon, value, label, color = 'text-white' }) => (
  <div className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl bg-white/5 border border-white/8">
    <span className="text-lg leading-none">{icon}</span>
    <span className={`font-bold text-sm leading-none ${color}`}>{value}</span>
    <span className="text-white/40 text-xs">{label}</span>
  </div>
);

export default XPBar;
