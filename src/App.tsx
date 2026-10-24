import React, { useState, useEffect, useMemo } from 'react';
import { TASKS } from './data/tasks';
import { RunResult, ValidationResult } from './types';
import { runPythonCode } from './utils/pythonRunner';
import { validateTask } from './utils/validator';
import { playErrorSound, playFanfareSound } from './utils/audio';

import { Navbar } from './components/Navbar';
import { TaskSelector } from './components/TaskSelector';
import { TaskInstructions } from './components/TaskInstructions';
import { CodeEditor } from './components/CodeEditor';
import { TerminalOutput } from './components/TerminalOutput';
import { SuccessModal } from './components/SuccessModal';
import { CertificateModal } from './components/CertificateModal';
import { Mascot } from './components/Mascot';
import { QuizView } from './components/QuizView';
import { BookOpen } from 'lucide-react';

const STORAGE_KEY = 'python_kids_trainer_progress_v2';

export default function App() {
  // Navigation mode: 'quiz' (intro test) | 'code' (hands-on tasks)
  const [currentMode, setCurrentMode] = useState<'quiz' | 'code'>('quiz');
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Coding tasks state
  const [currentTaskId, setCurrentTaskId] = useState<number>(1);
  const [completedTaskIds, setCompletedTaskIds] = useState<number[]>([]);
  const [xp, setXp] = useState<number>(0);
  const [soundsEnabled, setSoundsEnabled] = useState<boolean>(true);
  const [studentName, setStudentName] = useState<string>('Алиса');
  const [codeState, setCodeState] = useState<Record<number, string>>({});

  // Runtime state
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.completedTaskIds) setCompletedTaskIds(parsed.completedTaskIds);
        if (parsed.currentTaskId) setCurrentTaskId(parsed.currentTaskId);
        if (parsed.xp !== undefined) setXp(parsed.xp);
        if (parsed.soundsEnabled !== undefined) setSoundsEnabled(parsed.soundsEnabled);
        if (parsed.studentName) setStudentName(parsed.studentName);
        if (parsed.codeState) setCodeState(parsed.codeState);
        if (parsed.quizCompleted !== undefined) {
          setQuizCompleted(parsed.quizCompleted);
          // If quiz is already completed, default to code mode
          if (parsed.quizCompleted) {
            setCurrentMode('code');
          }
        }
        if (parsed.quizScore !== undefined) setQuizScore(parsed.quizScore);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          completedTaskIds,
          currentTaskId,
          xp,
          soundsEnabled,
          studentName,
          codeState,
          quizCompleted,
          quizScore
        })
      );
    } catch {
      // Ignore storage errors
    }
  }, [completedTaskIds, currentTaskId, xp, soundsEnabled, studentName, codeState, quizCompleted, quizScore]);

  // Current task definition
  const currentTask = useMemo(() => {
    return TASKS.find((t) => t.id === currentTaskId) || TASKS[0];
  }, [currentTaskId]);

  // Current code in editor
  const currentCode = useMemo(() => {
    if (codeState[currentTaskId] !== undefined) {
      return codeState[currentTaskId];
    }
    return currentTask.initialCode;
  }, [codeState, currentTaskId, currentTask]);

  // Mascot mood reaction
  const mascotMood = useMemo<'happy' | 'thinking' | 'celebrate' | 'oops'>(() => {
    if (isRunning) return 'thinking';
    if (validationResult?.isSuccess) return 'celebrate';
    if (validationResult && !validationResult.isSuccess) return 'oops';
    return 'happy';
  }, [isRunning, validationResult]);

  // Quiz completion handler
  const handleQuizComplete = (score: number) => {
    setQuizScore(score);
    setQuizCompleted(true);
    setXp((prev) => prev + score * 20);
  };

  // Code change handler
  const handleCodeChange = (newCode: string) => {
    setCodeState((prev) => ({
      ...prev,
      [currentTaskId]: newCode
    }));
  };

  // Reset current task code
  const handleResetTaskCode = () => {
    setCodeState((prev) => ({
      ...prev,
      [currentTaskId]: currentTask.initialCode
    }));
    setRunResult(null);
    setValidationResult(null);
  };

  // Reset entire progress
  const handleResetAll = () => {
    setCompletedTaskIds([]);
    setCurrentTaskId(1);
    setXp(0);
    setCodeState({});
    setQuizCompleted(false);
    setQuizScore(0);
    setCurrentMode('quiz');
    setRunResult(null);
    setValidationResult(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  // Select task
  const handleSelectTask = (taskId: number) => {
    setCurrentTaskId(taskId);
    setRunResult(null);
    setValidationResult(null);
  };

  // Run code without validation
  const handleRunCode = async () => {
    setIsRunning(true);
    setValidationResult(null);
    try {
      const result = await runPythonCode(currentCode);
      setRunResult(result);
      if (result.error) {
        playErrorSound(soundsEnabled);
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Run and validate code (Auto-Check)
  const handleValidateCode = async () => {
    setIsRunning(true);
    try {
      const result = await runPythonCode(currentCode);
      setRunResult(result);

      const validation = validateTask(currentTaskId, result, currentCode);
      setValidationResult(validation);

      if (validation.isSuccess) {
        // Mark task as completed
        if (!completedTaskIds.includes(currentTaskId)) {
          const updated = [...completedTaskIds, currentTaskId];
          setCompletedTaskIds(updated);
          setXp((prev) => prev + 50);

          // Check if this completes all tasks!
          if (updated.length === TASKS.length) {
            setTimeout(() => {
              playFanfareSound(soundsEnabled);
            }, 500);
          }
        }
        setIsSuccessModalOpen(true);
      } else {
        playErrorSound(soundsEnabled);
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Move to next task
  const handleNextTask = () => {
    setIsSuccessModalOpen(false);
    if (currentTaskId < TASKS.length) {
      setCurrentTaskId(currentTaskId + 1);
      setRunResult(null);
      setValidationResult(null);
    } else {
      setIsCertificateModalOpen(true);
    }
  };

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to validate in code mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
      }
      if (currentMode === 'code' && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleValidateCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMode, currentCode, currentTaskId, completedTaskIds, soundsEnabled]);

  const isCompleted = completedTaskIds.includes(currentTaskId);
  const isLastTask = currentTaskId === TASKS.length;

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-slate-100 text-slate-800 antialiased font-['Nunito',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        completedCount={completedTaskIds.length}
        totalCount={TASKS.length}
        xp={xp}
        soundsEnabled={soundsEnabled}
        onToggleSounds={() => setSoundsEnabled((prev) => !prev)}
        onOpenCertificate={() => setIsCertificateModalOpen(true)}
        onResetAll={handleResetAll}
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        quizCompleted={quizCompleted}
        quizScore={quizScore}
      />

      {/* Режим 1: тест по уроку */}
      {currentMode === 'quiz' ? (
        <main className="flex-1 lg:min-h-0 p-3 sm:p-4 lg:p-5 w-full max-w-[1600px] mx-auto flex flex-col items-center justify-center">
          <QuizView
            onCompleteQuiz={handleQuizComplete}
            onGoToCode={() => setCurrentMode('code')}
            soundsEnabled={soundsEnabled}
            savedScore={quizScore}
          />
        </main>
      ) : (
        /* Режим 2: практика кода */
        <>
          <TaskSelector
            currentTaskId={currentTaskId}
            completedTaskIds={completedTaskIds}
            onSelectTask={handleSelectTask}
            soundsEnabled={soundsEnabled}
          />

          <main className="flex-1 lg:min-h-0 p-3 sm:p-4 w-full max-w-[1600px] mx-auto flex flex-col gap-3">
            {/* Панель миссии: кнопка шторки, цель и совет Питончика */}
            <div className="shrink-0 bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-3 flex flex-wrap items-center gap-3 shadow-sm">
              <button
                onClick={() => setIsDrawerOpen((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition active:scale-95 shrink-0 ${
                  isDrawerOpen
                    ? 'bg-sky-600 text-white'
                    : 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                }`}
                title="Показать или спрятать задание (Esc — закрыть)"
              >
                <BookOpen size={18} />
                <span>{isDrawerOpen ? 'Спрятать задание' : 'Задание и подсказки'}</span>
              </button>

              <div className="min-w-0 flex-1 basis-64">
                <div className="text-sm font-black text-slate-800 truncate">{currentTask.title}</div>
                <div className="text-xs text-slate-500 truncate">
                  <span className="font-semibold text-emerald-700">Цель:</span>{' '}
                  {currentTask.expectedDescription.replace(/\n/g, ' ')}
                </div>
              </div>

              <div className="flex items-center gap-2.5 min-w-0 basis-80 flex-1 bg-emerald-50/70 border border-emerald-100 rounded-xl px-2.5 py-1.5">
                <Mascot mood={mascotMood} size={38} />
                <div className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug min-w-0">
                  {validationResult?.isSuccess
                    ? 'Отличная работа! Можешь переходить к следующему заданию!'
                    : validationResult && !validationResult.isSuccess
                    ? validationResult.kidAdvice || 'Не переживай, попробуй ещё раз или загляни в подсказки!'
                    : isCompleted
                    ? 'Это задание уже решено! Можешь улучшить код или перейти дальше.'
                    : 'Открой задание, пиши код слева и нажимай «Проверить решение»!'}
                </div>
              </div>

              <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500 shrink-0">
                <span>Проверка:</span>
                <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-mono text-[11px]">
                  Ctrl + Enter
                </kbd>
              </div>
            </div>

            {/* Два рабочих окна: код и результат */}
            <div className="flex-1 lg:min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="min-h-[420px] lg:min-h-0">
                <CodeEditor
                  code={currentCode}
                  onChange={handleCodeChange}
                  onReset={handleResetTaskCode}
                  soundsEnabled={soundsEnabled}
                  taskId={currentTaskId}
                />
              </div>
              <div className="min-h-[360px] lg:min-h-0">
                <TerminalOutput
                  runResult={runResult}
                  validationResult={validationResult}
                  isRunning={isRunning}
                  onRun={handleRunCode}
                  onValidate={handleValidateCode}
                  onClear={() => {
                    setRunResult(null);
                    setValidationResult(null);
                  }}
                  soundsEnabled={soundsEnabled}
                  isCompleted={isCompleted}
                />
              </div>
            </div>
          </main>

          {/* Шторка с заданием и подсказками */}
          <div
            className={`fixed inset-0 z-30 bg-slate-900/20 transition-opacity duration-300 ${
              isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside
            className={`fixed top-0 left-0 z-40 h-full w-[min(460px,92vw)] transition-transform duration-300 ease-out ${
              isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            aria-hidden={!isDrawerOpen}
          >
            <TaskInstructions
              key={currentTask.id}
              task={currentTask}
              onApplySolution={(code) => handleCodeChange(code)}
              onApplyTemplate={(code) => handleCodeChange(code)}
              soundsEnabled={soundsEnabled}
              onClose={() => setIsDrawerOpen(false)}
            />
            {/* Язычок шторки — виден, когда шторка закрыта */}
            <button
              onClick={() => setIsDrawerOpen((v) => !v)}
              className={`absolute top-1/2 -translate-y-1/2 left-full flex flex-col items-center gap-1.5 py-4 px-1.5 rounded-r-xl bg-sky-600 hover:bg-sky-700 text-white shadow-lg transition ${
                isDrawerOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              title="Открыть задание"
            >
              <BookOpen size={16} />
              <span className="text-[11px] font-bold [writing-mode:vertical-rl] rotate-180 tracking-wider">ЗАДАНИЕ</span>
            </button>
          </aside>
        </>
      )}

      {/* Success Modal upon completing a task */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        taskId={currentTaskId}
        message={validationResult?.message || 'Задание успешно выполнено!'}
        isLastTask={isLastTask}
        onNextTask={handleNextTask}
        onClose={() => setIsSuccessModalOpen(false)}
        onOpenCertificate={() => setIsCertificateModalOpen(true)}
        soundsEnabled={soundsEnabled}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        studentName={studentName}
        onUpdateName={setStudentName}
        completedCount={completedTaskIds.length}
        totalCount={TASKS.length}
        soundsEnabled={soundsEnabled}
        quizCompleted={quizCompleted}
      />
    </div>
  );
}
