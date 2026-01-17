import { useEffect, useState } from "react";
import { PlusCircle, Image as ImageIcon, Save, Trash2 } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";

export default function BranchForm({
  initialData = { id: null, name: "", image: null, imageUrl: "" },
  onSubmit,
  isSubmitting = false,
  onCancel,
  isEditMode = false,
  type,
}) {
  const [name, setName] = useState(initialData.name || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [image, setImage] = useState(initialData.image || null);
  const [preview, setPreview] = useState(initialData.imageUrl || "");
  const [pending, setPending] = useState(false);
  const [imageRemoved, setImageRemoved] = useState(false);

  useEffect(() => {
    setName(initialData.name || "");
    setDescription(initialData.description || "");
    setImage(initialData.image || null);
    setPreview(initialData.imageUrl || "");
    setImageRemoved(false);
  }, [
    initialData?.id,
    initialData?.name,
    initialData?.description,
    initialData?.image,
    initialData?.imageUrl,
  ]);

  const isAbsoluteUrl = (u) =>
    typeof u === "string" && /^(https?:)?\/\//i.test(u);
  const isBlobOrData = (u) =>
    typeof u === "string" && /^(blob:|data:)/i.test(u);
  const buildFullImagePath = (path) => {
    if (!path) return "";
    if (isAbsoluteUrl(path) || isBlobOrData(path)) return path;
    const base = process.env.NEXT_PUBLIC_IMAGES || "";
    return `${base.replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    const source = preview || initialData?.imageUrl || initialData?.image || "";
    const normalized = buildFullImagePath(source);
    if (normalized && normalized !== preview) setPreview(normalized);
  }, [initialData?.imageUrl, initialData?.image]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("الرجاء اختيار ملف صورة فقط");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("حجم الملف كبير جداً (الحد الأقصى 2MB)");
      return;
    }
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setImageRemoved(false);
  };

  const handleClearImage = (e) => {
    e?.stopPropagation?.();
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview("");
    const hadExisting = Boolean(initialData?.image || initialData?.imageUrl);
    setImageRemoved(hadExisting);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending || isSubmitting) return;
    if (type === "sub" && !image && !isEditMode) {
      alert("صورة القسم الفرعي مطلوبة");
      return;
    }
    try {
      setPending(true);
      const payload = {
        id: initialData?.id ?? null,
        name: name.trim(),
        description: description.trim(),
        image,
        imageRemoved,
      };
      await Promise.resolve(onSubmit?.(payload));
    } finally {
      setPending(false);
    }
  };

  const disabledNow = pending || isSubmitting;
  const buttonLabel = disabledNow
    ? "جارٍ الحفظ..."
    : isEditMode
      ? "حفظ التعديلات"
      : "حفظ";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md space-y-6"
        dir="rtl"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            الاسم
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A443A]"
            required
            minLength={3}
            maxLength={100}
            disabled={disabledNow}
          />
        </div>

        {(description || type === "store") && (

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              الوصف
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A443A] min-h-[100px]"
              maxLength={500}
              disabled={disabledNow}
              placeholder="أدخل وصفاً بسيطاً هنا..."
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {type === "sub" ? "صورة القسم الفرعي" : "صورة القسم الرئيسي"}
          </label>
          <div className="flex items-center space-x-4">
            <label
              className={`flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed rounded-md cursor-pointer hover:border-[#5A443A] ${disabledNow
                ? "opacity-60 cursor-not-allowed pointer-events-none"
                : "border-gray-300"
                }`}
            >
              {preview ? (
                <div className="relative w-full h-full">
                  <img
                    src={preview}
                    alt="معاينة الصورة"
                    className="w-full h-full object-cover rounded-md"
                  />
                  {!disabledNow && (
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-gray-500">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-sm">اختر صورة</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={disabledNow}
              />
            </label>

            <div className="text-sm text-gray-500">
              <p>• يفضل استخدام صورة بحجم 800x800 بكسل</p>
              <p>• الحد الأقصى لحجم الملف: 2MB</p>
              <p>• الصيغ المدعومة: JPG, PNG, WEBP</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={disabledNow}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={disabledNow || !name.trim()}
              className={`px-4 py-2 bg-[#5A443A] text-white rounded-md hover:bg-[#402E32] flex items-center
                ${disabledNow
                  ? "opacity-70 cursor-not-allowed pointer-events-none"
                  : ""
                }`}
            >
              {disabledNow ? (
                <>
                  <LoadingSpinner size={20} className="text-white ml-2" />
                  <span>{buttonLabel}</span>
                </>
              ) : (
                <>
                  {isEditMode ? (
                    <Save className="w-5 h-5 ml-2" />
                  ) : (
                    <PlusCircle className="w-5 h-5 ml-2" />
                  )}
                  <span>{buttonLabel}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
