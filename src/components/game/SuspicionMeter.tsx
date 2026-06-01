import * as React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface SuspicionMeterProps {
  level: number;
}

export const SuspicionMeter: React.FC<SuspicionMeterProps> = ({ level }) => {
  const getStatusColor = () => {
    if (level > 80) return 'bg-spy-red shadow-[0_0_15px_rgba(255,0,0,0.5)]';
    if (level > 50) return 'bg-yellow-500 shadow-[0_0_15px_rgba(255,255,0,0.3)]';
    return 'bg-spy-green shadow-[0_0_15px_rgba(0,255,65,0.3)]';
  };

  const getStatusText = () => {
    if (level > 80) return 'NGUY HIỂM: ĐỘ NGHI NGỜ CAO';
    if (level > 50) return 'CẢNH BÁO: TĂNG CAO';
    return 'TRẠNG THÁI: AN TOÀN';
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className={`text-[10px] font-black uppercase flex items-center gap-1 transition-colors ${level > 80 ? 'text-spy-red animate-pulse' : 'text-gray-500'}`}>
          <AlertTriangle size={12} /> {getStatusText()}
        </span>
        <span className={`text-[10px] font-black ${level > 80 ? 'text-spy-red' : 'text-spy-green'}`}>{level}%</span>
      </div>
      <div className="h-4 bg-gray-900 border border-spy-green/10 p-1 relative overflow-hidden">
        <motion.div 
          initial={{ width: '0%' }}
          animate={{ width: `${level}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className={`h-full transition-colors duration-500 ${getStatusColor()}`}
        />
        {/* Scanning line effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-20 animate-[scan_2s_infinite]" />
      </div>
    </div>
  );
};
