'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Download,
  Calendar,
  BookOpen,
  ArrowLeft,
  HardDrive,
  GraduationCap,
  AlertCircle,
  Share2,
  Check,
} from 'lucide-react';

const TYPE_STYLES = {
  Notes: 'bg-blue-50 text-blue-700 border-blue-200',
  'Question Paper': 'bg-amber-50 text-amber-700 border-amber-200',
  Assignment: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Lab Manual': 'bg-purple-50 text-purple-700 border-purple-200',
  'Reference Book': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Syllabus: 'bg-rose-50 text-rose-700 border-rose-200',
  Other: 'bg-gray-50 text-gray-700 border-gray-200',
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
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function MaterialDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchMaterial = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/materials/${id}`);
        const json = await res.json();
        if (json.success) {
          setMaterial(json.data);
        } else {
          setError(json.error || 'Study material not found.');
        }
      } catch (err) {
        setError('Network error while retrieving material details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id]);

  const handleDownload = () => {
    if (!material?._id) return;
    setDownloading(true);
    window.location.href = `/api/downloads/${material._id}`;
    setTimeout(() => {
      setDownloading(false);
      setMaterial((prev) => (prev ? { ...prev, downloads: (prev.downloads || 0) + 1 } : prev));
    }, 1500);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 space-y-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Material Unavailable</h2>
        <p className="text-sm text-gray-500 mb-6">{error || 'The requested study material does not exist.'}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Materials</span>
        </Link>
      </div>
    );
  }

  const badgeStyle =
    TYPE_STYLES[material.materialType] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Materials</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-semibold">Link Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-gray-400" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-b from-blue-50/40 via-white to-white">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}
            >
              {material.materialType}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
              <GraduationCap className="w-3.5 h-3.5" />
              Semester {material.semester}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            {material.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
            <BookOpen className="w-4 h-4" />
            <span>Subject: {material.subject?.name || 'General Subject'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 sm:p-8 bg-gray-50/60 border-b border-gray-100">
          <div className="p-3.5 bg-white rounded-2xl border border-gray-200/60 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              File Size
            </span>
            <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-blue-500" />
              {formatBytes(material.fileSize)}
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-200/60 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Downloads
            </span>
            <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-500" />
              {material.downloads || 0}
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-200/60 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Uploaded On
            </span>
            <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              {formatDate(material.createdAt)}
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-200/60 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Format
            </span>
            <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-rose-500" />
              PDF Document
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {material.description && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                {material.description}
              </p>
            </div>
          )}

          {material.subject && (
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                Subject
              </span>
              <p className="text-sm font-bold text-gray-900">
                {material.subject.name} (Semester {material.subject.semester})
              </p>
              {material.subject.description && (
                <p className="text-xs text-gray-500 mt-1 leading-normal">
                  {material.subject.description}
                </p>
              )}
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
            <div>
              <span className="text-xs font-semibold text-gray-900 block">
                Download Resource
              </span>
              <span className="text-xs text-gray-500 block">
                Download the PDF directly to your device.
              </span>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-75"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
