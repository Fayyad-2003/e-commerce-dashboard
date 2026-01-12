"use client";
import { MoveLeft, Save } from "lucide-react";
import useEditUnit from "../../hooks/update/useEditUnitsOfMeasure";
import { useEffect, useState } from "react";

export default function UnitsOfMeasureForm() {
  const {
    initialData,
    loading,
    submitting,
    error,
    handleSubmit,
    goBack,
  } = useEditUnit();

  const isEdit = !!initialData; // ✅ Add or Edit mode

  const [name, setName] = useState(initialData?.name || "");
  const [abbreviation, setAbbreviation] = useState(
    initialData?.abbreviation || ""
  );

  /** ✅ Update form when data is fetched */
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAbbreviation(initialData.abbreviation);
    }
  }, [initialData]);

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit({ name, abbreviation });
  };

  const disabled = submitting || !name.trim();

  return (
    <div className="relative font-sans sm:p-20 p-4">
      <div className="max-w-2xl mx-auto">
        {/* ✅ Title */}
        <h2 className="text-2xl font-bold text-[#5A443A] mb-8">
          {isEdit ? "تعديل وحدة القياس" : "إضافة وحدة قياس جديدة"}
        </h2>

        {loading ? (
          <div className="text-gray-600 text-sm">جارِ التحميل...</div>
        ) : (
          <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-md">
            {error && (
              <p className="text-red-600 text-sm mb-3">{String(error)}</p>
            )}

            {/* ✅ Name */}
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                وحدة القياس
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-[#5A443A]"
                placeholder="مثال: متر"
                required
                minLength={1}
                maxLength={50}
              />
              <p className="mt-1 text-sm text-gray-500">
                يرجى إدخال اسم وحدة القياس
              </p>
            </div>

            {/* ✅ Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={goBack}
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={disabled}
                className="px-4 py-2 bg-[#5A443A] text-white rounded-md hover:bg-[#402E32]
                  disabled:opacity-70 flex items-center"
              >
                {submitting ? (
                  "جاري الحفظ..."
                ) : (
                  <>
                    <Save className="w-5 h-5 ml-2" />
                    <span>{isEdit ? "تحديث الوحدة" : "حفظ الوحدة"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
