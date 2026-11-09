import React from 'react';

interface AudioWaveformProps {
  isActive: boolean;
  type?: 'listening' | 'speaking';
  barCount?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive,
  type = 'speaking',
  barCount = 18,
}) => {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  const colorClass =
    type === 'listening'
      ? 'bg-rose-500'
      : 'bg-gradient-to-t from-rose-500 via-amber-400 to-purple-400';

  return (
    <div className="flex items-center justify-center space-x-1 h-10 px-4 py-2 bg-slate-900/60 rounded-full border border-slate-800 backdrop-blur-md">
      {bars.map((bar) => {
        // Calculate variable heights based on index
        const normalized = Math.sin((bar / barCount) * Math.PI);
        const minHeight = 4;
        const maxHeight = 30;
        const targetHeight = isActive ? Math.max(minHeight, normalized * maxHeight) : minHeight;
        const delay = (bar * 0.05).toFixed(2);

        return (
          <div
            key={bar}
            className={`w-1 rounded-full transition-all duration-150 ${colorClass} ${
              isActive ? 'animate-pulse' : 'opacity-40'
            }`}
            style={{
              height: isActive ? `${targetHeight}px` : '4px',
              animationDelay: `${delay}s`,
              animationDuration: '0.6s',
            }}
          />
        );
      })}
    </div>
  );
};
