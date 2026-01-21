"use client";

export default function LoadingSpinner({ className, size = 48, label }) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-6", className)}>
            <div
                className="relative animate-scale-in"
                style={{ width: size, height: size }}
            >
                {/* Outer Gradient Ring */}
                <div className="absolute inset-0 rounded-full animate-spin" style={{ animationDuration: '1.2s' }}>
                    <div className="w-full h-full rounded-full border-[3px] border-transparent bg-gradient-to-tr from-[#F7931D] via-[#FFA94D] to-[#F7931D]/30 bg-clip-border opacity-80"></div>
                </div>

                {/* Middle Ring with Shimmer */}
                <div
                    className="absolute inset-[6px] rounded-full animate-spin-reverse"
                    style={{ animationDuration: '2s' }}
                >
                    <div className="w-full h-full rounded-full border-[2px] border-transparent bg-gradient-to-bl from-[#F7931D]/60 via-transparent to-[#F7931D]/40 bg-clip-border"></div>
                </div>

                {/* Particle Orbit Effect */}
                <div className="absolute inset-[8px] rounded-full animate-spin" style={{ animationDuration: '3s' }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#F7931D] rounded-full shadow-lg shadow-[#F7931D]/50"></div>
                    <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-1 h-1 bg-[#FFA94D] rounded-full shadow-md shadow-[#FFA94D]/50"></div>
                </div>

                {/* Center Glow Pulse */}
                <div className="absolute inset-[30%] bg-gradient-radial from-[#F7931D]/40 via-[#F7931D]/20 to-transparent rounded-full blur-lg animate-pulse-glow"></div>

                {/* Inner Core */}
                <div className="absolute inset-[38%] bg-[#F7931D]/30 rounded-full animate-pulse" style={{ animationDuration: '1.5s' }}></div>
            </div>

            {label && (
                <div className="flex flex-col items-center gap-2 animate-fade-in">
                    <span className="text-sm font-semibold text-[#5A443A]/90 tracking-wide">
                        {label}
                    </span>
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-[#F7931D] rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1s' }}></div>
                        <div className="w-2 h-2 bg-[#F7931D] rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1s' }}></div>
                        <div className="w-2 h-2 bg-[#F7931D] rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1s' }}></div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                .animate-spin-reverse {
                    animation: spin-reverse 1s linear infinite;
                }
                
                @keyframes pulse-glow {
                    0%, 100% { 
                        opacity: 0.6; 
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 1; 
                        transform: scale(1.15);
                    }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }
                
                @keyframes scale-in {
                    from { 
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    to { 
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.4s ease-out;
                }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out 0.2s both;
                }
            `}</style>
        </div>
    );
}

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}
