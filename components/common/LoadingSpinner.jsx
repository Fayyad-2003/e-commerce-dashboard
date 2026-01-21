"use client";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ className, size = 48, label }) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8", className)}>
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                {/* Outer Ring */}
                <div
                    className="absolute inset-0 border-4 border-gray-100 rounded-full"
                    style={{ borderTopColor: '#F7931D', animation: 'spin 1.5s linear infinite' }}
                />

                {/* Inner Ring (Reverse) */}
                <div
                    className="absolute inset-2 border-4 border-gray-50 rounded-full opacity-60"
                    style={{ borderBottomColor: '#F7931D', animation: 'spin 1.2s linear infinite reverse' }}
                />

                {/* Center Glow */}
                <div className="absolute inset-0 bg-[#F7931D]/5 rounded-full blur-sm animate-pulse" />
            </div>

            {label && (
                <div className="mt-8 flex flex-col items-center">
                    <span className="text-xl text-[#5A443A] font-black tracking-tight animate-pulse text-center leading-relaxed">
                        {label}
                    </span>
                    <div className="mt-2 flex gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#F7931D] rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-[#F7931D] rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-[#F7931D] rounded-full animate-bounce" />
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

// Simple fallback for cn if lib/utils doesn't exist
function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}
