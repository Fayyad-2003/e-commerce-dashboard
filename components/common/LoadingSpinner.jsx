"use client";

export default function LoadingSpinner({ className, size = 32, label }) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-4", className)}>
            <div
                className="relative animate-spin-smooth"
                style={{ width: size, height: size }}
            >
                <svg viewBox="0 0 32 32" className="w-full h-full">
                    <defs>
                        <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#F7931D" stopOpacity="1" />
                            <stop offset="100%" stopColor="#F7931D" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M16 2 A14 14 0 0 1 30 16"
                        fill="none"
                        stroke="url(#spinner-gradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {label && (
                <span className="mt-4 text-[13px] text-gray-400 font-medium tracking-tight animate-pulse-quiet">
                    {label}
                </span>
            )}

            <style jsx>{`
                @keyframes spin-smooth {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-smooth {
                    animation: spin-smooth 0.8s linear infinite;
                }
                @keyframes pulse-quiet {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse-quiet {
                    animation: pulse-quiet 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}
