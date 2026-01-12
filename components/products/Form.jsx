"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function Form(props) {
  const router = useRouter();

  // Accept either the product object or the full API response { success, message, data }
  let product = props?.product ?? props;
  if (product?.data) product = product.data;

  if (!product) {
    return <div className="p-8 text-center">المنتج غير موجود</div>;
  }

  const {
    name,
    model_number,
    description,
    base_price,
    full_image_urls,
    attributes = {},
    unit_of_measure,
    price_tiers,
    created_at,
    updated_at,
  } = product;

  const normalizeColors = (raw) => {
    if (!raw) return [];

    let arr = [];

    // Always treat `raw` as array
    const rawArray = Array.isArray(raw) ? raw : [raw];

    rawArray.forEach((item) => {
      if (typeof item === "string") {
        const s = item.trim();

        // Case 1: JSON array inside string:  "[\"أسود\",\"أبيض\"]"
        if (s.startsWith("[") && s.endsWith("]")) {
          try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) {
              arr.push(...parsed);
              return;
            }
          } catch (e) {
            // ignore and continue
          }
        }

        // Case 2: comma-separated string: "أسود, أبيض"
        if (s.includes(",")) {
          arr.push(...s.split(",").map((x) => x.trim()));
          return;
        }

        // Case 3: single plain string
        arr.push(s);
      } else if (Array.isArray(item)) {
        arr.push(...item);
      }
    });

    // Clean & dedupe
    const cleaned = arr
      .map((c) => String(c).trim())
      .filter(Boolean);

    return [...new Set(cleaned)];
  };


  // Normalize sizes into array of { name, colors: [...names] }
  const normalizeSizes = (attrs) => {
    const sizesRaw = attrs?.sizes ?? attrs?.size ?? [];
    const colorsRawGlobal = attrs?.colors ?? attrs?.color ?? [];

    if (!sizesRaw) return [];

    let sizes = [];

    // Handle many shapes of sizesRaw
    if (Array.isArray(sizesRaw)) {
      // e.g. [["small", "large"]]
      if (sizesRaw.length === 1 && Array.isArray(sizesRaw[0]) && typeof sizesRaw[0][0] === "string") {
        sizes = sizesRaw[0].map((s) => ({ name: s }));
      }
      // e.g. ["small","large"]
      else if (sizesRaw.every((s) => typeof s === "string")) {
        sizes = sizesRaw.map((s) => ({ name: s }));
      }
      // e.g. [{ name: "small", colors: ["red"] }, ...]
      else if (sizesRaw.every((s) => s && typeof s === "object")) {
        sizes = sizesRaw.map((s) => ({
          name: s.name ?? s.label ?? s.size ?? String(s).slice(0, 50),
          // normalize whatever is in s.colors or s.color (handles strings, arrays, etc.)
          colors: normalizeColors(s.colors ?? s.color ?? []),
        }));
      } else {
        // fallback: flatten and convert to names
        sizes = sizesRaw.flat(Infinity).filter(Boolean).map((s) => ({ name: String(s) }));
      }
    } else if (typeof sizesRaw === "string") {
      // sizesRaw might be JSON string or comma-separated, try parse
      const parsed = normalizeColors(sizesRaw); // will split or parse JSON
      sizes = parsed.map((s) => ({ name: s }));
    } else {
      // unexpected shape, coerce to single size
      sizes = [{ name: String(sizesRaw) }];
    }

    const globalColors = normalizeColors(colorsRawGlobal);

    // Ensure every size has a normalized colors array (use per-size if present else global)
    sizes = sizes.map((s) => ({
      name: s.name,
      colors: (Array.isArray(s.colors) && s.colors.length > 0) ? normalizeColors(s.colors) : globalColors,
    }));

    return sizes;
  };

  const sizes = normalizeSizes(attributes);
  const globalColors = normalizeColors(attributes?.colors ?? attributes?.color ?? []);

  // Quick debug helper: uncomment to inspect the product object in browser console
  // console.log("product for Form:", product, { attributes, sizes, globalColors });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#402E32]">تفاصيل المنتج</h2>
        <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} className="ml-1" />
          رجوع
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {full_image_urls && full_image_urls.length > 0 ? (
            <>
              <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden">
                <Image src={full_image_urls[0]} alt={name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {full_image_urls.map((img, index) => (
                  <div key={index} className="h-20 bg-gray-100 rounded-md overflow-hidden">
                    <Image src={img} alt={`thumbnail-${index}`} width={80} height={80} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-80 bg-gray-100 flex items-center justify-center rounded-lg">لا توجد صور</div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#402E32]">{name}</h1>
            <p className="text-gray-500 text-sm">{model_number}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#402E32] mb-2">الوصف</h3>
            <p className="text-gray-700">{description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[#402E32] mb-2">السعر الأساسي</h3>
              <p className="text-gray-700">{base_price} $</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#402E32] mb-2">وحدة القياس</h3>
              <p className="text-gray-700">{unit_of_measure?.name}</p>
            </div>
          </div>

          {sizes && sizes.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-[#402E32] mb-2">المقاسات والألوان</h3>
              <div className="space-y-3">
                {sizes.map((size, idx) => {
                  const uniq = (Array.isArray(size.colors) ? size.colors : []).map((c) => String(c).trim()).filter(Boolean);
                  return (
                    <div key={idx} className="border-b border-gray-200 pb-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-700">المقاس: {size.name}</p>
                        <p className="text-sm text-gray-500">{uniq.length ? `${uniq.length} لون` : "لا توجد ألوان"}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {uniq.length > 0 ? (
                          uniq.map((color, i) => (
                            <div key={i} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border bg-gray-50" title={color}>
                              <span className="text-gray-700">{color}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500">لا توجد ألوان متاحة لهذا المقاس</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : globalColors && globalColors.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-[#402E32] mb-2">الألوان المتاحة</h3>
              <div className="flex flex-wrap gap-2">
                {globalColors.map((color, i) => (
                  <div key={i} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border bg-gray-50" title={color}>
                    <span className="text-gray-700">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {price_tiers && price_tiers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#402E32] mb-2">خصومات الكمية</h3>
              <div className="space-y-2">
                {price_tiers.map((tier, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700">من {tier.min_quantity} {unit_of_measure?.name || 'وحدة'}</span>
                    <span className="text-gray-700">السعر لكل وحدة: {tier.price_per_unit} $</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500 mt-4">
            <p>تاريخ الإنشاء: {created_at ? new Date(created_at).toLocaleString() : "-"}</p>
            <p>آخر تحديث: {updated_at ? new Date(updated_at).toLocaleString() : "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
