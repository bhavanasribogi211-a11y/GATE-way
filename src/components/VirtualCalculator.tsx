import React, { useState } from 'react';
import { X, Minimize2, Maximize2, RotateCcw, Calculator as CalcIcon } from 'lucide-react';

interface VirtualCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VirtualCalculator: React.FC<VirtualCalculatorProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number>(0);
  const [isDegree, setIsDegree] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [history, setHistory] = useState<string>('');

  if (!isOpen) return null;

  const handleNumber = (digit: string) => {
    setDisplay(prev => (prev === '0' || prev === 'Error' ? digit : prev + digit));
  };

  const handleClear = () => {
    setDisplay('0');
    setHistory('');
  };

  const handleBackspace = () => {
    setDisplay(prev => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  };

  const handleOperator = (op: string) => {
    setDisplay(prev => {
      if (prev === 'Error') return '0';
      return prev + ' ' + op + ' ';
    });
  };

  const toAngle = (radOrDeg: number) => {
    return isDegree ? (radOrDeg * Math.PI) / 180 : radOrDeg;
  };

  const fromAngle = (rad: number) => {
    return isDegree ? (rad * 180) / Math.PI : rad;
  };

  const handleUnary = (func: string) => {
    try {
      const val = parseFloat(display);
      if (isNaN(val)) return;
      let result = 0;

      switch (func) {
        case 'sin':
          result = Math.sin(toAngle(val));
          break;
        case 'cos':
          result = Math.cos(toAngle(val));
          break;
        case 'tan':
          result = Math.tan(toAngle(val));
          break;
        case 'asin':
          result = fromAngle(Math.asin(val));
          break;
        case 'acos':
          result = fromAngle(Math.acos(val));
          break;
        case 'atan':
          result = fromAngle(Math.atan(val));
          break;
        case 'ln':
          result = Math.log(val);
          break;
        case 'log10':
          result = Math.log10(val);
          break;
        case 'log2':
          result = Math.log2(val);
          break;
        case 'sqrt':
          result = Math.sqrt(val);
          break;
        case 'cbrt':
          result = Math.cbrt(val);
          break;
        case 'sqr':
          result = Math.pow(val, 2);
          break;
        case 'cube':
          result = Math.pow(val, 3);
          break;
        case 'inv':
          result = 1 / val;
          break;
        case 'exp':
          result = Math.exp(val);
          break;
        case 'pow10':
          result = Math.pow(10, val);
          break;
        case 'abs':
          result = Math.abs(val);
          break;
        case 'factorial':
          result = factorial(Math.floor(val));
          break;
        case 'neg':
          result = -val;
          break;
        default:
          return;
      }

      setHistory(`${func}(${val})`);
      setDisplay(String(Number(result.toFixed(8))));
    } catch {
      setDisplay('Error');
    }
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n && i <= 100; i++) res *= i;
    return res;
  };

  const handleEvaluate = () => {
    try {
      setHistory(display);
      // Clean safe expression replacing symbols
      let expr = display.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');
      // Evaluate basic arithmetic safely
      // Only allow numbers, math operators, parens, decimal, spaces
      if (!/^[0-9+\-*/().\s*]+$/.test(expr)) {
        setDisplay('Error');
        return;
      }
      // eslint-disable-next-line no-eval
      const evaluated = Function(`'use strict'; return (${expr})`)();
      setDisplay(String(Number(Number(evaluated).toFixed(8))));
    } catch {
      setDisplay('Error');
    }
  };

  // Memory ops
  const handleMemory = (op: string) => {
    const val = parseFloat(display) || 0;
    if (op === 'MC') setMemory(0);
    else if (op === 'MR') setDisplay(String(memory));
    else if (op === 'MS') setMemory(val);
    else if (op === 'M+') setMemory(prev => prev + val);
    else if (op === 'M-') setMemory(prev => prev - val);
  };

  return (
    <div
      className={`fixed z-50 shadow-2xl rounded-xl border border-slate-700 bg-slate-900 text-white transition-all ${
        isMinimized
          ? 'bottom-4 right-4 w-72 h-14 overflow-hidden'
          : 'top-20 right-4 sm:right-8 w-full max-w-sm sm:max-w-md'
      }`}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-t-xl select-none">
        <div className="flex items-center gap-2">
          <CalcIcon className="w-4 h-4 text-blue-200" />
          <span className="text-xs font-semibold tracking-wide uppercase text-blue-100">
            GATE Official Virtual Calculator
          </span>
          {memory !== 0 && (
            <span className="text-[10px] bg-amber-500/30 text-amber-200 px-1.5 py-0.5 rounded font-mono">M</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition text-blue-200"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-rose-600 rounded transition text-blue-200 hover:text-white"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-3 bg-slate-900">
          {/* Display screen */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 mb-3 font-mono text-right shadow-inner">
            <div className="text-[11px] text-slate-400 min-h-[16px] truncate">{history}</div>
            <div className="text-xl sm:text-2xl font-bold text-white tracking-wider truncate py-1">{display}</div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
              <span className="text-emerald-400 font-sans">Click on-screen keys (Keypad locked in exam)</span>
              <span className="font-semibold text-blue-400">{isDegree ? 'DEG' : 'RAD'} MODE</span>
            </div>
          </div>

          {/* Mode & Memory row */}
          <div className="grid grid-cols-7 gap-1 text-[11px] font-semibold mb-2">
            <button
              onClick={() => setIsDegree(!isDegree)}
              className={`py-1 rounded font-medium transition ${
                isDegree ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isDegree ? 'DEG' : 'RAD'}
            </button>
            <button onClick={() => handleMemory('MC')} className="bg-slate-800 hover:bg-slate-700 py-1 rounded text-slate-300">MC</button>
            <button onClick={() => handleMemory('MR')} className="bg-slate-800 hover:bg-slate-700 py-1 rounded text-slate-300">MR</button>
            <button onClick={() => handleMemory('MS')} className="bg-slate-800 hover:bg-slate-700 py-1 rounded text-slate-300">MS</button>
            <button onClick={() => handleMemory('M+')} className="bg-slate-800 hover:bg-slate-700 py-1 rounded text-slate-300">M+</button>
            <button onClick={() => handleMemory('M-')} className="bg-slate-800 hover:bg-slate-700 py-1 rounded text-slate-300">M-</button>
            <button onClick={handleBackspace} className="bg-rose-900/40 hover:bg-rose-800/60 py-1 rounded text-rose-300 font-bold">⌫</button>
          </div>

          {/* Scientific Keypad Grid */}
          <div className="grid grid-cols-5 gap-1 text-xs">
            {/* Row 1 */}
            <button onClick={() => handleUnary('sin')} className="btn-sci">sin</button>
            <button onClick={() => handleUnary('cos')} className="btn-sci">cos</button>
            <button onClick={() => handleUnary('tan')} className="btn-sci">tan</button>
            <button onClick={() => handleUnary('ln')} className="btn-sci">ln</button>
            <button onClick={() => handleUnary('log10')} className="btn-sci">log₁₀</button>

            {/* Row 2 */}
            <button onClick={() => handleUnary('asin')} className="btn-sci">sin⁻¹</button>
            <button onClick={() => handleUnary('acos')} className="btn-sci">cos⁻¹</button>
            <button onClick={() => handleUnary('atan')} className="btn-sci">tan⁻¹</button>
            <button onClick={() => handleUnary('exp')} className="btn-sci">eˣ</button>
            <button onClick={() => handleUnary('pow10')} className="btn-sci">10ˣ</button>

            {/* Row 3 */}
            <button onClick={() => handleUnary('sqr')} className="btn-sci">x²</button>
            <button onClick={() => handleUnary('sqrt')} className="btn-sci">√x</button>
            <button onClick={() => handleUnary('cbrt')} className="btn-sci">∛x</button>
            <button onClick={() => handleUnary('inv')} className="btn-sci">1/x</button>
            <button onClick={() => handleUnary('factorial')} className="btn-sci">n!</button>

            {/* Standard Keypad & Operations */}
            <button onClick={() => handleOperator('(')} className="btn-sci font-bold">(</button>
            <button onClick={() => handleOperator(')')} className="btn-sci font-bold">)</button>
            <button onClick={() => handleNumber(String(Math.PI))} className="btn-sci">π</button>
            <button onClick={() => handleNumber(String(Math.E))} className="btn-sci">e</button>
            <button onClick={handleClear} className="bg-rose-700 hover:bg-rose-600 text-white font-bold rounded py-1.5">C</button>

            {/* Numbers & Operators */}
            <button onClick={() => handleNumber('7')} className="btn-num">7</button>
            <button onClick={() => handleNumber('8')} className="btn-num">8</button>
            <button onClick={() => handleNumber('9')} className="btn-num">9</button>
            <button onClick={() => handleOperator('/')} className="btn-op">÷</button>
            <button onClick={() => handleUnary('neg')} className="btn-sci">±</button>

            <button onClick={() => handleNumber('4')} className="btn-num">4</button>
            <button onClick={() => handleNumber('5')} className="btn-num">5</button>
            <button onClick={() => handleNumber('6')} className="btn-num">6</button>
            <button onClick={() => handleOperator('*')} className="btn-op">×</button>
            <button onClick={() => handleOperator('%')} className="btn-op">mod</button>

            <button onClick={() => handleNumber('1')} className="btn-num">1</button>
            <button onClick={() => handleNumber('2')} className="btn-num">2</button>
            <button onClick={() => handleNumber('3')} className="btn-num">3</button>
            <button onClick={() => handleOperator('-')} className="btn-op">−</button>
            <button onClick={() => handleUnary('abs')} className="btn-sci">|x|</button>

            <button onClick={() => handleNumber('0')} className="btn-num">0</button>
            <button onClick={() => handleNumber('.')} className="btn-num font-bold">.</button>
            <button onClick={() => handleOperator('**')} className="btn-sci">xʸ</button>
            <button onClick={() => handleOperator('+')} className="btn-op">+</button>
            <button onClick={handleEvaluate} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded py-1.5 shadow">=</button>
          </div>
        </div>
      )}
    </div>
  );
};
