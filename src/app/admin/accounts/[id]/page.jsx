"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchClient } from "../../../../lib/fetchClient";
import Link from "next/link";

export default function Page() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⛳ Fetch customer details
  const fetchCustomer = async () => {
    try {
      const res = await fetchClient(`/api/customers/${id}`, {
        method: "GET",
      });

      const data = await res.json();

      if (data?.success) {
        setCustomer(data.data);
      }
    } catch (e) {
      console.error("Error fetching customer:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  if (loading) {
    return <p className="text-center py-6">جاري التحميل...</p>;
  }

  if (!customer) {
    return <p className="text-center py-6 text-red-600">لم يتم العثور على المستخدم</p>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white shadow rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          تفاصيل الزبون
        </h2>
        <Link
          href="/admin/accounts"
          className="text-sm text-blue-600 hover:underline"
        >
          ← رجوع
        </Link>
      </div>

      {/* Details List */}
      <div className="space-y-4">
        <DetailRow label="المعرّف" value={customer.id} />
        <DetailRow label="الاسم" value={customer.name} />
        <DetailRow label="البريد الإلكتروني" value={customer.email} />
        <DetailRow label="رقم الهاتف" value={customer.phone} />

        <DetailRow
          label="تاريخ الإنشاء"
          value={formatDate(customer.created_at)}
        />
        <DetailRow
          label="تاريخ التعديل"
          value={formatDate(customer.updated_at)}
        />

        <DetailRow
          label="تفعيل البريد"
          value={customer.email_verified_at ? "مفعل ✅" : "غير مفعل ❌"}
        />
      </div>
    </div>
  );
}

/* ✅ Component to render labels and values */
function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="font-medium text-gray-600">{label}</span>
      <span className="text-gray-800">{value ?? "-"}</span>
    </div>
  );
}

/* ✅ Format Date Helper */
function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
