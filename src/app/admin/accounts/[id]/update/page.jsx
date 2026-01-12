"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";
import { ConditionalRender } from "../../../../../../components/common";
import { fetchClient } from "../../../../../lib/fetchClient";

export default function UpdateCustomerPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  /** ✅ 1) Fetch the user data */
  const fetchCustomer = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetchClient(`/api/customers/${id}`);

      if (!res.ok) {
        setError("فشل جلب بيانات الزبون");
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!data?.success) {
        setError(data.message || "فشل جلب بيانات الزبون");
        setLoading(false);
        return;
      }

      const { name, email, phone } = data.data ?? {};

      // ✅ Fill form
      setForm({
        name: name ?? "",
        email: email ?? "",
        phone: phone ?? "",
        password: "",
      });
    } catch (err) {
      console.error(err);
      setError("تعذر الاتصال بالخادم");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCustomer();
  }, []);

  /** ✅ Submit update */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val) {
          fd.append(key, val);
        }
      });

      const res = await fetchClient(`/api/customers/${id}`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ تم تحديث بيانات الزبون بنجاح");
        router.push(`/admin/accounts/${id}`);
      } else {
        alert(data.message || "فشل التحديث");
      }
    } catch (err) {
      console.error(err);
      alert("تعذر الإرسال");
    }

    setSaving(false);
  };

  return (
    <ConditionalRender
      loading={loading}
      error={error}
      loadingText="جاري تحميل البيانات..."
      errorText={error}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-[#402E32]">تعديل بيانات الزبون</h2>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <MoveLeft size={20} /> <span>إغلاق</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">اسم الزبون</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5A443A] focus:outline-none"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* phone */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5A443A] focus:outline-none"
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          {/* email */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5A443A] focus:outline-none"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">كلمة المرور (اختياري)</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5A443A] focus:outline-none"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="اتركه فارغًا إن لم يتغير"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              disabled={saving}
              className="bg-[#5A443A] hover:bg-[#402E32] text-white px-8 py-2 rounded-md transition-colors disabled:opacity-70"
            >
              {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </div>
    </ConditionalRender>
  );
}