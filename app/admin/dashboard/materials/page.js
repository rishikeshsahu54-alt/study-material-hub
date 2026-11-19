'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Edit,
  Download,
  AlertCircle,
  Eye,
  Loader2,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';

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

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function ManageMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [semester, setSemester] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, material: null });
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const debounceRef = useRef(null);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (semester) params.set('semester', semester);
      if (materialType) params.set('materialType', materialType);
      params.set('limit', '50');

      const res = await fetch(`/api/materials?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setMaterials(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load materials:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, semester, materialType]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchMaterials();
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [fetchMaterials]);

  const handleDelete = async () => {
    if (!deleteModal.material) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/materials/${deleteModal.material._id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setNotification({
          type: 'success',
          message: `Material '${deleteModal.material.title}' and associated local PDF file were deleted.`,
        });
        setDeleteModal({ open: false, material: null });
        fetchMaterials();
      } else {
        setNotification({ type: 'error', message: json.error || 'Failed to delete material' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error: ' + err.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Manage Study Materials"
        subtitle="View, search, edit, replace PDFs, or delete course documents"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
        {/* Notifications */}
        {notification.message && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs ${notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification({ type: '', message: '' })}
              className="p-1 hover:bg-black/5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Toolbar & Filters */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search materials by title or subject..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <Link
              href="/admin/dashboard/materials/add"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Material</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-gray-100">
            <span className="text-[11px] font-semibold text-gray-400   tracking-wider">
              Quick Filter:
            </span>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 font-medium text-gray-700"
            >
              <option value="">All Semesters</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>

            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 font-medium text-gray-700"
            >
              <option value="">All Document Types</option>
              {MATERIAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {(searchTerm || semester || materialType) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSemester('');
                  setMaterialType('');
                }}
                className="text-xs text-rose-600 font-medium px-2 py-1 rounded-lg hover:bg-rose-50"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Materials Table */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Loading materials list...</span>
            </div>
          ) : materials.length === 0 ? (
            <div className="p-16 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-800 mb-1">No Materials Found</h3>
              <p className="text-xs text-gray-500 mb-4">
                No matching materials found in the database.
              </p>
              <Link
                href="/admin/dashboard/materials/add"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Study Material</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-400   tracking-wider font-semibold border-b border-gray-100">
                    <th className="px-6 py-4">Title &amp; File</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Semester</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">File Size</th>
                    <th className="px-6 py-4">Downloads</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {materials.map((mat) => (
                    <tr key={mat._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 max-w-xs">
                        <span className="font-bold text-gray-900 block truncate leading-tight">
                          {mat.title}
                        </span>
                        <span className="text-[11px] text-gray-400 block truncate mt-0.5">
                          {mat.fileName}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {mat.subject?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold">
                          Sem {mat.semester}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200/50">
                          {mat.materialType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {formatBytes(mat.fileSize)}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {mat.downloads || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/materials/${mat._id}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                            title="Preview Details Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <a
                            href={`/api/downloads/${mat._id}`}
                            className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50"
                            title="Direct Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <Link
                            href={`/admin/dashboard/materials/edit/${mat._id}`}
                            className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                            title="Edit &amp; Replace PDF"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ open: true, material: mat })}
                            className="p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Delete Material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900">
                Confirm Material Deletion
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-gray-800">
                  &ldquo;{deleteModal.material?.title}&rdquo;
                </strong>
                ? This will also remove the physical PDF file from the server disk.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ open: false, material: null })}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Permanently</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
