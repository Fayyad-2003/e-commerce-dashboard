"use client";
import LoadingSpinner from "./LoadingSpinner";

export default function LoadingOverlay({ message = "جاري التحميل..." }) {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-md rounded-lg transition-all duration-500 overflow-hidden">
            <div className="relative group">
                {/* Decorative Background Glow */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#F7931D]/20 to-transparent blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative bg-white/80 p-8 rounded-2xl shadow-[0_20px_50px_rgba(247,147,29,0.12)] border border-white/50 backdrop-blur-xl flex flex-col items-center gap-5 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
                    <LoadingSpinner size={48} />
                    <p className="text-[#5A443A] font-bold font-cairo text-lg tracking-wide uppercase">
                        {message}
                    </p>

                    {/* Tiny accent bar */}
                    <div className="w-12 h-1 bg-[#F7931D]/20 rounded-full overflow-hidden">
                        <div className="w-1/2 h-full bg-[#F7931D] rounded-full animate-shimmer"></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
            `}</style>
        </div>
    );
}
