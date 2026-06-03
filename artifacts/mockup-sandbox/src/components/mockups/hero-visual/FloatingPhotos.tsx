import React from 'react';

export function FloatingPhotos() {
  return (
    <div className="relative w-[420px] h-[420px] flex items-center justify-center bg-transparent">
      {/* Soft circular gradient glow */}
      <div 
        className="absolute w-[320px] h-[320px] rounded-full blur-[60px]"
        style={{ backgroundColor: 'rgba(155, 35, 53, 0.12)' }}
      />
      
      {/* Back Left - Lantern */}
      <div className="absolute w-[200px] h-[200px] bg-white p-2 shadow-lg -translate-x-[80px] -translate-y-[40px] -rotate-[3deg] transition-all duration-500 hover:scale-105 hover:z-20 hover:shadow-xl">
        <img 
          src="https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=220&h=220&fit=crop&crop=center&q=80&auto=format" 
          alt="Lantern"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Back Right - Perfume */}
      <div className="absolute w-[200px] h-[200px] bg-white p-2 shadow-lg translate-x-[80px] -translate-y-[20px] rotate-[1deg] transition-all duration-500 hover:scale-105 hover:z-20 hover:shadow-xl">
        <img 
          src="https://images.unsplash.com/photo-1541643600914-78b084683702?w=220&h=220&fit=crop&crop=center&q=80&auto=format" 
          alt="Perfume"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Front Center - Gift Box */}
      <div className="absolute w-[240px] h-[240px] bg-white p-2.5 shadow-2xl translate-y-[30px] -rotate-[1.5deg] z-10 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-[5px]">
        <img 
          src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=260&h=260&fit=crop&crop=center&q=80&auto=format" 
          alt="Gift Box"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
