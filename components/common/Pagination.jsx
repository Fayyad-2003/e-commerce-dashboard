"use client";
import React, { useEffect, useState } from "react";

export default function Pagination({
  pagination = {},
  onPageChange,
  onPerPageChange,
  perPageOptions = [5, 10, 20, 50],
}) {
  const {
    total = 0,
    per_page = 10,
    current_page = 1,
    last_page = 1,
  } = pagination;

  const [currentPage, setCurrentPage] = useState(current_page);
  const [perPage, setPerPage] = useState(per_page);

  useEffect(() => {
    setCurrentPage(current_page);
    setPerPage(per_page);
  }, [current_page, per_page]);

  if (total === 0) return null;

  const handlePrev = () => {
    if (currentPage > 1) {
      const np = currentPage - 1;
      setCurrentPage(np);
      onPageChange?.(np);
    }
  };

  const handleNext = () => {
    if (currentPage < last_page) {
      const np = currentPage + 1;
      setCurrentPage(np);
      onPageChange?.(np);
    }
  };

  const handlePerPageChange = (e) => {
    const np = Number(e.target.value);
    setPerPage(np);
    // reset to page 1 when per-page changes
    onPerPageChange?.(np);
  };

  const pages = (() => {
    const out = [];
    const max = Math.min(5, last_page);
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(last_page, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) out.push(i);
    return out;
  })();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 flex-wrap sm:flex-nowrap">
      <span className="text-sm text-gray-700 w-full sm:w-auto text-center sm:text-left mb-2 sm:mb-0">
        الصفحة {currentPage} من {last_page} — المجموع: {total}
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          disabled={currentPage <= 1}
          className="px-3 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
        >
          السابق
        </button>

        {/* Conditionally display important pages for smaller devices */}
        <div className="flex gap-2 sm:block">
          {pages.map((n) => (
            <button
              key={n}
              onClick={() => {
                setCurrentPage(n);
                onPageChange?.(n);
              }}
              className={`px-3 py-1 rounded border mx-0.5 ${
                n === currentPage
                  ? "bg-[#5A443A] text-white border-[#5A443A]"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage >= last_page}
          className="px-3 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
        >
          التالي
        </button>
      </div>

      {/* Per Page dropdown on small screens */}
      <div className="flex items-center gap-2 ml-3 mt-2 sm:mt-0">
        <label className="text-sm">عرض:</label>
        <select
          value={perPage}
          onChange={handlePerPageChange}
          className="border px-2 py-1 rounded text-sm"
        >
          {perPageOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
