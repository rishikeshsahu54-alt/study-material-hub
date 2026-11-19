'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FilePlus2,
  Upload,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  X,
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

export default function AddMaterialPage() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [semester, setSemester] = useState('1');
  const [materialType, setMaterialType] = useState('Notes');
  const [file, setFile] = useState(null);

  // Aux states
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load registered subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('/api/subjects');
        const json = await res.json();
        if (json.success) {
          setSubjects(json.data || []);
          if (json.data?.length > 0) {
            setSubjectId(json.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  // Update available subjects filter when semester changes (optional convenience)
  const filteredSubjects = subjects.filter(
    (s) => !semester || String(s.semester) === String(semester)
  );

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setError('');

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Check extension
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Invalid file type: Only PDF (.pdf) documents are accepted.');
      setFile(null);
      return;
    }

    // Check size limit (10MB)
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size exceeds the 10 MB maximum limit. Please choose a smaller PDF.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!title.trim()) {
      setError('Please provide a title for the study material.');
      return;
    }
    if (!subjectId) {
      setError('Please select an academic subject. If none exist, create one first under Manage Subjects.');
      return;
    }
    if (!semester) {
      setError('Please select a valid semester.');
      return;
    }
    if (!materialType) {
      setError('Please select a material type.');
      return;
    }
    if (!file) {
      setError('A valid PDF file is required.');
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
      formData.append('file', file);

      const res = await fetch('/api/materials', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (json.success) {
        setSuccess('Study material successfully uploaded and saved to repository!');
        setTimeout(() => {
          router.push('/admin/dashboard/materials');
        }, 1200);
      } else {
        setError(json.error || 'Failed to upload material.');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Upload Study Material"
        subtitle="Add a new verified PDF lecture note, question paper, or assignment"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
        {/* Back Link */}
        <Link
          href="/admin/dashboard/materials"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Materials</span>
        </Link>

        {/* Feedback Messages */}
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

        {/* Form Card */}
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
                placeholder="e.g. Unit 3 Trees & Graphs Comprehensive Lecture Notes"
                maxLength={200}
                required
                className="w-full px-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                {title.length}/200 characters
              </span>
            </div>

            {/* Semester and Material Type in 2 cols */}
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700   tracking-wider">
                  Academic Subject <span className="text-rose-500">*</span>
                </label>
                <Link
                  href="/admin/dashboard/subjects"
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  + Add New Subject
                </Link>
              </div>

              {loadingSubjects ? (
                <div className="p-3 text-xs text-gray-400 bg-gray-50 rounded-xl">
                  Loading subjects list...
                </div>
              ) : subjects.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
                  No subjects found. Please{' '}
                  <Link href="/admin/dashboard/subjects" className="font-bold underline">
                    create a subject first
                  </Link>{' '}
                  or run <code className="bg-amber-100 px-1 py-0.5 rounded">npm run seed</code>.
                </div>
              ) : (
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
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700   tracking-wider mb-2">
                Description &amp; Syllabus Coverage (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include topics, unit numbers, professor notes, or exam guidelines..."
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                {description.length}/1000 characters
              </span>
            </div>

            {/* PDF File Upload Zone */}
            <div>
              <label className="block text-xs font-bold text-gray-700   tracking-wider mb-2">
                PDF Document File <span className="text-rose-500">*</span>
              </label>

              <div className="border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-3xl p-6 sm:p-8 text-center transition-colors bg-gray-50/40">
                <input
                  type="file"
                  id="pdf-upload"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs max-w-md mx-auto">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="pdf-upload" className="cursor-pointer block">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-blue-600 hover:text-blue-700 block mb-1">
                      Click to choose PDF file
                    </span>
                    <span className="text-xs text-gray-400 block">
                      Adobe PDF only (.pdf) • Maximum file size: 10 MB
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <Link
                href="/admin/dashboard/materials"
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting || subjects.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading &amp; Saving...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Publish Material</span>
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
