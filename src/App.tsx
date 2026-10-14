import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { NewQMJForm } from './components/NewQMJForm';
import { QMJView } from './components/QMJView';
import { SavedQMJList } from './components/SavedQMJList';
import { SettingsModal } from './components/SettingsModal';
import { QMJDocument, TeacherProfile } from './types';
import { OFFICIAL_DEMO_QMJ } from './data/sampleQMJ';

const DEFAULT_PROFILE: TeacherProfile = {
  schoolName: '№15 орта мектеп-лицейі',
  teacherName: 'Ахметова Гүлнұр Болатқызы',
  subject: 'Информатика',
  defaultGrade: '6',
  defaultDuration: 45
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<'new' | 'view' | 'saved' | 'history'>('new');
  const [currentQMJ, setCurrentQMJ] = useState<QMJDocument | null>(null);
  const [savedQMJList, setSavedQMJList] = useState<QMJDocument[]>([]);
  const [historyQMJList, setHistoryQMJList] = useState<QMJDocument[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(DEFAULT_PROFILE);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('qmj_teacher_profile');
      if (storedProfile) {
        setTeacherProfile(JSON.parse(storedProfile));
      }

      const storedSaved = localStorage.getItem('qmj_saved');
      if (storedSaved) {
        const parsed = JSON.parse(storedSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedQMJList(parsed);
        } else {
          setSavedQMJList([OFFICIAL_DEMO_QMJ]);
        }
      } else {
        setSavedQMJList([OFFICIAL_DEMO_QMJ]);
        localStorage.setItem('qmj_saved', JSON.stringify([OFFICIAL_DEMO_QMJ]));
      }

      const storedHistory = localStorage.getItem('qmj_history');
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        if (Array.isArray(parsed)) {
          setHistoryQMJList(parsed);
        }
      } else {
        setHistoryQMJList([OFFICIAL_DEMO_QMJ]);
      }
    } catch (e) {
      console.error('Error loading data from localStorage:', e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save profile
  const handleSaveProfile = (newProfile: TeacherProfile) => {
    setTeacherProfile(newProfile);
    try {
      localStorage.setItem('qmj_teacher_profile', JSON.stringify(newProfile));
      showToast('Мұғалім профилі сақталды');
    } catch (e) {
      console.error(e);
    }
  };

  // Save QMJ document
  const handleSaveQMJ = (doc: QMJDocument) => {
    try {
      const existingIndex = savedQMJList.findIndex(d => d.id === doc.id);
      let updatedList: QMJDocument[];
      if (existingIndex >= 0) {
        updatedList = [...savedQMJList];
        updatedList[existingIndex] = doc;
      } else {
        updatedList = [doc, ...savedQMJList];
      }
      setSavedQMJList(updatedList);
      localStorage.setItem('qmj_saved', JSON.stringify(updatedList));
      showToast('ҚМЖ құжаты «Менің ҚМЖ-ларым» бөліміне сақталды');
    } catch (e) {
      console.error(e);
    }
  };

  // Delete QMJ document
  const handleDeleteQMJ = (id: string) => {
    if (window.confirm('Бұл ҚМЖ жоспарын өшіргіңіз келетініне сенімдісіз бе?')) {
      const updatedSaved = savedQMJList.filter(d => d.id !== id);
      const updatedHistory = historyQMJList.filter(d => d.id !== id);
      setSavedQMJList(updatedSaved);
      setHistoryQMJList(updatedHistory);
      try {
        localStorage.setItem('qmj_saved', JSON.stringify(updatedSaved));
        localStorage.setItem('qmj_history', JSON.stringify(updatedHistory));
      } catch (e) {
        console.error(e);
      }
      if (currentQMJ?.id === id) {
        setCurrentQMJ(null);
        setCurrentTab('saved');
      }
      showToast('ҚМЖ өшірілді');
    }
  };

  // Generate full QMJ
  const handleGenerateQMJ = async (formData: Omit<QMJDocument, 'id' | 'lessonStages' | 'createdAt' | 'updatedAt'>) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-qmj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data.lessonStages) {
        const newDoc: QMJDocument = {
          ...formData,
          id: 'qmj-' + Date.now(),
          lessonStages: data.lessonStages,
          lessonDuration: data.lessonDuration || formData.lessonDuration,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setCurrentQMJ(newDoc);

        // Add to history
        const updatedHistory = [newDoc, ...historyQMJList.slice(0, 49)];
        setHistoryQMJList(updatedHistory);
        try {
          localStorage.setItem('qmj_history', JSON.stringify(updatedHistory));
        } catch (e) {
          console.error(e);
        }

        setCurrentTab('view');
        showToast('ҚМЖ сәтті құрастырылды!');
      } else {
        alert(data.error || 'ҚМЖ жасау барысында қате орын алды');
      }
    } catch (e: any) {
      console.error('Error generating QMJ:', e);
      alert('Серверге қосылу барысында қате болды');
    } finally {
      setIsGenerating(false);
    }
  };

  // Load demo sample
  const handleLoadDemo = () => {
    setCurrentQMJ(OFFICIAL_DEMO_QMJ);
    setCurrentTab('view');
    showToast('6-сынып Информатика demo үлгісі ашылды');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={tab => setCurrentTab(tab)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasActiveQMJ={Boolean(currentQMJ)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'new' && (
          <NewQMJForm
            initialProfile={teacherProfile}
            onGenerate={handleGenerateQMJ}
            onLoadDemo={handleLoadDemo}
            isGenerating={isGenerating}
          />
        )}

        {currentTab === 'view' && currentQMJ && (
          <QMJView
            doc={currentQMJ}
            onUpdateDoc={updated => {
              setCurrentQMJ(updated);
              // Update in saved if already there
              if (savedQMJList.some(d => d.id === updated.id)) {
                const newList = savedQMJList.map(d => d.id === updated.id ? updated : d);
                setSavedQMJList(newList);
                localStorage.setItem('qmj_saved', JSON.stringify(newList));
              }
            }}
            onSaveDoc={handleSaveQMJ}
            onBackToNew={() => setCurrentTab('new')}
          />
        )}

        {currentTab === 'saved' && (
          <SavedQMJList
            savedList={savedQMJList}
            onOpenDoc={doc => {
              setCurrentQMJ(doc);
              setCurrentTab('view');
            }}
            onDeleteDoc={handleDeleteQMJ}
            mode="saved"
          />
        )}

        {currentTab === 'history' && (
          <SavedQMJList
            savedList={historyQMJList}
            onOpenDoc={doc => {
              setCurrentQMJ(doc);
              setCurrentTab('view');
            }}
            onDeleteDoc={handleDeleteQMJ}
            mode="history"
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={teacherProfile}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
