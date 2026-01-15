import LoadingOverlay from "@/../../components/common/LoadingOverlay";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#FFF8F0]">
            <div className="flex flex-col items-center gap-6">
                {/* You can add a logo here if available */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-[#F7931D]/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-[#F7931D] rounded-full animate-spin"></div>
                </div>
                <h2 className="text-2xl font-bold text-[#5A443A] font-cairo animate-pulse">
                    جاري الملفات...
                </h2>
            </div>
        </div>
    );
}
