"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

const STORAGE_BASE =
  process.env.NEXT_PUBLIC_IMAGES || process.env.NEXT_PUBLIC_STORAGE_URL;

/** normalizeImage: returns a URL for non-File values. */
function normalizeImage(src) {
  if (!src) return null;
  if (typeof File !== "undefined" && src instanceof File) return null;
  if (/^https?:\/\//i.test(src) || src.startsWith("blob:")) return src;
  return `${STORAGE_BASE}/${String(src).replace(/^\/+/, "")}`;
}

// ✅ convert date to YYYY-MM-DD for <input type="date">
function normalizeDateForInput(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);

  const d = new Date(value);
  if (!isNaN(d)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return "";
}

/** normalizeArabic: standardizes Arabic characters for better searching. */
function normalizeArabic(text) {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u0652]/g, "") // remove diacritics
    .replace(/ـ/g, ""); // remove kashida
}

/**
 * ✅ SECURITY COMPONENT: SafeImage
 * This component acts as a firewall. It isolates the raw 'src' prop
 * and ensures only valid, safe URLs are ever rendered into the DOM.
 */
const SafeImage = ({ src, alt, className, fallback }) => {
  const safeSrc = useMemo(() => {
    if (!src) return null;
    const str = String(src);

    // 1. Allow Blob URLs (local previews)
    if (str.startsWith("blob:")) return str;

    // 2. Allow root-relative paths (internal images)
    if (str.startsWith("/") && !str.startsWith("//")) return str;

    // 3. Strict Protocol Parsing for external URLs
    try {
      const parsed = new URL(str);
      // STRICT ALLOWLIST: http and https only.
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return str;
      }
    } catch (e) {
      // Invalid URL syntax -> unsafe
      return null;
    }
    return null;
  }, [src]);

  if (!safeSrc) {
    return fallback || null;
  }

  // The src here is guaranteed safe by the logic above
  return <img src={safeSrc} alt={alt} className={className} />;
};

export default function BundleForm({
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: initialData?.name || "",
    price: initialData?.price || "",
    start_date: normalizeDateForInput(initialData?.start_date),
    end_date: normalizeDateForInput(initialData?.end_date),
    img: initialData?.image ?? initialData?.img ?? null,
  });

  const [preview, setPreview] = useState(
    normalizeImage(initialData?.image ?? initialData?.img)
  );

  /** initial selected products */
  const [selectedProducts, setSelectedProducts] = useState(() => {
    if (!initialData?.products) return [];
    return initialData.products.map((p) => ({
      id: p.id,
      name: p.name,
      base_price: Number(p.base_price ?? 0),
      image:
        (p.full_image_urls && p.full_image_urls[0]) ||
        (p.images && p.images[0]) ||
        p.image ||
        "",
      qty: p.qty ?? p.quantity ?? p.pivot?.quantity ?? 1,
    }));
  });

  const [productsList, setProductsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fileRef = useRef(null);
  const objectUrlRef = useRef(null);

  /** force patch after initialData changes */
  useEffect(() => {
    if (!initialData) return;

    setForm({
      name: initialData.name || "",
      price: initialData.price || "",
      start_date: normalizeDateForInput(initialData.start_date),
      end_date: normalizeDateForInput(initialData.end_date),
      img: initialData.image ?? initialData.img ?? null,
    });

    setPreview(normalizeImage(initialData.image ?? initialData.img));

    setSelectedProducts(
      (initialData.products || []).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        unit_of_measure: p.unit_of_measure?.name || p.unit_of_measure || "",
        base_price: Number(p.base_price ?? 0),
        image:
          (p.full_image_urls && p.full_image_urls[0]) ||
          (p.images && p.images[0]) ||
          p.image ||
          "",
        qty: p.qty ?? p.quantity ?? p.pivot?.quantity ?? 1,
      }))
    );
  }, [initialData]);

  /** Load products */
  useEffect(() => {
    async function fetchProducts() {
      setLoadingProducts(true);
      try {
        const res = await fetchClient("/api/products");
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data || [];
        const normalized = list.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description || "",
          unit_of_measure: p.unit_of_measure?.name || p.unit_of_measure || "",
          base_price: Number(p.base_price ?? 0),
          image:
            (p.full_image_urls && p.full_image_urls[0]) ||
            p.image ||
            (p.images && p.images[0]) ||
            "",
        }));
        setProductsList(normalized);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  /** Image preview lifecycle */
  useEffect(() => {
    if (objectUrlRef.current) {
      try {
        URL.revokeObjectURL(objectUrlRef.current);
      } catch (err) { }
      objectUrlRef.current = null;
    }

    if (typeof File !== "undefined" && form.img instanceof File) {
      const url = URL.createObjectURL(form.img);
      objectUrlRef.current = url;
      setPreview(url);
      return () => {
        if (objectUrlRef.current) {
          try {
            URL.revokeObjectURL(objectUrlRef.current);
          } catch (err) { }
          objectUrlRef.current = null;
        }
      };
    } else {
      setPreview(normalizeImage(form.img));
    }
  }, [form.img]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("اختر صورة");
    if (file.size > 2 * 1024 * 1024) return alert("الحد الأقصى 2MB");
    setForm((p) => ({ ...p, img: file }));
  };

  const handleRemoveImage = () => {
    if (objectUrlRef.current) {
      try {
        URL.revokeObjectURL(objectUrlRef.current);
      } catch (err) { }
      objectUrlRef.current = null;
    }
    setForm((p) => ({ ...p, img: null }));
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  /** ====================
   * Product logic
   * ====================*/
  const addProduct = (product) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeProduct = (product) => {
    setSelectedProducts((prev) => {
      const found = prev.find((p) => p.id === product.id);
      if (!found) return prev;
      if (found.qty <= 1) {
        return prev.filter((p) => p.id !== product.id);
      }
      return prev.map((p) =>
        p.id === product.id ? { ...p, qty: p.qty - 1 } : p
      );
    });
  };

  const handleQtyChange = (product, value) => {
    const newQty = parseInt(value, 10);
    if (isNaN(newQty) || newQty < 0) return;

    setSelectedProducts((prev) => {
      if (newQty === 0) {
        return prev.filter((p) => p.id !== product.id);
      }
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: newQty } : p
        );
      }
      return [...prev, { ...product, qty: newQty }];
    });
  };

  const qtyOf = (id) => {
    return selectedProducts.find((p) => p.id === id)?.qty ?? 0;
  };

  /** totals */
  const totalProductsPrice = selectedProducts.reduce(
    (sum, p) => sum + p.base_price * p.qty,
    0
  );

  const totalProductsCount = selectedProducts.reduce(
    (sum, p) => sum + p.qty,
    0
  );

  function extractImageFromResponse(obj) {
    if (!obj) return null;
    if (obj.img) return obj.img;
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSubmit) return;

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("price", form.price || "0");
    fd.append("start_date", form.start_date);
    fd.append("end_date", form.end_date);

    if (form.img instanceof File) fd.append("img", form.img);

    selectedProducts.forEach((p) => {
      for (let i = 0; i < p.qty; i++) {
        fd.append("product_ids[]", p.id);
      }
    });

    try {
      const res = await onSubmit(fd);
      let payload = res;
      if (res && typeof res === "object") {
        if (res.success && res.data) payload = res.data;
        else if (res.data) payload = res.data;
      }
      if (Array.isArray(payload)) {
        const updated = payload.find((p) => p.id === form.id) || payload[0];
        const img = extractImageFromResponse(updated);
        if (img) setForm((p) => ({ ...p, img: img }));
      } else if (payload && typeof payload === "object") {
        const img = extractImageFromResponse(payload);
        if (img) setForm((p) => ({ ...p, img: img }));
      }
    } catch (err) {
      console.error("submit error:", err);
      throw err;
    }
  };

  const filteredProducts = productsList.filter((p) => {
    const name = normalizeArabic(p.name.toLowerCase());
    const term = normalizeArabic(searchTerm.toLowerCase());
    return name.includes(term);
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow max-w-3xl mx-auto space-y-4"
    >
      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
      {/* Image */}
      <div>
        <label className="text-sm font-medium mb-1 block">صورة العرض</label>
        <div className="flex items-center gap-4">
          {preview ? (
            <div className="relative group">
              {/* ✅ USE SAFE COMPONENT */}
              <SafeImage
                src={preview}
                className="w-20 h-20 object-cover rounded"
                alt="Bundle Preview"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded p-4 text-center text-gray-500">
              لا توجد صورة
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            id="bundle-image"
          />
          <label
            htmlFor="bundle-image"
            className="cursor-pointer bg-gray-100 px-3 py-1 rounded text-sm"
          >
            {preview ? "تغيير الصورة" : "اختر صورة"}
          </label>
        </div>
      </div>

      {/* NAME */}
      <div>
        <label className="text-sm font-medium mb-1 block">اسم العرض</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>

      {/* PRICE */}
      <div>
        <label className="text-sm font-medium mb-1 block">
          السعر (الحد الأقصى: {totalProductsPrice})
        </label>
        <input
          type="number"
          value={form.price}
          min="0"
          max={totalProductsPrice}
          step="0.01"
          onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>

      {/* DATES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="text-sm mb-1 block">تاريخ البداية</label>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) =>
              setForm((p) => ({ ...p, start_date: e.target.value }))
            }
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="text-sm mb-1 block">تاريخ النهاية</label>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) =>
              setForm((p) => ({ ...p, end_date: e.target.value }))
            }
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>

      {/* COUNT */}
      <div className="mb-2">
        <strong>إجمالي عدد المنتجات:</strong> {totalProductsCount}
      </div>

      {/* PRODUCTS */}
      <div>
        <label className="text-sm font-medium mb-1 block">المنتجات</label>
        <input
          type="text"
          placeholder="ابحث عن منتج..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border rounded px-2 py-1 mb-2"
        />

        <div className="max-h-64 overflow-y-auto border rounded">
          {loadingProducts ? (
            <div className="text-center py-2">جارِ التحميل...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-2 text-gray-500">لا توجد منتجات</div>
          ) : (
            filteredProducts.map((p) => {
              const qty = qtyOf(p.id);

              return (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-2">
                    {/* ✅ USE SAFE COMPONENT HERE */}
                    {/* If no image, fallback is handled inside or via conditional */}
                    <SafeImage
                      src={p.image}
                      className="w-12 h-12 rounded object-cover"
                      alt={p.name}
                      fallback={
                        <div className="w-12 h-12 bg-gray-100 text-xs text-center flex items-center justify-center text-gray-400">
                          لا صورة
                        </div>
                      }
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2 items-start">
                        <span className="font-semibold truncate">{p.name}</span>
                        <span className="text-gray-600 font-bold ml-2">
                          {p.base_price} $
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 truncate" title={p.description}>
                        {p.description}
                      </div>
                      <div className="flex gap-3 items-center mt-1">
                        {qty > 0 && (
                          <div className="text-xs text-blue-600 font-medium">
                            الكمية: {qty}
                          </div>
                        )}
                        <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-600">
                          {p.unit_of_measure || "وحدة غير معروفة"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => removeProduct(p)}
                      disabled={qty <= 0}
                      className={`h-8 w-8 flex items-center justify-center rounded text-sm ${qty > 0
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      -
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={qty}
                      onChange={(e) => handleQtyChange(p, e.target.value)}
                      className="w-12 h-8 border rounded text-center focus:ring-2 focus:ring-blue-500 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => addProduct(p)}
                      className="h-8 w-8 flex items-center justify-center bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* submit */}
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {submitting ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>
    </form>
  );
}
