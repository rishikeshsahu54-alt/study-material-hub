'use client';

import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  BookOpen,
} from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export default function ManageSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semesterFilter, setSemesterFilter] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('1');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirmation
  const [deleteModal, setDeleteModal] = useState({ open: false, subject: null });
  const [deleting, setDeleting] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const url = semesterFilter
        ? `/api/subjects?semester=${semesterFilter}`
        : '/api/subjects';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setSubjects(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [semesterFilter]);

  const openAddModal = () => {
    setEditingSubject(null);
    setName('');
    setSemester(semesterFilter || '1');
    setDescription('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (sub) => {
    setEditingSubject(sub);
    setName(sub.name);
    setSemester(sub.semester);
    setDescription(sub.description || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Subject name is required.');
      return;
    }

    setSaving(true);
    try {
      const endpoint = editingSubject
        ? `/api/subjects/${editingSubject._id}`
        : '/api/subjects';
      const method = editingSubject ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          semester,
          description: description.trim(),
        }),
      });

      const json = await res.json();

      if (json.success) {
        setNotification({
          type: 'success',
          message: editingSubject
            ? `Subject '${name.trim()}' updated successfully.`
            : `Subject '${name.trim()}' created successfully.`,
        });
        setModalOpen(false);
        fetchSubjects();
      } else {
        setFormError(json.error || 'Operation failed');
      }
    } catch (err) {
      setFormError('Network error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.subject) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/subjects/${deleteModal.subject._id}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        setNotification({
          type: 'success',
          message: `Subject '${deleteModal.subject.name}' was deleted.`,
        });
        setDeleteModal({ open: false, subject: null });
        fetchSubjects();
      } else {
        // If materials are assigned, API responds with 400 and clear message
        setNotification({
          type: 'error',
          message: json.error || 'Failed to delete subject',
        });
        setDeleteModal({ open: false, subject: null });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error: ' + err.message });
      setDeleteModal({ open: false, subject: null });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Manage Academic Subjects"
        subtitle="Create, edit, and organize curriculum subjects by semester"
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

        {/* Toolbar */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-gray-400   tracking-wider">
              Filter by Semester:
            </span>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-medium text-gray-700"
            >
              <option value="">All Semesters (1-8)</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
            {semesterFilter && (
              <button
                onClick={() => setSemesterFilter('')}
                className="text-xs text-rose-600 font-medium px-2 py-1 rounded-lg hover:bg-rose-50"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Subject</span>
          </button>
        </div>

        {/* Subjects Grid */}
        {loading ? (
          <div className="p-16 text-center text-xs text-gray-400 flex items-center justify-center gap-2 bg-white rounded-3xl border border-gray-200">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading registered subjects...</span>
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800 mb-1">No Subjects Registered</h3>
            <p className="text-xs text-gray-500 mb-4">
              Add your college subjects or run the seed script to populate sample subjects.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Subject</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((sub) => (
              <div
                key={sub._id}
                className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-2xs flex flex-col justify-between hover:border-blue-200 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-100">
                      Semester {sub.semester}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(sub)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                        title="Edit Subject"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, subject: sub })}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-1.5">
                    {sub.name}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    {sub.description || 'No detailed syllabus description provided.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Subject ID: {sub._id.slice(-6)}</span>
                  <span className="text-blue-600 font-medium">Curriculum Course</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Subject Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {editingSubject ? 'Edit Subject' : 'Add New Academic Subject'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700   tracking-wider mb-1.5">
                  Subject Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Distributed Operating Systems"
                  maxLength={100}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700   tracking-wider mb-1.5">
                  Associated Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700   tracking-wider mb-1.5">
                  Course Description &amp; Scope (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of syllabus chapters and course objectives..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-60 flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingSubject ? 'Update Subject' : 'Create Subject'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900">
                Delete Academic Subject?
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-gray-800">
                  &ldquo;{deleteModal.subject?.name}&rdquo;
                </strong>
                ? If any study materials are assigned to this subject, deletion will be blocked
                to prevent orphaned documents.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ open: false, subject: null })}
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
                    <span>Checking...</span>
                  </>
                ) : (
                  <span>Delete Subject</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
