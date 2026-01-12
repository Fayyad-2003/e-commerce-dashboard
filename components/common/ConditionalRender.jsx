"use client";
export default function ConditionalRender({
  loading,
  error,
  empty,
  children,
  loadingText = "جاري التحميل…",
  errorText,
  emptyText = "لا توجد بيانات متاحة",
}) {
  if (loading)
    return <div className="p-6 text-center text-gray-600">{loadingText}</div>;

  if (error)
    return (
      <div className="p-6 text-center text-red-600">
        {errorText || `خطأ: ${error}`}
      </div>
    );

  if (empty)
    return (
      <div className="p-6 text-center text-gray-400">
        {emptyText}
      </div>
    );

  return children;
}
