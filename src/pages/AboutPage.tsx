import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  Mail,
  Send,
  HelpCircle,
  Briefcase,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const FAQS = [
  {
    q: 'What is the Graduate Aptitude Test in Engineering (GATE)?',
    a: 'GATE is a prestigious national examination conducted jointly by IISc Bangalore and seven Indian Institutes of Technology (IITs) on behalf of the National Coordination Board (NCB)-GATE, Ministry of Education, Government of India. It tests comprehensive understanding of various undergraduate engineering and science subjects.',
  },
  {
    q: 'How long is the GATE score valid?',
    a: 'GATE score is valid for THREE YEARS from the date of announcement of results for post-graduate admissions (M.Tech/M.S./Direct Ph.D.). However, PSU recruitments generally require the GATE score of the current corresponding year.',
  },
  {
    q: 'What are the question types and negative marking scheme in GATE?',
    a: 'There are three question types:\n1. Multiple Choice Questions (MCQ): 1-mark (negative 0.33 mark) and 2-mark (negative 0.66 mark).\n2. Multiple Select Questions (MSQ): One or more choices can be correct; full marks awarded only if all correct choices are picked and zero incorrect choices are chosen. NO negative marking.\n3. Numerical Answer Type (NAT): Physical or virtual decimal input. NO negative marking.',
  },
  {
    q: 'Can a candidate appear in two GATE papers?',
    a: 'Yes, candidates can choose a maximum of two papers from the permitted official two-paper combinations (e.g. CS + DA, EC + EE, ME + PI, etc.). The examinations are scheduled in non-clashing shifts.',
  },
  {
    q: 'What is the GATE score calculation formula?',
    a: 'For multi-session papers, normalized marks are computed taking into account the mean and standard deviation of marks of all candidates across sessions. The normalized marks are then converted to a GATE score on a scale of 1000 using the standard linear interpolation formula.',
  },
];

export const AboutPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [paper, setPaper] = useState('Computer Science (CS)');
  const [message, setMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setContactSuccess(true);
    confetti({ particleCount: 40, spread: 60 });
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setContactSuccess(false), 4000);
  };

  return (
    <div className="space-y-10 pb-12 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-3 py-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Everything You Need to Know About GATE
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Official examination guidelines, admission avenues through COAP & CCMT, top Navratna/Maharatna PSU careers, and preparation FAQs.
        </p>
      </div>

      {/* 3 Pillars Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-sm">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            IIT & IISc Admissions (COAP)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Direct gateway to Master of Technology (M.Tech), Master of Science (M.S. by Research), and Direct Ph.D. programs at IISc Bangalore and 23 IITs through the Common Offer Acceptance Portal.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-sm">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Maharatna & Navratna PSUs
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Recruitment for Executive Trainee (ET) and Assistant Executive Engineer (AEE) in top public sector undertakings: ONGC, IOCL, NTPC, BHEL, GAIL, HPCL, BARC, NPCIL, and DRDO with high CTCs.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold text-sm">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            NITs, IIITs & CFTIs (CCMT)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Centralized Counseling for M.Tech/M.Arch/M.Plan across all National Institutes of Technology (NITs), Indian Institutes of Information Technology (IIITs), and top central universities with MHRD stipends.
          </p>
        </div>
      </div>

      {/* Examination Structure Table Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            GATE Examination Marking Scheme & Structure
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                <th className="p-3">Section</th>
                <th className="p-3">Questions Count</th>
                <th className="p-3">Total Marks</th>
                <th className="p-3">Negative Marking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">General Aptitude (GA)</td>
                <td className="p-3">10 Questions (5 of 1-mark + 5 of 2-mark)</td>
                <td className="p-3 font-mono font-bold text-indigo-600">15 Marks</td>
                <td className="p-3 text-slate-500">MCQs only (-1/3 for 1m, -2/3 for 2m)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">Engineering Mathematics</td>
                <td className="p-3">Approx. 7–9 Questions</td>
                <td className="p-3 font-mono font-bold text-indigo-600">13 Marks</td>
                <td className="p-3 text-slate-500">Applied strictly to MCQs</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">Core Engineering Paper</td>
                <td className="p-3">Approx. 45–48 Questions</td>
                <td className="p-3 font-mono font-bold text-indigo-600">72 Marks</td>
                <td className="p-3 text-slate-500">No negative marks for MSQ & NAT</td>
              </tr>
              <tr className="font-bold bg-indigo-50/50 dark:bg-indigo-950/20">
                <td className="p-3 text-indigo-900 dark:text-indigo-200">Total Complete Examination</td>
                <td className="p-3 text-indigo-900 dark:text-indigo-200">65 Questions</td>
                <td className="p-3 font-mono text-indigo-700 dark:text-indigo-300">100 Marks (180 Mins)</td>
                <td className="p-3 text-emerald-600 font-semibold">CBT Mode with Virtual Calculator</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions (FAQ)
          </h3>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact & Student Mentorship Form */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            <span>Have Questions or Need Preparation Guidance?</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Send us your query regarding exam syllabus, timetable planning, or mock evaluations.
          </p>
        </div>

        {contactSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Your message has been received! Our mentor team will respond via email.</span>
          </div>
        )}

        <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                placeholder="Candidate name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Branch / GATE Paper
              </label>
              <input
                type="text"
                value={paper}
                onChange={e => setPaper(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Your Message / Question
            </label>
            <textarea
              rows={4}
              required
              placeholder="Ask about subject weightage, how to handle negative marking, or timetable rescheduling..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
