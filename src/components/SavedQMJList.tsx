import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, BookOpen, Trash2, FileText, ArrowRight, Download, Copy, Check } from 'lucide-react';
import { QMJDocument } from '../types';
import { exportToWord, copyQMJToClipboard } from '../utils/exportUtils';
import { SUBJECT_LIST } from '../data/sampleQMJ';

interface SavedQMJListProps {
  savedList: QMJDocument[];
  onOpenDoc: (doc: QMJDocument) => void;
  onDeleteDoc: (id: string) => void;
  mode: 'saved' | 'history';
}

export const SavedQMJList: React.FC<SavedQMJListProps> = ({
  savedList,
  onOpenDoc,
  onDeleteDoc,
  mode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredList = useMemo(() => {
    return savedList.filter(doc => {
      // Search text in topic, section, teacherName, or learningObjectives
      const matchesSearch =
        !searchTerm.trim() ||
        (doc.topic && doc.topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.section && doc.section.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.teacherName && doc.teacherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.learningObjectives && doc.learningObjectives.toLowerCase().includes(searchTerm.toLowerCase()));

      // Subject filter
      const matchesSubject = !filterSubject || doc.subject === filterSubject;

      // Grade filter
      const matchesGrade = !filterGrade || doc.grade === filterGrade;

      // Date filter
      const matchesDate = !filterDate || doc.date === filterDate;

      return matchesSearch && matchesSubject && matchesGrade && matchesDate;
    });
  }, [savedList, searchTerm, filterSubject, filterGrade, filterDate]);

  const handleCopy = async (doc: QMJDocument) => {
    const success = await copyQMJToClipboard(doc);
    if (success) {
      setCopiedId(doc.id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Title */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {mode === 'history' ? '🕘 Сабақ жоспарларының тарихы' : '📚 Менің ҚМЖ-ларым'}
            </h1>
            <p className="text-slate-600 mt-1 text-sm">
              {mode === 'history'
                ? 'Барлық жасалған немесе қаралған ҚМЖ жобалары уақыт ретімен'
                : 'Сақталған сабақ жоспарларының толық тізімі'}
            </p>
          </div>
          <div className="text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            Барлығы: <span className="font-bold text-blue-600">{filteredList.length}</span> құжат
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ҚМЖ іздеу..."
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Subject filter */}
          <div>
            <select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Барлық пәндер</option>
              {SUBJECT_LIST.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Grade filter */}
          <div>
            <select
              value={filterGrade}
              onChange={e => setFilterGrade(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Барлық сыныптар</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(g => (
                <option key={g} value={String(g)}>
                  {g}-сынып
                </option>
              ))}
            </select>
          </div>

          {/* Date filter */}
          <div>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        {(searchTerm || filterSubject || filterGrade || filterDate) && (
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Сүзгілер қолданылды</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterSubject('');
                setFilterGrade('');
                setFilterDate('');
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Сүзгілерді тазарту
            </button>
          </div>
        )}
      </div>

      {/* List / Cards */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">ҚМЖ құжаты табылмады</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchTerm || filterSubject || filterGrade || filterDate
              ? 'Іздеу сүзгілеріне сай келетін құжат жоқ. Сүзгілерді өзгертіп көріңіз.'
              : 'Әзірге сақталған сабақ жоспарлары жоқ. Жоғарғы жақтағы «+ Жаңа ҚМЖ» батырмасы арқылы құрастырыңыз.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {doc.subject}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {doc.grade}-сынып
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {doc.date}
                  </div>
                </div>

                {/* Topic & Section */}
                <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                  {doc.topic}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  Бөлім: {doc.section}
                </p>

                {/* Teacher */}
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  Педагог: {doc.teacherName}
                </p>

                {/* Learning Objective snippet */}
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {doc.learningObjectives}
                </p>
              </div>

              {/* Action Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => exportToWord(doc)}
                    title="Word (.doc) форматында жүктеу"
                    className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleCopy(doc)}
                    title="Мәтінін көшіріп алу"
                    className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    {copiedId === doc.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onDeleteDoc(doc.id)}
                    title="Жою"
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => onOpenDoc(doc)}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <span>ҚМЖ-ны ашу</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
