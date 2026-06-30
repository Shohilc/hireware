import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  Trash2,
  ChevronRight,
  TrendingUp,
  Brain,
  Info,
} from 'lucide-react';
import { useMatchStore } from '@/store/matchStore';
import { useJobStore } from '@/store/jobStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export default function Match() {
  const { analyzeResume, matchResult, isLoading, clearResult } = useMatchStore();
  const { jobs, fetchJobs } = useJobStore();

  const [selectedJobId, setSelectedJobId] = useState('');
  const [customJobDesc, setCustomJobDesc] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [useCustomDesc, setUseCustomDesc] = useState(false);

  useEffect(() => {
    fetchJobs({ page: 1, limit: 100 });
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeText) {
      toast.error('Please paste your resume content');
      return;
    }
    if (!useCustomDesc && !selectedJobId) {
      toast.error('Please select a job from the feed');
      return;
    }
    if (useCustomDesc && !customJobDesc) {
      toast.error('Please paste the job description');
      return;
    }

    try {
      await analyzeResume(
        resumeText,
        useCustomDesc ? customJobDesc : '',
        useCustomDesc ? '' : selectedJobId
      );
      toast.success('Analysis completed!');
    } catch (err) {
      toast.error(err.message || 'Analysis failed');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-accent-emerald stroke-accent-emerald';
    if (score >= 60) return 'text-accent-cyan stroke-accent-cyan';
    if (score >= 40) return 'text-brand-400 stroke-brand-400';
    return 'text-red-400 stroke-red-400';
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-page dark:bg-page-dark transition-colors duration-500 ease-smooth">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-brand-400" />
              ATS Resume Matcher
            </h1>
            <p className="text-muted-foreground text-sm">Optimize your resume for specific technical job requirements</p>
          </div>
          {matchResult && (
            <Button variant="outline" size="sm" onClick={clearResult}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              Reset Matcher
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <AnimatePresence mode="wait">
            {!matchResult ? (
              // MATCH INPUT FORM PANEL
              <motion.div
                key="input-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Left Panel: Job Selector */}
                <div className="bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                        <Search className="w-4 h-4 text-brand-400" />
                      </div>
                      <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Target Job Profile</h2>
                    </div>

                    <div className="flex gap-4 mb-4">
                      <button
                        type="button"
                        onClick={() => setUseCustomDesc(false)}
                        className={`text-xs font-semibold py-1 px-3 rounded-full transition-all ${
                          !useCustomDesc ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-zinc-100 dark:bg-white/5 text-muted-foreground hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        Choose Scraped Job
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseCustomDesc(true)}
                        className={`text-xs font-semibold py-1 px-3 rounded-full transition-all ${
                          useCustomDesc ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-zinc-100 dark:bg-white/5 text-muted-foreground hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        Paste Job Description
                      </button>
                    </div>

                    {!useCustomDesc ? (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Select Job Feed Item</label>
                        <select
                          value={selectedJobId}
                          onChange={(e) => setSelectedJobId(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                        >
                          <option value="">-- Choose Job from Feed --</option>
                          {jobs?.map((job) => (
                            <option key={job._id} value={job._id}>
                              {job.title} ({job.company} - {job.location})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Paste Job Requirements / Description</label>
                        <textarea
                          value={customJobDesc}
                          onChange={(e) => setCustomJobDesc(e.target.value)}
                          placeholder="Paste responsibilities, experience, technologies, and requirements..."
                          rows={10}
                          className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none font-sans"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex items-center gap-2 p-3 rounded-xl bg-zinc-100/50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 text-[11px] text-muted-foreground">
                    <Info size={14} className="text-brand-400 shrink-0" />
                    <span>The local parsing engine will map technical skills against your resume.</span>
                  </div>
                </div>

                {/* Right Panel: Resume input */}
                <div className="bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-accent-purple" />
                    </div>
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Resume Text</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Paste Resume Content</label>
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste text directly from your resume PDF/Word doc (include skills, experience details)..."
                        rows={10}
                        className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none font-sans"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleAnalyze}
                      className="w-full bg-gradient-to-r from-brand-500 to-accent-purple hover:from-brand-600 hover:to-accent-pink disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Running ATS Analysis...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 animate-pulse" />
                          Compare Resume and Job
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              // MATCH ANALYSIS RESULT PAGE
              <motion.div
                key="result-dashboard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {/* Score Dial & Overview Card */}
                <div className="bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand-500/10 to-transparent rounded-full filter blur-xl"></div>
                  
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">ATS Match Score</h3>
                  
                  {matchResult.isAI && (
                    <span className="-mt-4 mb-6 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-brand-500/10 text-brand-500 dark:text-brand-400 flex items-center gap-1 border border-brand-500/20">
                      <Sparkles size={11} className="animate-pulse" /> AI Verified Match
                    </span>
                  )}
                  
                  {/* Circular SVG Gauge */}
                  <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/20" strokeWidth="6" />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        className={getScoreColor(matchResult.score)}
                        strokeWidth="6"
                        strokeDasharray="251.2"
                        initial={{ strokeDashoffset: 251.2 }}
                        animate={{ strokeDashoffset: 251.2 - (251.2 * matchResult.score) / 100 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-4xl font-extrabold font-display text-zinc-900 dark:text-white">{matchResult.score}%</span>
                    </div>
                  </div>

                  <span className={`text-xs font-bold py-1 px-3 rounded-full ${
                    matchResult.score >= 80 ? 'bg-accent-emerald/10 text-accent-emerald' : 
                    matchResult.score >= 60 ? 'bg-accent-cyan/10 text-accent-cyan' : 
                    'bg-brand-500/10 text-brand-400'
                  }`}>
                    {matchResult.score >= 80 ? 'Excellent Match' : 
                     matchResult.score >= 60 ? 'Good Match' : 
                     'Needs Optimization'}
                  </span>
                </div>

                {/* Skill Keywords matches / missing */}
                <div className="bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:col-span-2 space-y-6">
                  {/* Matching Skills */}
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                      Matching Keywords ({matchResult.matchingSkills?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.matchingSkills?.length > 0 ? (
                        matchResult.matchingSkills.map((tag) => (
                          <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold text-accent-emerald px-2 py-1 rounded-lg bg-accent-emerald/5 border border-accent-emerald/10">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No matching keywords identified</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-brand-400" />
                      Missing Tech Keywords ({matchResult.missingKeywords?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.missingKeywords?.length > 0 ? (
                        matchResult.missingKeywords.map((tag) => (
                          <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold text-brand-400 px-2 py-1 rounded-lg bg-brand-500/5 border border-brand-500/10">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-accent-emerald italic">Zero technical keywords missing! Fantastic.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggestion recommendations */}
                <div className="bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:col-span-3">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent-purple" />
                    Resume Optimization Checklist
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {matchResult.recommendations?.map((rec, i) => (
                      <div key={rec.title} className="p-4 rounded-xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.01] flex flex-col gap-1 hover:bg-zinc-100 dark:hover:bg-white/[0.02] transition-colors relative">
                        <span className="absolute top-2 right-3 text-2xl font-extrabold text-zinc-200/20 dark:text-white/5">{i + 1}</span>
                        <h5 className="font-semibold text-zinc-900 dark:text-white text-xs">{rec.title}</h5>
                        <p className="text-muted-foreground text-[11px] mt-1 leading-relaxed">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
