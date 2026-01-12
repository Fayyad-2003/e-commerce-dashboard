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
      <div className="p-6 space-y-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="text-gray-700 hover:text-black flex gap-1"
        >
          <MoveLeft size={20} /> <span>رجوع</span>
        </button>

        <h2 className="text-xl font-semibold">تعديل بيانات الزبون</h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-6 rounded-md shadow-md max-w-md"
        >
          {/* name */}
          <div className="flex flex-col gap-1">
            <label className="font-medium">اسم الزبون</label>
            <input
              className="border p-2 rounded-md"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* email */}
          <div className="flex flex-col gap-1">
            <label className="font-medium">البريد الإلكتروني</label>
            <input
              className="border p-2 rounded-md"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* phone */}
          <div className="flex flex-col gap-1">
            <label className="font-medium">رقم الهاتف</label>
            <input
              className="border p-2 rounded-md"
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          {/* password */}
          <div className="flex flex-col gap-1">
            <label className="font-medium">كلمة المرور (اختياري)</label>
            <input
              className="border p-2 rounded-md"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="اتركه فارغًا إن لم يتغير"
            />
          </div>

          <button
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md w-full"
          >
            {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </button>
        </form>
      </div>
    </ConditionalRender>
  );
}