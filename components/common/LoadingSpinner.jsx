"use client";

export default function LoadingSpinner({ className, size = 48, label }) {
    return (
        <div className={cn("flex flex-col items-center justify-center", className)}>
            <div
                className="relative"
                style={{ width: size, height: size }}
            >
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-[3px] border-[#F7931D]/10 border-t-[#F7931D] animate-spin"></div>

                {/* Inner Ring (Slower/Reverse) */}
                <div
                    className="absolute inset-[4px] rounded-full border-[2px] border-[#F7931D]/5 border-t-[#F7931D]/40 animate-spin-reverse"
                    style={{ animationDuration: '1.5s' }}
                ></div>

                {/* Center Glow */}
                <div className="absolute inset-[35%] bg-[#F7931D]/20 rounded-full blur-md animate-pulse"></div>
            </div>

            {label && (
                <span className="mt-4 text-sm text-[#5A443A]/80 font-semibold tracking-wide animate-pulse-soft">
                    {label}
                </span>
            )}

            <style jsx>{`
                @keyframes spin-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                .animate-spin-reverse {
                    animation: spin-reverse 1s linear infinite;
                }
                @keyframes pulse-soft {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(0.98); }
                }
                .animate-pulse-soft {
                    animation: pulse-soft 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}
