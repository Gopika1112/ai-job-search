import { createUrlHash } from "@/lib/utils";
import type { ParsedJob } from "@/lib/crawlers/firecrawl";

const generateMockJobs = (): ParsedJob[] => {
  const categories = [
    { title: "Frontend Engineer", tags: ["React", "TypeScript", "Next.js"], company: "TechFlow" },
    { title: "Backend Developer", tags: ["Node.js", "PostgreSQL", "Redis"], company: "DataNode" },
    { title: "Product Designer", tags: ["Figma", "UI/UX", "Design Systems"], company: "Vivid UI" },
    { title: "Full Stack Developer", tags: ["React", "Express", "MongoDB"], company: "GrowthLab" },
    { title: "AI/ML Intern", tags: ["Python", "PyTorch", "LLMs"], company: "NeuralNet" },
    { title: "Software Engineering Intern", tags: ["Java", "Spring Boot", "AWS"], company: "CloudScale" },
    { title: "Mobile Developer", tags: ["React Native", "iOS", "Android"], company: "AppVantage" },
    { title: "DevOps Architect", tags: ["Kubernetes", "Docker", "Terraform"], company: "infraCore" },
    { title: "Security Engineer", tags: ["Pentesting", "Python", "Cloud Security"], company: "ShieldAI" },
    { title: "Data Scientist", tags: ["Python", "Pandas", "Scikit-Learn"], company: "InsightFlow" },
    { title: "UX Researcher", tags: ["User Testing", "Personas", "A/B Testing"], company: "HumanCentric" },
    { title: "Cloud Engineer", tags: ["AWS", "Serverless", "DynamoDB"], company: "SkyHigh" },
    { title: "Blockchain Developer", tags: ["Solidity", "Ethereum", "Web3"], company: "CryptoLink" },
    { title: "QA Automation Intern", tags: ["Selenium", "Playwright", "Jest"], company: "QualityFirst" },
    { title: "Product Manager", tags: ["Agile", "Roadmapping", "SQL"], company: "ShipIt" },
    { title: "Site Reliability Engineer", tags: ["Go", "Prometheus", "Linux"], company: "GlobalNodes" },
    { title: "Marketing Technology Intern", tags: ["Analytics", "SEO", "HTML/CSS"], company: "MediaGrowth" },
    { title: "Embedded Systems Engineer", tags: ["C++", "RTOS", "Firmware"], company: "ChipSets" },
    { title: "Sales Engineer", tags: ["Demos", "Customer Success", "API Integration"], company: "SolutionsInc" },
    { title: "Technical Writer", tags: ["Documentation", "Markdown", "Git"], company: "WriteDocs" },
    { title: "Junior Web Developer", tags: ["HTML", "CSS", "JavaScript"], company: "StartNow" },
    { title: "Senior AI Engineer", tags: ["OpenAI", "Vector DBs", "RAG"], company: "QuantumAI" },
    { title: "Customer Support Intern", tags: ["Zendesk", "Communication", "Troubleshooting"], company: "HelpDesk" },
    { title: "Data Analyst", tags: ["Tableau", "PowerBI", "SQL"], company: "StatVault" },
    { title: "Engineering Lead", tags: ["Mentorship", "Architecture", "Strategy"], company: "BigTech" }
  ];

  return categories.map((cat, i) => ({
    title: cat.title,
    company: cat.company,
    location: i % 2 === 0 ? "Remote" : "San Francisco, CA",
    description: `Exciting opportunity to join ${cat.company} as a ${cat.title}. You will work on cutting-edge projects using ${cat.tags.join(" and ")}.`,
    url: `https://${cat.company.toLowerCase()}.com/careers/${cat.title.toLowerCase().replace(/ /g, "-")}`,
    source: i % 3 === 0 ? "google" : "demo",
    tags: cat.tags,
    is_remote: i % 2 === 0,
    job_type: cat.title.includes("Intern") ? "internship" : "full-time",
    posted_at: new Date(Date.now() - (i * 3600000 * 4)).toISOString(),
    url_hash: createUrlHash(`${cat.company}-${cat.title}-${i}-demo`),
    salary_min: 80000 + (i * 5000),
    salary_max: 120000 + (i * 10000),
    about_job: `Join our dynamic team at ${cat.company} where we value innovation and collaboration. As a ${cat.title}, you'll be at the forefront of our ${cat.tags[0]} initiatives, helping to define the future of our platform.`,
    min_qualifications: [
      `Bachelors degree in Computer Science or related field`,
      `2+ years of experience with ${cat.tags[0]}`,
      `Strong understanding of ${cat.tags[1] || "software principles"}`
    ],
    preferred_qualifications: [
      `Masters degree in a technical field`,
      `Experience with ${cat.tags[cat.tags.length - 1]}`,
      `Background in high-growth startup environments`
    ],
    responsibilities: [
      `Design and implement scalable components using ${cat.tags[0]}`,
      `Collaborate with cross-functional teams to deliver high-quality features`,
      `Optimize application performance and maintainability`
    ]
  }));
};

export const MOCK_JOBS: ParsedJob[] = generateMockJobs();
