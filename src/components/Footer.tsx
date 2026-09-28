import React from 'react';
import { useApp } from '../context/AppContext';
import { GraduationCap, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-10 no-print transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">GATE Prep Planner</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[12px]">
              Empowering engineering aspirants to achieve top All India Ranks (AIR) through adaptive daily timetables, complete official syllabus coverage, and authentic CBT mock tests.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Aligned with National GATE Committee guidelines</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px] mb-3">
              Preparation Modules
            </h4>
            <ul className="space-y-2 text-[12px]">
              <li>
                <button onClick={() => setActiveTab('timetable')} className="hover:text-blue-400 transition">
                  Personalized Study Planner
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('syllabus')} className="hover:text-blue-400 transition">
                  Official Branch Syllabus
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('mock-tests')} className="hover:text-blue-400 transition">
                  CBT Simulator & Virtual Calculator
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('progress')} className="hover:text-blue-400 transition">
                  Progress Tracker & Hours Log
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('resources')} className="hover:text-blue-400 transition">
                  Handcrafted Formula Books & PYQs
                </button>
              </li>
            </ul>
          </div>

          {/* Official Portals */}
          <div>
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px] mb-3">
              Official Portals
            </h4>
            <ul className="space-y-2 text-[12px]">
              <li>
                <a
                  href="https://gate2026.iitkgp.ac.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-white transition"
                >
                  <span>GATE Official Website</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://coap.iitd.ac.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-white transition"
                >
                  <span>COAP (IIT Admissions)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://ccmt.admissions.nic.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-white transition"
                >
                  <span>CCMT (NITs / CFTIs)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://onlinecourses.nptel.ac.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-white transition"
                >
                  <span>NPTEL Engineering Lectures</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Disclaimer & Info */}
          <div>
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px] mb-3">
              Notice & Disclaimer
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              GATE Prep Planner is an independent preparation platform. GATE is organized by IISc Bangalore and 7 IITs (Bombay, Delhi, Guwahati, Kanpur, Kharagpur, Madras, Roorkee). All trademark names belong to their respective authorities.
            </p>
            <div className="mt-3">
              <button
                onClick={() => setActiveTab('about')}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                Read Exam Structure & Scoring Rules →
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
          <div>
            © {new Date().getFullYear()} GATE Prep Planner. Built for GATE aspirants with precision.
          </div>
          <div className="flex items-center gap-1">
            <span>Strive for Excellence • Target AIR Under 100</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
