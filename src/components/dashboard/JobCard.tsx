"use client";

import { useState } from "react";
import { 
  Bookmark, Share2, MapPin, Briefcase, 
  Clock, Zap, CheckCircle2, ChevronRight,
  Brain, FileText, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, timeAgo, formatSalary, getFitScoreColor, getFitScoreBg, getFitScoreLabel } from "@/lib/utils";
import type { JobWithMatch } from "@/lib/types/database";

interface JobCardProps {
  job: JobWithMatch;
  onSave: (id: string, saved: boolean) => void;
  onApply: (id: string) => void;
}

export default function JobCard({ job, onSave, onApply }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(job.saved || false);
  const [showDetails, setShowDetails] = useState(false);
  const fitScore = job.match?.fit_score || 0;

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave(job.id, !isSaved);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setShowDetails(!showDetails)}
      className={cn(
        "glass-card p-6 cursor-pointer group relative overflow-hidden transition-all duration-500",
        showDetails ? "ring-2 ring-accent/30" : ""
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-2xl glass border-white/[0.08] flex-shrink-0 flex items-center justify-center bg-white/[0.02] overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-lg font-black text-white/20">
              {job.company[0]}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 truncate">
                {job.source} • {job.posted_at ? timeAgo(job.posted_at) : "recently"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-accent-light transition-colors truncate">
              {job.title}
            </h3>
            <p className="text-sm font-medium text-white/60 mb-3">{job.company}</p>
            
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-white/40">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 opacity-60" />
                {job.location || "Remote"}
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 opacity-60" />
                {job.job_type || "Full-time"}
              </div>
              {job.salary_min && (
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 opacity-80" />
                  {formatSalary(job.salary_min, job.salary_max)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <div className={cn(
            "flex flex-col items-end px-3 py-1.5 rounded-xl border transition-all duration-500",
            getFitScoreBg(fitScore)
          )}>
            <div className="flex items-center gap-1.5">
              <span className={cn("text-lg font-black", getFitScoreColor(fitScore))}>
                {fitScore}%
              </span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">Fit Score</span>
          </div>
          
          <button 
            onClick={handleSave}
            className={cn(
              "w-10 h-10 rounded-xl glass border-white/[0.08] flex items-center justify-center transition-all hover:scale-105 active:scale-95",
              isSaved ? "bg-accent/20 border-accent/30 text-accent-light" : "text-white/40 hover:text-white"
            )}
          >
            <Bookmark className={cn("w-5 h-5", isSaved ? "fill-current" : "")} />
          </button>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-6 mt-6 border-t border-white/[0.06] space-y-6">
              {/* AI Match Reasons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-4 bg-white/[0.02] border-white/[0.04]">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-accent-light" />
                    <span className="text-xs font-bold uppercase tracking-widest text-accent-light">Why it matches</span>
                  </div>
                  <ul className="space-y-2">
                    {(job.match?.match_reasons || ["Analyzing your fit..."]).map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/60 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-4 bg-white/[0.02] border-white/[0.04]">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Skill Gaps</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(job.match?.skill_gaps || ["Software Architecture", "ML Modeling"]).map((skill, i) => (
                      <span key={i} className="px-2 py-1 rounded bg-amber-400/5 border border-amber-400/10 text-[10px] font-bold text-amber-400/80">
                        {skill}
                      </span>
                    ))}
                    {(!job.match?.skill_gaps || job.match.skill_gaps.length === 0) && (
                      <span className="text-xs text-emerald-400/60 italic font-medium">Perfect skill match!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Sections */}
              <div className="space-y-6">
                {/* About the Job */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-accent-light" />
                    <span className="text-xs font-bold uppercase tracking-widest text-white/30">About the Job</span>
                  </div>
                  <p className="text-[13px] text-white/60 leading-relaxed">
                    {job.about_job || job.description}
                  </p>
                </div>

                {/* Grid for Qualifications and Responsibilities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Qualifications */}
                  <div className="space-y-4">
                    {job.min_qualifications && job.min_qualifications.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Minimum Qualifications</span>
                        <ul className="space-y-2">
                          {job.min_qualifications.map((q, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-white/50 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent/40 mt-1.5 flex-shrink-0" />
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {job.preferred_qualifications && job.preferred_qualifications.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Preferred Qualifications</span>
                        <ul className="space-y-2">
                          {job.preferred_qualifications.map((q, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-white/50 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent-light/40 mt-1.5 flex-shrink-0" />
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Responsibilities */}
                  {job.responsibilities && job.responsibilities.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Responsibilities</span>
                      <ul className="space-y-2">
                        {job.responsibilities.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-white/50 leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent-light/40 flex-shrink-0 mt-0.5" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => { e.stopPropagation(); onApply(job.id); }}
                  className="accent-button flex-1 py-3 text-sm h-12"
                >
                  Apply Directly
                  <ChevronRight className="w-4 h-4" />
                </a>
                <button 
                  onClick={(e) => { e.stopPropagation(); /* Share logic */ }}
                  className="glass-button w-12 h-12 flex items-center justify-center p-0"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicators for AI */}
      {!job.match && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
          <div className="h-full bg-accent animate-shimmer w-1/3 rounded-full" />
        </div>
      )}
    </motion.div>
  );
}
