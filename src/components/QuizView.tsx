import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { QuizQuestion } from '../types';
import { QuizIllustration } from './QuizIllustration';
import { Mascot } from './Mascot';
import { CheckCircle2, XCircle, ArrowRight, Trophy, RotateCcw, Code, HelpCircle, Lightbulb, Check } from 'lucide-react';
import { playClickSound, playSuccessSound, playErrorSound, playFanfareSound } from '../utils/audio';

interface QuizViewProps {
  onCompleteQuiz: (score: number) => void;
  onGoToCode: () => void;
  soundsEnabled: boolean;
  savedScore?: number;
}

/** Цвета для пар в задании «соотнеси» */
const PAIR_COLORS = [
  { chip: 'bg-sky-500 text-white', ring: 'border-sky-400 bg-sky-50', text: 'text-sky-700' },
  { chip: 'bg-amber-500 text-white', ring: 'border-amber-400 bg-amber-50', text: 'text-amber-700' },
  { chip: 'bg-fuchsia-500 text-white', ring: 'border-fuchsia-400 bg-fuchsia-50', text: 'text-fuchsia-700' },
  { chip: 'bg-teal-500 text-white', ring: 'border-teal-400 bg-teal-50', text: 'text-teal-700' }
];

/** Перемешивает индексы так, чтобы порядок точно отличался от исходного */
function shuffledOrder(n: number, seed: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  let s = seed * 9301 + 49297;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (order.every((v, i) => v === i) && n > 1) order.push(order.shift()!);
  return order;
}

function questionHint(q: QuizQuestion): string {
  if (q.kind === 'multiple') return 'Выбери все правильные ответы';
  if (q.kind === 'match') return 'Нажми на правило, затем на его значение';
  return 'Выбери один правильный ответ';
}

export const QuizView: React.FC<QuizViewProps> = ({ onCompleteQuiz, onGoToCode, soundsEnabled }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Ответы ученика
  const [singleChoice, setSingleChoice] = useState<number | null>(null);
  const [multiChoice, setMultiChoice] = useState<number[]>([]);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [activeLeft, setActiveLeft] = useState<number>(0);

  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIndex];
  const total = QUIZ_QUESTIONS.length;

  const rightOrder = useMemo(
    () => (currentQ.kind === 'match' ? shuffledOrder(currentQ.pairs.length, currentQ.id) : []),
    [currentQ]
  );

  const celebrate = (big = false) => {
    try {
      confetti({ particleCount: big ? 100 : 40, spread: big ? 80 : 60, origin: { y: 0.7 } });
    } catch {
      // Ignore
    }
  };

  const finishCheck = (correct: boolean) => {
    setIsChecked(true);
    setIsCorrect(correct);
    if (correct) {
      setScore((prev) => prev + 1);
      playSuccessSound(soundsEnabled);
      celebrate();
    } else {
      playErrorSound(soundsEnabled);
    }
  };

  // --- Один ответ: проверяем сразу по клику
  const handleSingle = (idx: number) => {
    if (isChecked || currentQ.kind !== 'single') return;
    setSingleChoice(idx);
    finishCheck(idx === currentQ.correctIndex);
  };

  // --- Несколько ответов: отмечаем галочками
  const toggleMulti = (idx: number) => {
    if (isChecked) return;
    playClickSound(soundsEnabled);
    setMultiChoice((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  };

  // --- Соотнеси: выбираем правило, потом значение
  const pickLeft = (leftIdx: number) => {
    if (isChecked) return;
    playClickSound(soundsEnabled);
    if (matches[leftIdx] !== undefined) {
      // Повторный клик по соединённому правилу — разъединяем
      const next = { ...matches };
      delete next[leftIdx];
      setMatches(next);
    }
    setActiveLeft(leftIdx);
  };

  const pickRight = (rightIdx: number) => {
    if (isChecked || currentQ.kind !== 'match') return;
    playClickSound(soundsEnabled);
    const next: Record<number, number> = {};
    Object.entries(matches).forEach(([l, r]) => {
      if (r !== rightIdx && Number(l) !== activeLeft) next[Number(l)] = r;
    });
    next[activeLeft] = rightIdx;
    setMatches(next);
    // Переходим к следующему несоединённому правилу
    const nextFree = currentQ.pairs.findIndex((_, i) => next[i] === undefined);
    if (nextFree !== -1) setActiveLeft(nextFree);
  };

  const canCheck =
    currentQ.kind === 'multiple'
      ? multiChoice.length > 0
      : currentQ.kind === 'match'
      ? Object.keys(matches).length === currentQ.pairs.length
      : false;

  const handleCheck = () => {
    if (!canCheck || isChecked) return;
    if (currentQ.kind === 'multiple') {
      const correctSet = [...currentQ.correctIndices].sort().join(',');
      const chosen = [...multiChoice].sort().join(',');
      finishCheck(correctSet === chosen);
    } else if (currentQ.kind === 'match') {
      finishCheck(currentQ.pairs.every((_, i) => matches[i] === i));
    }
  };

  const resetAnswerState = () => {
    setSingleChoice(null);
    setMultiChoice([]);
    setMatches({});
    setActiveLeft(0);
    setIsChecked(false);
    setIsCorrect(false);
  };

  const handleNext = () => {
    playClickSound(soundsEnabled);
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetAnswerState();
    } else {
      setIsQuizFinished(true);
      onCompleteQuiz(score);
      playFanfareSound(soundsEnabled);
      celebrate(true);
    }
  };

  const handleRestart = () => {
    playClickSound(soundsEnabled);
    setCurrentIndex(0);
    setScore(0);
    setIsQuizFinished(false);
    resetAnswerState();
  };

  // ================= Экран итогов =================
  if (isQuizFinished) {
    const isPerfect = score === total;
    return (
      <div className="max-w-2xl mx-auto w-full">
        <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center shadow-xl shadow-emerald-100 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-52 h-52 bg-emerald-200/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-amber-200/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex justify-center mb-4">
            <div className="relative">
              <Mascot mood="celebrate" size={110} />
              <div className="absolute -bottom-1 -right-2 bg-amber-400 text-slate-900 font-black text-sm px-3 py-1 rounded-full shadow-md border-2 border-white flex items-center gap-1">
                <Trophy size={16} className="fill-current" />
                {score} / {total}
              </div>
            </div>
          </div>

          <h2 className="relative z-10 text-2xl sm:text-3xl font-black text-slate-800 font-['Comfortaa',sans-serif]">
            {isPerfect ? 'Идеальный результат! 🌟' : 'Тест пройден! 👏'}
          </h2>

          <p className="relative z-10 text-emerald-700 font-semibold text-sm sm:text-base mt-2 mb-6 max-w-md mx-auto">
            {isPerfect
              ? `Ты настоящий эрудит! Все ${total} вопросов отвечены верно!`
              : `Отличная разминка! Ты правильно ответил на ${score} из ${total} вопросов. Теперь ты готов к практике кода!`}
          </p>

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-2xl block mb-1">🧠</span>
              <span className="text-xs font-bold text-slate-700">Теория урока</span>
              <span className="text-[11px] text-emerald-600 block font-semibold">Освоена</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-2xl block mb-1">⭐</span>
              <span className="text-xs font-bold text-slate-700">Очки опыта</span>
              <span className="text-[11px] text-amber-600 block font-semibold">+{score * 20} XP</span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-2xl block mb-1">🚀</span>
              <span className="text-xs font-bold text-slate-700">Следующий шаг</span>
              <span className="text-[11px] text-sky-600 block font-semibold">Практика (8 миссий)</span>
            </div>
          </div>

          <div className="relative z-10 space-y-3">
            <button
              onClick={() => {
                playClickSound(soundsEnabled);
                onGoToCode();
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 active:scale-95 text-white font-black text-base sm:text-lg shadow-lg shadow-emerald-200 flex items-center justify-center gap-2.5 transition"
            >
              <Code size={22} />
              <span>Погнали писать код!</span>
              <ArrowRight size={22} />
            </button>
            <button
              onClick={handleRestart}
              className="w-full py-2.5 px-4 text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={14} /> Пройти тест ещё раз
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= Варианты ответов =================
  const renderOptions = () => {
    if (currentQ.kind === 'single') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = singleChoice === idx;
            const isRight = idx === currentQ.correctIndex;
            let style = 'bg-white border-slate-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50';
            if (isChecked) {
              if (isRight) style = 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-200';
              else if (isSelected) style = 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-200';
              else style = 'bg-slate-50 border-slate-200 text-slate-400';
            }
            return (
              <button
                key={idx}
                disabled={isChecked}
                onClick={() => handleSingle(idx)}
                className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left font-semibold text-[15px] transition-all active:scale-[0.98] min-w-0 ${style}`}
              >
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    isChecked && isRight
                      ? 'bg-emerald-500 text-white'
                      : isChecked && isSelected
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isChecked && isRight ? <CheckCircle2 size={18} /> : isChecked && isSelected ? <XCircle size={18} /> : String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 leading-snug break-words pt-1">{option}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (currentQ.kind === 'multiple') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {currentQ.options.map((option, idx) => {
            const isSelected = multiChoice.includes(idx);
            const isRight = currentQ.correctIndices.includes(idx);
            let style = isSelected
              ? 'bg-amber-50 border-amber-400 text-slate-800'
              : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50';
            let mark: React.ReactNode = isSelected ? <Check size={16} strokeWidth={3} /> : null;
            let markStyle = isSelected ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-300';
            if (isChecked) {
              if (isRight && isSelected) {
                style = 'bg-emerald-50 border-emerald-500 text-emerald-800';
                markStyle = 'bg-emerald-500 border-emerald-500 text-white';
              } else if (isRight && !isSelected) {
                style = 'bg-emerald-50/60 border-emerald-300 border-dashed text-emerald-800';
                markStyle = 'bg-white border-emerald-400 text-emerald-500';
                mark = <Check size={16} strokeWidth={3} />;
              } else if (!isRight && isSelected) {
                style = 'bg-rose-50 border-rose-400 text-rose-800';
                markStyle = 'bg-rose-500 border-rose-500 text-white';
                mark = <XCircle size={16} />;
              } else {
                style = 'bg-slate-50 border-slate-200 text-slate-400';
              }
            }
            return (
              <button
                key={idx}
                disabled={isChecked}
                onClick={() => toggleMulti(idx)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left font-semibold text-[15px] transition-all active:scale-[0.98] min-w-0 ${style}`}
              >
                <span className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition ${markStyle}`}>{mark}</span>
                <span className="flex-1 leading-snug break-words">{option}</span>
              </button>
            );
          })}
        </div>
      );
    }

    // kind === 'match'
    const leftForRight: Record<number, number> = {};
    Object.entries(matches).forEach(([l, r]) => (leftForRight[r] = Number(l)));

    return (
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 md:gap-5">
        {/* Левый столбик: правила */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Правило</div>
          {currentQ.pairs.map((pair, i) => {
            const color = PAIR_COLORS[i % PAIR_COLORS.length];
            const isLinked = matches[i] !== undefined;
            const isActive = !isChecked && activeLeft === i;
            const pairOk = isChecked && matches[i] === i;
            return (
              <button
                key={i}
                disabled={isChecked}
                onClick={() => pickLeft(i)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl border-2 text-left font-bold text-sm transition min-w-0 ${
                  isChecked
                    ? pairOk
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-rose-400 bg-rose-50 text-rose-800'
                    : isActive
                    ? `${color.ring} ring-4 ring-offset-0 ring-slate-100 text-slate-800`
                    : isLinked
                    ? `${color.ring} text-slate-800`
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${color.chip}`}>{i + 1}</span>
                <span className="flex-1 leading-snug break-words">{pair.left}</span>
                {isChecked && (pairOk ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> : <XCircle size={18} className="text-rose-500 shrink-0" />)}
              </button>
            );
          })}
        </div>

        {/* Правый столбик: значения (перемешаны) */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Значение</div>
          {rightOrder.map((rightIdx) => {
            const linkedLeft = leftForRight[rightIdx];
            const isLinked = linkedLeft !== undefined;
            const color = isLinked ? PAIR_COLORS[linkedLeft % PAIR_COLORS.length] : null;
            return (
              <button
                key={rightIdx}
                disabled={isChecked}
                onClick={() => pickRight(rightIdx)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl border-2 text-left font-semibold text-sm transition min-w-0 ${
                  isLinked && color ? `${color.ring} text-slate-800` : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 border-2 ${
                    isLinked && color ? `${color.chip} border-transparent` : 'border-dashed border-slate-300 text-slate-300'
                  }`}
                >
                  {isLinked ? linkedLeft + 1 : '?'}
                </span>
                <span className="flex-1 leading-snug break-words">{currentQ.pairs[rightIdx].right}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Подсказка о правильных парах, если ученик ошибся в «соотнеси»
  const renderMatchSolution = () => {
    if (currentQ.kind !== 'match' || isCorrect) return null;
    return (
      <ul className="space-y-1.5 text-sm">
        {currentQ.pairs.map((p, i) => (
          <li key={i} className="flex gap-2 text-slate-700">
            <span className="font-bold shrink-0">{p.left}</span>
            <span className="text-slate-400">→</span>
            <span>{p.right}</span>
          </li>
        ))}
      </ul>
    );
  };

  // ================= Экран вопроса =================
  return (
    <div className="w-full h-full lg:max-h-[800px] max-w-[1500px] mx-auto bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/60 flex flex-col overflow-hidden">
      {/* Шапка: номер вопроса и прогресс */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-7 py-3 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm border border-amber-200">
            {currentIndex + 1}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Вопрос {currentIndex + 1} из {total}
            </div>
            <div className="text-xs text-emerald-600 font-semibold">Правильных ответов: {score}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {QUIZ_QUESTIONS.map((q, idx) => (
            <div
              key={q.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-amber-400 w-8' : idx < currentIndex ? 'bg-emerald-400 w-4' : 'bg-slate-200 w-4'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => {
            playClickSound(soundsEnabled);
            onGoToCode();
          }}
          className="text-xs font-semibold text-slate-500 hover:text-sky-700 flex items-center gap-1 bg-white hover:bg-sky-50 px-3 py-1.5 rounded-lg border border-slate-200 transition"
        >
          <Code size={13} />
          <span>Сразу к коду →</span>
        </button>
      </div>

      {/* Тело: слева вопрос, справа проверка и результат */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        {/* Левая колонка */}
        <div className="min-h-0 overflow-y-auto p-5 sm:p-7 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
              <HelpCircle size={13} /> Тема: {currentQ.topic}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{questionHint(currentQ)}</span>
          </div>

          <h3 className="text-xl sm:text-[26px] font-black text-slate-800 font-['Comfortaa',sans-serif] leading-snug break-words">
            {currentQ.question}
          </h3>

          {renderOptions()}
        </div>

        {/* Правая колонка */}
        <div className="min-h-0 border-t lg:border-t-0 lg:border-l border-slate-100 bg-slate-50/60 flex flex-col">
          {!isChecked ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-4">
              <Mascot mood="thinking" size={96} />
              <div>
                <p className="font-bold text-slate-700">
                  {currentQ.kind === 'single'
                    ? 'Нажми на ответ, который считаешь правильным'
                    : currentQ.kind === 'multiple'
                    ? 'Отметь все подходящие варианты и нажми «Проверить»'
                    : 'Соедини все правила со значениями и нажми «Проверить»'}
                </p>
                <p className="text-sm text-slate-500 mt-1">Здесь появится результат и объяснение</p>
              </div>
              {currentQ.kind !== 'single' && (
                <button
                  onClick={handleCheck}
                  disabled={!canCheck}
                  className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:brightness-105 active:scale-95 text-white font-black text-base shadow-lg shadow-amber-200 flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <CheckCircle2 size={20} />
                  Проверить
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4">
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className={`flex items-center gap-2 font-black text-base ${isCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 size={20} /> Правильно! +20 XP ⭐
                      </>
                    ) : (
                      <>
                        <XCircle size={20} /> Ничего страшного, давай запомним:
                      </>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">{currentQ.explanation}</p>
                  {renderMatchSolution()}
                </div>

                <div className="flex gap-2.5 text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                  <Lightbulb size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{currentQ.fact}</span>
                </div>

                <QuizIllustration type={currentQ.illustrationType} />
              </div>

              <div className="p-4 sm:p-5 border-t border-slate-100 bg-white">
                <button
                  onClick={handleNext}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 active:scale-95 text-white font-black text-base shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition"
                >
                  <span>{currentIndex < total - 1 ? 'Следующий вопрос' : 'Посмотреть итоги'}</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
