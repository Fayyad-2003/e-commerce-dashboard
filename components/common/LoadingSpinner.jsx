"use client";

export default function LoadingSpinner({ className, size = 48, label }) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
            <div
                className="relative"
                style={{ width: size, height: size }}
            >
                {/* Background Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>

                {/* Spinning Ring */}
                <div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#F7931D] animate-spin"
                    style={{ animationDuration: '0.8s' }}
                ></div>
            </div>

            {label && (
                <span className="text-sm font-medium text-gray-700">
                    {label}
                </span>
            )}
        </div>
    );
}

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}
