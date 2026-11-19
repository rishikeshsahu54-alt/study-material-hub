'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Flame,
  Layers,
  GraduationCap,
  Search,
  ArrowRight,
  FileText,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import MaterialCard from '@/components/MaterialCard';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export default function HomePage() {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [semester, setSemester] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);

  // Data states
  const [materials, setMaterials] = useState([]);
  const [popularMaterials, setPopularMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalItems: 0,
    totalPages: 1,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState('');

  const isFiltered = Boolean(
    searchTerm.trim() || semester || materialType || selectedSubject || sortBy !== 'recent'
  );

  const debounceTimerRef = useRef(null);

  // 1. Fetch Subjects list
  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects');
      const json = await res.json();
      if (json.success) {
        setSubjects(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  // 2. Fetch Popular Materials
  const fetchOverviewData = async () => {
    try {
      const popRes = await fetch('/api/materials?limit=4&sortBy=popular');
      const popJson = await popRes.json();
      if (popJson.success) setPopularMaterials(popJson.data || []);
    } catch (err) {
      console.error('Failed to load popular materials:', err);
    }
  };

  // 3. Fetch Query/Filtered Materials
  const fetchMaterials = useCallback(
    async (curPage = 1) => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.set('search', searchTerm.trim());
        if (semester) params.set('semester', semester);
        if (materialType) params.set('materialType', materialType);
        if (selectedSubject) params.set('subject', selectedSubject);
        if (sortBy) params.set('sortBy', sortBy);
        params.set('page', curPage.toString());
        params.set('limit', '12');

        const res = await fetch(`/api/materials?${params.toString()}`);
        const json = await res.json();

        if (json.success) {
          setMaterials(json.data || []);
          setPagination(json.pagination);
        } else {
          setError(json.error || 'Failed to fetch materials');
        }
      } catch (err) {
        setError('Network error: ' + err.message);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, semester, materialType, selectedSubject, sortBy]
  );

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoadingInitial(true);
      await Promise.all([fetchSubjects(), fetchOverviewData(), fetchMaterials(1)]);
      setLoadingInitial(false);
    };
    init();
  }, []);

  // Handle Debounced search or filter changes
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      setPage(1);
      fetchMaterials(1);
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchTerm, semester, materialType, selectedSubject, sortBy, fetchMaterials]);

  const handleFilterChange = (key, value) => {
    if (key === 'semester') setSemester(value);
    if (key === 'materialType') setMaterialType(value);
    if (key === 'subject') setSelectedSubject(value);
    if (key === 'sortBy') setSortBy(value);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSemester('');
    setMaterialType('');
    setSelectedSubject('');
    setSortBy('recent');
    setPage(1);
  };

  const handleSemesterSelect = (sem) => {
    setSemester(sem === semester ? '' : sem);
    const target = document.getElementById('browse-materials');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubjectSelect = (subId) => {
    setSelectedSubject(subId === selectedSubject ? '' : subId);
    const target = document.getElementById('browse-materials');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50 border-b border-gray-200/60 pt-16 sm:pt-20 pb-12 sm:pb-14">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4 max-w-3xl">
           All Your Study Resources in,{' '} 
           <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 block sm:inline">
               One Place
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-xl mx-auto text-sm sm:text-base text-gray-500 mb-6 leading-relaxed">
            Free and easy access to semester lecture notes, previous year exam question papers,
            assignments, and lab manuals organized by subject and semester.
          </p>

          {/* Hero Search Bar */}
          <div className="w-full max-w-xl mx-auto">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={() => fetchMaterials(1)}
              placeholder="Search by material title, topic, or subject name..."
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
        {/* BROWSE BY SEMESTER */}
        <section id="browse-semesters" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span>Browse by Semester</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {SEMESTERS.map((s) => {
              const isSelected = semester === s;
              return (
                <button
                  key={s}
                  onClick={() => handleSemesterSelect(s)}
                  className={`p-3.5 rounded-2xl border text-center transition-all duration-150 flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 shadow-2xs'
                  }`}
                >
                  <span className="text-2xl font-black leading-none mb-1">
                    0{s}
                  </span>
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider ${
                      isSelected ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    Semester
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* BROWSE BY SUBJECTS (Directory Grid) */}
        <section id="browse-subjects" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Browse by Subject</span>
            </h2>
          </div>

          {subjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center text-xs text-gray-500">
              No subjects registered yet. Run <code className="bg-gray-100 px-1 py-0.5 rounded">npm run seed</code> or add them from Admin.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {subjects.map((sub) => {
                const isSelected = selectedSubject === sub._id;
                return (
                  <button
                    key={sub._id}
                    onClick={() => handleSubjectSelect(sub._id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                        : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-slate-50/70 shadow-2xs'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-sm text-gray-900 block truncate">
                        {sub.name}
                      </span>
                      <span className="text-[11px] font-medium text-gray-400 block mt-0.5">
                        Semester {sub.semester}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* MAIN ALL / FILTERED MATERIALS SECTION */}
        <section id="browse-materials" className="scroll-mt-20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <span>
                  {isFiltered ? 'Search & Filtered Results' : 'All Study Materials'}
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isFiltered
                  ? `Showing results matching your query (${pagination.totalItems} found)`
                  : 'Explore all approved notes, question papers, and lab resources'}
              </p>
            </div>

            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="self-start sm:self-auto text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200/60 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* FILTER TOOLBAR */}
          <FilterBar
            semester={semester}
            materialType={materialType}
            subject={selectedSubject}
            sortBy={sortBy}
            subjects={subjects}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {/* ERROR STATE */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* LOADING STATE */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 animate-pulse h-64"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-10 bg-gray-100 rounded mt-6"></div>
                </div>
              ))}
            </div>
          ) : materials.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">
                No Study Materials Found
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                {isFiltered
                  ? 'We could not find any materials matching your criteria. Try adjusting or clearing your filters.'
                  : 'No materials have been uploaded to the database yet. Admin can upload real PDFs using the Admin Portal.'}
              </p>
              {isFiltered ? (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Reset All Filters
                </button>
              ) : (
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <span>Go to Admin Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ) : (
            /* MATERIALS GRID */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {materials.map((mat) => (
                  <MaterialCard
                    key={mat._id}
                    material={mat}
                    onDownloadSuccess={() => {
                      fetchOverviewData();
                    }}
                  />
                ))}
              </div>

              {/* PAGINATION */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    onClick={() => fetchMaterials(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-500 px-3">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchMaterials(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* POPULAR MATERIALS (Only show when NOT actively filtering and items exist) */}
        {!isFiltered && popularMaterials.length > 0 && (
          <section className="pt-6 border-t border-gray-200/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span>Popular Materials</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Most downloaded study resources by students
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {popularMaterials.map((mat) => (
                <MaterialCard
                  key={mat._id}
                  material={mat}
                  onDownloadSuccess={fetchOverviewData}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
