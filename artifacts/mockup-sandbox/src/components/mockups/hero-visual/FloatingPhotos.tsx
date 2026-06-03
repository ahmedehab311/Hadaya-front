import React from 'react';

export function FloatingPhotos() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="relative w-[420px] h-[420px] flex items-center justify-center">
        {/* Soft circular gradient glow */}
        <div
          className="absolute w-[320px] h-[320px] rounded-full blur-[60px]"
          style={{ backgroundColor: 'rgba(155, 35, 53, 0.12)' }}
        />

        {/* Back Left - Red roses */}
        <div className="absolute w-[200px] h-[200px] bg-white p-2 shadow-lg -translate-x-[80px] -translate-y-[40px] -rotate-[3deg] transition-all duration-500 hover:scale-105 hover:z-20 hover:shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=260&h=260&fit=crop&crop=center&q=80&auto=format"
            alt="Luxury gift set"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Back Right - Luxury chocolates */}
        <div className="absolute w-[200px] h-[200px] bg-white p-2 shadow-lg translate-x-[80px] -translate-y-[20px] rotate-[1deg] transition-all duration-500 hover:scale-105 hover:z-20 hover:shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=260&h=260&fit=crop&crop=center&q=80&auto=format"
            alt="Luxury chocolates"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Front Center - Wrapped gift box with ribbon */}
        <div className="absolute w-[240px] h-[240px] bg-white p-2.5 shadow-2xl translate-y-[30px] -rotate-[1.5deg] z-10 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-[5px]">
          <img
            src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&h=300&fit=crop&crop=center&q=80&auto=format"
            alt="Wrapped gift box"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
