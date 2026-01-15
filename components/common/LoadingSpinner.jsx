"use client";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming cn utility is available, if not I'll use standard className

export default function LoadingSpinner({ className, size = 24, label }) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
            <Loader2
                className="animate-spin text-[#F7931D]"
                size={size}
            />
            {label && <span className="text-sm text-[#5A443A] font-cairo">{label}</span>}
        </div>
    );
}

// Simple fallback for cn if lib/utils doesn't exist
function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}
