import React from 'react';
import { IllustrationType } from '../types';

interface QuizIllustrationProps {
  type: IllustrationType;
  className?: string;
}

/** Плашка с иконкой и подписью, текст всегда по центру и помещается */
const Badge: React.FC<{ x: number; y: number; w: number; icon: string; label: string; stroke: string; color: string }> = ({
  x,
  y,
  w,
  icon,
  label,
  stroke,
  color
}) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect width={w} height="32" rx="10" fill="#ffffff" stroke={stroke} strokeWidth="1.8" />
    <text x="16" y="21" fontSize="14" textAnchor="middle">
      {icon}
    </text>
    <text x={(w + 28) / 2} y="20.5" fontSize="10.5" fontWeight="800" fill={color} textAnchor="middle">
      {label}
    </text>
  </g>
);

export const QuizIllustration: React.FC<QuizIllustrationProps> = ({ type, className = '' }) => {
  return (
    <div
      className={`relative w-full h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50 border border-slate-200 flex items-center justify-center p-2 ${className}`}
    >
      {type === 'algorithm' && (
        <svg viewBox="0 0 400 220" className="w-full h-full select-none" fill="none">
          <defs>
            <pattern id="grid-alg" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            </pattern>
            <linearGradient id="gold-path" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <radialGradient id="chest-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="220" fill="url(#grid-alg)" />

          <rect x="40" y="30" width="80" height="20" rx="6" fill="#cbd5e1" />
          <rect x="160" y="30" width="120" height="20" rx="6" fill="#cbd5e1" />
          <rect x="40" y="80" width="20" height="90" rx="6" fill="#cbd5e1" />
          <rect x="90" y="80" width="90" height="20" rx="6" fill="#cbd5e1" />
          <rect x="210" y="80" width="20" height="70" rx="6" fill="#cbd5e1" />
          <rect x="130" y="140" width="140" height="20" rx="6" fill="#cbd5e1" />
          <rect x="300" y="30" width="20" height="130" rx="6" fill="#cbd5e1" />

          <path
            d="M 60 190 L 60 60 L 140 60 L 140 115 L 185 115 L 185 180 L 260 180 L 260 85 L 345 85 L 345 130"
            stroke="url(#gold-path)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 4"
          />

          <circle cx="60" cy="190" r="16" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="2.5" />
          <text x="60" y="195" fontSize="16" textAnchor="middle">🤖</text>
          <text x="60" y="216" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#0369a1">СТАРТ</text>

          <circle cx="345" cy="135" r="45" fill="url(#chest-glow)" />
          <rect x="325" y="120" width="40" height="28" rx="6" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
          <path d="M 323 120 Q 345 105 367 120 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
          <circle cx="345" cy="130" r="4" fill="#fef3c7" />
          <text x="312" y="105" fontSize="16">✨</text>
          <text x="370" y="115" fontSize="16">⭐</text>
        </svg>
      )}

      {type === 'program' && (
        <svg viewBox="0 0 400 220" className="w-full h-full select-none" fill="none">
          <defs>
            <linearGradient id="neon-prog" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>

          <rect x="65" y="18" width="270" height="48" rx="14" fill="#ffffff" stroke="url(#neon-prog)" strokeWidth="2.5" />
          <text x="200" y="51" fontSize="24" fontWeight="900" textAnchor="middle" fill="url(#neon-prog)" letterSpacing="4">
            ПРОГРАММА
          </text>

          <g transform="translate(30, 88)">
            <rect width="104" height="32" rx="8" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
            <text x="52" y="21" fontSize="12" fontWeight="bold" fontFamily="monospace" fill="#047857" textAnchor="middle">
              print("Привет")
            </text>
          </g>
          <g transform="translate(150, 88)">
            <rect width="100" height="32" rx="8" fill="#ecfeff" stroke="#06b6d4" strokeWidth="1.5" />
            <text x="50" y="21" fontSize="12" fontWeight="bold" fontFamily="monospace" fill="#0e7490" textAnchor="middle">
              speed = 100
            </text>
          </g>
          <g transform="translate(266, 88)">
            <rect width="104" height="32" rx="8" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="1.5" />
            <text x="52" y="21" fontSize="12" fontWeight="bold" fontFamily="monospace" fill="#6d28d9" textAnchor="middle">
              go_forward()
            </text>
          </g>

          <g transform="translate(145, 140)">
            <rect x="0" y="40" width="110" height="8" rx="3" fill="#94a3b8" />
            <rect x="20" y="0" width="70" height="42" rx="6" fill="#ffffff" stroke="#64748b" strokeWidth="2" />
            <rect x="25" y="5" width="60" height="32" rx="3" fill="#e0f2fe" />
            <text x="55" y="26" fontSize="12" textAnchor="middle" fill="#0369a1" fontWeight="bold">🐍 Python</text>
          </g>
          <text x="95" y="190" fontSize="28">🧒</text>
          <text x="285" y="190" fontSize="28">⚡</text>
        </svg>
      )}

      {type === 'industry' && (
        <svg viewBox="0 0 400 220" className="w-full h-full select-none" fill="none">
          <ellipse cx="200" cy="110" rx="150" ry="72" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="5 5" />
          <circle cx="200" cy="110" r="36" fill="#ffffff" stroke="#3b82f6" strokeWidth="3" />
          <text x="200" y="120" fontSize="30" textAnchor="middle">🐍</text>

          <Badge x={55} y={22} w={84} icon="🚀" label="NASA" stroke="#ef4444" color="#b91c1c" />
          <Badge x={262} y={22} w={88} icon="🔍" label="Google" stroke="#3b82f6" color="#1d4ed8" />
          <Badge x={10} y={94} w={92} icon="🔴" label="Яндекс" stroke="#f97316" color="#c2410c" />
          <Badge x={298} y={94} w={94} icon="▶️" label="YouTube" stroke="#f43f5e" color="#be123c" />
          <Badge x={55} y={166} w={84} icon="🍏" label="Apple" stroke="#64748b" color="#334155" />
          <Badge x={250} y={166} w={104} icon="💎" label="The Sims 4" stroke="#10b981" color="#047857" />
        </svg>
      )}

      {type === 'spheres' && (
        <svg viewBox="0 0 400 220" className="w-full h-full select-none" fill="none">
          {[
            { x: 8, icon: '🌐', title: 'САЙТЫ', sub: 'Django • Flask', stroke: '#0284c7', color: '#0369a1', bg: '#f0f9ff' },
            { x: 106, icon: '🧠', title: 'ИИ И ДАННЫЕ', sub: 'Нейросети', stroke: '#8b5cf6', color: '#6d28d9', bg: '#f5f3ff' },
            { x: 204, icon: '🤖', title: 'РОБОТЫ', sub: 'Автоматизация', stroke: '#10b981', color: '#047857', bg: '#ecfdf5' },
            { x: 302, icon: '🎨', title: '3D-ГРАФИКА', sub: 'Blender', stroke: '#f97316', color: '#c2410c', bg: '#fff7ed' }
          ].map((s) => (
            <g key={s.title} transform={`translate(${s.x}, 40)`}>
              <rect width="90" height="140" rx="16" fill="#ffffff" stroke={s.stroke} strokeWidth="2" />
              <circle cx="45" cy="42" r="24" fill={s.bg} />
              <text x="45" y="51" fontSize="24" textAnchor="middle">{s.icon}</text>
              <text x="45" y="90" fontSize="10.5" fontWeight="900" textAnchor="middle" fill={s.color}>{s.title}</text>
              <rect x="8" y="104" width="74" height="20" rx="6" fill={s.bg} stroke={s.stroke} strokeWidth="1" />
              <text x="45" y="118" fontSize="9" fontWeight="bold" textAnchor="middle" fill={s.color}>{s.sub}</text>
            </g>
          ))}
        </svg>
      )}

      {type === 'rules' && (
        <svg viewBox="0 0 400 220" className="w-full h-full select-none" fill="none">
          <text x="200" y="22" fontSize="13" fontWeight="900" textAnchor="middle" fill="#b45309" letterSpacing="1">
            👑 ТРИ ЗОЛОТЫХ ПРАВИЛА КОДЕРА 👑
          </text>
          {[
            { y: 36, n: '1', title: 'ПРАВИЛО НАЧАЛА СТРОКИ', sub: 'Команда — в самом начале строки, без пробелов', stroke: '#06b6d4', fill: '#0891b2', color: '#0e7490', icon: '📏' },
            { y: 92, n: '2', title: 'ПРАВИЛО ПОРЯДКА', sub: 'Компьютер читает команды сверху вниз', stroke: '#f59e0b', fill: '#d97706', color: '#b45309', icon: '⬇️' },
            { y: 148, n: '3', title: 'ПРАВИЛО ТОЧНОСТИ', sub: 'Важен каждый символ: кавычки и скобки', stroke: '#ef4444', fill: '#dc2626', color: '#b91c1c', icon: '🎯' }
          ].map((r) => (
            <g key={r.n} transform={`translate(20, ${r.y})`}>
              <rect width="360" height="48" rx="12" fill="#ffffff" stroke={r.stroke} strokeWidth="2" />
              <rect x="10" y="9" width="30" height="30" rx="8" fill={r.fill} />
              <text x="25" y="30" fontSize="16" fontWeight="bold" fill="#ffffff" textAnchor="middle">{r.n}</text>
              <text x="52" y="22" fontSize="12" fontWeight="900" fill={r.color}>{r.title}</text>
              <text x="52" y="38" fontSize="10.5" fill="#475569">{r.sub}</text>
              <text x="332" y="31" fontSize="18">{r.icon}</text>
            </g>
          ))}
        </svg>
      )}

      {type === 'automation' && (
        <svg viewBox="0 0 400 220" className="w-full h-full select-none" fill="none">
          <g transform="translate(30, 40)">
            <rect width="150" height="140" rx="16" fill="#ffffff" stroke="#0ea5e9" strokeWidth="2" />
            <text x="75" y="38" fontSize="26" textAnchor="middle">✉️</text>
            <text x="75" y="66" fontSize="11" fontWeight="900" textAnchor="middle" fill="#0369a1">СОРТИРОВКА ПИСЕМ</text>
            <text x="75" y="84" fontSize="9.5" textAnchor="middle" fill="#64748b">Миллионы писем в секунду</text>
            <rect x="25" y="100" width="100" height="22" rx="6" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1" />
            <text x="75" y="115" fontSize="9.5" fontWeight="bold" textAnchor="middle" fill="#0369a1">Почтовые боты</text>
          </g>

          <path d="M 188 110 L 212 110" stroke="#0ea5e9" strokeWidth="4" strokeDasharray="4 2" />
          <text x="200" y="100" fontSize="16" textAnchor="middle">⚡</text>

          <g transform="translate(220, 40)">
            <rect width="150" height="140" rx="16" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
            <text x="75" y="38" fontSize="26" textAnchor="middle">🌐</text>
            <text x="75" y="66" fontSize="11" fontWeight="900" textAnchor="middle" fill="#047857">ВЕБ-ФРЕЙМВОРКИ</text>
            <text x="75" y="84" fontSize="9.5" textAnchor="middle" fill="#64748b">Движки для сайтов</text>
            <rect x="18" y="100" width="54" height="22" rx="6" fill="#d1fae5" />
            <text x="45" y="115" fontSize="9.5" fontWeight="bold" textAnchor="middle" fill="#065f46">Django</text>
            <rect x="78" y="100" width="54" height="22" rx="6" fill="#ffffff" stroke="#10b981" strokeWidth="1" />
            <text x="105" y="115" fontSize="9.5" fontWeight="bold" textAnchor="middle" fill="#047857">Flask</text>
          </g>
        </svg>
      )}
    </div>
  );
};
