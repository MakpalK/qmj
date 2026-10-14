import React, { useState } from 'react';
import { Sparkles, Wand2, Lightbulb, CheckSquare, Square, Info } from 'lucide-react';
import { QMJDocument, TeacherProfile } from '../types';
import { OPTIONAL_PEDAGOGICAL_ELEMENTS, SUBJECT_LIST } from '../data/sampleQMJ';

interface NewQMJFormProps {
  initialProfile: TeacherProfile;
  onGenerate: (data: Omit<QMJDocument, 'id' | 'lessonStages' | 'createdAt' | 'updatedAt'>) => void;
  onLoadDemo: () => void;
  isGenerating: boolean;
}

export const NewQMJForm: React.FC<NewQMJFormProps> = ({
  initialProfile,
  onGenerate,
  onLoadDemo,
  isGenerating
}) => {
  const [section, setSection] = useState('Python программалау тілінде алгоритмдерді программалау');
  const [teacherName, setTeacherName] = useState(initialProfile.teacherName || 'Ахметова Гүлнұр Болатқызы');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [grade, setGrade] = useState(initialProfile.defaultGrade || '6');
  const [presentStudents, setPresentStudents] = useState<number>(24);
  const [absentStudents, setAbsentStudents] = useState<number>(0);
  const [subject, setSubject] = useState(initialProfile.subject || 'Информатика');
  const [topic, setTopic] = useState('Python тілінде енгізу және шығару');
  const [learningObjectives, setLearningObjectives] = useState('6.3.2.1 - Python (пайтон) программалау тілінде енгізу және шығару операторларын қолдану');
  const [lessonObjectives, setLessonObjectives] = useState(
    'Барлық оқушылар: Python ортасында print() және input() функцияларының қызметін біледі, қарапайым хабарлама шығарады.\nКөптеген оқушылар: Деректерді енгізіп, оларды айнымалыларға меншіктейді және мәндерін экранға шығарады.\nКейбір оқушылар: Дерек түрлерін ескере отырып, күрделі диалогтік программа құрастырады.'
  );
  const [lessonDuration, setLessonDuration] = useState<number>(initialProfile.defaultDuration || 45);
  const [selectedPedagogicalElements, setSelectedPedagogicalElements] = useState<string[]>([
    'Психологиялық ахуал',
    'Қызығушылықты ояту',
    'Практикалық жұмыс',
    'Саралау',
    'ЕББҚ оқушыға бейімдеу',
    'Қалыптастырушы бағалау',
    'Рефлексия',
    'Үй тапсырмасы'
  ]);

  const [isGeneratingObjective, setIsGeneratingObjective] = useState(false);
  const [objectiveError, setObjectiveError] = useState<string | null>(null);

  const togglePedagogicalElement = (id: string) => {
    if (selectedPedagogicalElements.includes(id)) {
      setSelectedPedagogicalElements(selectedPedagogicalElements.filter(item => item !== id));
    } else {
      setSelectedPedagogicalElements([...selectedPedagogicalElements, id]);
    }
  };

  const handleGenerateObjective = async () => {
    if (!topic.trim()) {
      setObjectiveError('Алдымен сабақтың тақырыбын жазыңыз');
      return;
    }
    setIsGeneratingObjective(true);
    setObjectiveError(null);
    try {
      const response = await fetch('/api/generate-objective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          learningObjectives,
          subject,
          grade
        })
      });
      const data = await response.json();
      if (data.lessonObjectives) {
        setLessonObjectives(data.lessonObjectives);
      } else if (data.error) {
        setObjectiveError(data.error);
      }
    } catch (e: any) {
      setObjectiveError('Мақсатты құрастыру кезінде қате болды');
    } finally {
      setIsGeneratingObjective(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      section,
      teacherName,
      date,
      grade,
      presentStudents: Number(presentStudents) || 0,
      absentStudents: Number(absentStudents) || 0,
      subject,
      topic,
      learningObjectives,
      lessonObjectives,
      lessonDuration: Number(lessonDuration) || 45,
      selectedPedagogicalElements,
      schoolName: initialProfile.schoolName
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Title & Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
              <span>ҚР БҒМ №130 бұйрығы негізінде</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              QМЖ AI — «Ақылды ҚМЖ құрастырушы»
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">
              Қазақстан мектебінің ҚМЖ форматына сәйкес сабақ жоспарын AI көмегімен жылдам жасаңыз
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="btn-load-demo"
              onClick={onLoadDemo}
              className="inline-flex items-center px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-semibold transition-colors shadow-xs"
            >
              <Lightbulb className="w-4 h-4 mr-2 text-blue-600" />
              <span>Демо үлгіні жүктеу (Информатика 6-сынып)</span>
            </button>
          </div>
        </div>

        {/* Regulatory Distinction Alert */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs sm:text-sm flex items-start space-x-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold">Құрылымдық талап:</span> Қосымша педагогикалық элементтер (саралау, ЕББҚ, бағалау дескрипторлары) жасанды артық бағандар немесе бөлімдер жасамай, №130 бұйрықтың <b>ресми 5 бағанды кестесінің ішіне</b> (педагог пен оқушының әрекетіне) үйлесімді кіріктіріледі.
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main QMJ Form - Section 1: Official Header Fields */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <span className="w-2 h-6 bg-blue-600 rounded-full mr-3 inline-block"></span>
              Міндетті ҚМЖ құрылымы (№130 бұйрық өрістері)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Төмендегі барлық ресми өрістер сабақ жоспарының титулдық кестесінде көрсетіледі
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Бөлім */}
            <div className="md:col-span-2">
              <label htmlFor="input-section" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Бөлім: <span className="text-red-500">*</span>
              </label>
              <input
                id="input-section"
                type="text"
                value={section}
                onChange={e => setSection(e.target.value)}
                placeholder="Мысалы: Python программалау тілінде алгоритмдерді программалау"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 transition-colors"
              />
            </div>

            {/* Педагогтің Т.А.Ә. */}
            <div>
              <label htmlFor="input-teacher" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Педагогтің Т.А.Ә.: <span className="text-red-500">*</span>
              </label>
              <input
                id="input-teacher"
                type="text"
                value={teacherName}
                onChange={e => setTeacherName(e.target.value)}
                placeholder="Мысалы: Ахметова Гүлнұр Болатқызы"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 transition-colors"
              />
            </div>

            {/* Күні */}
            <div>
              <label htmlFor="input-date" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Күні: <span className="text-red-500">*</span>
              </label>
              <input
                id="input-date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 transition-colors"
              />
            </div>

            {/* Пән */}
            <div>
              <label htmlFor="input-subject" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Пән: <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-subject"
                  type="text"
                  list="subjects-datalist"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Пәнді таңдаңыз немесе жазыңыз"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 transition-colors"
                />
                <datalist id="subjects-datalist">
                  {SUBJECT_LIST.map(sub => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Сынып */}
            <div>
              <label htmlFor="select-grade" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Сынып: <span className="text-red-500">*</span>
              </label>
              <select
                id="select-grade"
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 transition-colors bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
                  <option key={num} value={String(num)}>
                    {num}-сынып
                  </option>
                ))}
              </select>
            </div>

            {/* Қатысушылар саны */}
            <div>
              <label htmlFor="input-present" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Қатысушылар саны: <span className="text-red-500">*</span>
              </label>
              <input
                id="input-present"
                type="number"
                min="1"
                max="50"
                value={presentStudents}
                onChange={e => setPresentStudents(parseInt(e.target.value) || 0)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 transition-colors"
              />
            </div>

            {/* Қатыспағандар саны */}
            <div>
              <label htmlFor="input-absent" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Қатыспағандар саны:
              </label>
              <input
                id="input-absent"
                type="number"
                min="0"
                max="30"
                value={absentStudents}
                onChange={e => setAbsentStudents(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 transition-colors"
              />
            </div>

            {/* Сабақтың тақырыбы */}
            <div className="md:col-span-2">
              <label htmlFor="input-topic" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Сабақтың тақырыбы: <span className="text-red-500">*</span>
              </label>
              <input
                id="input-topic"
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Мысалы: Python тілінде енгізу және шығару"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-slate-900 transition-colors"
              />
            </div>

            {/* Сабақ ұзақтығы */}
            <div>
              <label htmlFor="select-duration" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Сабақ ұзақтығы:
              </label>
              <select
                id="select-duration"
                value={lessonDuration}
                onChange={e => setLessonDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 transition-colors bg-white"
              >
                <option value={45}>45 минут (стандартты мектеп сабағы)</option>
                <option value={40}>40 минут (қысқартылған режім)</option>
              </select>
            </div>

            {/* Оқу бағдарламасына сәйкес оқыту мақсаттары */}
            <div className="md:col-span-2">
              <label htmlFor="textarea-learning-objectives" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Оқу бағдарламасына сәйкес оқыту мақсаттары: <span className="text-red-500">*</span>
              </label>
              <textarea
                id="textarea-learning-objectives"
                rows={3}
                value={learningObjectives}
                onChange={e => setLearningObjectives(e.target.value)}
                placeholder="Мысалы: 6.3.2.1 - Python (пайтон) программалау тілінде енгізу және шығару операторларын қолдану"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 transition-colors leading-relaxed"
              />
              <p className="text-xs text-slate-500 mt-1">
                * Ереже: Егер оқу мақсатының ресми коды (мысалы, 6.3.2.1) бар болса, дәл сол күйінде сақталады.
              </p>
            </div>

            {/* Сабақтың мақсаты */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="textarea-lesson-objectives" className="block text-sm font-semibold text-slate-700">
                  Сабақтың мақсаты: <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  id="btn-ai-generate-objective"
                  onClick={handleGenerateObjective}
                  disabled={isGeneratingObjective}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold border border-indigo-200 transition-colors disabled:opacity-50"
                >
                  <Wand2 className={`w-3.5 h-3.5 mr-1.5 ${isGeneratingObjective ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingObjective ? 'Мақсат құрастырылуда...' : '✨ AI арқылы сабақ мақсатын құрастыру'}</span>
                </button>
              </div>

              {objectiveError && (
                <div className="text-xs text-red-600 mb-1.5">{objectiveError}</div>
              )}

              <textarea
                id="textarea-lesson-objectives"
                rows={4}
                value={lessonObjectives}
                onChange={e => setLessonObjectives(e.target.value)}
                placeholder="Барлық оқушылар: ...&#10;Көптеген оқушылар: ...&#10;Кейбір оқушылар: ..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 transition-colors leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Optional Pedagogical Elements */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <span className="w-2 h-6 bg-emerald-500 rounded-full mr-3 inline-block"></span>
                Қосымша педагогикалық элементтер (Мұғалім қалауы бойынша)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Қажетті элементтерді белгілеңіз. AI оларды ҚМЖ-ның орталық 5 бағанды кестесіне үйлесімді кірістіреді.
              </p>
            </div>
            <div className="text-xs font-medium text-slate-500">
              Таңдалғаны: <span className="text-blue-600 font-bold">{selectedPedagogicalElements.length}</span> / {OPTIONAL_PEDAGOGICAL_ELEMENTS.length}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {OPTIONAL_PEDAGOGICAL_ELEMENTS.map(element => {
              const isSelected = selectedPedagogicalElements.includes(element.id);
              return (
                <div
                  key={element.id}
                  onClick={() => togglePedagogicalElement(element.id)}
                  className={`flex items-start p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-300 text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="mr-3 mt-0.5 text-blue-600">
                    {isSelected ? <CheckSquare className="w-4 h-4 fill-blue-600 text-white" /> : <Square className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold">{element.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{element.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit & Generate Button */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-2">
          <button
            type="submit"
            id="btn-generate-qmj"
            disabled={isGenerating}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-blue-600 text-white text-base font-semibold shadow-md hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-5 h-5 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'ҚМЖ AI арқылы құрастырылуда...' : '🚀 ҚМЖ құрастыру (AI)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
