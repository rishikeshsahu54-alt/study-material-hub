'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Calendar,
  BookOpen,
  ArrowUpRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';

const TYPE_STYLES = {
  Notes: 'bg-blue-50 text-blue-700 border-blue-200/60',
  'Question Paper': 'bg-amber-50 text-amber-700 border-amber-200/60',
  Assignment: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  'Lab Manual': 'bg-purple-50 text-purple-700 border-purple-200/60',
  'Reference Book': 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  Syllabus: 'bg-rose-50 text-rose-700 border-rose-200/60',
  Other: 'bg-gray-50 text-gray-700 border-gray-200/60',
};

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function MaterialCard({ material, onDownloadSuccess }) {
  const [downloadCount, setDownloadCount] = useState(material.downloads || 0);
  const [downloading, setDownloading] = useState(false);

  const badgeStyle =
    TYPE_STYLES[material.materialType] || 'bg-gray-50 text-gray-700 border-gray-200/60';

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Trigger download
      window.location.href = `/api/downloads/${material._id}`;
      // Optimistically increment client-side counter
      setDownloadCount((prev) => prev + 1);
      if (onDownloadSuccess) onDownloadSuccess(material._id);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div className="p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}
          >
            {material.materialType}
          </span>
          <span className="inline-flex items-center text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
            Sem {material.semester}
          </span>
        </div>

        {/* Subject */}
        <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold mb-1.5 truncate">
          <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{material.subject?.name || 'General Subject'}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          <Link href={`/materials/${material._id}`}>{material.title}</Link>
        </h3>

        {/* Description snippet if any */}
        {material.description && (
          <p className="text-gray-500 text-xs line-clamp-2 mb-3">
            {material.description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(material.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 font-medium">
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>{downloadCount} {downloadCount === 1 ? 'download' : 'downloads'}</span>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="px-5 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-2">
        <Link
          href={`/materials/${material._id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </Link>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs transition-colors disabled:opacity-75"
        >
          {downloading ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-200" />
              <span>Starting...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
