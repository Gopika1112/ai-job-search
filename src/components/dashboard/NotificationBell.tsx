"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, Zap, Target, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { cn, timeAgo } from "@/lib/utils";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  const fetchNotifications = async () => {
    const response = await fetch("/api/notifications");
    const data = await response.json();
    if (data.notifications) {
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter((n: any) => !n.read).length);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel("new_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ id }),
    });
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ id: "all" }),
    });
    fetchNotifications();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-10 h-10 rounded-xl glass border-white/[0.08] flex items-center justify-center transition-all relative group",
          isOpen ? "bg-accent/10 border-accent/30 text-accent-light" : "text-white/40 hover:text-white"
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center animate-glow-pulse border-2 border-[#080808]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 glass-card bg-[#0d0d0d] border-white/[0.06] z-50 p-2 overflow-hidden shadow-2xl shadow-black"
            >
              <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Alerts</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-accent-light hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={cn(
                        "p-4 border-b border-white/[0.02] last:border-0 hover:bg-white/[0.02] transition-colors relative group",
                        !n.read ? "bg-accent/[0.02]" : ""
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1",
                          n.type === "high_match" ? "bg-emerald-400/10 text-emerald-400" : "bg-accent/10 text-accent-light"
                        )}>
                          {n.type === "high_match" ? <Target className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white mb-1">{n.title}</p>
                          <p className="text-[11px] text-white/40 leading-relaxed max-w-[200px]">{n.message}</p>
                          <p className="text-[9px] text-white/20 mt-2 font-bold uppercase tracking-wider">{timeAgo(n.created_at)}</p>
                        </div>
                        {!n.read && (
                          <button 
                            onClick={() => markAsRead(n.id)}
                            className="w-6 h-6 rounded-lg glass border-white/[0.04] flex items-center justify-center hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Check className="w-3 h-3 text-emerald-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-white/10" />
                    </div>
                    <p className="text-xs font-bold text-white/30 uppercase tracking-widest">No alerts yet</p>
                    <p className="text-[10px] text-white/10 mt-1">Autonomous agent is scouring the web.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
