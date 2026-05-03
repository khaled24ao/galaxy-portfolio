// src/components/utils/projectsData.js

export const projectsData = [
  {
    id: 1,
    name: "Nexus Pro",
    description: "Comprehensive smart chat application integrating Groq API for instant responses.",
    fullDescription: "A fully integrated smart chat application utilizing Groq API for instant responses. It supports chat sessions with create/rename/delete functionalities, multiple themes (dark/light/blossom), and a responsive design. Data is stored in SQLite with JWT authentication. Features include Markdown export, response rating, and full-text search.",
    category: "NLP / LLM Applications",
    useCase: "Enterprise chatbots, support automation",
    tech: ["Python", "Flask", "Groq", "LLaMA 3.1", "SQLite", "JWT"],
    stats: {
      "Latency": "<500ms",
      "Model": "LLaMA 3.1",
      "Auth": "JWT Secure"
    },
    color: "#00f2ff", // Bright Cyan
    size: 1.4,
    rotationSpeed: 0.1,
    github: "https://github.com/khaled24ao/nexus-pro",
    demo: ""
  },
  {
    id: 2,
    name: "SupportAI",
    description: "RAG system for answering questions based on document uploads.",
    fullDescription: "A RAG (Retrieval-Augmented Generation) system designed to answer questions from documents. It allows users to upload PDF/TXT files (up to 10MB) and ask questions in natural language. Uses ChromaDB for vector embeddings and Groq's LLaMA for highly accurate generation. Features drag-and-drop upload, response streaming, isolated session collections, a health endpoint, Docker containerization, and 94% test coverage.",
    category: "RAG / Document AI",
    useCase: "Internal documentation Q&A, customer support knowledge base",
    tech: ["Python", "ChromaDB", "LLaMA", "Docker", "RAG"],
    stats: {
      "Max File Size": "10MB",
      "Test Coverage": "94%",
      "Vector DB": "ChromaDB"
    },
    color: "#b967ff", // Bright Purple
    size: 1.2,
    rotationSpeed: 0.3,
    github: "https://github.com/khaled24ao/support-ai",
    demo: ""
  },
  {
    id: 3,
    name: "ResumeAI",
    description: "Smart resume parser that evaluates and optimizes CVs.",
    fullDescription: "An intelligent resume parser that analyzes PDF files and provides a score from 1-10, highlighting strengths, weaknesses, an optimized summary, and missing keywords. Built using Groq LLaMA 3.1, pypdf for text extraction, and Pydantic for robust validation. Features strict file size checks, secure filenames, retry mechanisms with exponential backoff, and comprehensive error handling.",
    category: "HR Tech / Recruitment",
    useCase: "Job seekers optimizing CVs, recruiters screening candidates",
    tech: ["Python", "Groq LLaMA 3.1", "pypdf", "Pydantic"],
    stats: {
      "Score Output": "1-10",
      "Extraction": "PDF -> JSON",
      "Validation": "Strict Pydantic"
    },
    color: "#ff33ff", // Magenta
    size: 1.0,
    rotationSpeed: 0.2,
    github: "https://github.com/khaled24ao/ResumeAI",
    demo: ""
  },
  {
    id: 4,
    name: "MeetingAI",
    description: "Meeting analytics platform translating audio/text to actionable insights.",
    fullDescription: "A meeting analytics platform that transforms audio recordings or text transcripts into actionable insights. Uses OpenAI Whisper for highly accurate transcription (95%+) and LLaMA 3.1 to extract concise summaries, action items (with owners and deadlines), and key decisions. Supports MP3, WAV, M4A, MP4, and direct text input. Includes user authentication, rate limiting, secure file processing, and robust logging.",
    category: "Speech-to-Text / Meeting Analytics",
    useCase: "Business meetings, interview analysis, collaborative session summaries",
    tech: ["Python", "OpenAI Whisper", "LLaMA 3.1", "Audio Processing"],
    stats: {
      "Transcription": "95%+ Accuracy",
      "Formats": "MP3, WAV, MP4",
      "Extraction": "Action Items & Summaries"
    },
    color: "#ffcc00", // Gold
    size: 1.25,
    rotationSpeed: 0.15,
    github: "https://github.com/khaled24ao/meeting-ai",
    demo: ""
  },
  {
    id: 5,
    name: "EmailAI",
    description: "Smart, context-aware professional email generator.",
    fullDescription: "An intelligent professional email generator that adapts to context. Users can select from multiple tones (Professional, Friendly, Formal, Casual) and languages (English/Arabic). It understands context and generates appropriate messages for any scenario—business proposals, client communications, follow-ups, or casual outreach. Features one-click copy, live preview, a responsive dark UI, REST API with CORS, input validation, security headers (CSP, HSTS), and Docker deployment.",
    category: "NLP / Text Generation",
    useCase: "Business communication, marketing emails, client outreach",
    tech: ["REST API", "Docker", "LLaMA", "CORS/HSTS"],
    stats: {
      "Tones": "4 Unique Styles",
      "Languages": "English & Arabic",
      "Security": "Enterprise Headers"
    },
    color: "#2eff8b", // Emerald Green
    size: 1.05,
    rotationSpeed: 0.25,
    github: "https://github.com/khaled24ao/EmailAI",
    demo: ""
  },
  {
    id: 6,
    name: "CodeReviewAI",
    description: "Automated code reviewer providing instant feedback using LLaMA 3.1.",
    fullDescription: "An automated code reviewer leveraging Groq LLaMA 3.1 to provide intelligent, immediate feedback on code quality. Supports Python, JavaScript, Java, Go, Rust, TypeScript, and C++. Detects bugs, security vulnerabilities, performance issues, and stylistic inconsistencies. Each review includes a quality score (1-10), line-by-line suggestions, security warnings, and refactoring recommendations. Features a beautiful dark UI, file upload/paste support, Swagger/OpenAPI documentation, rate limiting, and error handling.",
    category: "DevTools / Code Quality",
    useCase: "Pull request automation, pre-commit checks, learning best practices",
    tech: ["Python", "JavaScript", "Go/Rust/C++", "Swagger/OpenAPI", "LLaMA 3.1"],
    stats: {
      "Languages": "7+ Supported",
      "Scoring": "1-10 Quality Metric",
      "Analysis": "Security & Performance"
    },
    color: "#ff4d4d", // Neon Red
    size: 1.1,
    rotationSpeed: 0.4,
    github: "https://github.com/khaled24ao/CodeReviewAI",
    demo: ""
  },
  {
    id: 7,
    name: "SQLGenAI",
    description: "Transforms natural language queries into complex SQL instantly.",
    fullDescription: "Converts natural language into executable SQL, allowing anyone to query databases without writing code (e.g., 'Find top 10 customers who spent the most last month' → instant SQL). It understands complex JOINs, aggregations, subqueries, and database-specific dialects (MySQL, PostgreSQL, SQLite). Every generated query includes an explanation of the logic and assumptions. Returns results in <500ms. Features query logging, file exporting, multi-dialect support, and a dark UI.",
    category: "Data / SQL Generation",
    useCase: "Data analysts, business intelligence, rapid prototyping",
    tech: ["MySQL", "PostgreSQL", "SQLite", "NLP to SQL"],
    stats: {
      "Response Time": "<500ms",
      "Dialects": "3 Major DBs",
      "Features": "Auto-JOIN & Aggregation"
    },
    color: "#00e6ff", // Sky Blue
    size: 1.2,
    rotationSpeed: 0.1,
    github: "https://github.com/khaled24ao/SQLGenAI",
    demo: ""
  },
  {
    id: 8,
    name: "CaptionAI",
    description: "Comprehensive image understanding and automated captioning service.",
    fullDescription: "A comprehensive image understanding service. Upload any image and receive: 1) A concise single-sentence summary, 2) A detailed 3-sentence description, 3) 10 relevant hashtags, 4) WCAG-compliant alt text for screen readers, 5) Emotional mood analysis, and 6) Three suggested use cases. Powered by Groq's vision-capable LLaMA and Pillow for image processing. Includes an API with CORS, file validation, and strict error handling.",
    category: "Computer Vision / Image Understanding",
    useCase: "Social media content creation, accessibility compliance, image SEO, automated tagging",
    tech: ["Vision LLaMA", "Pillow", "API", "CORS"],
    stats: {
      "Outputs": "6 Distinct Analyses",
      "Accessibility": "WCAG Alt Text",
      "Processing": "Vision Models"
    },
    color: "#ff5e4d", // Coral Red
    size: 1.1,
    rotationSpeed: 0.3,
    github: "https://github.com/khaled24ao/CaptionAI",
    demo: ""
  },
  {
    id: 9,
    name: "YoutubeSummAI",
    description: "Extracts and generates structured summaries from YouTube videos.",
    fullDescription: "Instantly extracts and summarizes YouTube video content. Paste a URL and it fetches the transcript (via YouTube Transcript API), then uses LLaMA 3.1 to generate a structured summary including: video title, category classification, sentiment analysis, key points with timestamps, and a brief overview. Supports multiple languages (English, Arabic, Spanish, French). Additional features: export summary as Markdown/PDF, shareable links, video embedding, and API endpoints.",
    category: "Video / Text Summarization",
    useCase: "Research, content curation, quick video digestion",
    tech: ["YouTube API", "LLaMA 3.1", "Markdown", "PDF Export"],
    stats: {
      "Languages": "English, Arabic, Spanish, French",
      "Features": "Timestamped Key Points",
      "Exports": "Markdown & PDF"
    },
    color: "#5dade2", // Dusty Blue
    size: 1.15,
    rotationSpeed: 0.2,
    github: "https://github.com/khaled24ao/YoutubeSummAI",
    demo: ""
  },
  {
    id: 10,
    name: "CoachAI",
    description: "Smart personal life coach and productivity tracking platform.",
    fullDescription: "A productivity and life coaching platform acting as a smart personal coach. Features: daily check-ins and mood tracking, SMART goals with milestones and deadlines, progress visualization in charts, intelligent chat for personalized advice, habit formation with streak tracking, a smart reflection diary, and weekly reports. The AI understands context across sessions to provide evolving guidance. Uses SQLAlchemy + SQLite for persistence, Chart.js for analytics, and end-to-end encryption for privacy.",
    category: "Wellness / Personal Development",
    useCase: "Habit tracking, goal setting, mental wellness, productivity coaching",
    tech: ["SQLAlchemy", "SQLite", "Chart.js", "E2E Encryption", "LLaMA"],
    stats: {
      "Tracking": "Habits & Moods",
      "Analytics": "Chart.js Visuals",
      "Privacy": "End-to-End Encrypted"
    },
    color: "#af7ac5", // Soft Purple
    size: 1.09,
    rotationSpeed: 0.25,
    github: "https://github.com/khaled24ao/CoachAI",
    demo: ""
  },
  {
    id: 11,
    name: "CompeteAI",
    description: "Enterprise competitive intelligence platform generating SWOT reports.",
    fullDescription: "An enterprise-grade competitive intelligence platform that transforms web data into actionable SWOT reports. Utilizes a multi-source polling engine (news, social media, financial data, company websites). Features automatic competitor discovery, real-time sentiment analysis, market positioning visualization, threat/opportunity scoring, and automated report generation. Powered by Flask + Celery + Redis for asynchronous processing, Socket.io for real-time dashboard updates, and PostgreSQL for structured data. Includes authentication, per-organization rate limiting, and audit logs.",
    category: "Business Intelligence / Competitive Analysis",
    useCase: "Enterprise strategic auditing, market research, competitor tracking",
    tech: ["Flask", "Celery", "Redis", "PostgreSQL", "Socket.io"],
    stats: {
      "Processing": "Async & Real-time",
      "Reports": "Automated SWOT",
      "Data": "Multi-source Web Scraping"
    },
    color: "#48c9b0", // Turquoise
    size: 1.2,
    rotationSpeed: 0.15,
    github: "https://github.com/khaled24ao/CompeteAI",
    demo: ""
  },
  {
    id: 12,
    name: "ContractAI",
    description: "Smart contract analysis platform for legal risk assessment.",
    fullDescription: "An intelligent contract analysis platform that extracts clauses (parties, dates, payment terms), identifies risks (ambiguous language, liability exposure), summarizes obligations, compares against templates or previous versions, and flags non-standard terms. It highlights specific text segments, provides a severity rating (Low/Medium/High), and suggests improvements. Features version control, audit trails, team collaboration, and role-based access control. Integrates DocuSign for e-signatures and supports 10+ languages.",
    category: "LegalTech / Contract Analysis",
    useCase: "Legal teams, procurement departments, contract review automation",
    tech: ["NLP", "DocuSign API", "PostgreSQL", "Role-based Auth"],
    stats: {
      "Risk Scoring": "Low/Medium/High",
      "Languages": "10+ Supported",
      "Integration": "E-signatures"
    },
    color: "#f5b041", // Sandy Yellow
    size: 1.15,
    rotationSpeed: 0.2,
    github: "https://github.com/khaled24ao/ContractAI",
    demo: ""
  },
  {
    id: 13,
    name: "SocialAI",
    description: "AI social media content generator tailored for multiple platforms.",
    fullDescription: "An AI-powered social media content generator. Input a topic or URL, and it instantly creates tailored posts for specific platforms: LinkedIn (professional tone, article length), Twitter/X (concise, hashtag-optimized), Instagram (visual focus with captions), and Facebook (conversational). Features automatic trending/niche hashtag generation, emoji insertion, character counts, optimal posting time suggestions based on engagement analytics, image recommendations, and A/B testing variants (3 options per post).",
    category: "Marketing / Social Media",
    useCase: "Social media managers, marketers, agencies, content creators",
    tech: ["API Integration", "LLaMA", "Analytics", "Social Media APIs"],
    stats: {
      "Platforms": "LinkedIn, X, IG, FB",
      "Variants": "A/B Testing Support",
      "Optimization": "Hashtags & Timing"
    },
    color: "#ec7063", // Light Red
    size: 1.1,
    rotationSpeed: 0.3,
    github: "https://github.com/khaled24ao/socialai",
    demo: ""
  },
  {
    id: 14,
    name: "MarketAI",
    description: "Comprehensive stock market intelligence platform with real-time AI insights.",
    fullDescription: "A comprehensive stock market intelligence platform combining real-time data with AI-driven insights. Features: live price streaming with millisecond updates (via yfinance), 50+ technical indicators (RSI, MACD, Bollinger Bands), AI price predictions (LSTM + news sentiment), portfolio risk analysis, sector heatmaps, earnings calendars, and customizable alerts. The dashboard displays interactive charts (candlestick, volume), social sentiment dials, and auto-generated market summaries. Built on WebSockets for live updates and PostgreSQL for historical data, including mock trading and backtesting tools.",
    category: "FinTech / Trading",
    useCase: "Day traders, investors, financial analysts, portfolio management",
    tech: ["Python", "yfinance", "LSTM", "WebSockets", "PostgreSQL"],
    stats: {
      "Data Feed": "Real-time (ms)",
      "Indicators": "50+ Technical",
      "AI Models": "LSTM & Sentiment"
    },
    color: "#2ecc71", // Green
    size: 1.2,
    rotationSpeed: 0.1,
    github: "https://github.com/khaled24ao/MarketAI",
    demo: ""
  }
];