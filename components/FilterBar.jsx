'use client';

import { Filter, X, ArrowUpDown } from 'lucide-react';

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const MATERIAL_TYPES = [
  'Notes',
  'Question Paper',
  'Assignment',
  'Lab Manual',
  'Reference Book',
  'Syllabus',
  'Other',
];

export default function FilterBar({
  semester = '',
  materialType = '',
  subject = '',
  sortBy = 'recent',
  subjects = [],
  onFilterChange,
  onReset,
}) {
  const hasActiveFilters = Boolean(semester || materialType || subject || sortBy !== 'recent');

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500   tracking-wider pr-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filters:</span>
          </div>

          {/* Semester Selector */}
          <select
            value={semester}
            onChange={(e) => onFilterChange('semester', e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          >
            <option value="">All Semesters</option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          {/* Material Type Selector */}
          <select
            value={materialType}
            onChange={(e) => onFilterChange('materialType', e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          >
            <option value="">All Material Types</option>
            {MATERIAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Subject Selector */}
          <select
            value={subject}
            onChange={(e) => onFilterChange('subject', e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors max-w-[200px] truncate"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name} (Sem {sub.semester})
              </option>
            ))}
          </select>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-medium px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Sort Group */}
        <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          >
            <option value="recent">Recently Added</option>
            <option value="popular">Most Downloaded</option>
            <option value="title">Title (A-Z)</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
}
