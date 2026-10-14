import React, { useState } from 'react';
import { X, Save, School, User, BookOpen, Check } from 'lucide-react';
import { TeacherProfile } from '../types';
import { SUBJECT_LIST } from '../data/sampleQMJ';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TeacherProfile;
  onSaveProfile: (newProfile: TeacherProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile
}) => {
  if (!isOpen) return null;

  const [schoolName, setSchoolName] = useState(profile.schoolName || '');
  const [teacherName, setTeacherName] = useState(profile.teacherName || '');
  const [subject, setSubject] = useState(profile.subject || 'Информатика');
  const [defaultGrade, setDefaultGrade] = useState(profile.defaultGrade || '6');
  const [defaultDuration, setDefaultDuration] = useState(profile.defaultDuration || 45);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      schoolName,
      teacherName,
      subject,
      defaultGrade,
      defaultDuration: Number(defaultDuration) || 45
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Мұғалім профилі және баптаулар
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-xs text-slate-500">
            Осы мәліметтерді сақтағаннан кейін, олар әр жаңа ҚМЖ құрастырғанда автоматты түрде өрістерге енгізіледі.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <School className="w-4 h-4 mr-1 text-slate-400" />
              Мектеп атауы:
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              placeholder="Мысалы: №15 орта мектеп-лицейі"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <User className="w-4 h-4 mr-1 text-slate-400" />
              Педагогтің Т.А.Ә.: <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={teacherName}
              onChange={e => setTeacherName(e.target.value)}
              placeholder="Мысалы: Ахметова Гүлнұр Болатқызы"
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <BookOpen className="w-4 h-4 mr-1 text-slate-400" />
              Пәні: <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              list="profile-subjects"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Мысалы: Информатика"
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <datalist id="profile-subjects">
              {SUBJECT_LIST.map(sub => (
                <option key={sub} value={sub} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Әдепкі сынып:
              </label>
              <select
                value={defaultGrade}
                onChange={e => setDefaultGrade(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(g => (
                  <option key={g} value={String(g)}>
                    {g}-сынып
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Сабақ уақыты:
              </label>
              <select
                value={defaultDuration}
                onChange={e => setDefaultDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value={45}>45 минут</option>
                <option value={40}>40 минут</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Жабу
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Сақталды!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Сақтау
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
