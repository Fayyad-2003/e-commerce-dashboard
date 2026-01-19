"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * SectionLayout
 *
 * Props:
 * - title: string
 * - backHref: string
 * - addHref?: string
 * - addLabel?: string
 * - children: React.ReactNode   // table or ConditionalRender inside
 */

export default function SectionLayout({
  title,
  backHref = "/",
  addHref,
  addLabel = "إضافة عنصر جديد",
  children,
  hideBackButton,
}) {
  return (
    <div className="relative font-sans gap-16 px-4 sm:px-10 lg:px-20 py-8 sm:py-16">
      {/* Back Button */}
      {!hideBackButton && (
        <div className="absolute top-4 right-4 sm:right-8">
          <Link href={backHref}>
            <div className="flex items-center text-xs sm:text-sm text-[#5A443A] hover:text-[#F7931D] transition-colors">
              <ArrowRight />
              <span className="mr-3">العودة</span>
            </div>
          </Link>
        </div>
      )}

      {/* Title + Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b mb-5 gap-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#5A443A]">
          {title}
        </h2>

        {addHref && (
          <Link
            href={addHref}
            className="bg-[#5A443A] text-white px-4 py-2 rounded-md hover:bg-[#402E32] transition-colors mt-4 sm:mt-0"
          >
            {addLabel}
          </Link>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
