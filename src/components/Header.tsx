/**
 * Header Component for HH Goa 2026 Boarding Pass Generator
 */
import React from 'react';
import { Plane, Sparkles, MapPin } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-[#e2ded4] text-[#092130] px-4 sm:px-8 py-3.5 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#095755] flex items-center justify-center text-white shadow-sm">
            <Plane className="w-4 h-4 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-lg tracking-tight text-[#092130] leading-none">
                HACKER HOUSE GOA
              </h1>
              <span className="bg-[#095755]/10 text-[#095755] text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border border-[#095755]/20">
                2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[#095755]" /> Boarding Pass Generator
            </p>
          </div>
        </div>

        {/* Right Hashtag Badge */}
        <div className="flex items-center gap-1.5 bg-[#f1ede2] border border-[#dcd7cc] px-3 py-1 rounded-full">
          <Sparkles className="w-3 h-3 text-[#095755]" />
          <span className="text-xs font-bold text-[#095755] tracking-wider">#FrameInGoa</span>
        </div>
      </div>
    </header>
  );
};


