import FirecrawlApp from "@mendable/firecrawl-js";
import { createUrlHash } from "@/lib/utils";
import type { Job } from "@/lib/types/database";

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || "",
});

export interface ParsedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  tags: string[];
  is_remote: boolean;
  job_type: string;
  posted_at: string | null;
  url_hash: string;
  salary_min?: number | null;
  salary_max?: number | null;
}

const CRAWL_TARGETS = [
  {
    url: "https://remoteok.com/api",
    source: "remoteok",
    type: "json" as const,
  },
  {
    url: "https://wellfound.com/jobs",
    source: "wellfound",
    type: "scrape" as const,
  },
];

// RemoteOK has a public JSON API - no Firecrawl needed
async function fetchRemoteOKJobs(roles: string[]): Promise<ParsedJob[]> {
  try {
    const response = await fetch("https://remoteok.com/api", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JobSearchBot/1.0)" },
    });
    const data = await response.json();
    // First item is meta, skip it
    const jobs = Array.isArray(data) ? data.slice(1) : [];

    return jobs
      .filter((job: Record<string, unknown>) => {
        const title = String(job.position || "").toLowerCase();
        const description = String(job.description || "").toLowerCase();
        
        if (!roles || roles.length === 0) return true;
        
        // Match against roles or skills
        const searchTerms = [...roles, "software", "engineer", "developer", "remote"];
        return searchTerms.some((term) => 
          title.includes(term.toLowerCase()) || 
          description.includes(term.toLowerCase())
        );
      })
      .slice(0, 20)
      .map((job: Record<string, unknown>) => ({
        title: String(job.position || ""),
        company: String(job.company || ""),
        location: String(job.location || "Remote"),
        description: String(job.description || "").replace(/<[^>]*>/g, ""),
        url: String(job.url || `https://remoteok.com/r/${job.id}`),
        source: "remoteok",
        tags: Array.isArray(job.tags) ? (job.tags as string[]).slice(0, 8) : [],
        is_remote: true,
        job_type: "full-time",
        posted_at: job.date ? new Date(String(job.date)).toISOString() : null,
        url_hash: createUrlHash(String(job.url || job.id)),
      }));
  } catch (err) {
    console.error("RemoteOK fetch error:", err);
    return [];
  }
}

// LinkedIn RSS (public, no auth)
async function fetchLinkedInRSS(keywords: string[]): Promise<ParsedJob[]> {
  try {
    const keyword = keywords.slice(0, 3).join(" OR ");
    const rssUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&f_C=&f_LF=f_AL&f_WT=2&f_JT=F&f_TPR=r604800`;
    // LinkedIn blocks RSS directly, use Firecrawl to scrape the page
    const result = await firecrawl.scrapeUrl(rssUrl, {
      formats: ["markdown"],
    });

    if (!result.success || !result.markdown) return [];

    // Basic parsing from markdown content
    const lines = result.markdown.split("\n");
    const jobs: ParsedJob[] = [];
    let currentJob: Partial<ParsedJob> = {};

    for (const line of lines) {
      if (line.includes("##") && currentJob.title) {
        if (currentJob.title && currentJob.company) {
          const url = currentJob.url || rssUrl;
          jobs.push({
            title: currentJob.title,
            company: currentJob.company || "Unknown",
            location: currentJob.location || "Remote",
            description: currentJob.description || currentJob.title,
            url,
            source: "linkedin",
            tags: [],
            is_remote: true,
            job_type: "full-time",
            posted_at: new Date().toISOString(),
            url_hash: createUrlHash(url),
          });
        }
        currentJob = {};
      }
    }
    return jobs.slice(0, 10);
  } catch {
    return [];
  }
}

// Wellfound via Firecrawl
async function fetchWellfoundJobs(roles: string[]): Promise<ParsedJob[]> {
  try {
    const keyword = roles.slice(0, 2).join("-").toLowerCase();
    const url = `https://wellfound.com/role/r/${encodeURIComponent(keyword)}`;

    const result = await firecrawl.scrapeUrl(url, {
      formats: ["markdown"],
    });

    if (!result.success || !result.markdown) return [];

    // Parse job listings from markdown
    const jobs: ParsedJob[] = [];
    const sections = result.markdown.split(/(?=#{2,3}\s)/);

    for (const section of sections.slice(0, 15)) {
      const titleMatch = section.match(/^#{2,3}\s+(.+)/);
      const companyMatch = section.match(/\*\*(.+?)\*\*/);
      if (titleMatch) {
        const title = titleMatch[1].trim();
        const company = companyMatch ? companyMatch[1].trim() : "Startup";
        const jobUrl = `https://wellfound.com${section.match(/\(\/jobs\/\d+\)/)?.[0]?.slice(1, -1) || "/jobs"}`;
        jobs.push({
          title,
          company,
          location: "Remote",
          description: section.slice(0, 500),
          url: jobUrl,
          source: "wellfound",
          tags: roles,
          is_remote: true,
          job_type: "full-time",
          posted_at: new Date().toISOString(),
          url_hash: createUrlHash(jobUrl + title),
        });
      }
    }
    return jobs.slice(0, 10);
  } catch {
    return [];
  }
}

export async function fetchJobsFromAllSources(
  skills: string[],
  preferredRoles: string[]
): Promise<ParsedJob[]> {
  const keywords = [...preferredRoles, ...skills.slice(0, 3)];
  const roles = preferredRoles.length > 0 ? preferredRoles : skills.slice(0, 3);

  const [remoteOkJobs, wellfoundJobs] = await Promise.allSettled([
    fetchRemoteOKJobs(roles),
    fetchWellfoundJobs(roles),
  ]);

  const allJobs: ParsedJob[] = [];

  if (remoteOkJobs.status === "fulfilled") allJobs.push(...remoteOkJobs.value);
  if (wellfoundJobs.status === "fulfilled") allJobs.push(...wellfoundJobs.value);

  // Deduplicate by url_hash
  const seen = new Set<string>();
  return allJobs.filter((job) => {
    if (seen.has(job.url_hash)) return false;
    seen.add(job.url_hash);
    return true;
  });
}

export type { Job };
