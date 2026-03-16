"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import JobCard from "./JobCard";
import { Loader2, Sparkles, Filter, RefreshCcw, Search, MapPin, Check, Upload, CheckCircle2, AlertCircle, BrainCircuit, Zap } from "lucide-react";
import type { JobWithMatch } from "@/lib/types/database";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface JobFeedProps {
  activeTab: string;
}

export default function JobFeed({ activeTab }: JobFeedProps) {
  const [jobs, setJobs] = useState<JobWithMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState({
    experience: [] as string[],
    degree: [] as string[],
    qualifications: [] as string[],
    jobTypes: [] as string[],
    datePosted: "any" as string,
    salaryRange: [0, 200000] as [number, number],
  });

  const [locationSuggestions] = useState([
    "Remote", "San Francisco, CA", "New York, NY", "London, UK", "Bengaluru, India", "Kerala, India", "Berlin, Germany"
  ]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profiles/me"); 
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (error) {
       console.error("Profile fetch error:", error);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const fetchJobs = useCallback(async (isSearch = false) => {
    // ... rest of fetchJobs
    // RULE: Feed tab only fetches if search query is present
    if (activeTab === "feed" && !searchQuery && !locationQuery && !isSearch) {
      setJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const q = encodeURIComponent(`${searchQuery} ${locationQuery}`.trim());
      const filterParams = encodeURIComponent(JSON.stringify(filters));
      const response = await fetch(`/api/jobs?tab=${activeTab}&q=${q}&filters=${filterParams}`);
      const data = await response.json();
      if (data.jobs) {
        setJobs(data.jobs);
        if (isSearch) setHasSearched(true);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, searchQuery, locationQuery, filters]);

  useEffect(() => {
    if (activeTab !== "feed") {
      fetchJobs();
    }
  }, [activeTab, filters]); // Re-fetch on filter change for non-feed tabs

  const onSave = async (id: string, saved: boolean) => {
    await fetch("/api/jobs/save", {
      method: "POST",
      body: JSON.stringify({ jobId: id, action: saved ? "save" : "unsave" }),
    });
    // Optimistic update
    setJobs(jobs.map(j => j.id === id ? { ...j, saved } : j));
  };

  const onApply = async (id: string) => {
    await fetch("/api/jobs/apply", {
      method: "POST",
      body: JSON.stringify({ jobId: id }),
    });
    // Optimistic update
    setJobs(jobs.map(j => j.id === id ? { ...j, applied: true } : j));
  };

  const handleSearch = async () => {
    if (!searchQuery && !locationQuery && activeTab === "feed") return;
    
    setRefreshing(true);
    setLoading(true);
    
    try {
      // 1. Trigger real-time discovery/scraper with combined query
      const fullQuery = `${searchQuery} ${locationQuery}`.trim();
      await fetch("/api/jobs/fetch", { 
        method: "POST",
        body: JSON.stringify({ query: fullQuery })
      });
      
      // 2. Fetch the newly discovered/matched jobs
      await fetchJobs(true);
      setHasSearched(true);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus("idle");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || "Upload failed");
        throw new Error(errorMsg);
      }

      setUploadStatus("success");
      // Refresh jobs and profile to reflect new match scores and analysis
      fetchJobs(true);
      fetchProfile();
      
      setTimeout(() => setUploadStatus("idle"), 3000);
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 3000);
    } finally {
      setUploading(false);
    }
  };

  const toggleFilter = (type: "experience" | "degree" | "qualifications" | "jobTypes", value: string) => {
    setFilters(prev => {
      const currentValues = prev[type] as string[];
      return {
        ...prev,
        [type]: currentValues.includes(value) 
          ? currentValues.filter((v: string) => v !== value)
          : [...currentValues, value]
      };
    });
  };

  const showWelcome = activeTab === "feed" && !hasSearched && jobs.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Resume Upload Section */}
      <div className="glass-card p-6 border-red-500/10 bg-gradient-to-br from-red-500/[0.03] to-transparent relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
          <Upload className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Boost your match score</h3>
            </div>
            <p className="text-xs text-white/50 max-w-md">
              Upload your resume to let our AI analyze your skills and highlight the best opportunities for you instantly.
            </p>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf"
            onChange={handleFileUpload}
          />

          <button 
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-3 group/btn min-w-[200px] justify-center",
              uploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                Processing...
              </>
            ) : uploadStatus === "success" ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Resume Analyzed!
              </>
            ) : uploadStatus === "error" ? (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                Upload Failed
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-red-500 group-hover/btn:scale-110 transition-transform" />
                Upload PDF Resume
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resume Insights Section */}
      <AnimatePresence>
        {profile?.resume_analysis && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="md:col-span-2 glass-card p-6 border-emerald-500/10 bg-emerald-500/[0.02]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">AI Resume Insights</h3>
                </div>
                {profile.resume_url && (
                  <a 
                    href={profile.resume_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-accent-light hover:underline flex items-center gap-1"
                  >
                    View Original PDF <Zap className="w-3 h-3" />
                  </a>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/50">Top Strengths</span>
                  <ul className="space-y-2">
                    {profile.resume_analysis.strengths?.slice(0, 3).map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/50">Growth Areas</span>
                  <ul className="space-y-2">
                    {profile.resume_analysis.weaknesses?.slice(0, 3).map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col items-center justify-center text-center bg-accent/5 border-accent/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Overall Profile Strength</span>
              <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                  <circle 
                    cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" 
                    className="text-accent" 
                    strokeDasharray={251.2} 
                    strokeDashoffset={251.2 * (1 - (profile.resume_analysis.overallScore || 70) / 100)} 
                  />
                </svg>
                <span className="absolute text-2xl font-black text-white">{profile.resume_analysis.overallScore || 70}%</span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed italic">
                &quot;{profile.resume_analysis.summary?.slice(0, 80)}...&quot;
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col gap-4 sticky top-[80px] z-30 py-2 bg-[#080808]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center glass rounded-2xl border-white/[0.08] p-1.5 focus-within:ring-2 ring-accent/30 transition-all">
            {/* Title Search */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-red-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Job title or keywords"
                className="w-full bg-transparent border-none outline-none pl-11 pr-4 py-2 text-sm text-white placeholder:text-white/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
            </div>

            <div className="w-[1px] h-6 bg-white/[0.08] mx-1" />

            {/* Location Search */}
            <div className="relative flex-[0.8] group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-red-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Location"
                className="w-full bg-transparent border-none outline-none pl-11 pr-4 py-2 text-sm text-white placeholder:text-white/20"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onFocus={() => setShowLocationSuggestions(true)}
                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showLocationSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 right-0 top-full mt-2 glass-card border-white/[0.08] p-2 z-50 shadow-2xl max-h-48 overflow-y-auto"
                  >
                    {locationSuggestions.filter(s => s.toLowerCase().includes(locationQuery.toLowerCase())).map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setLocationQuery(suggestion);
                          setShowLocationSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-xs text-white/70 hover:text-white transition-all flex items-center gap-2"
                      >
                        <MapPin className="w-3 h-3 text-white/20" />
                        {suggestion}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter Toggle */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-xl transition-all mr-1",
                showFilters ? "bg-accent/20 text-accent-light" : "hover:bg-white/5 text-white/40"
              )}
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* Search Button */}
            <button 
              onClick={handleSearch}
              disabled={refreshing}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 h-full"
            >
              {refreshing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </div>
        </div>

        {/* Filter Dropdown */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-6 border-white/[0.08] grid grid-cols-1 md:grid-cols-4 gap-8 shadow-2xl relative z-40"
            >
              {/* Experience */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Experience</span>
                <div className="space-y-2">
                  {["Entry Level", "Mid Level", "Senior", "Director"].map(exp => (
                    <label key={exp} className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                        filters.experience.includes(exp) ? "bg-red-500 border-red-500" : "border-white/20 group-hover:border-white/40"
                      )}>
                        {filters.experience.includes(exp) && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" onChange={() => toggleFilter("experience", exp)} />
                      <span className="text-xs text-white/60 group-hover:text-white transition-colors">{exp}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Degree */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Degree</span>
                <div className="space-y-2">
                  {["Pursuing degree", "Associate", "Bachelors", "Masters", "Ph.D."].map(deg => (
                    <label key={deg} className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                        filters.degree.includes(deg) ? "bg-red-500 border-red-500" : "border-white/20 group-hover:border-white/40"
                      )}>
                        {filters.degree.includes(deg) && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" onChange={() => toggleFilter("degree", deg)} />
                      <span className="text-xs text-white/60 group-hover:text-white transition-colors">{deg}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Job Types */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Job Types</span>
                <div className="space-y-2">
                  {["Full-time", "Part-time", "Temporary", "Intern"].map(type => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                        filters.jobTypes.includes(type) ? "bg-red-500 border-red-500" : "border-white/20 group-hover:border-white/40"
                      )}>
                        {filters.jobTypes.includes(type) && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" onChange={() => toggleFilter("jobTypes", type)} />
                      <span className="text-xs text-white/60 group-hover:text-white transition-colors">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Posted & Salary */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Date Posted</span>
                  <select 
                    value={filters.datePosted}
                    onChange={(e) => setFilters(prev => ({ ...prev, datePosted: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-red-500/50 transition-all"
                  >
                    <option value="any" className="bg-[#080808]">Any time</option>
                    <option value="24h" className="bg-[#080808]">Last 24 hours</option>
                    <option value="7d" className="bg-[#080808]">Last 7 days</option>
                    <option value="30d" className="bg-[#080808]">Last 30 days</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Salary Range</span>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] text-white/30">
                      <span>$0</span>
                      <span>$200k+</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="200000" 
                      step="10000"
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
                      value={filters.salaryRange[1]}
                      onChange={(e) => setFilters(prev => ({ ...prev, salaryRange: [prev.salaryRange[0], parseInt(e.target.value)] }))}
                    />
                    <div className="text-xs text-white/60">
                      Up to <span className="text-white font-bold">${(filters.salaryRange[1] / 1000).toFixed(0)}k/year</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills & Qualifications */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Skills & Qualifications</span>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Computer programming, finance degree..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-red-500/50 transition-all"
                  />
                  <div className="flex flex-wrap gap-2">
                    {["Python", "React", "Cloud"].map(skill => (
                      <span key={skill} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/40">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading State */}
      {loading && !refreshing && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-white/20 text-sm font-medium tracking-widest uppercase">Fetching AI Insights...</p>
        </div>
      )}

      {/* Feed Content */}
      <div className="grid grid-cols-1 gap-4 pb-20">
        <AnimatePresence mode="popLayout">
          {!loading && (jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onSave={onSave}
                onApply={onApply}
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 glass-card border-dashed border-white/5 text-center px-6"
            >
              {showWelcome ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-accent/5 flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 text-accent/20" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Ready to find your next role?</h3>
                  <p className="text-white/40 text-sm max-w-sm">
                    Enter a job title, skill, or company name above to start your AI-powered search.
                  </p>
                </>
              ) : (
                <>
                  {searchQuery ? (
                    <>
                      <Search className="w-12 h-12 text-white/10 mb-4" />
                      <h3 className="text-white font-bold mb-1">No matches found for &quot;{searchQuery}&quot;</h3>
                      <p className="text-white/30 text-sm mb-6">Try adjusting your search or tabs.</p>
                      <button 
                        onClick={() => { setSearchQuery(""); setHasSearched(false); setJobs([]); }}
                        className="glass-button px-6 h-10 text-xs uppercase tracking-widest"
                      >
                        Clear Search
                      </button>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-12 h-12 text-white/10 mb-4" />
                      <h3 className="text-white font-bold mb-1">Nothing here yet</h3>
                      <p className="text-white/30 text-sm mb-6">
                        {activeTab === "saved" ? "Jobs you save will appear here." : 
                         activeTab === "applied" ? "Tracking your applications here." :
                         "Still analyzing your profile for recommendations."}
                      </p>
                    </>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

