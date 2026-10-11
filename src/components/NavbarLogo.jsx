import React from "react";

export function NavbarLogo() {
  return (
    <div className="flex items-center gap-2.5 cursor-pointer">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center p-1 shadow-md shadow-blue-500/20">
        <svg viewBox="0 0 512 512" className="w-full h-full">
          <rect x="136" y="106" width="240" height="300" rx="20" fill="#ffffff" />
          <path d="M 316 106 L 376 166 L 316 166 Z" fill="#dbeafe" />
          <circle cx="186" cy="166" r="22" fill="#2563eb" />
          <rect x="222" y="154" width="114" height="10" rx="5" fill="#1e293b" />
          <rect x="222" y="172" width="80" height="8" rx="4" fill="#94a3b8" />
          <rect x="166" y="214" width="180" height="8" rx="4" fill="#cbd5e1" />
          <rect x="166" y="232" width="150" height="8" rx="4" fill="#cbd5e1" />
          <rect x="166" y="250" width="170" height="8" rx="4" fill="#cbd5e1" />
          <circle cx="340" cy="340" r="44" fill="#10b981" />
          <path
            d="M 322 340 L 334 352 L 358 328"
            stroke="#ffffff"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className="font-black text-lg sm:text-xl text-gray-900 tracking-tight leading-none">
          CV<span className="text-blue-600">Maker</span>
        </span>
        <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mt-0.5">
          Resume Builder
        </span>
      </div>
    </div>
  );
}
