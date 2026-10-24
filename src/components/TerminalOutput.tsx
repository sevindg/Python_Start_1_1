import React from 'react';
import { Play, CheckCircle2, AlertCircle, Trash2, Clock, Sparkles } from 'lucide-react';
import { RunResult, ValidationResult } from '../types';
import { Mascot } from './Mascot';
import { playClickSound } from '../utils/audio';

interface TerminalOutputProps {
  runResult: RunResult | null;
  validationResult: ValidationResult | null;
  isRunning: boolean;
  onRun: () => void;
  onValidate: () => void;
  onClear: () => void;
  soundsEnabled: boolean;
  isCompleted: boolean;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  runResult,
  validationResult,
  isRunning,
  onRun,
  onValidate,
  onClear,
  soundsEnabled,
  isCompleted
}) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono flex items-center gap-1.5">
            📺 Консоль вывода
          </span>
          {runResult?.executionTimeMs !== undefined && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-2 font-mono">
              <Clock size={11} /> {runResult.executionTimeMs} мс
            </span>
          )}
        </div>

        <button
          onClick={() => {
            playClickSound(soundsEnabled);
            onClear();
          }}
          title="Очистить терминал"
          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Terminal Screen */}
      <div className="flex-1 p-4 font-mono text-sm overflow-y-auto min-h-[160px] bg-white text-slate-800 selection:bg-emerald-100">
        {!runResult && !validationResult && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Mascot mood="thinking" size={72} />
            <p className="mt-3 text-sm font-sans font-semibold text-slate-600">
              Нажми зелёную кнопку <span className="text-emerald-600 font-bold">«✔ Проверить решение»</span> или <span className="text-sky-600 font-bold">«▶ Запустить код»</span>!
            </p>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Питончик выполнит твой код и покажет результат здесь
            </p>
          </div>
        )}

        {/* Standard Output */}
        {runResult && runResult.output && (
          <div className="mb-4">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              &gt; Вывод программы (print):
            </div>
            <pre className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-800 whitespace-pre overflow-x-auto text-sm leading-relaxed">
              {runResult.output}
            </pre>
          </div>
        )}

        {/* Runtime/Syntax Error Message */}
        {runResult && runResult.error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase mb-1">
              <AlertCircle size={15} /> Ошибка в коде (Error):
            </div>
            <pre className="font-mono text-xs text-rose-700 whitespace-pre-wrap break-words leading-relaxed">
              {runResult.error}
            </pre>
          </div>
        )}

        {/* Validation Result Box */}
        {validationResult && (
          <div
            className={`mt-3 p-4 rounded-xl border transition-all ${
              validationResult.isSuccess
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {validationResult.isSuccess ? (
                  <CheckCircle2 size={24} className="text-emerald-600" />
                ) : (
                  <AlertCircle size={24} className="text-amber-500" />
                )}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0 font-sans">
                <div className="font-bold text-base flex items-center gap-2">
                  {validationResult.message}
                </div>

                {validationResult.kidAdvice && (
                  <div className="text-sm text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                    {validationResult.kidAdvice}
                  </div>
                )}

                {/* Compare Expected vs Actual if failed */}
                {!validationResult.isSuccess && (validationResult.expectedOutput || validationResult.actualOutput) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 text-xs font-mono">
                    {validationResult.expectedOutput && (
                      <div className="bg-white p-2 rounded border border-emerald-200 min-w-0">
                        <span className="text-emerald-700 block font-sans font-semibold mb-1">
                          Ожидалось получить:
                        </span>
                        <div className="text-emerald-900 whitespace-pre-wrap break-words">
                          {validationResult.expectedOutput}
                        </div>
                      </div>
                    )}
                    {validationResult.actualOutput && (
                      <div className="bg-white p-2 rounded border border-rose-200 min-w-0">
                        <span className="text-rose-700 block font-sans font-semibold mb-1">
                          Твоя программа вывела:
                        </span>
                        <div className="text-rose-900 whitespace-pre-wrap break-words">
                          {validationResult.actualOutput}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => {
            playClickSound(soundsEnabled);
            onRun();
          }}
          disabled={isRunning}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-sky-50 active:scale-95 text-sky-700 font-bold rounded-xl border border-sky-300 transition shadow-sm disabled:opacity-50"
        >
          <Play size={16} className="fill-current" />
          <span>Запустить код</span>
        </button>

        <button
          onClick={() => {
            playClickSound(soundsEnabled);
            onValidate();
          }}
          disabled={isRunning}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
            isCompleted
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200'
              : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-105 text-white shadow-emerald-200'
          }`}
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Проверяю...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              <span>{isCompleted ? 'Проверить повторно' : 'Проверить решение'}</span>
              <Sparkles size={16} className="text-amber-200" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
