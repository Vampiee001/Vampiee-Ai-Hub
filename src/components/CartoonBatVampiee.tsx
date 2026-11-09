import React, { useState, useEffect } from 'react';

interface CartoonBatVampieeProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  showStatusLabel?: boolean;
  mood?: string;
  isRoaming?: boolean;
}

export const CartoonBatVampiee: React.FC<CartoonBatVampieeProps> = ({
  state,
  size = 'md',
  onClick,
  showStatusLabel = true,
  mood = 'Happy',
  isRoaming = false,
}) => {
  const [blink, setBlink] = useState(false);
  const [wiggle, setWiggle] = useState(false);

  // Periodic blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 3500);

    return () => clearInterval(blinkInterval);
  }, []);

  const sizeDimensions = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-40 h-40',
    xl: 'w-52 h-52',
  }[size];

  const statusInfo = {
    idle: {
      text: 'Vampiee Cartoon: Ready',
      color: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      aura: 'drop-shadow-[0_0_15px_rgba(225,29,72,0.4)]',
      wingSpeed: 'animate-[bounce_1.4s_infinite_ease-in-out]',
    },
    listening: {
      text: 'Vampiee: Listening to you...',
      color: 'bg-red-500/20 text-red-300 border-red-500/40',
      aura: 'drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]',
      wingSpeed: 'animate-[ping_0.8s_infinite]',
    },
    thinking: {
      text: 'Vampiee: Thinking & Syncing...',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      aura: 'drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]',
      wingSpeed: 'animate-[pulse_0.6s_infinite]',
    },
    speaking: {
      text: 'Vampiee: Speaking...',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      aura: 'drop-shadow-[0_0_25px_rgba(245,158,11,0.75)]',
      wingSpeed: 'animate-[bounce_0.6s_infinite_ease-in-out]',
    },
  }[state];

  const handleClick = () => {
    setWiggle(true);
    setTimeout(() => setWiggle(false), 600);
    if (onClick) onClick();
  };

  return (
    <div
      className={`flex flex-col items-center justify-center select-none cursor-pointer group transition-transform ${
        wiggle ? 'scale-110 rotate-6' : ''
      }`}
      onClick={handleClick}
      title="Click to speak with cartoon Vampiee"
    >
      <div className={`relative ${sizeDimensions} flex items-center justify-center`}>
        {/* Ambient floating glow */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr from-rose-600/30 via-purple-600/20 to-transparent blur-xl transition-all duration-300 group-hover:scale-125 ${
            state === 'listening' ? 'scale-125 bg-red-600/50' : ''
          }`}
        />

        {/* SVG Cartoon Character */}
        <svg
          viewBox="0 0 240 200"
          className={`w-full h-full filter ${statusInfo.aura} transition-all duration-300 group-hover:scale-105`}
        >
          <defs>
            <linearGradient id="batBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4c1d95" />
              <stop offset="60%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="batWing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#4c0519" />
            </linearGradient>

            <linearGradient id="capeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
          </defs>

          {/* Left Wing with Animated Flapping */}
          <g
            className={`origin-[85px_100px] transition-transform ${
              state === 'speaking'
                ? 'animate-[spin_0.8s_infinite_alternate]'
                : state === 'listening'
                ? 'scale-110'
                : 'animate-[wiggle_1.5s_infinite_ease-in-out]'
            }`}
          >
            <path
              d="M 85 105 C 50 65, 10 70, 5 110 C 25 125, 55 135, 75 125 C 80 145, 95 145, 90 120 Z"
              fill="url(#batWing)"
              stroke="#fb7185"
              strokeWidth="2"
            />
            {/* Wing bone highlights */}
            <path d="M 85 105 Q 40 85 10 110" stroke="#fda4af" strokeWidth="1.5" fill="none" opacity="0.6" />
          </g>

          {/* Right Wing with Animated Flapping */}
          <g
            className={`origin-[155px_100px] transition-transform ${
              state === 'speaking'
                ? 'animate-[spin_0.8s_infinite_alternate]'
                : state === 'listening'
                ? 'scale-110'
                : 'animate-[wiggle_1.5s_infinite_ease-in-out]'
            }`}
          >
            <path
              d="M 155 105 C 190 65, 230 70, 235 110 C 215 125, 185 135, 165 125 C 160 145, 145 145, 150 120 Z"
              fill="url(#batWing)"
              stroke="#fb7185"
              strokeWidth="2"
            />
            {/* Wing bone highlights */}
            <path d="M 155 105 Q 200 85 230 110" stroke="#fda4af" strokeWidth="1.5" fill="none" opacity="0.6" />
          </g>

          {/* Little Dracula Vamp Cape Behind */}
          <path
            d="M 90 115 C 80 160, 95 180, 120 185 C 145 180, 160 160, 150 115 Z"
            fill="url(#capeGrad)"
            stroke="#e11d48"
            strokeWidth="1.5"
          />

          {/* Left Ear */}
          <polygon points="90,75 65,25 108,55" fill="#3b0764" stroke="#e11d48" strokeWidth="2" />
          <polygon points="88,68 73,35 102,56" fill="#f43f5e" />

          {/* Right Ear */}
          <polygon points="150,75 175,25 132,55" fill="#3b0764" stroke="#e11d48" strokeWidth="2" />
          <polygon points="152,68 167,35 138,56" fill="#f43f5e" />

          {/* Round Chubby Cartoon Body */}
          <ellipse
            cx="120"
            cy="110"
            rx="46"
            ry="44"
            fill="url(#batBody)"
            stroke="#f43f5e"
            strokeWidth="2.5"
          />

          {/* Fluffy Cyber Belly Patch */}
          <ellipse cx="120" cy="122" rx="26" ry="22" fill="#581c87" opacity="0.6" />

          {/* Left Eye */}
          <g>
            <ellipse cx="102" cy="100" rx="14" ry={blink ? 2 : 16} fill="#ffffff" />
            {!blink && (
              <>
                <ellipse cx="102" cy="100" rx="9" ry="11" fill="#e11d48" />
                <circle cx="98" cy="95" r="4" fill="#ffffff" />
                <circle cx="105" cy="104" r="2" fill="#ffffff" />
              </>
            )}
          </g>

          {/* Right Eye */}
          <g>
            <ellipse cx="138" cy="100" rx="14" ry={blink ? 2 : 16} fill="#ffffff" />
            {!blink && (
              <>
                <ellipse cx="138" cy="100" rx="9" ry="11" fill="#e11d48" />
                <circle cx="134" cy="95" r="4" fill="#ffffff" />
                <circle cx="141" cy="104" r="2" fill="#ffffff" />
              </>
            )}
          </g>

          {/* Cute Rosy Blushing Cheeks */}
          <ellipse cx="90" cy="115" rx="7" ry="4" fill="#fb7185" opacity="0.75" />
          <ellipse cx="150" cy="115" rx="7" ry="4" fill="#fb7185" opacity="0.75" />

          {/* Mouth with adorable vampire fangs */}
          {state === 'speaking' ? (
            // Open animated talking mouth
            <g>
              <ellipse cx="120" cy="124" rx="9" ry="8" fill="#4c0519" stroke="#ffffff" strokeWidth="1.5" />
              {/* Left fang */}
              <polygon points="114,119 118,119 116,125" fill="#ffffff" />
              {/* Right fang */}
              <polygon points="122,119 126,119 124,125" fill="#ffffff" />
            </g>
          ) : (
            // Smiling mouth with cute mini fangs
            <g>
              <path
                d="M 110 120 Q 120 130 130 120"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Left mini fang */}
              <polygon points="113,121 117,121 115,127" fill="#ffffff" />
              {/* Right mini fang */}
              <polygon points="123,121 127,121 125,127" fill="#ffffff" />
            </g>
          )}

          {/* Little Floating Cyber Gem / Crown on Head */}
          <polygon
            points="120,50 126,60 120,70 114,60"
            fill="#38bdf8"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        </svg>

        {/* Floating Cartoon Emotion Bubble */}
        {state === 'speaking' && (
          <div className="absolute -top-3 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg animate-bounce">
            ♪ TALKING
          </div>
        )}
        {state === 'listening' && (
          <div className="absolute -top-3 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg animate-pulse">
            👂 LISTENING
          </div>
        )}
      </div>

      {showStatusLabel && (
        <div className="mt-2 flex items-center space-x-1.5">
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md uppercase tracking-wider ${statusInfo.color}`}
          >
            {statusInfo.text}
          </span>
        </div>
      )}
    </div>
  );
};
