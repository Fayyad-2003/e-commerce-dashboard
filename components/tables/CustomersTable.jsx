"use client";
import Link from "next/link";
import { Pagination } from "../common";

export default function CustomersTable({
  accounts = [],
  pagination = {},
  onDelete,
  onPageChange,
  onPerPageChange,
}) {
  // accounts already represent current page items (coming from hook)
  const total = Number(pagination.total ?? accounts.length);
  const current_page = Number(pagination.current_page ?? 1);
  const last_page = Math.max(1, Number(pagination.last_page ?? 1));
  const from = Number(pagination.from ?? (accounts.length ? 1 : 0));
  const to = Number(pagination.to ?? (from + accounts.length - 1));

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden w-full">
      <div className="overflow-x-auto">
        {/* Table */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">المعرف</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المستخدم</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد الإلكتروني</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الهاتف</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التفاصيل</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التعديل</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحذف</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm text-gray-500">{account.id}</td>
                <td className="px-4 py-4 text-sm font-medium text-gray-900">{account.name}</td>
                <td className="px-4 py-4 text-sm text-gray-500">{account.email}</td>
                <td className="px-4 py-4 text-sm text-gray-500">{account.phone}</td>

                <td className="px-4 py-4 text-sm font-medium">
                  <Link href={`/admin/accounts/${account.id}`}>
                    <button className="text-[#5A443A] hover:text-[#3f2f28]">التفاصيل</button>
                  </Link>
                </td>

                <td className="px-4 py-4 text-sm font-medium">
                  <Link href={`/admin/accounts/${account.id}/update`}>
                    <button className="text-blue-600 hover:text-blue-800">تعديل</button>
                  </Link>
                </td>

                <td className="px-4 py-4 text-sm font-medium">
                  <button
                    onClick={() => onDelete?.(account)}
                    className="text-red-600 hover:text-red-800"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}

            {accounts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  لا توجد حسابات
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Shared Pagination component */}
        <Pagination
          pagination={pagination}
          onPageChange={(n) => onPageChange?.(n)}
          onPerPageChange={(per) => onPerPageChange?.(per)}
          perPageOptions={[5, 10, 20, 50]}
        />
      </div>
    </div>
  );
}
