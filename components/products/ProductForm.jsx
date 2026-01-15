"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { fetchClient } from "../../src/lib/fetchClient";

/*
  Enhanced EditProductForm: supports both edit *and* create modes.
  - Pass `product` to edit an existing product (existing behaviour).
  - Pass `defaultSubCategoryId` (and do NOT pass `product`) to open the form in CREATE mode with that sub-category preselected.

  Behavioural notes included in code comments.
*/

const UPLOADED_SCREENSHOT = "/mnt/data/Screenshot 2025-11-24 145132.png";

// ... keep utility helpers intact (normalizeColors, toColorGroups, appendAttributesToFD, normalizeOldImages, urlToFile) ...

function normalizeColors(raw) {
  if (raw === null || raw === undefined) return [];

  let buckets = [];

  const ensureArray = Array.isArray(raw) ? raw.flat(Infinity) : [raw];

  ensureArray.forEach((item) => {
    if (item === null || item === undefined) return;

    if (Array.isArray(item)) {
      buckets.push(...item.flat(Infinity));
      return;
    }

    if (typeof item === "string") {
      const s = item.trim();
      if (!s) return;

      if (
        (s.startsWith("[") && s.endsWith("]")) ||
        (s.startsWith("{") && s.endsWith("}"))
      ) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) {
            buckets.push(...parsed.flat(Infinity));
            return;
          }
          if (parsed && typeof parsed === "object") {
            const maybe =
              parsed.colors ??
              parsed.color ??
              parsed.items ??
              parsed.values ??
              [];
            if (Array.isArray(maybe)) {
              buckets.push(...maybe.flat(Infinity));
              return;
            }
            if (maybe) {
              buckets.push(maybe);
              return;
            }
          } else {
            buckets.push(String(parsed));
            return;
          }
        } catch (e) {
          // fallthrough
        }
      }

      if (s.includes(",")) {
        buckets.push(
          ...s
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        );
        return;
      }

      buckets.push(s);
      return;
    }

    buckets.push(String(item));
  });

  const cleaned = [];
  const seen = new Set();
  buckets.forEach((c) => {
    const v = String(c).trim();
    if (!v) return;
    const key = v;
    if (!seen.has(key)) {
      seen.add(key);
      cleaned.push(v);
    }
  });

  return cleaned;
}

function toColorGroups(attributes) {
  if (!attributes) return [];

  if (Array.isArray(attributes.sizes)) {
    const colorToSizesMap = {};
    attributes.sizes.forEach((sizeObj) => {
      const sizeName = sizeObj?.name ?? sizeObj?.label ?? sizeObj?.size;
      if (!sizeName) return;
      const colors = normalizeColors(sizeObj.colors ?? sizeObj.color ?? []);
      colors.forEach((color) => {
        if (!color) return;
        const key = String(color);
        if (!colorToSizesMap[key]) colorToSizesMap[key] = new Set();
        colorToSizesMap[key].add(sizeName);
      });
    });

    return Object.keys(colorToSizesMap).map((color) => ({
      color,
      sizes: Array.from(colorToSizesMap[color]),
      _newSize: "",
    }));
  }

  const colors = Array.isArray(attributes.color)
    ? attributes.color
    : Array.isArray(attributes.colors)
      ? attributes.colors
      : [];
  const sizes = Array.isArray(attributes.size)
    ? attributes.size
    : Array.isArray(attributes.sizes)
      ? attributes.sizes
      : [];

  return colors.map((c, i) => ({
    color: c,
    sizes: Array.isArray(sizes[i]) ? sizes[i] : [],
    _newSize: "",
  }));
}

function appendAttributesToFD(fd, colorGroups) {
  const sizeToColorsMap = {};

  (colorGroups || []).forEach((g) => {
    const color = g?.color;
    (g.sizes || []).forEach((sz) => {
      if (!sz) return;
      if (!sizeToColorsMap[sz]) sizeToColorsMap[sz] = new Set();
      if (color) sizeToColorsMap[sz].add(color);
    });
  });

  const sizes = Object.keys(sizeToColorsMap);
  sizes.forEach((sizeName, i) => {
    fd.append(`attributes[sizes][${i}][name]`, sizeName);
    Array.from(sizeToColorsMap[sizeName]).forEach((color, j) => {
      fd.append(`attributes[sizes][${i}][colors][${j}]`, color);
    });
  });
}

function normalizeOldImages(images, fullImageUrls = []) {
  if (!Array.isArray(images)) return [];
  if (images.length === 0) return [];
  if (
    typeof images[0] === "object" &&
    images[0] !== null &&
    "id" in images[0]
  ) {
    return images
      .map((img, idx) => ({
        id: img.id,
        url: img.url ?? img.path ?? img.src ?? "",
        displayUrl:
          fullImageUrls?.[idx] ?? img.url ?? img.path ?? img.src ?? "",
      }))
      .filter((i) => i.url);
  }
  return images
    .map((url, idx) =>
      typeof url === "string"
        ? { id: -(idx + 1), url, displayUrl: fullImageUrls?.[idx] ?? url }
        : null
    )
    .filter(Boolean);
}

async function urlToFile(url, filenameBase = "old-image") {
  if (!url) return null;

  const tryFetchToFile = async (u) => {
    try {
      const r = await fetch(u, { headers: { accept: "*/*" } });
      if (!r.ok) return null;
      const blob = await r.blob();
      const ext = (blob.type && blob.type.split("/")[1]) || "jpg";
      const name = `${filenameBase}.${ext}`;
      return new File([blob], name, { type: blob.type || "image/jpeg" });
    } catch {
      return null;
    }
  };

  let file = await tryFetchToFile(url);
  if (file) return file;

  const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
  file = await tryFetchToFile(proxyUrl);
  return file;
}

export default function ProductForm({
  product = null,
  defaultSubCategoryId = "",
  updateBaseUrl = null,
}) {
  const router = useRouter();
  // نعتمد فقط على عدم وجود منتج لتحديد وضع الإنشاء
  const isCreate = !product?.id;
  // units
  const [units, setUnits] = useState({ items: [], loading: true, error: "" });

  // initial old images normalized (for edit mode only)
  const initialOldImages = useMemo(() => {
    if (!product) return [];
    const base = normalizeOldImages(
      product?.images ?? [],
      product?.full_image_urls ?? []
    );
    return base;
  }, [product]);

  const [formData, setFormData] = useState({
    id: product?.id ?? "",
    // prefer product.store_section_id, otherwise use defaultSubCategoryId (create mode)
    store_section_id: String(
      product?.store_section_id ?? product?.sub_category_id ?? defaultSubCategoryId ?? ""
    ),
    unit_of_measure_id: String(product?.unit_of_measure_id ?? ""),
    name: product?.name ?? "",
    model_number: product?.model_number ?? "",
    description: product?.description ?? "",
    base_price: String(product?.base_price ?? ""),
    old_images: initialOldImages,
    new_images: [],
    attribute_color_groups: toColorGroups(product?.attributes),
    _newColor: "",
    price_tiers: Array.isArray(product?.price_tiers)
      ? product.price_tiers.map((t) => ({
        id: t.id,
        min_quantity: Number(t.min_quantity),
        price_per_unit: Number(t.price_per_unit),
      }))
      : [],
    new_tier: { min_quantity: "", price_per_unit: "" },
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // fetch units (same behaviour)
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setUnits((p) => ({ ...p, loading: true, error: "" }));
        const res = await fetchClient(`/api/units-of-measure?per_page=100`, {
          cache: "no-store",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        const items = Array.isArray(j?.data) ? j.data : [];
        setUnits({ items, loading: false, error: "" });
        if (!formData.unit_of_measure_id && items.length === 1) {
          setFormData((p) => ({
            ...p,
            unit_of_measure_id: String(items[0].id),
          }));
        }
      } catch (e) {
        if (e.name === "AbortError") return;
        setUnits({
          items: [],
          loading: false,
          error: e?.message || "فشل الجلب",
        });
      }
    })();
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // onChange helper
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  // images handlers (unchanged)
  const removeOldImageAt = (index) =>
    setFormData((p) => ({
      ...p,
      old_images: p.old_images.filter((_, i) => i !== index),
    }));

  const onNewImages = (e) => {
    const files = Array.from(e.target.files || []);
    setFormData((p) => ({ ...p, new_images: [...p.new_images, ...files] }));
  };

  const removeNewImage = (i) =>
    setFormData((p) => ({
      ...p,
      new_images: p.new_images.filter((_, idx) => idx !== i),
    }));

  // attributes handlers (unchanged)
  const addColorGroup = () => {
    const c = (formData._newColor || "").trim();
    if (!c) return;
    if (
      formData.attribute_color_groups.some(
        (g) => (g.color || "").toLowerCase() === c.toLowerCase()
      )
    )
      return;
    setFormData((p) => ({
      ...p,
      attribute_color_groups: [
        ...p.attribute_color_groups,
        { color: c, sizes: [], _newSize: "" },
      ],
      _newColor: "",
    }));
  };

  const removeColorGroup = (idx) =>
    setFormData((p) => ({
      ...p,
      attribute_color_groups: p.attribute_color_groups.filter(
        (_, i) => i !== idx
      ),
    }));

  const addSizeToGroup = (idx) => {
    const g = formData.attribute_color_groups[idx];
    const s = (g._newSize || "").trim();
    if (!s) return;
    if (g.sizes.includes(s)) return;
    const groups = [...formData.attribute_color_groups];
    groups[idx] = { ...g, sizes: [...g.sizes, s], _newSize: "" };
    setFormData((p) => ({ ...p, attribute_color_groups: groups }));
  };

  const removeSizeFromGroup = (idx, size) => {
    const g = formData.attribute_color_groups[idx];
    const groups = [...formData.attribute_color_groups];
    groups[idx] = { ...g, sizes: g.sizes.filter((x) => x !== size) };
    setFormData((p) => ({ ...p, attribute_color_groups: groups }));
  };

  // price tiers (unchanged)
  const addTier = () => {
    const { min_quantity, price_per_unit } = formData.new_tier;
    if (!min_quantity || !price_per_unit) return;
    setFormData((p) => ({
      ...p,
      price_tiers: [
        ...p.price_tiers,
        {
          min_quantity: parseInt(min_quantity),
          price_per_unit: parseFloat(price_per_unit),
        },
      ],
      new_tier: { min_quantity: "", price_per_unit: "" },
    }));
  };

  const removeTier = (i) =>
    setFormData((p) => ({
      ...p,
      price_tiers: p.price_tiers.filter((_, idx) => idx !== i),
    }));

  // validation (slightly adjusted to allow create-mode without id)
  const validate = () => {
    const newErrors = {};
    if (!formData.store_section_id) newErrors.store_section_id = "مطلوب";
    if (!formData.unit_of_measure_id) newErrors.unit_of_measure_id = "مطلوب";
    if (!formData.name) newErrors.name = "مطلوب";
    if (!formData.model_number) newErrors.model_number = "مطلوب";
    if (!formData.description) newErrors.description = "مطلوب";
    if (formData.base_price === "" || isNaN(Number(formData.base_price)))
      newErrors.base_price = "مطلوب";
    const hasAtLeastOneSize = formData.attribute_color_groups.some(
      (g) => g.color && g.sizes && g.sizes.length > 0
    );
    if (!hasAtLeastOneSize)
      newErrors.attributes = "أضف على الأقل لوناً واحداً مع حجم واحد.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // submit: uses /api/products (create) or /api/products/:id (edit)
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const fd = new FormData();

      // only include product_id for edits
      if (!isCreate && formData.id)
        fd.append("product_id", String(formData.id));

      fd.append("store_section_id", String(formData.store_section_id));
      fd.append("unit_of_measure_id", String(formData.unit_of_measure_id));
      fd.append("name", formData.name);
      fd.append("model_number", formData.model_number);
      fd.append("description", formData.description);
      fd.append("base_price", String(formData.base_price));

      // old images -> files: only necessary for edit mode (create has no old images)
      const oldFiles = isCreate
        ? []
        : (
          await Promise.all(
            formData.old_images.map(async (img, idx) => {
              const url = img.displayUrl || img.url;
              return await urlToFile(
                url,
                `old-${formData.id || "tmp"}-${idx + 1}`
              );
            })
          )
        ).filter(Boolean);

      const newFiles = formData.new_images || [];
      [...oldFiles, ...newFiles].forEach((file) => fd.append("images[]", file));

      // attributes
      // إجبار النظام على منع تكرار الألوان عبر المقاسات إذا كان الباك-إند يرفضها
      appendAttributesToFD(fd, formData.attribute_color_groups, {
        uniqueAcrossSizes: true,
      });

      // price tiers
      formData.price_tiers.forEach((t, i) => {
        fd.append(`price_tiers[${i}][min_quantity]`, String(t.min_quantity));
        fd.append(
          `price_tiers[${i}][price_per_unit]`,
          String(t.price_per_unit)
        );
      });

      // choose endpoint and method
      let endpoint = isCreate
        ? `/api/products`
        : (updateBaseUrl ? `${updateBaseUrl}/${formData.id}` : `/api/products/${formData.id}`);

      // IF it's a create action AND we have a store_section_id, use the specific store-product endpoint
      if (isCreate && formData.store_section_id) {
        endpoint = `/api/admin/store-products/store`;
      }

      const method = "POST"; // use POST for both create and edit (keeps parity with previous behaviour)

      const res = await fetchClient(endpoint, { method, body: fd });
      const out = await res.json().catch(() => ({}));

      if (res.ok && out?.success) {
        // prefer returned IDs if available
        const newId =
          out?.product?.id ?? out?.data?.id ?? out?.id ?? formData.id;
        // navigate back to sub-branch products list; if you prefer to go to the created product edit page, change the path below
        router.push(
          `/admin/products/sub-branch-products/${formData.store_section_id}`
        );
      } else {
        setErrors((p) => ({ ...p, form: out?.message || "فشل الحفظ" }));
      }
    } catch (err) {
      setErrors((p) => ({ ...p, form: err?.message || "فشل الاتصال" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#402E32]">
          {isCreate ? "إنشاء منتج جديد" : `تعديل المنتج #${formData.id}`}
        </h2>
        <button
          onClick={() =>
            router.push(
              `/admin/products/sub-branch-products/${product?.store_section_id ?? product?.sub_category_id ?? defaultSubCategoryId
              }`
            )
          }
          className="flex items-center text-gray-500 hover:text-gray-700"
        >
          <X size={20} className="ml-1" /> إغلاق
        </button>
      </div>

      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {errors.form}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* sub_category_id (hidden) but show small read-only hint for create-mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 hidden">
            <label className="block text-sm font-medium text-gray-700">
              المجموعة الفرعية (sub_category_id){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="sub_category_id"
              value={formData.sub_category_id}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.sub_category_id
                ? "border-red-500"
                : "border-gray-300 focus:ring-2 focus:ring-[#5A443A]"
                }`}
              min="1"
            />
            {errors.sub_category_id && (
              <p className="text-sm text-red-500">{errors.sub_category_id}</p>
            )}
          </div>

          {/* visible read-only display of assigned sub-category for clarity */}
          <div>
            <p className="text-sm text-gray-600">
              المجموعة الفرعية المختارة:{" "}
              <span className="font-medium text-[#402E32]">
                {formData.store_section_id || "لم يتم التحديد"}
              </span>
            </p>
          </div>
        </div>

        {/* rest of the form remains unchanged visually; labels and controls unchanged */}

        {/* name + model_number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["name", "model_number"].map((f) => (
            <div key={f} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {f === "name" ? "اسم المنتج" : "رقم الموديل"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name={f}
                value={formData[f]}
                onChange={onChange}
                className={`w-full px-3 py-2 border rounded-md ${errors[f]
                  ? "border-red-500"
                  : "border-gray-300 focus:ring-2 focus:ring-[#5A443A]"
                  }`}
              />
              {errors[f] && <p className="text-sm text-red-500">{errors[f]}</p>}
            </div>
          ))}
        </div>

        {/* base_price + unit_of_measure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              السعر الأساسي <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="base_price"
              value={formData.base_price}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.base_price
                ? "border-red-500"
                : "border-gray-300 focus:ring-2 focus:ring-[#5A443A]"
                }`}
              min="0"
              step="0.01"
            />
            {errors.base_price && (
              <p className="text-sm text-red-500">{errors.base_price}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              وحدة القياس (unit_of_measure_id){" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              name="unit_of_measure_id"
              value={formData.unit_of_measure_id}
              onChange={onChange}
              disabled={units.loading || !!units.error}
              className={`w-full px-3 py-2 border rounded-md bg-white ${errors.unit_of_measure_id
                ? "border-red-500"
                : "border-gray-300 focus:ring-2 focus:ring-[#5A443A]"
                }`}
            >
              <option value="">
                {units.loading ? "جاري التحميل..." : "اختر وحدة القياس"}
              </option>
              {units.items.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            {errors.error && (
              <p className="text-sm text-orange-600">
                تعذّر جلب الوحدات: {units.error}
              </p>
            )}
            {errors.unit_of_measure_id && (
              <p className="text-sm text-red-500">
                {errors.unit_of_measure_id}
              </p>
            )}
          </div>
        </div>

        {/* description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الوصف <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md min-h-28 ${errors.description
              ? "border-red-500"
              : "border-gray-300 focus:ring-2 focus:ring-[#5A443A]"
              }`}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* images */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الصور الحالية
          </label>

          {formData.old_images.length ? (
            <div className="grid grid-cols-3 gap-4 mb-3">
              {formData.old_images.map((img, idx) => (
                <div
                  key={
                    (img?.id != null ? `id-${img.id}` : `u-${img.url}`) ??
                    `i-${idx}`
                  }
                  className="relative group"
                >
                  <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={img.displayUrl || img.url}
                      alt={`old-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOldImageAt(idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="حذف من المنتج"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">لا توجد صور قديمة محفوظة.</p>
          )}

          <label className="block text-sm font-medium text-gray-700">
            إضافة صور جديدة
          </label>
          <div className="grid grid-cols-3 gap-4 mb-3">
            {formData.new_images.map((img, idx) => (
              <div key={idx} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`new-${idx}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeNewImage(idx)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <span className="text-2xl">+</span>
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-semibold">انقر لرفع الصور</span>
              </p>
              <p className="text-xs text-gray-500">JPEG, PNG, WebP</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={onNewImages}
              className="hidden"
            />
          </label>
        </div>

        {/* attributes (colors & sizes) */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-[#402E32] mb-4">
            السمات (Attributes)
          </h3>

          <div className="space-y-2 mb-4">
            <label className="block text-sm font-medium text-gray-700">
              إضافة لون
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData._newColor}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, _newColor: e.target.value }))
                }
                placeholder="مثال: أحمر / red"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5A443A]"
              />
              <button
                type="button"
                onClick={addColorGroup}
                className="bg-[#5A443A] text-white px-4 py-2 rounded-md hover:bg-[#402E32]"
              >
                <Plus size={16} className="ml-1 inline-block" /> إضافة
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {formData.attribute_color_groups.map((g, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">
                    اللون: <span className="text-[#402E32]">{g.color}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeColorGroup(idx)}
                    className="text-red-500 hover:text-red-700"
                    title="حذف اللون"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={g._newSize}
                    onChange={(e) => {
                      const groups = [...formData.attribute_color_groups];
                      groups[idx] = { ...g, _newSize: e.target.value };
                      setFormData((p) => ({
                        ...p,
                        attribute_color_groups: groups,
                      }));
                    }}
                    placeholder="مثال: صغير، وسط، كبير"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5A443A]"
                  />
                  <button
                    type="button"
                    onClick={() => addSizeToGroup(idx)}
                    className="bg-gray-800 text-white px-3 py-2 rounded-md hover:bg-black"
                  >
                    إضافة حجم
                  </button>
                </div>

                {!!g.sizes.length && (
                  <div className="flex flex-wrap gap-2">
                    {g.sizes.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 bg-gray-100 rounded-full border inline-flex items-center gap-2"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => removeSizeFromGroup(idx, s)}
                          className="ml-2 text-red-500"
                          title="حذف"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {errors.attributes && (
              <p className="text-sm text-red-500">{errors.attributes}</p>
            )}
          </div>
        </div>

        {/* price tiers */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-[#402E32] mb-4">
            شرائح الأسعار
          </h3>

          {formData.price_tiers.length > 0 && (
            <div className="space-y-2">
              {formData.price_tiers.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center bg-white p-3 rounded-md shadow-sm"
                >
                  <span className="flex-1">{`من كمية ${t.min_quantity}+ ${units.items.find(u => u.id == formData.unit_of_measure_id)?.name || 'وحدة'} : سعر الوحدة = ${t.price_per_unit}`}</span>
                  <button
                    type="button"
                    onClick={() => removeTier(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحد الأدنى للكمية
              </label>
              <input
                type="number"
                value={formData.new_tier.min_quantity}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    new_tier: { ...p.new_tier, min_quantity: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                سعر الوحدة
              </label>
              <input
                type="number"
                value={formData.new_tier.price_per_unit}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    new_tier: { ...p.new_tier, price_per_unit: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={addTier}
                className="w-full bg-[#5A443A] text-white px-4 py-2 rounded-md hover:bg-[#402E32]"
              >
                <Plus size={16} className="ml-1 inline-block" /> إضافة شريحة
              </button>
            </div>
          </div>
        </div>

        {/* submit */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center px-4 py-2 bg-[#5A443A] text-white rounded-md hover:bg-[#402E32] disabled:opacity-50"
          >
            {isSubmitting
              ? isCreate
                ? "جاري الإنشاء..."
                : "جاري الحفظ..."
              : isCreate
                ? "إنشاء المنتج"
                : "حفظ التعديلات"}
            <Save size={18} className="mr-2" />
          </button>
        </div>
      </form>
    </div>
  );
}
