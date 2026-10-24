import React from 'react';
import { Volume2, VolumeX, Award, RotateCcw, Flame, HelpCircle, Code } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface NavbarProps {
  completedCount: number;
  totalCount: number;
  xp: number;
  soundsEnabled: boolean;
  onToggleSounds: () => void;
  onOpenCertificate: () => void;
  onResetAll: () => void;
  currentMode: 'quiz' | 'code';
  onSelectMode: (mode: 'quiz' | 'code') => void;
  quizCompleted: boolean;
  quizScore: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  completedCount,
  totalCount,
  xp,
  soundsEnabled,
  onToggleSounds,
  onOpenCertificate,
  onResetAll,
  currentMode,
  onSelectMode,
  quizCompleted
}) => {
  const percent = Math.round((completedCount / totalCount) * 100);
  const isAllCompleted = completedCount === totalCount;

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2.5 select-none shrink-0">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Логотип */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl shadow-md shadow-emerald-200">
            🐍
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-800 font-['Comfortaa',sans-serif]">Питончик</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                Детский тренажёр
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Интерактивные уроки программирования на Python</p>
          </div>
        </div>

        {/* Переключатель режимов */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => {
              playClickSound(soundsEnabled);
              onSelectMode('quiz');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              currentMode === 'quiz' ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle size={14} />
            <span>1. Тест по уроку</span>
            {quizCompleted && (
              <span className="w-4 h-4 rounded-full bg-white/70 text-emerald-600 text-[10px] flex items-center justify-center font-black">✓</span>
            )}
          </button>

          <button
            onClick={() => {
              playClickSound(soundsEnabled);
              onSelectMode('code');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              currentMode === 'code' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code size={14} />
            <span>
              2. Практика кода ({completedCount}/{totalCount})
            </span>
          </button>
        </div>

        {/* Прогресс и кнопки */}
        <div className="flex items-center gap-3 sm:gap-5">
          {currentMode === 'code' && (
            <div className="hidden md:flex flex-col gap-1 w-28 sm:w-36">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Задания:</span>
                <span className="text-emerald-600 font-mono">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-black text-xs sm:text-sm">
            <Flame size={16} className="text-amber-500 fill-amber-400" />
            <span>{xp} XP</span>
          </div>

          <button
            onClick={() => {
              playClickSound(soundsEnabled);
              onOpenCertificate();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm active:scale-95 ${
              isAllCompleted
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 animate-bounce'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
            title="Посмотреть сертификат"
          >
            <Award size={16} className={isAllCompleted ? 'fill-current' : ''} />
            <span className="hidden lg:inline">Сертификат</span>
          </button>

          <button
            onClick={onToggleSounds}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition"
            title={soundsEnabled ? 'Выключить звук' : 'Включить звук'}
          >
            {soundsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-slate-400" />}
          </button>

          <button
            onClick={() => {
              if (window.confirm('Сбросить весь прогресс (тест и задания) и начать заново?')) {
                onResetAll();
              }
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Сбросить прогресс"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
