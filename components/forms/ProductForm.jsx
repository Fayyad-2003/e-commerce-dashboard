"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useUnitsOfMeasure } from "../../hooks";
import LoadingSpinner from "../common/LoadingSpinner";

const STORAGE_BASE =
  process.env.NEXT_PUBLIC_IMAGES ||
  process.env.NEXT_PUBLIC_STORAGE_URL;

function normalizeImage(src) {
  if (!src) return null;
  if (typeof File !== "undefined" && src instanceof File)
    return URL.createObjectURL(src);
  if (/^https?:\/\//i.test(src) || src.startsWith("blob:")) return src;
  return `${STORAGE_BASE}/${String(src).replace(/^\/+/, "")}`;
}

export default function ProductForm({
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
  subCategoryId
}) {

  /* ----------------------------------
   *        FETCH UNITS OF MEASURE
   * ---------------------------------- */
  const {
    data: units,
    loading: loadingUnits,
    err: unitError,
  } = useUnitsOfMeasure();

  const [form, setForm] = useState({
    id: initialData?.id ?? "",
    name: initialData?.name || "",
    model_number: initialData?.model_number || "",
    description: initialData?.description || "",
    base_price: initialData?.base_price ?? "",
    sub_category_id: String(subCategoryId ?? ""),
    unit_of_measure_id: String(initialData?.unit_of_measure_id ?? ""),
    images: initialData?.images || [],
  });

  const fileRef = useRef(null);
  const [previews, setPreviews] = useState(
    (initialData?.full_image_urls || []).map((img) => normalizeImage(img))
  );

  /* sizes and tiers with at least one trailing empty row */
  const [sizes, setSizes] = useState(() => {
    const fromInit = initialData?.attributes?.sizes || [];
    if (!fromInit || fromInit.length === 0) return [{ name: "", colors: [""] }];
    return fromInit.map((s) => ({
      name: s.name ?? "",
      colors: (s.colors && s.colors.length ? s.colors.slice() : [""]),
    }));
  });

  const [priceTiers, setPriceTiers] = useState(() => {
    const fromInit = initialData?.price_tiers || [];
    if (!fromInit || fromInit.length === 0)
      return [{ min_quantity: "", price_per_unit: "" }];
    return fromInit.map((t) => ({
      min_quantity: t.min_quantity ?? "",
      price_per_unit: t.price_per_unit ?? "",
    }));
  });

  /* sync when initialData changes */
  useEffect(() => {
    setForm({
      id: initialData?.id ?? "",
      name: initialData?.name || "",
      model_number: initialData?.model_number || "",
      description: initialData?.description || "",
      base_price: initialData?.base_price ?? "",
      sub_category_id: subCategoryId, // Update sub_category_id when subId changes
      unit_of_measure_id: String(initialData?.unit_of_measure_id ?? ""),
      images: initialData?.images || [],
    });

    setPreviews(
      (initialData?.full_image_urls || []).map((img) => normalizeImage(img))
    );

    const fromInitSizes = initialData?.attributes?.sizes || [];
    setSizes(
      (fromInitSizes && fromInitSizes.length > 0
        ? fromInitSizes.map((s) => ({
          name: s.name ?? "",
          colors: s.colors && s.colors.length ? s.colors.slice() : [""],
        }))
        : [{ name: "", colors: [""] }]
      )
    );

    const fromInitTiers = initialData?.price_tiers || [];
    setPriceTiers(
      (fromInitTiers && fromInitTiers.length > 0
        ? fromInitTiers.map((t) => ({
          min_quantity: t.min_quantity ?? "",
          price_per_unit: t.price_per_unit ?? "",
        }))
        : [{ min_quantity: "", price_per_unit: "" }]
      )
    );
  }, [initialData]);

  /* cleanup blob urls on unmount */
  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (typeof p === "string" && p.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(p);
          } catch (e) { }
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----------------------------------
   *        IMAGE HANDLING
   * ---------------------------------- */
  const handleImageAdd = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("اختر صورة");
    if (file.size > 2 * 1024 * 1024) return toast.error("الحد الأقصى 2MB");

    setForm((p) => ({ ...p, images: [...p.images, file] }));
    setPreviews((p) => [...p, normalizeImage(file)]);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    const nextImages = [...form.images];
    const removed = nextImages.splice(idx, 1);

    const nextPrev = [...previews];
    const target = nextPrev.splice(idx, 1)[0];

    if (target?.startsWith?.("blob:")) {
      try {
        URL.revokeObjectURL(target);
      } catch (e) { }
    }

    setForm((p) => ({ ...p, images: nextImages }));
    setPreviews(nextPrev);
  };

  /* ----------------------------------
   *        ATTRIBUTES (sizes/colors)
   *  - auto-append a new empty row when user types into the last one
   * ---------------------------------- */

  // Update size name or add new size if it's the last one
  const updateSize = (index, field, value) => {
    const updated = [...sizes];
    updated[index][field] = value;
    setSizes(updated);

    if (index === sizes.length - 1 && field === "name" && value !== "") {
      setSizes((prev) => [...prev, { name: "", colors: [""] }]);
    }
  };

  // Update or add a new color for a specific size
  const updateColor = (sizeIndex, colorIndex, value) => {
    const updated = [...sizes];
    updated[sizeIndex].colors[colorIndex] = value;
    setSizes(updated);

    if (
      sizeIndex === sizes.length - 1 &&
      colorIndex === updated[sizeIndex].colors.length - 1 &&
      value !== ""
    ) {
      setSizes((prev) => {
        const newSizes = [...prev];
        newSizes[sizeIndex].colors.push("");
        return newSizes;
      });
    }
  };

  const removeSize = (index) => {
    const nextSizes = sizes.filter((_, i) => i !== index);
    if (nextSizes.length === 0) nextSizes.push({ name: "", colors: [""] });
    setSizes(nextSizes);
  };

  const removeColor = (sizeIndex, colorIndex) => {
    const updated = [...sizes];
    updated[sizeIndex].colors = updated[sizeIndex].colors.filter((_, i) => i !== colorIndex);
    if (updated[sizeIndex].colors.length === 0) updated[sizeIndex].colors = [""];
    setSizes(updated);
  };

  /* ----------------------------------
   *        PRICE TIERS (auto-append)
   * ---------------------------------- */
  // Update price tier or add new one
  const updateTier = (index, field, value) => {
    const updated = [...priceTiers];
    updated[index][field] = value;
    setPriceTiers(updated);

    if (
      index === priceTiers.length - 1 &&
      (field === "min_quantity" || field === "price_per_unit") &&
      value !== ""
    ) {
      setPriceTiers((prev) => [...prev, { min_quantity: "", price_per_unit: "" }]);
    }
  };

  const removeTier = (index) => {
    const updated = priceTiers.filter((_, i) => i !== index);
    if (updated.length === 0) updated.push({ min_quantity: "", price_per_unit: "" });
    setPriceTiers(updated);
  };


  /* ----------------------------------
   *            SUBMIT
   * ---------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSubmit) return;

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("model_number", form.model_number);
    fd.append("description", form.description);
    fd.append("base_price", form.base_price);
    fd.append("sub_category_id", form.sub_category_id);
    fd.append("unit_of_measure_id", form.unit_of_measure_id);

    // images
    form.images.forEach((img) => {
      if (img instanceof File) {
        fd.append("images[]", img);
      } else {
        fd.append("existing_images[]", img);
      }
    });

    // Send attributes (sizes/colors)
    fd.append("attributes", JSON.stringify({ sizes }));

    // Send price tiers
    priceTiers.forEach((t, i) => {
      fd.append(`price_tiers[${i}][min_quantity]`, t.min_quantity);
      fd.append(`price_tiers[${i}][price_per_unit]`, t.price_per_unit);
    });

    await onSubmit(fd);
  };

  /* ----------------------------------
   *            UI
   * ---------------------------------- */
  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {initialData ? "تعديل المنتج" : "منتج جديد"}
      </h2>

      {/* Images area - square at the top */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">الصور</label>

        <div className="w-full aspect-square bg-gray-50 rounded border border-gray-200 p-3 overflow-auto">
          <div className="flex gap-3 flex-wrap">
            {previews.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img}
                  alt={`preview-${i}`}
                  className="w-28 h-28 rounded object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
            {/* placeholder square add button */}
            <label className="w-28 h-28 flex items-center justify-center rounded border border-dashed cursor-pointer text-sm text-gray-500">
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={handleImageAdd}
                className="hidden"
              />
              إضافة صورة
            </label>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
          <input
            type="text"
            value={form.name}
            required
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Model Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رقم الموديل</label>
          <input
            type="text"
            value={form.model_number}
            onChange={(e) => setForm((p) => ({ ...p, model_number: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Base Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">سعر الأساس</label>
          <input
            type="number"
            value={form.base_price}
            required
            onChange={(e) => setForm((p) => ({ ...p, base_price: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Unit Of Measure */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">وحدة القياس</label>
          <select
            value={form.unit_of_measure_id}
            disabled={loadingUnits}
            onChange={(e) => setForm((p) => ({ ...p, unit_of_measure_id: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">اختر وحدة</option>
            {units?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {unitError && <p className="text-red-500 text-sm">خطأ في تحميل الوحدات</p>}
        </div>

        {/* Sizes and Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الأحجام والألوان</label>
          {sizes.map((s, i) => (
            <div key={i} className="border p-3 mb-2 rounded-lg">
              <input
                type="text"
                placeholder="اسم الحجم"
                value={s.name}
                onChange={(e) => updateSize(i, "name", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {s.colors.map((c, ci) => (
                <div key={ci} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={c}
                    placeholder="لون"
                    onChange={(e) => updateColor(i, ci, e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeColor(i, ci)}
                    className="px-2 py-1 bg-red-600 text-white rounded"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* Price Tiers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">شرائح السعر</label>

          {priceTiers.map((t, i) => (
            <div key={i} className="border p-3 mb-2 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="الكمية الدنيا"
                  value={t.min_quantity}
                  onChange={(e) => updateTier(i, "min_quantity", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="السعر للوحدة"
                  value={t.price_per_unit}
                  onChange={(e) => updateTier(i, "price_per_unit", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeTier(i)}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
              >
                حذف
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <LoadingSpinner size={18} className="text-white" />
                <span>جاري الحفظ…</span>
              </>
            ) : (
              initialData ? "حفظ التعديلات" : "إضافة المنتج"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
