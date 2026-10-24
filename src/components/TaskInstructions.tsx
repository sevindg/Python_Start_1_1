import React, { useState } from 'react';
import { Task } from '../types';
import { HelpCircle, ChevronDown, ChevronUp, Eye, Check, Lightbulb, BookOpen, Target, Palette, X } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface TaskInstructionsProps {
  task: Task;
  onApplySolution: (code: string) => void;
  onApplyTemplate?: (code: string) => void;
  soundsEnabled: boolean;
  onClose?: () => void;
}

export const TaskInstructions: React.FC<TaskInstructionsProps> = ({
  task,
  onApplySolution,
  onApplyTemplate,
  soundsEnabled,
  onClose
}) => {
  const [openedHintIndex, setOpenedHintIndex] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);

  const toggleHint = (index: number) => {
    playClickSound(soundsEnabled);
    setOpenedHintIndex((prev) => (prev === index ? null : index));
  };

  const handleApplySolution = () => {
    playClickSound(soundsEnabled);
    onApplySolution(task.solutionCode);
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-2xl overflow-y-auto p-4 sm:p-5 space-y-4">
      {/* Header tags */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            task.difficulty === 'Легко'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : task.difficulty === 'Средне'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-purple-50 text-purple-700 border border-purple-200'
          }`}
        >
          {task.difficulty}
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          {task.topic}
        </span>
        {onClose && (
          <button
            onClick={() => {
              playClickSound(soundsEnabled);
              onClose();
            }}
            className="ml-auto p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Спрятать задание"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Title & subtitle */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
          {task.title}
        </h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          {task.subtitle}
        </p>
      </div>

      {/* Target card */}
      <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
          <Target size={20} />
        </div>
        <div className="text-sm min-w-0">
          <span className="font-bold text-slate-800 block mb-1">Цель миссии:</span>
          <span className="text-emerald-700 font-mono font-semibold whitespace-pre-line break-words text-xs sm:text-sm">
            {task.expectedDescription}
          </span>
        </div>
      </div>

      {/* Instructions list */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <BookOpen size={14} className="text-sky-500" /> Что нужно сделать:
        </h3>
        <ul className="space-y-2 text-sm text-slate-700">
          {task.instructions.map((inst, idx) => (
            <li key={idx} className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed break-words min-w-0">{inst}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Starter Templates (for Task 8) */}
      {task.starterTemplates && task.starterTemplates.length > 0 && (
        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-2.5">
          <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
            <Palette size={16} /> Выбери готовую идею для вдохновения:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {task.starterTemplates.map((template, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playClickSound(soundsEnabled);
                  if (onApplyTemplate) onApplyTemplate(template.code);
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-white hover:bg-purple-100 border border-purple-200 text-left text-xs text-slate-700 hover:text-purple-900 transition group"
              >
                <span className="text-lg group-hover:scale-125 transition-transform">
                  {template.icon}
                </span>
                <span className="font-semibold">{template.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hints Accordion */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Lightbulb size={14} className="text-amber-500" /> Нужна подсказка?
          </h3>
          <span className="text-[11px] text-slate-400">3 уровня помощи</span>
        </div>

        <div className="space-y-1.5">
          {task.hints.map((hint, index) => {
            const isOpen = openedHintIndex === index;
            return (
              <div key={index} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <button
                  onClick={() => toggleHint(index)}
                  className="w-full flex items-center justify-between p-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition text-left"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle size={14} className="text-amber-500 shrink-0" />
                    Подсказка {index + 1}
                  </span>
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 pt-1 text-sm text-amber-900 bg-amber-50 leading-relaxed font-sans border-t border-amber-100 break-words">
                    {hint}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Reveal Solution Button */}
        <div className="pt-2">
          {!showSolution ? (
            <button
              onClick={() => {
                playClickSound(soundsEnabled);
                setShowSolution(true);
              }}
              className="w-full py-2 px-3 text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl border border-dashed border-slate-300 transition flex items-center justify-center gap-1.5"
            >
              <Eye size={13} /> Показать правильный ответ
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                <span>Правильное решение:</span>
                <button
                  onClick={handleApplySolution}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white rounded transition active:scale-95"
                >
                  {copiedSolution ? <Check size={12} /> : null}
                  {copiedSolution ? 'Вставлено!' : 'Вставить в редактор'}
                </button>
              </div>
              <pre className="p-2.5 bg-white border border-slate-200 rounded font-mono text-xs text-emerald-800 whitespace-pre overflow-x-auto">
                {task.solutionCode}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
