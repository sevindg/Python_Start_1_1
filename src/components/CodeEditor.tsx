import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Sparkles, MoveLeft, MoveRight } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface CodeEditorProps {
  code: string;
  onChange: (val: string) => void;
  onReset: () => void;
  soundsEnabled: boolean;
  taskId: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onReset,
  soundsEnabled,
  taskId
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number>(16);

  const lines = code.split('\n');
  const lineCount = Math.max(lines.length, 1);

  // Tab key handler to insert 4 spaces or indent
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (!e.shiftKey) {
        // Insert 4 spaces
        const newCode = code.substring(0, start) + '    ' + code.substring(end);
        onChange(newCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);
      } else {
        // Dedent current line
        const before = code.substring(0, start);
        const lastLineBreak = before.lastIndexOf('\n');
        const lineStart = lastLineBreak === -1 ? 0 : lastLineBreak + 1;
        const currentLine = code.substring(lineStart, end);

        if (currentLine.startsWith('    ')) {
          const newCode = code.substring(0, lineStart) + currentLine.substring(4);
          onChange(newCode);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - 4);
          }, 0);
        } else if (currentLine.startsWith(' ')) {
          const newCode = code.substring(0, lineStart) + currentLine.substring(1);
          onChange(newCode);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - 1);
          }, 0);
        }
      }
    }
  };

  // Quick insertion helpers
  const insertText = (before: string, after: string = '') => {
    playClickSound(soundsEnabled);
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(code + before + after);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = code.substring(start, end);

    const newCode = code.substring(0, start) + before + selected + after + code.substring(end);
    onChange(newCode);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = end + before.length;
    }, 0);
  };

  // Helper to remove all leading spaces from all lines (especially useful for Task 4!)
  const removeAllLeadingIndents = () => {
    playClickSound(soundsEnabled);
    const modified = lines
      .map((line) => {
        // Keep comments intact or strip leading space before print
        return line.replace(/^\s+print\(/, 'print(').replace(/^\s+([a-zA-Z_])/, '$1');
      })
      .join('\n');
    onChange(modified);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Editor Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
          </div>
          <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5">
            <span className="text-sm">🐍</span> main.py
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Строк: {lineCount}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom controls */}
          <button
            onClick={() => {
              playClickSound(soundsEnabled);
              setFontSize((prev) => Math.max(13, prev - 2));
            }}
            title="Уменьшить шрифт"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => {
              playClickSound(soundsEnabled);
              setFontSize((prev) => Math.min(22, prev + 2));
            }}
            title="Увеличить шрифт"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
          >
            <ZoomIn size={16} />
          </button>

          {/* Reset code button */}
          <button
            onClick={() => {
              playClickSound(soundsEnabled);
              onReset();
            }}
            title="Сбросить код к исходному"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 bg-white transition"
          >
            <RotateCcw size={13} />
            <span className="hidden md:inline">Сбросить</span>
          </button>
        </div>
      </div>

      {/* Quick helper helper-buttons for kids */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-white border-b border-slate-200 overflow-x-auto text-xs scrollbar-none">
        <span className="text-slate-500 font-medium text-[11px] flex items-center gap-1 mr-1 shrink-0">
          <Sparkles size={12} className="text-amber-500" /> Помощники:
        </span>

        <button
          onClick={() => insertText('print("', '")')}
          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 active:scale-95 text-emerald-700 font-mono rounded font-semibold transition shrink-0"
          title="Вставить print(&quot;...&quot;)"
        >
          print("...")
        </button>

        <button
          onClick={() => insertText('"', '"')}
          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 active:scale-95 text-amber-700 font-mono rounded font-semibold transition shrink-0"
          title="Вставить кавычки"
        >
          " "
        </button>

        <button
          onClick={() => insertText('(', ')')}
          className="px-2 py-1 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 active:scale-95 text-cyan-700 font-mono rounded font-semibold transition shrink-0"
          title="Вставить скобки"
        >
          ( )
        </button>

        <button
          onClick={() => insertText(' = ""')}
          className="px-2 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 active:scale-95 text-purple-700 font-mono rounded font-semibold transition shrink-0"
          title="Вставить знак равно и кавычки"
        >
          = ""
        </button>

        {taskId === 4 && (
          <button
            onClick={removeAllLeadingIndents}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-medium rounded transition flex items-center gap-1 shrink-0 animate-pulse"
            title="Убрать лишние пробелы в начале строк"
          >
            <MoveLeft size={13} /> Убрать все отступы слева
          </button>
        )}
      </div>

      {/* Editor Body: Line numbers + Textarea */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Line Numbers column */}
        <div
          ref={lineNumbersRef}
          className="select-none py-3 px-2 sm:px-3 text-right bg-slate-50 text-slate-400 font-mono border-r border-slate-200 overflow-hidden"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
        >
          {lines.map((_, i) => (
            <div key={i} className="text-slate-400">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={(e) => {
            if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
          }}
          wrap="off"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          placeholder="# Пиши свой код на Python здесь..."
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: '1.6',
            tabSize: 4
          }}
          className="flex-1 w-full h-full p-3 font-mono bg-transparent text-slate-800 placeholder:text-slate-400 outline-none resize-none overflow-auto whitespace-pre selection:bg-emerald-200"
        />
      </div>

      {/* Editor Footer Status */}
      <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span>Python 3.12</span>
          <span>UTF-8</span>
        </div>
        <div className="text-slate-500">
          Подсказка: нажимай <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600">Tab</kbd> для отступа
        </div>
      </div>
    </div>
  );
};
