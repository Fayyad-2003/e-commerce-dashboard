"use client";

export default function LoadingSpinner({ className, size = 40, label }) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-4", className)}>
            <div className="relative" style={{ width: size, height: size }}>
                {/* Single Elegant Spinner */}
                <div
                    className="w-full h-full border-2 border-gray-100 rounded-full"
                    style={{
                        borderTopColor: '#F7931D',
                        animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite'
                    }}
                />
            </div>

            {label && (
                <div className="mt-6">
                    <span className="text-sm text-gray-400 font-medium tracking-wide animate-pulse text-center">
                        {label}
                    </span>
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
