"use client";

const PAGE_SIZES = [10, 20, 30, 40, 50];

type Props = {
  total: number;
  pageSize: number;
  page: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
};

function pageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function Pagination({ total, pageSize, page, onPageChange, onPageSizeChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-gray-100 bg-white">
      {/* Prev + Pages + Next */}
      <div className="flex items-center gap-1.5">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Previous
        </button>

        {pageNumbers(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${page === p ? "bg-zinc-900 text-white shadow-sm" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {p}
            </button>
          )
        )}

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next
        </button>
      </div>

      {/* Show Rows dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-semibold whitespace-nowrap">Show Rows</span>
        <div className="relative">
          <select
            value={pageSize}
            onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
            className="h-8 pl-3 pr-7 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-zinc-400 transition-all appearance-none cursor-pointer"
          >
            {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Showing X out of Y */}
      <p className="text-xs text-gray-400 font-semibold whitespace-nowrap">
        Showing <span className="font-black text-gray-700">{from}–{to}</span> out of <span className="font-black text-gray-700">{total}</span> results
      </p>
    </div>
  );
}
