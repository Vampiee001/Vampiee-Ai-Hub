import React from 'react';

interface VampieeOrbProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  showStatusLabel?: boolean;
}

export const VampieeOrb: React.FC<VampieeOrbProps> = ({
  state,
  size = 'md',
  onClick,
  showStatusLabel = true,
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-44 h-44',
  }[size];

  const stateColors = {
    idle: {
      core: 'from-rose-600 via-purple-700 to-slate-950',
      glow: 'shadow-[0_0_35px_rgba(225,29,72,0.45)]',
      border: 'border-rose-500/30',
      ring: 'border-rose-500/20',
      label: 'Vampiee Standby',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    listening: {
      core: 'from-rose-500 via-red-600 to-pink-900',
      glow: 'shadow-[0_0_55px_rgba(244,63,94,0.85)] animate-pulse',
      border: 'border-red-400',
      ring: 'border-red-500/50 animate-ping',
      label: 'Listening to you...',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    thinking: {
      core: 'from-purple-600 via-indigo-600 to-fuchsia-900',
      glow: 'shadow-[0_0_50px_rgba(168,85,247,0.7)]',
      border: 'border-purple-400',
      ring: 'border-purple-500/40 animate-spin',
      label: 'Orchestrating AI Fleet...',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
    speaking: {
      core: 'from-rose-500 via-amber-500 to-purple-800',
      glow: 'shadow-[0_0_60px_rgba(244,63,94,0.75)]',
      border: 'border-rose-400 animate-pulse',
      ring: 'border-rose-400/60',
      label: 'Vampiee Speaking',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
  }[state];

  return (
    <div className="flex flex-col items-center justify-center select-none group cursor-pointer" onClick={onClick}>
      <div className="relative flex items-center justify-center">
        {/* Outer orbital rings */}
        <div
          className={`absolute inset-[-14px] rounded-full border border-dashed transition-all duration-700 pointer-events-none ${
            state === 'thinking' ? 'animate-[spin_4s_linear_infinite]' : 'animate-[spin_24s_linear_infinite]'
          } ${stateColors.ring}`}
        />

        <div
          className={`absolute inset-[-6px] rounded-full border transition-all duration-500 pointer-events-none ${
            state === 'listening' ? 'animate-ping' : ''
          } ${stateColors.border}`}
        />

        {/* Aura ambient backglow */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${stateColors.core} opacity-70 blur-xl transition-all duration-500 group-hover:scale-110`}
        />

        {/* Core sphere */}
        <div
          className={`relative ${sizeClasses} rounded-full bg-gradient-to-tr ${stateColors.core} ${stateColors.glow} border border-white/20 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-105 active:scale-95`}
        >
          {/* Vampire/Cyber Eye & Grid effect inside */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_60%)]" />

          {/* Core geometry icon */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {state === 'thinking' ? (
              <div className="w-6 h-6 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
            ) : state === 'listening' ? (
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-6 bg-white rounded-full animate-[bounce_0.8s_infinite_100ms]" />
                <span className="w-1.5 h-9 bg-rose-200 rounded-full animate-[bounce_0.8s_infinite_200ms]" />
                <span className="w-1.5 h-6 bg-white rounded-full animate-[bounce_0.8s_infinite_300ms]" />
              </div>
            ) : state === 'speaking' ? (
              <div className="flex items-center space-x-1">
                <span className="w-1 h-4 bg-amber-200 rounded-full animate-pulse" />
                <span className="w-1.5 h-8 bg-white rounded-full animate-bounce" />
                <span className="w-1 h-5 bg-rose-200 rounded-full animate-pulse" />
                <span className="w-1.5 h-7 bg-white rounded-full animate-bounce" />
              </div>
            ) : (
              // Idle Vampiee signature: stylized crimson fangs / bat-cyber wings
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-300 shadow-[0_0_8px_#f43f5e]" />
                  <div className="w-2 h-2 rounded-full bg-rose-300 shadow-[0_0_8px_#f43f5e]" />
                </div>
                <div className="w-4 h-1 bg-white/40 rounded-full mt-1.5" />
              </div>
            )}
          </div>
        </div>
      </div>

      {showStatusLabel && (
        <div className="mt-3 flex items-center space-x-2">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border backdrop-blur-md uppercase tracking-wider ${stateColors.badgeColor}`}>
            {stateColors.label}
          </span>
        </div>
      )}
    </div>
  );
};
