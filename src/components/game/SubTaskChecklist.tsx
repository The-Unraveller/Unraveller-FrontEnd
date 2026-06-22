import * as React from 'react';
import { useState } from 'react';
import { Check, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import type { SubTaskDto } from '../../services/api';

interface SubTaskChecklistProps {
  subTasks: SubTaskDto[];
  compact?: boolean;
}

/**
 * SubTaskChecklist — hiển thị danh sách nhiệm vụ con của một kịch bản.
 * - compact=true: dạng pill nhỏ cho Mission Info Card
 * - compact=false: dạng full với hint cho panel trong game (có tính năng đóng/mở)
 */
export const SubTaskChecklist: React.FC<SubTaskChecklistProps> = ({ subTasks, compact = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Đóng theo mặc định để chừa chỗ cho khung chat
  const doneCount = subTasks.filter(st => st.isCompleted).length;
  const totalRequired = subTasks.filter(st => !st.isOptional).length;
  const doneRequired = subTasks.filter(st => !st.isOptional && st.isCompleted).length;

  if (subTasks.length === 0) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {subTasks.map(task => (
          <span
            key={task.id}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono
              border transition-all duration-300 ${
              task.isCompleted
                ? 'bg-green-500/15 border-green-500/40 text-green-400'
                : task.isOptional
                  ? 'bg-white/5 border-white/10 text-text-muted'
                  : 'bg-purple-brand/10 border-purple-brand/25 text-text-secondary'
            }`}
          >
            {task.isCompleted
              ? <Check size={8} strokeWidth={3} />
              : <Circle size={8} />
            }
            {task.label}
            {task.isOptional && (
              <span className="opacity-40 text-[8px]">opt</span>
            )}
          </span>
        ))}
      </div>
    );
  }

  // Full panel view
  return (
    <div className="p-3 bg-navy-2/60 border border-white/5 rounded-xl transition-all duration-300">
      {/* Header (Clickable to collapse/expand) */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between cursor-pointer select-none group hover:opacity-90"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-brand font-bold flex items-center gap-1 group-hover:text-cyan-light transition-colors">
            🎯 Nhiệm vụ con
          </span>
          {isCollapsed && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-brand/10 text-purple-soft border border-purple-brand/20 ml-1">
              {doneRequired}/{totalRequired} bắt buộc
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <span className="text-[10px] font-mono text-text-muted">
              {doneRequired}/{totalRequired} bắt buộc
              {doneCount > doneRequired && (
                <span className="text-green-400 ml-1">(+{doneCount - doneRequired} tùy chọn)</span>
              )}
            </span>
          )}
          {isCollapsed ? (
            <ChevronDown size={14} className="text-text-muted group-hover:text-white transition-colors" />
          ) : (
            <ChevronUp size={14} className="text-text-muted group-hover:text-white transition-colors" />
          )}
        </div>
      </div>

      {/* Task list and progress bar (Only visible when expanded) */}
      {!isCollapsed && (
        <div className="mt-3 space-y-2 animate-fade-in">
          {subTasks.map(task => (
            <div
              key={task.id}
              className={`flex items-start gap-2.5 text-xs transition-all duration-500 ${
                task.isCompleted ? 'opacity-60' : 'opacity-100'
              }`}
            >
              {/* Status icon */}
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                task.isCompleted
                  ? 'bg-green-500 text-white'
                  : task.isOptional
                    ? 'border border-white/20'
                    : 'border border-purple-brand/50'
              }`}>
                {task.isCompleted && <Check size={9} strokeWidth={3} />}
              </div>

              {/* Label + Hint */}
              <div className="flex-1 min-w-0">
                <span className={`block ${task.isCompleted ? 'line-through text-text-muted' : 'text-white'}`}>
                  {task.label}
                  {task.isOptional && (
                    <span className="ml-1 text-[9px] text-text-muted opacity-60">(không bắt buộc)</span>
                  )}
                </span>
                {!task.isCompleted && task.hintPhrase && (
                  <p className="text-[10px] text-text-muted mt-0.5 italic leading-relaxed">
                    💬 {task.hintPhrase}
                  </p>
                )}
              </div>

              {/* XP bonus when completed */}
              {task.isCompleted && (
                <span className="text-[9px] text-green-400 font-mono flex-shrink-0 font-semibold">
                  +{task.xpBonus} XP
                </span>
              )}
            </div>
          ))}

          {/* Progress bar */}
          <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-brand to-cyan-brand rounded-full transition-all duration-700"
              style={{ width: `${subTasks.length > 0 ? (doneCount / subTasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubTaskChecklist;
