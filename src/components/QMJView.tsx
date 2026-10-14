import React, { useState } from 'react';
import {
  Printer,
  Copy,
  FileDown,
  FileText,
  Save,
  ShieldCheck,
  Edit3,
  RefreshCw,
  Trash2,
  Plus,
  Sparkles,
  Check,
  AlertTriangle,
  ArrowLeft,
  Share2
} from 'lucide-react';
import { QMJDocument, LessonStageRow } from '../types';
import { exportToWord, copyQMJToClipboard } from '../utils/exportUtils';
import { checkQMJQuality } from '../utils/qualityChecker';
import { RowEditModal } from './RowEditModal';
import { QualityCheckerModal } from './QualityCheckerModal';

interface QMJViewProps {
  doc: QMJDocument;
  onUpdateDoc: (updated: QMJDocument) => void;
  onSaveDoc: (doc: QMJDocument) => void;
  onBackToNew: () => void;
}

export const QMJView: React.FC<QMJViewProps> = ({
  doc,
  onUpdateDoc,
  onSaveDoc,
  onBackToNew
}) => {
  const [editingStage, setEditingStage] = useState<LessonStageRow | null>(null);
  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);
  const [isFixingQuality, setIsFixingQuality] = useState(false);

  const [regeneratingStageId, setRegeneratingStageId] = useState<string | null>(null);
  const [customAiCommand, setCustomAiCommand] = useState('');
  const [isModifyingAi, setIsModifyingAi] = useState(false);
  const [aiModifyMessage, setAiModifyMessage] = useState<string | null>(null);

  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [isCopiedSuccess, setIsCopiedSuccess] = useState(false);
  const [isHeaderEditMode, setIsHeaderEditMode] = useState(false);

  // Editable header state
  const [headerState, setHeaderState] = useState({
    section: doc.section,
    teacherName: doc.teacherName,
    date: doc.date,
    grade: doc.grade,
    presentStudents: doc.presentStudents,
    absentStudents: doc.absentStudents,
    subject: doc.subject,
    topic: doc.topic,
    learningObjectives: doc.learningObjectives,
    lessonObjectives: doc.lessonObjectives
  });

  const qualityResult = checkQMJQuality(doc);

  // Quick AI Commands
  const QUICK_COMMANDS = [
    'Тапсырманы жеңілдет',
    'Тапсырманы күрделендір',
    'Оқушы жасына бейімде',
    'ЕББҚ оқушыға бейімде',
    'Практикалық тапсырма қос',
    'Қалыптастырушы бағалауды өзгерту',
    'Рефлексияны өзгерту',
    'Уақытты қайта бөл',
    'Информатикаға арналған тапсырма қос'
  ];

  // Save handler
  const handleSave = () => {
    onSaveDoc(doc);
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2000);
  };

  // Copy handler
  const handleCopy = async () => {
    const ok = await copyQMJToClipboard(doc);
    if (ok) {
      setIsCopiedSuccess(true);
      setTimeout(() => setIsCopiedSuccess(false), 2000);
    }
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Save header edit
  const handleSaveHeader = () => {
    const updated: QMJDocument = {
      ...doc,
      ...headerState,
      presentStudents: Number(headerState.presentStudents) || 0,
      absentStudents: Number(headerState.absentStudents) || 0,
      updatedAt: new Date().toISOString()
    };
    onUpdateDoc(updated);
    setIsHeaderEditMode(false);
  };

  // Delete stage
  const handleDeleteStage = (stageId: string) => {
    if (doc.lessonStages.length <= 1) {
      alert('Кестеде кем дегенде 1 кезең қалуы қажет.');
      return;
    }
    if (window.confirm('Бұл кезеңді жойғыңыз келетініне сенімдісіз бе?')) {
      const updatedStages = doc.lessonStages.filter(s => s.id !== stageId);
      onUpdateDoc({
        ...doc,
        lessonStages: updatedStages,
        updatedAt: new Date().toISOString()
      });
    }
  };

  // Add stage
  const handleAddStage = () => {
    const newStage: LessonStageRow = {
      id: 'stage-' + Date.now(),
      stageName: 'Қосымша кезең (5 мин)',
      durationMinutes: 5,
      teacherActivity: 'Мұғалім оқушыларға қосымша бекіту тапсырмасын береді.',
      studentActivity: 'Оқушылар тапсырманы талдайды және орындайды.',
      assessment: 'Дескриптор арқылы бағалау.',
      resources: 'Таратпа материал, оқулық.',
      pedagogicalTags: []
    };
    onUpdateDoc({
      ...doc,
      lessonStages: [...doc.lessonStages, newStage],
      updatedAt: new Date().toISOString()
    });
  };

  // Regenerate only this stage
  const handleRegenerateStage = async (stageId: string) => {
    setRegeneratingStageId(stageId);
    try {
      const response = await fetch('/api/regenerate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qmjDoc: doc,
          stageId,
          userInstruction: 'Осы кезеңді жаңа әдіс-тәсілдермен қайта жаса'
        })
      });
      const data = await response.json();
      if (data.updatedStage) {
        const updatedStages = doc.lessonStages.map(s =>
          s.id === stageId ? data.updatedStage : s
        );
        onUpdateDoc({
          ...doc,
          lessonStages: updatedStages,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error('Error regenerating stage:', e);
    } finally {
      setRegeneratingStageId(null);
    }
  };

  // Execute AI Modification
  const handleRunAiCommand = async (cmdText?: string) => {
    const commandToRun = cmdText || customAiCommand;
    if (!commandToRun.trim()) return;

    setIsModifyingAi(true);
    setAiModifyMessage(null);
    try {
      const response = await fetch('/api/modify-qmj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qmjDoc: doc,
          command: cmdText ? cmdText : undefined,
          customPrompt: !cmdText ? customAiCommand : undefined
        })
      });
      const data = await response.json();
      if (data.updatedDoc) {
        onUpdateDoc(data.updatedDoc);
        setAiModifyMessage(`«${commandToRun}» командасы сәтті орындалды!`);
        setCustomAiCommand('');
        setTimeout(() => setAiModifyMessage(null), 3000);
      } else if (data.error) {
        setAiModifyMessage(`Қате: ${data.error}`);
      }
    } catch (e: any) {
      setAiModifyMessage('Өзгерісті енгізу барысында қате болды');
    } finally {
      setIsModifyingAi(false);
    }
  };

  // Auto-fix quality checklist
  const handleAutoFixQuality = async () => {
    setIsFixingQuality(true);
    try {
      const response = await fetch('/api/fix-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qmjDoc: doc,
          missingElements: qualityResult.missingElements
        })
      });
      const data = await response.json();
      if (data.fixedDoc) {
        onUpdateDoc(data.fixedDoc);
        setIsQualityModalOpen(false);
      }
    } catch (e) {
      console.error('Error auto-fixing quality:', e);
    } finally {
      setIsFixingQuality(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Action Toolbar (Hidden during browser printing) */}
      <div className="no-print bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBackToNew}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Формаға қайту</span>
        </button>

        {/* Quality indicator badge */}
        <button
          id="btn-quality-check"
          onClick={() => setIsQualityModalOpen(true)}
          className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
            qualityResult.isComplete
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mr-1.5" />
          <span>🔍 ҚМЖ сапасын тексеру ({qualityResult.scoreRatio})</span>
        </button>

        {/* Document Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Print */}
          <button
            id="btn-print"
            onClick={handlePrint}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors border border-slate-200"
            title="ҚМЖ құжатын басып шығару"
          >
            <Printer className="w-4 h-4 mr-1.5 text-slate-600" />
            <span>Басып шығару</span>
          </button>

          {/* PDF */}
          <button
            id="btn-pdf"
            onClick={handlePrint}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors border border-slate-200"
            title="PDF түрінде сақтау"
          >
            <FileDown className="w-4 h-4 mr-1.5 text-rose-600" />
            <span>PDF</span>
          </button>

          {/* Word (.doc) */}
          <button
            id="btn-word"
            onClick={() => exportToWord(doc)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors border border-blue-200"
            title="Microsoft Word форматында жүктеу"
          >
            <FileText className="w-4 h-4 mr-1.5 text-blue-600" />
            <span>Word</span>
          </button>

          {/* Copy */}
          <button
            id="btn-copy"
            onClick={handleCopy}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors border border-slate-200"
            title="Мәтінді алмасу буферіне көшіру"
          >
            {isCopiedSuccess ? (
              <>
                <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
                <span className="text-emerald-700">Көшірілді!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1.5 text-slate-600" />
                <span>Көшіру</span>
              </>
            )}
          </button>

          {/* Save */}
          <button
            id="btn-save-doc"
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            {isSavedSuccess ? (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                <span>Сақталды!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                <span>💾 Сақтау</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quality Missing elements alert if incomplete */}
      {!qualityResult.isComplete && (
        <div className="no-print mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">
                ҚМЖ толық емес. Төмендегі бөлімдерді толықтыру қажет:
              </div>
              <div className="text-xs text-amber-800 mt-1">
                {qualityResult.missingElements.join(', ')}
              </div>
            </div>
          </div>
          <button
            onClick={handleAutoFixQuality}
            disabled={isFixingQuality}
            className="shrink-0 inline-flex items-center px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 mr-1.5 ${isFixingQuality ? 'animate-spin' : ''}`} />
            <span>{isFixingQuality ? 'Толықтырылуда...' : '✨ AI арқылы толықтыру'}</span>
          </button>
        </div>
      )}

      {/* AI Command Panel (Section 13) */}
      <div className="no-print bg-white rounded-2xl p-6 border border-slate-200 shadow-xs mb-8">
        <div className="flex items-center space-x-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              «ҚМЖ-ны AI арқылы өзгерту»
            </h3>
            <p className="text-xs text-slate-500">
              Жылдам командаларды басыңыз немесе AI-ға еркін тапсырма беріңіз
            </p>
          </div>
        </div>

        {/* Quick Commands Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_COMMANDS.map(cmd => (
            <button
              key={cmd}
              onClick={() => handleRunAiCommand(cmd)}
              disabled={isModifyingAi}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 transition-all disabled:opacity-50"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Free text field */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={customAiCommand}
            onChange={e => setCustomAiCommand(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleRunAiCommand();
              }
            }}
            placeholder="AI-ға тапсырма беріңіз (мысалы: топтық жұмысты күшейт, Python кодын 7-сыныпқа бейімде)..."
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => handleRunAiCommand()}
            disabled={isModifyingAi || !customAiCommand.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-xs shrink-0 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 mr-1.5 ${isModifyingAi ? 'animate-spin' : ''}`} />
            <span>{isModifyingAi ? 'Өзгертілуде...' : '✨ Өзгерту'}</span>
          </button>
        </div>

        {aiModifyMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-medium border border-blue-100 flex items-center">
            <Check className="w-4 h-4 mr-1.5 text-blue-600" />
            <span>{aiModifyMessage}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* THE OFFICIAL QMJ DOCUMENT (PRINTABLE & SCHOOL DOCUMENTATION READY) */}
      {/* ========================================================================= */}
      <div
        id="official-qmj-document"
        className="official-qmj-sheet bg-white rounded-2xl p-6 sm:p-10 border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        {/* School Header & Official Document Title */}
        <div className="text-center mb-6">
          {doc.schoolName && (
            <div className="text-sm font-bold uppercase tracking-wide text-slate-800 mb-1">
              {doc.schoolName}
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-bold uppercase text-slate-900 tracking-tight">
            Қысқа мерзімді сабақ жоспары (ҚМЖ)
          </h1>
          <p className="text-xs text-slate-600 italic mt-1">
            ҚР Білім және ғылым министрінің 2020 жылғы 6 сәуірдегі №130 бұйрығына сәйкес
          </p>

          <div className="no-print mt-3 flex justify-end">
            <button
              onClick={() => setIsHeaderEditMode(!isHeaderEditMode)}
              className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              <span>{isHeaderEditMode ? 'Өңдеуді аяқтау' : 'Жоғарғы өрістерді өңдеу'}</span>
            </button>
          </div>
        </div>

        {/* Section 2 & 3: Official Header Table */}
        <div className="border border-slate-800 mb-6 text-slate-900 text-sm overflow-x-auto">
          {isHeaderEditMode ? (
            <div className="p-4 space-y-3 bg-slate-50 font-sans text-xs">
              <div className="font-bold text-slate-700 border-b pb-1">
                ҚМЖ-ның негізгі ақпараттарын өңдеу:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Бөлім:</label>
                  <input
                    type="text"
                    value={headerState.section}
                    onChange={e => setHeaderState({ ...headerState, section: e.target.value })}
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Педагогтің Т.А.Ә.:</label>
                  <input
                    type="text"
                    value={headerState.teacherName}
                    onChange={e => setHeaderState({ ...headerState, teacherName: e.target.value })}
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Күні:</label>
                  <input
                    type="date"
                    value={headerState.date}
                    onChange={e => setHeaderState({ ...headerState, date: e.target.value })}
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Сынып:</label>
                  <input
                    type="text"
                    value={headerState.grade}
                    onChange={e => setHeaderState({ ...headerState, grade: e.target.value })}
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Қатысушылар саны:</label>
                  <input
                    type="number"
                    value={headerState.presentStudents}
                    onChange={e => setHeaderState({ ...headerState, presentStudents: Number(e.target.value) })}
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Қатыспағандар саны:</label>
                  <input
                    type="number"
                    value={headerState.absentStudents}
                    onChange={e => setHeaderState({ ...headerState, absentStudents: Number(e.target.value) })}
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold block mb-1">Сабақтың тақырыбы:</label>
                  <input
                    type="text"
                    value={headerState.topic}
                    onChange={e => setHeaderState({ ...headerState, topic: e.target.value })}
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold block mb-1">Оқу бағдарламасына сәйкес оқыту мақсаттары:</label>
                  <textarea
                    rows={2}
                    value={headerState.learningObjectives}
                    onChange={e => setHeaderState({ ...headerState, learningObjectives: e.target.value })}
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold block mb-1">Сабақтың мақсаты:</label>
                  <textarea
                    rows={3}
                    value={headerState.lessonObjectives}
                    onChange={e => setHeaderState({ ...headerState, lessonObjectives: e.target.value })}
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveHeader}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-semibold text-xs"
                >
                  Сақтау
                </button>
              </div>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b border-slate-800">
                  <td className="w-1/3 p-2.5 font-bold bg-slate-50 border-r border-slate-800">
                    Бөлім:
                  </td>
                  <td className="p-2.5">{doc.section || '-'}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-800">
                    Педагогтің Т.А.Ә.:
                  </td>
                  <td className="p-2.5">{doc.teacherName || '-'}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-800">
                    Күні:
                  </td>
                  <td className="p-2.5">{doc.date || '-'}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-800">
                    Сынып:
                  </td>
                  <td className="p-2.5">
                    <span className="font-bold">{doc.grade}</span>-сынып
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="font-bold">Қатысушылар саны:</span> {doc.presentStudents}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="font-bold">Қатыспағандар саны:</span> {doc.absentStudents}
                  </td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-800">
                    Пән:
                  </td>
                  <td className="p-2.5 font-semibold">{doc.subject || '-'}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-800">
                    Сабақтың тақырыбы:
                  </td>
                  <td className="p-2.5 font-bold text-base">{doc.topic || '-'}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-800 align-top">
                    Оқу бағдарламасына сәйкес оқыту мақсаттары:
                  </td>
                  <td className="p-2.5 whitespace-pre-line leading-relaxed">
                    {doc.learningObjectives || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-800 align-top">
                    Сабақтың мақсаты:
                  </td>
                  <td className="p-2.5 whitespace-pre-line leading-relaxed">
                    {doc.lessonObjectives || '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Section 4: Central Lesson Process Table (Сабақтың барысы) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-900">
              Сабақтың барысы:
            </h2>
            <div className="text-xs text-slate-600 no-print">
              Жалпы уақыт: <span className="font-bold text-blue-700">{doc.lessonStages.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)} мин</span> / {doc.lessonDuration} мин
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-800 text-center font-bold">
                  <th className="p-2.5 border-r border-slate-800 w-[17%]">
                    Сабақтың кезеңі/уақыты
                  </th>
                  <th className="p-2.5 border-r border-slate-800 w-[29%]">
                    Педагогтің әрекеті
                  </th>
                  <th className="p-2.5 border-r border-slate-800 w-[27%]">
                    Оқушының әрекеті
                  </th>
                  <th className="p-2.5 border-r border-slate-800 w-[14%]">
                    Бағалау
                  </th>
                  <th className="p-2.5 w-[13%]">
                    Ресурстар
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {doc.lessonStages.map((stage, index) => {
                  const isRegenerating = regeneratingStageId === stage.id;
                  return (
                    <tr
                      key={stage.id || index}
                      className="hover:bg-slate-50/70 transition-colors group align-top"
                    >
                      {/* Сабақтың кезеңі/уақыты */}
                      <td className="p-2.5 border-r border-slate-800 bg-slate-50/40">
                        <div className="font-bold text-slate-900 mb-1">
                          {stage.stageName}
                        </div>
                        <div className="text-[11px] text-slate-500 mb-2">
                          ({stage.durationMinutes} минут)
                        </div>

                        {/* Pedagogical Tags badges */}
                        {stage.pedagogicalTags && stage.pedagogicalTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2 no-print">
                            {stage.pedagogicalTags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Row Action buttons (no-print) */}
                        <div className="no-print pt-2 border-t border-slate-200/60 flex flex-wrap gap-1">
                          <button
                            onClick={() => setEditingStage(stage)}
                            title="Өңдеу"
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs inline-flex items-center transition-colors"
                          >
                            <Edit3 className="w-3 h-3 mr-0.5" />
                            <span>Өңдеу</span>
                          </button>
                          <button
                            onClick={() => handleRegenerateStage(stage.id)}
                            disabled={isRegenerating}
                            title="Тек осы бөлімді қайта жаса"
                            className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs inline-flex items-center transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 mr-0.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                            <span>Қайта жаса</span>
                          </button>
                          <button
                            onClick={() => handleDeleteStage(stage.id)}
                            title="Жою"
                            className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-xs inline-flex items-center transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Педагогтің әрекеті */}
                      <td className="p-2.5 border-r border-slate-800 whitespace-pre-line leading-relaxed">
                        {isRegenerating ? (
                          <div className="text-indigo-600 italic text-xs animate-pulse p-4">
                            ✨ AI осы кезеңді қайта құрастырып жатыр...
                          </div>
                        ) : (
                          stage.teacherActivity
                        )}
                      </td>

                      {/* Оқушының әрекеті */}
                      <td className="p-2.5 border-r border-slate-800 whitespace-pre-line leading-relaxed">
                        {isRegenerating ? (
                          <div className="text-indigo-600 italic text-xs animate-pulse p-4">
                            ...
                          </div>
                        ) : (
                          stage.studentActivity
                        )}
                      </td>

                      {/* Бағалау */}
                      <td className="p-2.5 border-r border-slate-800 whitespace-pre-line leading-relaxed">
                        {stage.assessment}
                      </td>

                      {/* Ресурстар */}
                      <td className="p-2.5 whitespace-pre-line leading-relaxed">
                        {stage.resources}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add stage button (no-print) */}
          <div className="no-print mt-3 flex justify-end">
            <button
              onClick={handleAddStage}
              className="inline-flex items-center px-3.5 py-1.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-all"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>+ Жаңа кезең қосу</span>
            </button>
          </div>
        </div>

        {/* Section 18: Mandatory Legal & Regulatory Note */}
        <div className="mt-8 pt-4 border-t border-slate-300 text-slate-600 text-xs leading-relaxed italic">
          <p>
            * Ескерту: AI көмегімен жасалған ҚМЖ педагогтің кәсіби тексеруінен және қажет болған жағдайда түзетуінен кейін пайдалануға ұсынылады.
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 not-italic">
            Құжат Қазақстан Республикасы Білім және ғылым министрінің 2020 жылғы 6 сәуірдегі №130 бұйрығының талаптары мен құрылымына толық сәйкес келеді.
          </p>
        </div>
      </div>

      {/* Row Edit Modal */}
      <RowEditModal
        stage={editingStage}
        onClose={() => setEditingStage(null)}
        onSave={updatedStage => {
          const updatedStages = doc.lessonStages.map(s =>
            s.id === updatedStage.id ? updatedStage : s
          );
          onUpdateDoc({
            ...doc,
            lessonStages: updatedStages,
            updatedAt: new Date().toISOString()
          });
          setEditingStage(null);
        }}
      />

      {/* Quality Checker Modal */}
      <QualityCheckerModal
        isOpen={isQualityModalOpen}
        onClose={() => setIsQualityModalOpen(false)}
        result={qualityResult}
        onAutoFix={handleAutoFixQuality}
        isFixing={isFixingQuality}
      />
    </div>
  );
};
