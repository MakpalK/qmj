import React from 'react';
import { X, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { QualityCheckResult } from '../types';

interface QualityCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: QualityCheckResult;
  onAutoFix: () => void;
  isFixing: boolean;
}

export const QualityCheckerModal: React.FC<QualityCheckerModalProps> = ({
  isOpen,
  onClose,
  result,
  onAutoFix,
  isFixing
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl ${result.isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                №130 бұйрық бойынша ҚМЖ сапасын тексеру
              </h3>
              <p className="text-xs text-slate-500">
                Нәтиже: <span className="font-bold text-slate-800">{result.scoreRatio}</span> талап орындалды
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Status banner */}
          {result.isComplete ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">ҚМЖ толық және талапқа сай!</div>
                <div className="text-xs text-emerald-700 mt-1">
                  Барлық ресми өрістер мен 5 бағанды кесте сәйкестендірілген, уақыт көлемі дұрыс есептелген.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex flex-col gap-2">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="font-bold text-amber-900">
                  ҚМЖ толық емес. Төмендегі бөлімдерді толықтыру қажет:
                </div>
              </div>
              <ul className="list-disc list-inside text-xs text-amber-800 pl-2 space-y-1">
                {result.missingElements.map((el, i) => (
                  <li key={i}>{el}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Ресми тексеру парағы (Чек-лист):
            </h4>
            <div className="space-y-2 border border-slate-200 rounded-xl divide-y divide-slate-100 p-2 bg-slate-50/50">
              {result.items.map(item => (
                <div key={item.id} className="py-2 px-2 flex items-center justify-between text-sm">
                  <span className={`${item.passed ? 'text-slate-800' : 'text-amber-900 font-medium'}`}>
                    {item.label}
                  </span>
                  <div className="flex items-center ml-2">
                    {item.passed ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        Түзету керек
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Жабу
          </button>

          {!result.isComplete && (
            <button
              onClick={onAutoFix}
              disabled={isFixing}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-xs transition-colors disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 mr-2 ${isFixing ? 'animate-spin' : ''}`} />
              <span>{isFixing ? 'Түзетілуде...' : '✨ Автоматты түрде түзету (AI)'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
