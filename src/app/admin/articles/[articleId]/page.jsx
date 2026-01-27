"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchClient } from "../../../../lib/fetchClient";
import Link from "next/link";
import { ConditionalRender } from "../../../../../components/common";

function fmt(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr || "-";
  }
}

// --- SECURITY FIX ---
function sanitizeUrl(url) {
  if (!url) return undefined;
  // Allow http, https, and relative paths (starting with /)
  // Block javascript:, data: (unless safe), vbscript:
  if (/^(https?:\/\/|\/)/i.test(url)) return url;
  return undefined;
}

export default function ArticleDetailsPage() {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchArticle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchClient(`/api/articles/${articleId}`);
      if (!res.ok) {
        let text;
        try {
          const j = await res.json();
          text = j?.message || JSON.stringify(j);
        } catch {
          text = await res.text();
        }
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = await res.json();

      if (json?.success) {
        setArticle(json.data);
      } else {
        throw new Error(json?.message || "تعذر تحميل المقال");
      }
    } catch (err) {
      console.error("Error fetching article:", err);
      setError(err?.message || String(err));
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  // Apply sanitization
  const safeImageUrl = sanitizeUrl(article?.full_image_url);

  return (
    <ConditionalRender
      loading={loading}
      error={error}
      empty={!article}
      loadingText="جاري التحميل..."
      emptyText="لم يتم العثور على المقال"
      errorText={error ? `حدث خطأ: ${error}` : undefined}
    >
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">{article?.title}</h1>
          <Link
            href="/admin/articles"
            className="text-blue-600 hover:underline"
          >
            العودة للقائمة
          </Link>
        </div>

        {/* الصورة */}
        {safeImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={safeImageUrl}
            alt={article?.title}
            className="max-w-sm rounded shadow"
          />
        ) : (
          <div className="text-gray-400">لا توجد صورة (أو الرابط غير آمن)</div>
        )}

        {/* المحتوى */}
        <div className="font-bold text-md leading-relaxed whitespace-pre-wrap">
          {(article?.content || "لا يوجد محتوى")
            .replace(/\\r\\n/g, "\n")
            .replace(/\\r/g, "\n")
            .replace(/\\n/g, "\n")}
        </div>

        {/* معلومات إضافية */}
        <div className="space-y-2 text-sm text-gray-600">
          <p>المعرف: {article?.id}</p>
          <p>تاريخ الإنشاء: {fmt(article?.created_at)}</p>
          <p>آخر تعديل: {fmt(article?.updated_at)}</p>
        </div>
      </div>
    </ConditionalRender>
  );
}
