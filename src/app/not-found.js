"use client";

import Link from "next/link";
import { TriangleAlert, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#FFF8F0] text-[#5A443A] px-4">
      <div className="flex flex-col items-center">
        <TriangleAlert className="w-20 h-20 text-[#5A443A] mb-6" />

        <h1 className="text-3xl font-bold mb-2">الصفحة غير موجودة</h1>
        <p className="text-base opacity-80 mb-6 text-center">
          يبدو أنك وصلت إلى رابط غير صحيح أو لم يعد موجودًا.
        </p>

        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-[#5A443A] text-white rounded-md hover:bg-[#402E32] transition-all"
        >
          العودة للصفحة الرئيسية
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
