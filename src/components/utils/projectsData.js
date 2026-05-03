// src/utils/projectsData.js

/**
 * Projects Data File - AAA-Portfolio Edition
 * 
 * Contains all 14 AI/MLOps projects with specific 3D properties
 * (Textures, Size, Rotation, Colors) for the Galaxy Scene.
 */

export const projectsData = [
  {
    id: 1,
    name: "Nexus Pro",
    description: "Comprehensive smart chat application integrating Groq API for instant responses.",
    fullDescription: "Comprehensive smart chat application integrating Groq API for instant responses. Supports chat sessions with create/rename/delete, multiple themes (dark/light/blossom), and responsive design. Data is saved in SQLite with JWT authentication and Markdown export capabilities.",
    tech: ["Python", "Flask", "Groq", "LLaMA 3.1", "SQLite", "JWT", "SSE"],
    stats: {
      latency: "<500ms",
      model: "Llama 3.1 8B",
      sessions: "Unlimited",
      themes: 3,
    },
    color: "#00f2ff", // Bright Cyan Glow
    size: 1.4,
    rotationSpeed: 0.1,
    github: "https://github.com/khaled24ao/NexusPro",
    demo: "https://nexuspro.demo.com"
  },
  {
    id: 2,
    name: "SupportAI",
    description: "RAG system for answering questions from documents.",
    fullDescription: "RAG system for answering questions from documents. Allows uploading PDF/TXT files (up to 10MB) and asking questions in natural language. Uses ChromaDB for vector storage and Groq's LLaMA for accurate response generation.",
    tech: ["Python", "ChromaDB", "PDF Processing", "FastAPI", "LLaMA", "Embeddings"],
    stats: {
      "Max File": "10MB",
      "Accuracy": "94%",
      "Response Time": "<1s",
    },
    color: "#b967ff", // Bright Purple
    size: 1.2,
    rotationSpeed: 0.3,
    github: "https://github.com/khaled24ao/SupportAI",
    demo: "https://supportai.demo.com"
  },
  {
    id: 3,
    name: "ResumeAI",
    description: "Smart resume parser that analyzes PDFs and provides a score from 1-10.",
    fullDescription: "Smart resume parser that analyzes PDFs and provides a score from 1-10, strengths, weaknesses, an optimized summary, and missing keywords. Uses Groq LLaMA 3.1, pypdf for text extraction, and Pydantic for validation.",
    tech: ["Python", "PyPDF", "Pydantic", "FastAPI", "LLaMA", "NLP"],
    stats: {
      "Accuracy": "96%",
      "Formats": "PDF, TXT, DOCX",
      "Processing": "<2s",
    },
    color: "#ff33ff", // Bright Magenta
    size: 1.0,
    rotationSpeed: 0.2,
    github: "https://github.com/khaled24ao/ResumeAI",
    demo: "https://resumeai.demo.com"
  },
  {
    id: 4,
    name: "MeetingAI",
    description: "Meeting analysis platform converting audio recordings into actionable insights.",
    fullDescription: "Meeting analysis platform that converts audio recordings or transcripts into actionable insights. Uses OpenAI Whisper for transcription (95%+ accuracy) and LLaMA 3.1 to extract summaries and action items.",
    tech: ["Python", "Whisper", "LLaMA", "Audio Processing", "FastAPI", "SQLAlchemy"],
    stats: {
      "Accuracy": "95%",
      "Formats": "MP3, WAV, MP4",
      "Languages": "15+",
    },
    color: "#ffcc00", // Bright Gold
    size: 1.25,
    rotationSpeed: 0.15,
    github: "https://github.com/khaled24ao/MeetingAI",
    demo: "https://meetingai.demo.com"
  },
  {
    id: 5,
    name: "EmailAI",
    description: "Smart professional email generator.",
    fullDescription: "Smart professional email generator. Choose from multiple tones (Professional, Friendly, Formal, Casual) and languages (English/Arabic). Features: one-click copy, live preview, and responsive dark UI.",
    tech: ["React", "Node.js", "LLaMA", "Express", "MongoDB", "Tailwind"],
    stats: {
      "Tones": 4,
      "Languages": 12,
      "API Rate": "Unlimited",
    },
    color: "#2eff8b", // Emerald Green
    size: 1.05,
    rotationSpeed: 0.25,
    github: "https://github.com/khaled24ao/EmailAI",
    demo: "https://emailai.demo.com"
  },
  {
    id: 6,
    name: "CodeReviewAI",
    description: "Automated code reviewer using Groq LLaMA 3.1.",
    fullDescription: "Automated code reviewer using Groq LLaMA 3.1 to provide intelligent feedback on code quality. Supports multiple programming languages: Python, JavaScript, Java, Go, Rust, TypeScript, C++.",
    tech: ["Python", "FastAPI", "LLaMA", "AST Parser", "Redis", "PostgreSQL"],
    stats: {
      "Languages": 7,
      "Detection": "Bugs, Security",
      "Score": "1-10",
    },
    color: "#ff4d4d", // Neon Red
    size: 1.1,
    rotationSpeed: 0.4,
    github: "https://github.com/khaled24ao/CodeReviewAI",
    demo: "https://codereviewai.demo.com"
  },
  {
    id: 7,
    name: "SQLGenAI",
    description: "Converts natural language queries directly into complex SQL.",
    fullDescription: "Converts natural language to SQL. Allows anyone to query databases without writing code. Understands complex JOINs, aggregations, and database-specific dialects (MySQL, PostgreSQL, SQLite).",
    tech: ["Python", "LLaMA", "SQLAlchemy", "FastAPI", "Pandas", "Query Parser"],
    stats: {
      "Response": "<500ms",
      "DB Support": "5+",
      "Query Types": "Complex",
    },
    color: "#00e6ff", // Bright Sky Blue
    size: 1.2,
    rotationSpeed: 0.1,
    github: "https://github.com/khaled24ao/SQLGenAI",
    demo: "https://sqlgenai.demo.com"
  },
  {
    id: 8,
    name: "CaptionAI",
    description: "Comprehensive image understanding service.",
    fullDescription: "Comprehensive image understanding service. Upload any image and receive: a brief summary, a detailed 3-sentence description, 10 relevant hashtags, alt text, emotional analysis, and usage suggestions.",
    tech: ["Python", "Vision LLaMA", "PIL", "FastAPI", "CORS", "Docker"],
    stats: {
      "Output": "6 components",
      "Max Size": "50MB",
      "Processing": "<2s",
    },
    color: "#ff5e4d", // Coral Red
    size: 1.1,
    rotationSpeed: 0.3,
    github: "https://github.com/khaled24ao/CaptionAI",
    demo: "https://captionai.demo.com"
  },
  {
    id: 9,
    name: "YoutubeSummAI",
    description: "Extracts and summarizes YouTube video content instantly.",
    fullDescription: "Extracts and summarizes YouTube video content. Paste a YouTube link and it fetches the transcript, then uses LLaMA 3.1 to generate a structured summary including: title, category classification, sentiment analysis, and key points.",
    tech: ["Python", "YouTube API", "LLaMA", "FastAPI", "Markdown", "Playwright"],
    stats: {
      "Languages": 15,
      "Export": "MD, PDF",
      "Speed": "<5s",
    },
    color: "#5dade2", // Dusty Blue
    size: 1.15,
    rotationSpeed: 0.2,
    github: "https://github.com/khaled24ao/YoutubeSummAI",
    demo: "https://youtubesummai.demo.com"
  },
  {
    id: 10,
    name: "CoachAI",
    description: "Productivity life coaching platform acting as a smart personal coach.",
    fullDescription: "Productivity life coaching platform acting as a smart personal coach. Features: daily check-ins and mood tracking, SMART goals with milestones and deadlines, progress visualization in charts, and intelligent chat for personalized advice.",
    tech: ["React", "Node.js", "SQLAlchemy", "Chart.js", "LLaMA", "SQLite"],
    stats: {
      "Goals": "Unlimited",
      "Habits": "Track 30+ days",
      "Analytics": "Weekly reports",
    },
    color: "#af7ac5", // Soft Purple
    size: 1.09,
    rotationSpeed: 0.25,
    github: "https://github.com/khaled24ao/CoachAI",
    demo: "https://coachai.demo.com"
  },
  {
    id: 11,
    name: "CompeteAI",
    description: "Enterprise-grade competitive intelligence platform.",
    fullDescription: "Enterprise-grade competitive intelligence platform that turns web data into actionable SWOT reports. Uses a multi-source crawling engine (news, social media, financial data).",
    tech: ["Flask", "Celery", "Redis", "PostgreSQL", "Socket.io", "Web Scraping"],
    stats: {
      "Data Sources": "10+",
      "Update": "Real-time",
      "Reports": "Auto-generated",
    },
    color: "#48c9b0", // Soft Turquoise
    size: 1.2,
    rotationSpeed: 0.15,
    github: "https://github.com/khaled24ao/CompeteAI",
    demo: "https://competeai.demo.com"
  },
  {
    id: 12,
    name: "ContractAI",
    description: "Smart contract analysis platform extracting key legal insights.",
    fullDescription: "Smart contract analysis platform that extracts clauses, identifies risks, summarizes obligations, compares against templates or previous versions, and flags non-standard terms.",
    tech: ["Python", "LLaMA", "FastAPI", "DocuSign", "PostgreSQL", "NLP"],
    stats: {
      "Languages": "10+",
      "Risk Levels": "3 tiers",
      "Accuracy": "98%",
      "Accuracy": "98%",
    },
    color: "#f5b041", // Sandy Yellow
    size: 1.15,
    rotationSpeed: 0.2,
    github: "https://github.com/khaled24ao/ContractAI",
    demo: "https://contractai.demo.com"
  },
  {
    id: 13,
    name: "SocialAI",
    description: "AI social media content generator for multiple platforms.",
    fullDescription: "AI social media content generator. Enter a topic or URL, and it generates tailored posts for each platform: LinkedIn, Twitter/X, Instagram, and Facebook.",
    tech: ["React", "Node.js", "LLaMA", "Hashtag API", "Emoji API", "MongoDB"],
    stats: {
      "Platforms": 4,
      "Variants": "3 per post",
      "Hashtags": "Auto-generated",
    },
    color: "#ec7063", // Light Red
    size: 1.1,
    rotationSpeed: 0.3,
    github: "https://github.com/khaled24ao/SocialAI",
    demo: "https://socialai.demo.com"
  },
  {
    id: 14,
    name: "MarketAI",
    description: "Comprehensive stock market intelligence platform.",
    fullDescription: "Comprehensive stock market intelligence platform combining real-time data with AI-driven insights. Features: live price streams, 50+ technical indicators, AI price predictions, and portfolio risk analysis.",
    tech: ["Python", "yfinance", "LSTM", "FastAPI", "WebSocket", "PostgreSQL"],
    stats: {
      "Indicators": "50+",
      "Update": "Millisecond",
      "Backtesting": "Yes",
    },
    color: "#2ecc71", // Emerald Green
    size: 1.2,
    rotationSpeed: 0.1,
    github: "https://github.com/khaled24ao/MarketAI",
    demo: "https://marketai.demo.com"
  }
];