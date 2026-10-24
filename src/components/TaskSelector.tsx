import React from 'react';
import { TASKS } from '../data/tasks';
import { CheckCircle2, Star, Sparkles } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface TaskSelectorProps {
  currentTaskId: number;
  completedTaskIds: number[];
  onSelectTask: (id: number) => void;
  soundsEnabled: boolean;
}

export const TaskSelector: React.FC<TaskSelectorProps> = ({
  currentTaskId,
  completedTaskIds,
  onSelectTask,
  soundsEnabled
}) => {
  return (
    <div className="w-full bg-white border-b border-slate-200 px-4 py-2 sticky top-0 z-20 shrink-0">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 overflow-x-auto scrollbar-none py-1">
        <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold uppercase text-slate-500 tracking-wider mr-1">
          <Sparkles size={14} className="text-amber-500" /> Карта миссий:
        </div>

        <div className="flex items-center gap-2">
          {TASKS.map((t) => {
            const isActive = t.id === currentTaskId;
            const isCompleted = completedTaskIds.includes(t.id);

            return (
              <button
                key={t.id}
                onClick={() => {
                  playClickSound(soundsEnabled);
                  onSelectTask(t.id);
                }}
                className={`relative group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 ring-2 ring-emerald-200'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {/* Number / Status icon */}
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black ${
                    isActive
                      ? 'bg-white text-emerald-600'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={13} className="text-emerald-600" /> : t.id}
                </span>

                <span className="whitespace-nowrap hidden sm:inline">
                  {t.badge.replace(/^.*? /, '')}
                </span>

                {isCompleted && (
                  <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
