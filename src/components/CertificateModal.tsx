import React, { useState } from 'react';
import { X, Printer, Award, Star, CheckCircle, Sparkles } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  onUpdateName: (name: string) => void;
  completedCount: number;
  totalCount: number;
  soundsEnabled: boolean;
  quizCompleted?: boolean;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  studentName,
  onUpdateName,
  completedCount,
  totalCount,
  soundsEnabled,
  quizCompleted
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const isComplete = completedCount === totalCount;
  const today = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  if (!isOpen) return null;

  const handlePrint = () => {
    playClickSound(soundsEnabled);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 my-8 text-slate-800">
        {/* Close Button */}
        <button
          onClick={() => {
            playClickSound(soundsEnabled);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full transition"
        >
          <X size={20} />
        </button>

        {/* Top Controls: Name input and Print */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Имя ученика:</span>
            <input
              type="text"
              value={studentName}
              onChange={(e) => onUpdateName(e.target.value)}
              placeholder="Введи своё имя..."
              className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-sm text-amber-700 font-bold focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-900 font-bold text-xs transition shadow"
          >
            <Printer size={15} />
            <span>Распечатать / Сохранить</span>
          </button>
        </div>

        {/* The Printable Certificate Box */}
        <div
          id="printable-certificate"
          className="relative bg-gradient-to-br from-amber-50 via-white to-amber-100 text-slate-900 rounded-2xl p-8 border-8 border-double border-amber-600/40 shadow-inner overflow-hidden select-none"
        >
          {/* Subtle watermark background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-9xl">
            🐍
          </div>

          {/* Certificate Corner Ribbons */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-amber-500 rounded-tl-xl m-2" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-amber-500 rounded-tr-xl m-2" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-amber-500 rounded-bl-xl m-2" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-amber-500 rounded-br-xl m-2" />

          {/* Header */}
          <div className="text-center space-y-1 relative z-10">
            <div className="inline-flex items-center gap-2 text-amber-700 font-black text-xs uppercase tracking-widest px-3 py-1 bg-amber-100 rounded-full border border-amber-300">
              <Sparkles size={14} /> Академия юных программистов «Питончик»
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-['Comfortaa',sans-serif] tracking-tight pt-2">
              СЕРТИФИКАТ
            </h2>
            <p className="text-sm font-semibold text-amber-800">
              об успешном прохождении базового тренажёра Python
            </p>
          </div>

          {/* Recipient */}
          <div className="text-center my-6 relative z-10">
            <p className="text-xs text-slate-600 uppercase tracking-wider">
              Настоящий сертификат подтверждает, что
            </p>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-['Comfortaa',sans-serif] mt-1 mb-2 border-b-2 border-emerald-500/30 inline-block px-6 pb-1">
              {studentName.trim() || 'Юный Программист'}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 max-w-md mx-auto leading-relaxed">
              успешно выполнил интерактивные практические задания по программированию,
              освоил работу со строками, переменными, синтаксисом Python 3 и отступами!
            </p>
          </div>

          {/* Badges / Skills mastered */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-5 relative z-10 text-[11px]">
            <div className={`p-2 rounded-lg border text-center font-semibold shadow-sm ${quizCompleted ? 'bg-amber-100/80 border-amber-300 text-amber-950' : 'bg-white/80 border-amber-200 text-slate-800'}`}>
              <CheckCircle size={14} className="text-emerald-600 inline mr-1" />
              Тест по уроку
            </div>
            <div className="p-2 rounded-lg bg-white/80 border border-amber-200 text-center font-semibold text-slate-800 shadow-sm">
              <CheckCircle size={14} className="text-emerald-600 inline mr-1" />
              Строки и кавычки
            </div>
            <div className="p-2 rounded-lg bg-white/80 border border-amber-200 text-center font-semibold text-slate-800 shadow-sm">
              <CheckCircle size={14} className="text-emerald-600 inline mr-1" />
              Переменные и регистр
            </div>
            <div className="p-2 rounded-lg bg-white/80 border border-amber-200 text-center font-semibold text-slate-800 shadow-sm">
              <CheckCircle size={14} className="text-emerald-600 inline mr-1" />
              Отступы в коде
            </div>
            <div className="p-2 rounded-lg bg-white/80 border border-amber-200 text-center font-semibold text-slate-800 shadow-sm">
              <CheckCircle size={14} className="text-emerald-600 inline mr-1" />
              Собственный проект
            </div>
          </div>

          {/* Footer of Certificate: Seal + Date + Signature */}
          <div className="flex items-end justify-between pt-4 border-t border-amber-200 text-slate-700 text-xs relative z-10">
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Дата выдачи:</span>
              <span className="font-bold text-slate-800">{today}</span>
            </div>

            {/* Gold Seal */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-slate-950 flex flex-col items-center justify-center shadow-lg border-2 border-white ring-2 ring-amber-400/50">
                <Award size={20} className="fill-current text-slate-950" />
                <span className="text-[9px] font-black uppercase mt-0.5 tracking-tighter">PYTHON</span>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-[10px] text-slate-500 uppercase">Статус:</span>
              <span className="font-bold text-emerald-700">
                {isComplete ? '🌟 Отлично (8 из 8)' : `${completedCount} из ${totalCount} миссий`}
              </span>
            </div>
          </div>
        </div>

        {/* Note */}
        {!isComplete && (
          <p className="text-xs text-amber-700 text-center mt-4">
            Совет: заверши все 8 заданий, чтобы получить высший золотой знак отличия!
          </p>
        )}
      </div>
    </div>
  );
};
