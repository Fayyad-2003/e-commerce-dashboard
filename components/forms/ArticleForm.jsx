// src/components/articles/ArticleForm.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const STORAGE_BASE =
  process.env.NEXT_PUBLIC_IMAGES || // فضّل هذا إن كان مضبوطًا عندك
  process.env.NEXT_PUBLIC_STORAGE_URL;

function isAbsoluteUrl(u) {
  return (
    typeof u === "string" && (/^https?:\/\//i.test(u) || u.startsWith("blob:"))
  );
}

function normalizeImageSrc(src) {
  if (!src) return null;

  // في حال كان File
  if (typeof File !== "undefined" && src instanceof File) {
    return URL.createObjectURL(src);
  }

  // في حال كان URL كامل
  if (isAbsoluteUrl(src)) return src;

  // في حال كان مسار نسبي مثل "articles/xxx.png" أو "/articles/xxx.png"
  const clean = String(src).replace(/^\/+/, ""); // يشيل أي سلاش في البداية
  return `${STORAGE_BASE}/${clean}`;
}

export default function ArticleForm({
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    date: initialData?.date || "",
    content: initialData?.content || "",
    image: initialData?.image || null, // File أو string (رابط/مسار)
  });

  const [preview, setPreview] = useState(() =>
    normalizeImageSrc(initialData?.image)
  );
  const fileRef = useRef(null);

  // حدّث المعاينة إذا تغيّر initialData.image لاحقًا
  useEffect(() => {
    setPreview(normalizeImageSrc(initialData?.image));
  }, [initialData?.image]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("اختر صورة");
    if (file.size > 2 * 1024 * 1024) return alert("الحد الأقصى 2MB");

    // نظّف أي blob سابق
    if (preview && preview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(preview);
      } catch {}
    }

    setFormData((p) => ({ ...p, image: file }));
    setPreview(normalizeImageSrc(file));
  };

  const handleRemoveImage = () => {
    if (preview && preview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(preview);
      } catch {}
    }
    setFormData((p) => ({ ...p, image: null }));
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = (e) => {
    e.preventDefault();
    // ملاحظة مهمة عند الإرسال:
    // - إذا formData.image كان File -> أرسله كـ multipart
    // - إذا كان string (رابط/مسار) -> أرسله كسلسلة نصية كما هي
    onSubmit?.(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        {initialData ? "تعديل المقال" : "مقال جديد"}
      </h2>

      <form onSubmit={submit}>
        {/* صورة المقال */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            صورة المقال
          </label>
          <div className="flex items-center gap-4">
            {preview ? (
              <div className="relative group">
                {/* نستخدم <img> لتفادي قيود next/image مع blob: */}
                <img
                  src={preview}
                  alt="معاينة"
                  width={120}
                  height={80}
                  className="rounded object-cover border"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                لا توجد صورة
              </div>
            )}

            <div>
              <input
                ref={fileRef}
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm transition-colors"
              >
                {preview ? "تغيير الصورة" : "اختر صورة"}
              </label>
              <p className="text-xs text-gray-500 mt-1">
                يُفضّل 800×400 بكسل (حد أقصى 2MB)
              </p>
            </div>
          </div>
        </div>

        {/* العنوان */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            عنوان المقال
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        {/* المحتوى */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المحتوى
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={8}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/articles"
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-70"
          >
            {submitting
              ? "جاري الحفظ…"
              : initialData
              ? "حفظ التعديلات"
              : "إضافة المقال"}
          </button>
        </div>
      </form>
    </div>
  );
}
