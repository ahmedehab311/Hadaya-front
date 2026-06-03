import React from 'react';

export function GiftIllustration() {
  return (
    <div className="relative flex items-center justify-center w-[420px] h-[420px] overflow-hidden rounded-3xl" style={{ background: 'radial-gradient(circle at center, #fdf6f0 0%, #f8ede8 70%, transparent 100%)' }}>
      
      {/* Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { top: '15%', left: '25%', size: 12, delay: 0 },
          { top: '25%', left: '75%', size: 8, delay: 1 },
          { top: '75%', left: '15%', size: 14, delay: 2 },
          { top: '80%', left: '80%', size: 10, delay: 0.5 },
          { top: '45%', left: '85%', size: 6, delay: 1.5 },
          { top: '50%', left: '10%', size: 8, delay: 2.5 },
        ].map((sparkle, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              top: sparkle.top,
              left: sparkle.left,
              width: sparkle.size,
              height: sparkle.size,
              backgroundColor: '#e8c87a',
              transform: 'rotate(45deg)',
              animation: `float 3s ease-in-out infinite alternate`,
              animationDelay: `${sparkle.delay}s`,
              boxShadow: '0 0 8px rgba(232, 200, 122, 0.6)'
            }}
          />
        ))}
      </div>

      {/* Gift Box Container */}
      <div className="relative group hover:scale-105 transition-transform duration-500 ease-out z-10">
        
        {/* Shadow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[160px] h-[20px] bg-black/10 rounded-[100%] blur-md"></div>
        
        {/* Main Box */}
        <div 
          className="relative w-[180px] h-[140px] rounded-b-lg shadow-inner mt-6"
          style={{ backgroundColor: '#9b2335', boxShadow: 'inset -10px -10px 30px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.1)' }}
        >
          {/* Vertical Ribbon */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30px] h-full" style={{ backgroundColor: '#d4af7a', boxShadow: 'inset 2px 0 5px rgba(0,0,0,0.1)' }}></div>
          {/* Horizontal Ribbon */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-[30px]" style={{ backgroundColor: '#d4af7a', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)' }}></div>
        </div>

        {/* Box Lid */}
        <div 
          className="absolute -top-1 -left-2 w-[196px] h-[40px] rounded-md shadow-md z-10"
          style={{ backgroundColor: '#a9283b', boxShadow: 'inset -5px -5px 15px rgba(0,0,0,0.2), 0 5px 10px rgba(0,0,0,0.15)' }}
        >
          {/* Lid Vertical Ribbon */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30px] h-full" style={{ backgroundColor: '#d4af7a', boxShadow: 'inset 2px 0 5px rgba(0,0,0,0.1)' }}></div>
          
          {/* Lid Overhang shadow */}
          <div className="absolute top-full left-0 w-full h-2 bg-black/20 blur-[2px] rounded-b-sm"></div>
        </div>

        {/* Bow */}
        <div className="absolute -top-[45px] left-1/2 -translate-x-1/2 w-[100px] h-[50px] z-20 flex justify-center">
          {/* Left Loop */}
          <div 
            className="absolute left-1 top-2 w-[45px] h-[35px] origin-bottom-right rotate-[-15deg] border-[6px]"
            style={{ borderColor: '#d4af7a', borderRadius: '40px 10px 10px 40px', boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)' }}
          ></div>
          {/* Right Loop */}
          <div 
            className="absolute right-1 top-2 w-[45px] h-[35px] origin-bottom-left rotate-[15deg] border-[6px]"
            style={{ borderColor: '#d4af7a', borderRadius: '10px 40px 40px 10px', boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)' }}
          ></div>
          {/* Center Knot */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[24px] h-[24px] rounded-full shadow-sm"
            style={{ backgroundColor: '#d4af7a', boxShadow: 'inset -2px -2px 5px rgba(0,0,0,0.1)' }}
          ></div>
          {/* Ribbon Tails */}
          <div 
            className="absolute top-[28px] left-[15px] w-[15px] h-[40px] origin-top rotate-[25deg] rounded-b-md z-[-1]"
            style={{ backgroundColor: '#c5a06c', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)' }}
          ></div>
          <div 
            className="absolute top-[28px] right-[15px] w-[15px] h-[40px] origin-top rotate-[-25deg] rounded-b-md z-[-1]"
            style={{ backgroundColor: '#c5a06c', boxShadow: 'inset -2px 2px 5px rgba(0,0,0,0.1)' }}
          ></div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(45deg) scale(0.9); opacity: 0.7; }
          100% { transform: translateY(-15px) rotate(45deg) scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
