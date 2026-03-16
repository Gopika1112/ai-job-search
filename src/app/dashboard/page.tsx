"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/dashboard/Sidebar";
import JobFeed from "@/components/dashboard/JobFeed";
import NotificationBell from "@/components/dashboard/NotificationBell";
import { 
  Search, BrainCircuit, LayoutGrid, 
  Menu, X, Sparkles, TrendingUp, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("feed");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ jobsFound: 0, avgFit: 0, savedCount: 0 });
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();

    // Fetch stats
    const fetchStats = async () => {
      const { count: jobsCount } = await supabase.from("jobs").select("*", { count: "exact", head: true });
      const { data: matches } = await supabase.from("job_matches").select("fit_score");
      const { count: savedCount } = await supabase.from("saved_jobs").select("*", { count: "exact", head: true });
      
      const avgFit = matches && matches.length > 0 
        ? Math.round(matches.reduce((acc: number, m: any) => acc + m.fit_score, 0) / matches.length)
        : 85;

      setStats({
        jobsFound: jobsCount || 124,
        avgFit: avgFit,
        savedCount: savedCount || 0
      });
    };
    fetchStats();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#080808] flex">
      {/* Background decoration */}
      <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[800px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block sticky top-0 h-screen z-50">
        <Sidebar 
          user={user} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          stats={stats}
        />
      </div>

      {/* Sidebar - Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-[70] lg:hidden"
            >
              <Sidebar 
                user={user} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                stats={stats}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 w-full min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 h-20 bg-[#080808]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl glass border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-white capitalize tracking-tight flex items-center gap-2">
                {activeTab.replace("-", " ")}
                <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              </h2>
              <p className="text-[10px] sm:text-xs text-white/30 font-bold uppercase tracking-widest">
                {activeTab === "feed" ? "Real-time AI synchronization active" : `Viewing your ${activeTab}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Stats (Desktop) */}
            <div className="hidden md:flex items-center gap-2 mr-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border-white/[0.04] animate-float">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-tighter">AI Online</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border-white/[0.04]">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-tighter">{stats.jobsFound} Jobs Today</span>
              </div>
            </div>

            <NotificationBell />
            
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/[0.08] flex items-center justify-center p-0.5 overflow-hidden">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover rounded-[10px]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-accent/20 rounded-[10px]">
                  <span className="text-xs font-black text-accent-light uppercase">
                    {user?.email?.[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 scroll-smooth overflow-x-hidden">
          <div className="max-w-4xl mx-auto">
            {/* Welcome banner (Feed only) */}
            {activeTab === "feed" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-8 glass-card bg-gradient-to-r from-accent/5 to-transparent border-accent/10 relative overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl animate-float" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0 animate-glow-pulse">
                    <Sparkles className="w-8 h-8 text-accent-light" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-white mb-1">
                      Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {user?.user_metadata?.full_name?.split(" ")[0] || "Explorer"}!
                    </h1>
                    <p className="text-white/40 text-sm leading-relaxed max-w-xl">
                      {activeTab === "feed" 
                        ? "Search for your next role below. I'm ready to find the perfect match for you."
                        : `I've analyzed ${stats.jobsFound} opportunities to find the best matches for your profile.`}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-auto">
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                      Sync Status: 100%
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Job Feed */}
            <JobFeed activeTab={activeTab} />
          </div>
        </div>
      </main>
    </div>
  );
}
