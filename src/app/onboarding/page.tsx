"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Briefcase, Code, MapPin, Sparkles, 
  ArrowRight, ArrowLeft, Check, Plus, X 
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "basics", title: "The Basics", icon: User },
  { id: "skills", title: "Your Skills", icon: Code },
  { id: "roles", title: "Target Roles", icon: Briefcase },
  { id: "finish", title: "preferences", icon: Sparkles },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  // Form State
  const [fullName, setFullName] = useState("");
  const [experience, setExperience] = useState<number>(0);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [preferredRoles, setPreferredRoles] = useState<string[]>([]);
  const [rolesInput, setRolesInput] = useState("");
  const [preferredLocations, setPreferredLocations] = useState<string[]>(["Remote"]);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);
      setFullName(user.user_metadata?.full_name || "");
    }
    getUser();
  }, [supabase, router]);

  const addSkill = () => {
    if (skillInput && !skills.includes(skillInput)) {
      setSkills([...skills, skillInput]);
      setSkillInput("");
    }
  };

  const addRole = () => {
    if (rolesInput && !preferredRoles.includes(rolesInput)) {
      setPreferredRoles([...preferredRoles, rolesInput]);
      setRolesInput("");
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          experience_years: experience,
          skills: skills,
          preferred_roles: preferredRoles,
          preferred_locations: preferredLocations,
          onboarded: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Trigger initial job fetch in the background
      fetch("/api/jobs/fetch", { method: "POST" }).catch(console.error);

      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col p-6 items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-xl relative z-10">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 relative px-4">
          <div className="absolute h-0.5 bg-white/5 left-10 right-10 top-1/2 -translate-y-1/2" />
          <div 
            className="absolute h-0.5 bg-accent left-10 transition-all duration-500 top-1/2 -translate-y-1/2" 
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} 
          />
          {STEPS.map((s, i) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border-2",
                  step >= i ? "bg-accent border-accent text-white" : "bg-[#080808] border-white/10 text-white/20"
                )}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-colors duration-300",
                step >= i ? "text-white/60" : "text-white/20"
              )}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="glass-card p-10 min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black mb-2">Let&apos;s get to know you.</h2>
                    <p className="text-white/40 text-sm">We&apos;ll use this to personalize your job search.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-white/30">Your Full Name</label>
                      <input 
                        className="glass-input" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-white/30">Years of Experience</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" 
                          min="0" max="20" 
                          value={experience}
                          onChange={(e) => setExperience(parseInt(e.target.value))}
                          className="flex-1 accent-accent"
                        />
                        <span className="w-12 text-center font-black text-xl text-accent">{experience}+</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black mb-2">What are your superpowers?</h2>
                    <p className="text-white/40 text-sm">Add technical skills, tools, or expertise (e.g. React, Python, UI Design).</p>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        className="glass-input pr-12" 
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addSkill()}
                        placeholder="Type a skill and press Enter"
                      />
                      <button 
                        onClick={addSkill}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s) => (
                        <span key={s} className="pl-3 pr-2 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent-light text-sm flex items-center gap-2">
                          {s}
                          <button onClick={() => setSkills(skills.filter(i => i !== s))}>
                            <X className="w-3 h-3 hover:text-white transition-colors" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black mb-2">What jobs are you hunting?</h2>
                    <p className="text-white/40 text-sm">Add roles you&apos;re looking for (e.g. Senior Frontend Engineer, Product Designer).</p>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        className="glass-input pr-12" 
                        value={rolesInput}
                        onChange={(e) => setRolesInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addRole()}
                        placeholder="Type a role and press Enter"
                      />
                      <button 
                        onClick={addRole}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {preferredRoles.map((r) => (
                        <span key={r} className="pl-3 pr-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm flex items-center gap-2">
                          {r}
                          <button onClick={() => setPreferredRoles(preferredRoles.filter(i => i !== r))}>
                            <X className="w-3 h-3 hover:text-white transition-colors" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black mb-2">Almost there.</h2>
                    <p className="text-white/40 text-sm">Where do you want to work? Our AI will focus on these.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {["Remote", "Hybrid", "On-site", "USA", "Europe", "Worldwide"].map((loc) => (
                        <button
                          key={loc}
                          onClick={() => {
                            if (preferredLocations.includes(loc)) {
                              setPreferredLocations(preferredLocations.filter(l => l !== loc));
                            } else {
                              setPreferredLocations([...preferredLocations, loc]);
                            }
                          }}
                          className={cn(
                            "p-4 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-between",
                            preferredLocations.includes(loc) 
                              ? "bg-accent/10 border-accent/50 text-accent-light" 
                              : "glass border-white/5 text-white/40 hover:border-white/20 hover:text-white/60"
                          )}
                        >
                          {loc}
                          {preferredLocations.includes(loc) && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={prevStep}
              className={cn(
                "glass-button",
                step === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            {step === STEPS.length - 1 ? (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="accent-button px-10 h-12 flex items-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Finish & Launch AI
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="accent-button h-12 px-8 flex items-center gap-3"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-white/20 tracking-wide uppercase font-bold">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  );
}
