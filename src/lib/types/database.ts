export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          skills: string[];
          experience_years: number;
          preferred_roles: string[];
          preferred_locations: string[];
          resume_text: string | null;
          resume_url: string | null;
          resume_analysis: Json | null;
          onboarded: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          skills?: string[];
          experience_years?: number;
          preferred_roles?: string[];
          preferred_locations?: string[];
          resume_text?: string | null;
          resume_url?: string | null;
          resume_analysis?: Json | null;
          onboarded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          company: string;
          location: string | null;
          description: string;
          url: string;
          source: string;
          tags: string[];
          salary_min: number | null;
          salary_max: number | null;
          job_type: string | null;
          is_remote: boolean;
          posted_at: string | null;
          fetched_at: string;
          url_hash: string;
          min_qualifications: string[] | null;
          preferred_qualifications: string[] | null;
          responsibilities: string[] | null;
          about_job: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          company: string;
          location?: string | null;
          description: string;
          url: string;
          source: string;
          tags?: string[];
          salary_min?: number | null;
          salary_max?: number | null;
          job_type?: string | null;
          is_remote?: boolean;
          posted_at?: string | null;
          fetched_at?: string;
          url_hash: string;
          min_qualifications?: string[] | null;
          preferred_qualifications?: string[] | null;
          responsibilities?: string[] | null;
          about_job?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["jobs"]["Insert"]>;
      };
      job_matches: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          fit_score: number;
          summary: string | null;
          skill_gaps: string[];
          match_reasons: string[];
          matched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          fit_score: number;
          summary?: string | null;
          skill_gaps?: string[];
          match_reasons?: string[];
          matched_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["job_matches"]["Insert"]>;
      };
      saved_jobs: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          saved_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          saved_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_jobs"]["Insert"]>;
      };
      applied_jobs: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          applied_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          applied_at?: string;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["applied_jobs"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type JobMatch = Database["public"]["Tables"]["job_matches"]["Row"];
export type SavedJob = Database["public"]["Tables"]["saved_jobs"]["Row"];
export type AppliedJob = Database["public"]["Tables"]["applied_jobs"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export type JobWithMatch = Job & {
  job_matches?: JobMatch[];
  saved_jobs?: SavedJob[];
  applied_jobs?: AppliedJob[];
  match?: JobMatch | null;
  saved?: boolean;
  applied?: boolean;
};
