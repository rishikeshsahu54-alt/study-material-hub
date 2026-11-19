'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Edit,
  Upload,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  X,
  FileCheck,
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
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function EditMaterialPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [semester, setSemester] = useState('1');
  const [materialType, setMaterialType] = useState('Notes');
  const [currentFile, setCurrentFile] = useState(null);
  const [replacementFile, setReplacementFile] = useState(null);

  // Aux states
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [matRes, subRes] = await Promise.all([
          fetch(`/api/materials/${id}`),
          fetch('/api/subjects'),
        ]);

        const matJson = await matRes.json();
        const subJson = await subRes.json();

        if (subJson.success) setSubjects(subJson.data || []);

        if (matJson.success && matJson.data) {
          const m = matJson.data;
          setTitle(m.title || '');
          setDescription(m.description || '');
          setSubjectId(m.subject?._id || m.subject || '');
          setSemester(m.semester || '1');
          setMaterialType(m.materialType || 'Notes');
          setCurrentFile({
            fileName: m.fileName,
            fileSize: m.fileSize,
          });
        } else {
          setError(matJson.error || 'Material not found');
        }
      } catch (err) {
        setError('Error fetching material data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleReplacementFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setError('');

    if (!selectedFile) {
      setReplacementFile(null);
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF (.pdf) documents are accepted for replacement.');
      setReplacementFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('Replacement PDF exceeds 10 MB limit.');
      setReplacementFile(null);
      return;
    }

    setReplacementFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }
    if (!subjectId) {
      setError('Subject selection is required');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('subject', subjectId);
      formData.append('semester', semester);
      formData.append('materialType', materialType);

      if (replacementFile) {
        formData.append('file', replacementFile);
      }

      const res = await fetch(`/api/materials/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const json = await res.json();

      if (json.success) {
        setSuccess('Material updated successfully!');
        setTimeout(() => {
          router.push('/admin/dashboard/materials');
        }, 1200);
      } else {
        setError(json.error || 'Failed to update material');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Edit Material" />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading material details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Edit Study Material"
        subtitle="Update course information or replace the attached PDF file"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
        <Link
          href="/admin/dashboard/materials"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Materials</span>
        </Link>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700   tracking-wider mb-2">
                Material Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
                className="w-full px-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Semester and Material Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700   tracking-wider mb-2">
                  Target Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700   tracking-wider mb-2">
                  Material Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {MATERIAL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-700   tracking-wider mb-2">
                Subject <span className="text-rose-500">*</span>
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name} (Sem {sub.semester})
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700   tracking-wider mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
              />
            </div>

            {/* Current File Display */}
            {currentFile && (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-800 block truncate">
                      Current Attached File
                    </span>
                    <span className="text-[11px] text-gray-500 block truncate">
                      {currentFile.fileName} ({formatBytes(currentFile.fileSize)})
                    </span>
                  </div>
                </div>
                <a
                  href={`/api/downloads/${id}`}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Download Current
                </a>
              </div>
            )}

            {/* Replace PDF Section */}
            <div>
              <label className="block text-xs font-bold text-gray-700   tracking-wider mb-2">
                Replace PDF File (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-3xl p-6 text-center transition-colors bg-gray-50/40">
                <input
                  type="file"
                  id="replace-pdf"
                  accept="application/pdf,.pdf"
                  onChange={handleReplacementFileChange}
                  className="hidden"
                />

                {replacementFile ? (
                  <div className="flex items-center justify-center gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 max-w-sm mx-auto">
                    <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="text-left min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {replacementFile.name}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {(replacementFile.size / (1024 * 1024)).toFixed(2)} MB • Replacement ready
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplacementFile(null)}
                      className="p-1 text-gray-400 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="replace-pdf" className="cursor-pointer block">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <span className="text-xs font-bold text-blue-600 block">
                      Click to choose a replacement PDF
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      Leave empty to retain the existing PDF file
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <Link
                href="/admin/dashboard/materials"
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
