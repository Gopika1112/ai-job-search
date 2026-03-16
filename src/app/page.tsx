"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BrainCircuit, Zap, Target, Shield, ArrowRight,
  CheckCircle, Star, TrendingUp, Search, Bell
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Job Matching",
    description: "GPT-4 analyzes your profile and scores every job with a compatibility percentage.",
    accent: true,
  },
  {
    icon: Zap,
    title: "Real-Time Discovery",
    description: "Jobs are auto-fetched from LinkedIn, RemoteOK, Wellfound, and more — every few minutes.",
  },
  {
    icon: Target,
    title: "Fit Score & Skill Gap",
    description: "See exactly how well you match and what skills to learn to boost your chances.",
  },
  {
    icon: Search,
    title: "Zero Manual Searching",
    description: "Set up once. The AI works in the background 24/7 to find opportunities for you.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get instant alerts when a high-match job is discovered. Never miss an opportunity.",
  },
  {
    icon: TrendingUp,
    title: "Resume Analysis",
    description: "AI analyzes your resume and suggests improvements to help you land more interviews.",
  },
];

const stats = [
  { value: "50K+", label: "Jobs Tracked" },
  { value: "94%", label: "Match Accuracy" },
  { value: "3x", label: "Faster Job Search" },
  { value: "Zero", label: "Manual Effort" },
];

const steps = [
  { num: "01", title: "Sign Up & Set Preferences", desc: "Tell us your skills, experience, and dream roles in 2 minutes." },
  { num: "02", title: "AI Gets to Work", desc: "Our system crawls top job boards and matches listings to your profile automatically." },
  { num: "03", title: "Review & Apply", desc: "Browse AI-ranked jobs with fit scores. Apply with a single click." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080808] overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="fixed inset-0 radial-accent pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">JobsAI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth" className="glass-button text-sm">Sign In</Link>
          <Link href="/auth" className="accent-button text-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-6 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-accent/20 text-xs font-medium text-accent mb-8">
            <span className="glow-dot" />
            AI-powered • Real-time • Zero effort
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
            <span className="gradient-text">Your AI Job Hunter</span>
            <br />
            <span className="gradient-text-accent">Working 24/7</span>
            <br />
            <span className="text-white/90">for You</span>
          </h1>

          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop manually searching job boards. Set up once, and our AI continuously 
            discovers, ranks, and recommends the best opportunities tailored to your 
            profile — automatically.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="accent-button text-base px-8 py-4"
              >
                Start Searching for Free
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <a href="#features" className="glass-button text-sm px-6 py-3">
              See How It Works
            </a>
          </div>
        </motion.div>

        {/* Floating job card preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 max-w-2xl mx-auto"
        >
          <div className="glass-card p-6 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">RemoteOK • Just now</p>
                <h3 className="text-xl font-bold text-white">Senior AI Engineer</h3>
                <p className="text-white/50 text-sm mt-1">OpenAI • San Francisco, CA (Remote)</p>
              </div>
              <div className="fit-badge-high text-sm px-3 py-1.5">
                <Star className="w-3.5 h-3.5" />
                94% Match
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {["Python", "LLMs", "PyTorch", "MLOps", "APIs"].map((tag) => (
                <span key={tag} className="source-badge">{tag}</span>
              ))}
            </div>
            <div className="section-divider mb-4" />
            <p className="text-white/40 text-sm">AI Summary: Lead development of next-gen language models. Strong Python background required, architecture exp preferred...</p>
            <div className="flex gap-2 mt-4">
              <button className="accent-button text-xs px-4 py-2">Apply Now</button>
              <button className="glass-button text-xs px-4 py-2">Save</button>
            </div>
          </div>
          <div className="text-center mt-4 text-white/30 text-sm">↑ This is what AI-ranked jobs look like</div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-6 text-center"
            >
              <div className="text-3xl font-black gradient-text-accent mb-1">{stat.value}</div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 gradient-text">Everything AI. Nothing Manual.</h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">A complete AI-powered job search system that handles discovery, ranking, and recommendation — while you focus on interviews.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className={`glass-card p-6 ${f.accent ? "border-accent/20" : ""}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.accent ? "bg-accent/20" : "bg-white/[0.06]"}`}>
                <f.icon className={`w-5 h-5 ${f.accent ? "text-accent-light" : "text-white/60"}`} />
              </div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 gradient-text">Up and Running in Minutes</h2>
        </div>
        <div className="space-y-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="flex items-start gap-6 glass-card p-6"
            >
              <span className="text-4xl font-black gradient-text-accent opacity-40 flex-shrink-0">{step.num}</span>
              <div>
                <h3 className="font-bold text-white text-lg mb-1">{step.title}</h3>
                <p className="text-white/40 text-sm">{step.desc}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-12"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-6">
            <BrainCircuit className="w-7 h-7 text-accent-light" />
          </div>
          <h2 className="text-4xl font-black mb-4 text-white">Ready to Let AI<br />Find Your Dream Job?</h2>
          <p className="text-white/40 mb-8">Join thousands of job seekers who let AI do the heavy lifting.</p>
          <Link href="/auth">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="accent-button text-base px-10 py-4"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
          <p className="text-white/20 text-xs mt-4 flex items-center justify-center gap-2">
            <Shield className="w-3 h-3" /> No credit card required
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6 text-center text-white/20 text-sm">
        <p>© 2026 JobsAI. Built with AI, designed for humans.</p>
      </footer>
    </div>
  );
}
