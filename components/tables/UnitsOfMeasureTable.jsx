"use client";
import Link from "next/link";
import { Pagination } from "../common";

export default function UnitsOfMeasureTable({
  data = [],
  pagination = {},
  basePath = "/admin/sizetable",
  onDelete,
  onPageChange,
  onPerPageChange,
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وحدة القياس</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تعديل</th>
              {/* <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">حذف</th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.map((u, idx) => (
              <tr key={u.id} className="hover:bg-gray-50">
                {/* show 1-based index from server 'from' */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{idx}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`${basePath.replace(/\/+$/, "")}/${u.id}/update`}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    تعديل
                  </Link>
                </td>
                {/* <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                    onClick={() => onDelete?.(u.id)}
                  >
                    حذف
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination (shared) */}
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
