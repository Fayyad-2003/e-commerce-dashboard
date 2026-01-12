"use client";
import Link from "next/link";
import { Pagination } from "../../common";

export default function AdsTable({
    ads = [],
    pagination = {},
    onDelete,
    onPageChange,
    onPerPageChange,
}) {

    const itemStartIndex = (Number(pagination.from ?? (ads.length ? 1 : 0)) - 1) || 0;

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden w-full">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-right">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">العنوان</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">الموقع</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البدء</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الانتهاء</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">الصورة</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">تعديل</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">حذف</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {ads.length > 0 ? (
                            ads.map((ad, index) => (
                                <tr key={ad.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{itemStartIndex + index + 1}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{ad.title}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{ad.position}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${ad.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {ad.is_active ? "نشط" : "غير نشط"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {ad.start_date ? new Date(ad.start_date).toLocaleDateString('ar-EG') : '-'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {ad.end_date ? new Date(ad.end_date).toLocaleDateString('ar-EG') : '-'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {ad.image ? (
                                            <img src={ad.image} alt={ad.title} className="h-10 w-20 object-cover rounded" />
                                        ) : (
                                            <span className="text-gray-400">لا توجد صورة</span>
                                        )}
                                    </td>

                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link
                                            href={`/admin/ads/${ad.id}/update`}
                                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                        >
                                            تعديل
                                        </Link>
                                    </td>

                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => onDelete?.(ad.id)}
                                            className="text-red-600 hover:text-red-800 cursor-pointer"
                                        >
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center py-4 text-gray-500">
                                    لا توجد إعلانات
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination المشترك */}
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
