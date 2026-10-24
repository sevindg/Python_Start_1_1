import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Mascot } from './Mascot';
import { ArrowRight, Star, Sparkles, Award } from 'lucide-react';
import { playClickSound, playSuccessSound } from '../utils/audio';

interface SuccessModalProps {
  isOpen: boolean;
  taskId: number;
  message: string;
  isLastTask: boolean;
  onNextTask: () => void;
  onClose: () => void;
  onOpenCertificate: () => void;
  soundsEnabled: boolean;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  taskId,
  message,
  isLastTask,
  onNextTask,
  onClose,
  onOpenCertificate,
  soundsEnabled
}) => {
  useEffect(() => {
    if (isOpen) {
      playSuccessSound(soundsEnabled);

      // Multi-stage confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 250);
      } catch {
        // Ignore if canvas-confetti fails
      }
    }
  }, [isOpen, soundsEnabled]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white border-2 border-emerald-200 rounded-3xl p-6 text-center shadow-2xl overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-emerald-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-amber-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Mascot celebrating */}
        <div className="relative z-10 flex justify-center mb-3">
          <div className="relative">
            <Mascot mood="celebrate" size={110} />
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 font-black text-xs px-2.5 py-0.5 rounded-full shadow flex items-center gap-1 border-2 border-white">
              <Star size={12} className="fill-current" /> +50 XP
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="relative z-10 text-2xl font-black text-slate-800 font-['Comfortaa',sans-serif] flex items-center justify-center gap-2">
          Миссия {taskId} выполнена! <Sparkles className="text-amber-400 animate-spin" size={20} />
        </h3>

        {/* Message */}
        <p className="relative z-10 text-emerald-700 font-semibold text-sm mt-2 mb-6 px-4 leading-relaxed">
          {message}
        </p>

        {/* Buttons */}
        <div className="relative z-10 space-y-2.5">
          {!isLastTask ? (
            <button
              onClick={() => {
                playClickSound(soundsEnabled);
                onNextTask();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 active:scale-95 text-white font-black text-base shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition"
            >
              <span>Следующее задание</span>
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={() => {
                playClickSound(soundsEnabled);
                onClose();
                onOpenCertificate();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:brightness-110 active:scale-95 text-slate-900 font-black text-base shadow-lg shadow-amber-200 flex items-center justify-center gap-2 transition"
            >
              <Award size={22} className="fill-current" />
              <span>Получить Сертификат!</span>
            </button>
          )}

          <button
            onClick={() => {
              playClickSound(soundsEnabled);
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold text-xs transition"
          >
            Остаться в этом задании
          </button>
        </div>
      </div>
    </div>
  );
};
