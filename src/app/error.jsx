"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert, RotateCcw, Home } from "lucide-react";

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF8F0] text-[#5A443A] px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-[#5A443A]/10">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-[#5A443A]/5 rounded-full flex items-center justify-center">
                        <TriangleAlert className="w-10 h-10 text-[#5A443A]" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-2 text-[#5A443A]">
                    عذراً، حدث خطأ ما!
                </h2>

                <p className="text-[#402E32]/80 mb-8 leading-relaxed">
                    واجهنا مشكلة غير متوقعة أثناء معالجة طلبك.
                    <br />
                    <span className="text-sm font-mono mt-2 block opacity-60 ltr">
                        {error?.message || "Unknown Error"}
                    </span>
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#5A443A] text-white rounded-xl hover:bg-[#402E32] transition-colors shadow-lg shadow-[#5A443A]/20"
                    >
                        <RotateCcw size={18} />
                        <span>إعادة المحاولة</span>
                    </button>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#5A443A]/20 text-[#5A443A] rounded-xl hover:bg-[#5A443A]/5 transition-colors"
                    >
                        <Home size={18} />
                        <span>العودة للرئيسية</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
