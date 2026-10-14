import React from 'react';
import { PlusCircle, BookOpen, Clock, Settings, FileCheck2 } from 'lucide-react';

interface NavbarProps {
  currentTab: 'new' | 'view' | 'saved' | 'history';
  onSelectTab: (tab: 'new' | 'saved' | 'history') => void;
  onOpenSettings: () => void;
  hasActiveQMJ: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
  hasActiveQMJ
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('new')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">QМЖ AI</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  №130 бұйрық
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Ақылды ҚМЖ құрастырушы</p>
            </div>
          </div>

          {/* Main Navigation Buttons */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              id="btn-nav-new"
              onClick={() => onSelectTab('new')}
              className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'new'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>+ Жаңа ҚМЖ</span>
            </button>

            {hasActiveQMJ && (
              <button
                id="btn-nav-active-qmj"
                onClick={() => onSelectTab('view' as any)}
                className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'view'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <FileCheck2 className="w-4 h-4 mr-1.5 text-emerald-500" />
                <span>Ағымдағы ҚМЖ</span>
              </button>
            )}

            <button
              id="btn-nav-saved"
              onClick={() => onSelectTab('saved')}
              className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'saved'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">📚 </span>
              <span>Менің ҚМЖ-ларым</span>
            </button>

            <button
              id="btn-nav-history"
              onClick={() => onSelectTab('history')}
              className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'history'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 mr-1 sm:mr-1.5" />
              <span className="hidden sm:inline">🕘 </span>
              <span>Тарих</span>
            </button>

            <button
              id="btn-nav-settings"
              onClick={onOpenSettings}
              className="inline-flex items-center px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-colors"
              title="Мұғалім профилі және баптаулар"
            >
              <Settings className="w-4 h-4 mr-1 text-slate-500" />
              <span className="hidden md:inline">Баптаулар</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
