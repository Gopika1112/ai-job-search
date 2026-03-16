import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobsAI — AI-Powered Job Search Platform",
  description: "Let AI find your perfect job. Automated job discovery, AI matching, and real-time recommendations tailored just for you.",
  keywords: "AI job search, automated job hunting, job matching, career AI",
  openGraph: {
    title: "JobsAI — AI-Powered Job Search Platform",
    description: "Let AI find your perfect job automatically",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#080808] text-white antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
