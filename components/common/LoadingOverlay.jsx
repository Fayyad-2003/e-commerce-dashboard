"use client";
import LoadingSpinner from "./LoadingSpinner";

export default function LoadingOverlay({ message = "جاري التحميل..." }) {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-lg transition-all duration-300">
            <div className="bg-[#FFF8F0] p-6 rounded-xl shadow-xl border border-[#C5A68D]/30 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                <LoadingSpinner size={40} />
                <p className="text-[#5A443A] font-bold font-cairo text-lg">{message}</p>
            </div>
        </div>
    );
}
