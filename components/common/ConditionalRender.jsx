import LoadingSpinner from "./LoadingSpinner";

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
    return (
      <div className="flex items-center justify-center py-20 px-8">
        <LoadingSpinner size={64} label={loadingText} />
      </div>
    );

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
