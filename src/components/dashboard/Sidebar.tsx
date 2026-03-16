"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Star, Bookmark, CheckSquare, 
  Settings, LogOut, BrainCircuit, TrendingUp, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarProps {
  user: any;
  stats?: {
    jobsFound: number;
    avgFit: number;
    savedCount: number;
  };
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ user, stats, activeTab, setActiveTab }: SidebarProps) {
  const router = useRouter();
  const supabase = createClient();

  const navItems = [
    { id: "feed", label: "Job Feed", icon: LayoutDashboard },
    { id: "recommended", label: "Recommended", icon: Star },
    { id: "saved", label: "Saved Jobs", icon: Bookmark },
    { id: "applied", label: "Applied", icon: CheckSquare },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside className="w-72 border-r border-white/[0.06] flex flex-col h-screen sticky top-0 bg-[#080808]">
      {/* Logo */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/20">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white block leading-tight">JobsAI</span>
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Autonomous</span>
          </div>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="px-6 mb-8">
        <div className="glass-card p-4 border-white/[0.04] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 rounded-full blur-xl group-hover:bg-accent/10 transition-colors" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-white/40">
                  {user?.email?.[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
              </p>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter">Premium Agent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
              activeTab === item.id 
                ? "bg-accent/10 text-accent-light" 
                : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-colors",
              activeTab === item.id ? "text-accent-light" : "text-white/20 group-hover:text-white/40"
            )} />
            {item.label}
            {activeTab === item.id && (
              <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-accent animate-glow-pulse" />
            )}
          </button>
        ))}
      </nav>

      {/* Stats Section */}
      <div className="px-6 mb-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Daily Stats</span>
            <TrendingUp className="w-3 h-3 text-white/10" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="glass-card p-3 border-white/[0.04]">
              <span className="text-xs text-white/30 block mb-1">Found</span>
              <span className="text-sm font-black text-white">{stats?.jobsFound || 0}</span>
            </div>
            <div className="glass-card p-3 border-white/[0.04]">
              <span className="text-xs text-white/30 block mb-1">Avg Fit</span>
              <span className="text-sm font-black text-accent-light">{stats?.avgFit || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Nav */}
      <div className="p-4 border-t border-white/[0.06] space-y-1">
        <Link 
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.03] transition-all group"
        >
          <Settings className="w-5 h-5 text-white/20 group-hover:text-white/40" />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400/50 hover:text-red-400 hover:bg-red-400/5 transition-all group"
        >
          <LogOut className="w-5 h-5 text-red-400/30 group-hover:text-red-400/50" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
