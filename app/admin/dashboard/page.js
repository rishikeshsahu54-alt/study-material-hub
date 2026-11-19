'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  GraduationCap,
  Download,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  BookOpen,
  Calendar,
  ExternalLink,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalSubjects: 0,
    totalDownloads: 0,
    recentMaterials: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/stats');
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      } else {
        setError(json.error || 'Failed to load statistics.');
      }
    } catch (err) {
      setError('Connection failure: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Admin Overview Dashboard"
        subtitle="Manage academic repository records, uploads, and download analytics"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-12">
        {/* Error message */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Total Materials */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400   tracking-wider">
                Total Materials
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {loading ? '...' : stats.totalMaterials}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Active PDF documents in repository
            </p>
          </div>

          {/* Total Subjects */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400   tracking-wider">
                Registered Subjects
              </span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {loading ? '...' : stats.totalSubjects}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Course modules across 8 semesters
            </p>
          </div>

          {/* Total Downloads */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400   tracking-wider">
                Total Downloads
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {loading ? '...' : stats.totalDownloads}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Cumulative student file downloads
            </p>
          </div>
        </div>

        {/* QUICK ACTIONS BAR */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900   tracking-wider">
            Quick Administrative Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/admin/dashboard/materials/add"
              className="flex items-center justify-between p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block">Upload Material</span>
                  <span className="text-[11px] text-blue-100 block">Add notes, papers, or lab guides</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/admin/dashboard/materials"
              className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-blue-50/50 border border-gray-200 hover:border-blue-200 text-gray-900 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100/60 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block">Manage Materials</span>
                  <span className="text-[11px] text-gray-500 block">Edit, delete, replace PDFs</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/admin/dashboard/subjects"
              className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50/50 border border-gray-200 hover:border-indigo-200 text-gray-900 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100/60 text-indigo-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block">Manage Subjects</span>
                  <span className="text-[11px] text-gray-500 block">Add or edit semester courses</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* RECENT UPLOADS TABLE */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Recently Uploaded Study Materials
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                The latest materials uploaded to the repository
              </p>
            </div>
            <Link
              href="/admin/dashboard/materials"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Loading materials...</span>
            </div>
          ) : stats.recentMaterials.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-4">No materials uploaded yet.</p>
              <Link
                href="/admin/dashboard/materials/add"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload First Material</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-400   tracking-wider font-semibold border-b border-gray-100">
                    <th className="px-6 py-3.5">Title</th>
                    <th className="px-6 py-3.5">Subject</th>
                    <th className="px-6 py-3.5">Semester</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Downloads</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {stats.recentMaterials.map((mat) => (
                    <tr key={mat._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900 max-w-xs truncate">
                        <Link
                          href={`/materials/${mat._id}`}
                          target="_blank"
                          className="hover:text-blue-600 transition-colors"
                        >
                          {mat.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {mat.subject?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
                          Sem {mat.semester}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200/50">
                          {mat.materialType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {mat.downloads}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/materials/${mat._id}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/dashboard/materials/edit/${mat._id}`}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
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
    </div>
  );
}
