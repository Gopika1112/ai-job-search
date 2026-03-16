"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Chrome, Mail, ArrowRight, Github } from "lucide-react";

export default function AuthPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading("google");
    setError(null);
    try {
      if (!supabase.auth) {
        throw new Error("Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file and restart the server.");
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
      setLoading(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading("email");
    setError(null);
    setSuccess(null);

    try {
      if (!supabase.auth) {
        throw new Error("Supabase is not configured. Please check your .env.local file.");
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes("rate limit") && process.env.NODE_ENV === "development") {
          // Bypassing rate limit for local development demonstration
          console.warn("Rate limit hit. Bypassing auth for local development.");
          document.cookie = "dev_bypass=true; path=/; max-age=3600";
          window.location.href = "/dashboard";
          return;
        }
        throw error;
      }

      setSuccess("Check your email for the login link!");
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to send magic link");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-accent/20"
          >
            <BrainCircuit className="w-9 h-9 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black gradient-text mb-2">Welcome to JobsAI</h1>
          <p className="text-white/40">The future of autonomous job hunting.</p>
        </div>

        <div className="glass-card p-8 border-white/[0.08]">
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={!!loading}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading === "google" ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <Chrome className="w-5 h-5" />
              )}
              Continue with Google
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#080808] px-3 text-white/20 font-medium tracking-widest">or</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div className="space-y-3">
                <label className="text-sm text-white/30 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input pl-11 w-full h-12 rounded-xl text-white placeholder:text-white/20 bg-white/5 border border-white/10 focus:border-red-500/50 focus:outline-none transition-colors"
                    disabled={!!loading}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!!loading || !email}
                className="w-full h-12 flex items-center justify-center rounded-xl glass border-white/[0.1] text-white hover:bg-white/5 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading === "email" ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  "Continue with Email"
                )}
              </button>
            </form>
          </div>

          <AnimatePresence>
            {success && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-green-400 text-xs text-center mt-4 bg-green-400/10 py-2 rounded-lg border border-green-400/20"
              >
                {success}
              </motion.p>
            )}
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-xs text-center mt-4 bg-red-400/10 py-2 rounded-lg border border-red-400/20"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center mt-8 text-xs text-white/20 leading-relaxed px-8">
          By continuing, you agree to our <span className="text-white/40 underline hover:text-white/60 cursor-pointer">Terms of Service</span> and <span className="text-white/40 underline hover:text-white/60 cursor-pointer">Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
  );
}
