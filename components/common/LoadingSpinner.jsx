"use client";

export default function LoadingSpinner({ className, size = 48, label }) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-4 transition-all duration-500", className)}>
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <svg
                    className="animate-spin-smooth"
                    viewBox="0 0 50 50"
                    style={{ width: '100%', height: '100%' }}
                >
                    <circle
                        className="opacity-20"
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="#F7931D"
                        strokeWidth="4"
                    />
                    <circle
                        className="opacity-100"
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="#F7931D"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="31.4 31.4"
                    />
                </svg>
            </div>

            {label && (
                <div className="mt-6 flex flex-col items-center gap-1">
                    <span className="text-sm font-medium text-gray-500 tracking-wide animate-pulse-slow">
                        {label}
                    </span>
                    <div className="flex gap-1">
                        <span className="w-1 h-1 bg-[#F7931D]/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1 h-1 bg-[#F7931D]/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1 h-1 bg-[#F7931D] rounded-full animate-bounce" />
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin-smooth {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-smooth {
                    animation: spin-smooth 1s linear infinite;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
}

// Simple fallback for cn if lib/utils doesn't exist
function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}
