// FootersTable.jsx
"use client";
import React from "react";
import { Facebook, Instagram, Phone, Mail, MapPin, Globe } from "lucide-react";

const SOCIAL_ICONS = {
  facebook_link: Facebook,
  instagram_link: Instagram,
  x_link: null, // render X manually
  google_link: Globe, // added google link
};

function isProbablyUrl(value) {
  if (!value) return true; // empty is allowed
  // simple URL check (sufficient for quick client-side validation)
  // numeric / short strings will be flagged
  try {
    // try constructor for robust validation
    // allow //foo (protocol-relative) by prepending http:
    const maybe = value.startsWith("//") ? `http:${value}` : value;
    // eslint-disable-next-line no-new
    new URL(maybe);
    return true;
  } catch {
    return false;
  }
}

export default function FootersTable({
  footerData,
  saving,
  handleChange,
  handleSave,
  error, // string|null
  successMessage, // string|null
}) {
  // simple derived errors for link fields
  const linkKeys = Object.keys(SOCIAL_ICONS);
  const linkErrors = linkKeys.reduce((acc, key) => {
    const val = footerData?.[key] || "";
    if (!isProbablyUrl(val)) acc[key] = "الرجاء إدخال رابط صالح (مثال: https://...)";
    return acc;
  }, {});

  return (
    <footer className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 py-10">
      <div className="container px-6 grid grid-cols-1 gap-6">

        {/* Global alerts (error / success) */}
        {(error || successMessage) && (
          <div className="col-span-1">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-red-800">
                <strong className="block font-semibold">حدث خطأ</strong>
                <div className="mt-1 text-sm">{error}</div>
              </div>
            )}
            {!error && successMessage && (
              <div className="rounded-md bg-green-50 border border-green-200 p-3 text-green-800">
                <strong className="block font-semibold">نجاح</strong>
                <div className="mt-1 text-sm">{successMessage}</div>
              </div>
            )}
          </div>
        )}

        {/* Address */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-[#5A443A]">العنوان</h3>
          <div className="flex items-center gap-3">
            <MapPin size={20} />
            <input
              type="text"
              value={footerData?.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              className="border border-gray-200 px-3 py-2 rounded-md w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5A443A]"
              placeholder="أدخل العنوان"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-[#5A443A]">التواصل</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Phone size={20} />
              <input
                type="text"
                value={footerData?.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="border border-gray-200 px-3 py-2 rounded-md w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5A443A]"
                placeholder="أدخل رقم الهاتف"
              />
            </div>
            <div className="flex items-center gap-3">
              <Mail size={20} />
              <input
                type="email"
                value={footerData?.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="border border-gray-200 px-3 py-2 rounded-md w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5A443A]"
                placeholder="أدخل البريد الإلكتروني"
              />
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-[#5A443A]">تابعنا</h3>
          <div className="flex flex-col gap-3">
            {Object.entries(SOCIAL_ICONS).map(([key, Icon]) => (
              <div key={key} className="flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="w-6 flex-shrink-0">
                    {Icon ? <Icon size={18} /> : <span className="text-xl font-bold">X</span>}
                  </div>

                  <input
                    type="text"
                    value={footerData?.[key] || ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className={`border px-3 py-2 rounded-md w-full placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      linkErrors[key] ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#5A443A]"
                    }`}
                    placeholder={key === "google_link" ? "أدخل رابط خرائط / صفحة Google" : "أدخل رابط"}
                  />
                </div>
                {linkErrors[key] && (
                  <p className="text-xs text-red-600 mt-1 ml-9">{linkErrors[key]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="text-center mt-8">
        <button
          onClick={async () => {
            // optionally run a quick client-side check before saving
            const invalidLink = linkKeys.find((k) => !isProbablyUrl(footerData?.[k] || ""));
            if (invalidLink) {
              // call handleChange to set nothing; instead rely on prop-driven error rendering
              // we surface UI message by invoking browser alert (keeps it simple) and return
              // but we also return early to avoid saving invalid values.
              // Better: you could trigger a state in this component to show a nicer banner.
              alert("الرجاء تصحيح الروابط غير الصالحة قبل الحفظ.");
              return;
            }

            await handleSave();
          }}
          disabled={saving}
          className={`px-5 py-2 rounded-md text-white transition ${
            saving ? "bg-gray-400 cursor-not-allowed" : "bg-[#5A443A] hover:bg-[#402E32]"
          }`}
        >
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>
    </footer>
  );
}
