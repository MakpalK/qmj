import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { LessonStageRow } from '../types';

interface RowEditModalProps {
  stage: LessonStageRow | null;
  onSave: (updated: LessonStageRow) => void;
  onClose: () => void;
}

export const RowEditModal: React.FC<RowEditModalProps> = ({
  stage,
  onSave,
  onClose
}) => {
  if (!stage) return null;

  const [stageName, setStageName] = useState(stage.stageName);
  const [durationMinutes, setDurationMinutes] = useState(stage.durationMinutes);
  const [teacherActivity, setTeacherActivity] = useState(stage.teacherActivity);
  const [studentActivity, setStudentActivity] = useState(stage.studentActivity);
  const [assessment, setAssessment] = useState(stage.assessment);
  const [resources, setResources] = useState(stage.resources);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...stage,
      stageName,
      durationMinutes: Number(durationMinutes) || 0,
      teacherActivity,
      studentActivity,
      assessment,
      resources
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-base font-bold text-slate-900">
            Кезеңді өңдеу: {stage.stageName}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Сабақтың кезеңі / уақыты:
              </label>
              <input
                type="text"
                value={stageName}
                onChange={e => setStageName(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ұзақтығы (мин):
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Педагогтің әрекеті:
            </label>
            <textarea
              rows={4}
              value={teacherActivity}
              onChange={e => setTeacherActivity(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Оқушының әрекеті:
            </label>
            <textarea
              rows={4}
              value={studentActivity}
              onChange={e => setStudentActivity(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Бағалау:
              </label>
              <textarea
                rows={3}
                value={assessment}
                onChange={e => setAssessment(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ресурстар:
              </label>
              <textarea
                rows={3}
                value={resources}
                onChange={e => setResources(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Бас тарту
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Сақтау
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
