import React from 'react';

export function StatsCards() {
  return (
    <div className="relative w-[420px] h-[440px] flex items-center justify-center font-sans bg-transparent mx-auto">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        .font-serif-ar { font-family: 'Amiri', serif; }
      `}} />
      
      {/* Card 1: Top-Left */}
      <div className="absolute top-[8%] left-[4%] rotate-[-2deg] z-10 bg-[#fdf8f5] rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(155,35,53,0.15)] border-l-[6px] border-[#9b2335] min-w-[200px] flex flex-col justify-center items-start">
        <span className="font-serif-ar text-5xl font-bold text-[#9b2335] mb-2 leading-none">+500</span>
        <span className="text-gray-800 font-bold text-xl leading-tight" dir="rtl">هدية تم توصيلها</span>
        <span className="text-gray-500 text-sm mt-0.5 font-medium">Gifts Delivered</span>
      </div>

      {/* Card 2: Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[1deg] z-20 bg-[#9b2335] text-white rounded-2xl p-8 shadow-[0_20px_50px_-12px_rgba(155,35,53,0.4)] min-w-[240px] flex flex-col justify-center items-center">
        <span className="font-serif-ar text-6xl font-bold mb-3 leading-none">4</span>
        <span className="font-bold text-2xl leading-tight opacity-95" dir="rtl">مجموعات</span>
        <span className="text-white/70 text-sm mt-1 uppercase tracking-widest font-semibold">Collections</span>
      </div>

      {/* Card 3: Bottom-Right */}
      <div className="absolute bottom-[8%] right-[4%] rotate-[-1.5deg] z-10 bg-[#fdf8f5] rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(155,35,53,0.15)] min-w-[200px] flex flex-col justify-center items-start">
        <span className="font-serif-ar text-5xl font-bold text-[#9b2335] mb-2 leading-none">100%</span>
        <span className="text-gray-800 font-bold text-xl leading-tight" dir="rtl">رضا العملاء</span>
        <span className="text-gray-500 text-sm mt-0.5 font-medium">Customer Satisfaction</span>
      </div>
    </div>
  );
}
