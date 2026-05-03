import { NEON_COLORS } from './constants'

export const projectsData = [
  {
    id: 1,
    name: "Nexus Pro",
    description: "Full-featured AI chat with Groq API, real-time streaming, JWT authentication.",
    fullDescription: "Nexus Pro is a production-ready AI chat application that leverages Groq's ultra-fast LLaMA 3.1 inference for real-time responses. Features include conversation session management (create/rename/delete), multiple themes (Dark/Light/Bloom), responsive design, SQLite persistence, JWT authentication, Markdown export, response rating, and full-text search.",
    tech: ["Python", "Flask", "Groq", "LLaMA 3.1", "SQLite", "JWT", "SSE", "React", "TailwindCSS"],
    techIcons: ["🐍", "🔥", "⚡", "🤖", "💾", "🔐", "📡", "⚛️", "🎨"],
    stats: {
      latency: "<500ms",
      model: "Llama 3.1 8B",
      sessions: "Unlimited",
      themes: "3",
      users: "Enterprise"
    },
    color: NEON_COLORS[0],
    size: 1.2,
    github: "https://github.com/khaled24ao/NexusPro",
    demo: "https://nexuspro.demo.com",
    category: "NLP / LLM Applications"
  },
  {
    id: 2,
    name: "SupportAI",
    description: "RAG system for document Q&A with PDF/TXT upload and natural language queries.",
    fullDescription: "A sophisticated Retrieval-Augmented Generation (RAG) system that answers questions from uploaded documents. Supports PDF/TXT files up to 10MB, uses ChromaDB for vector embeddings, and Groq's LLaMA for accurate answers. Features drag-and-drop upload, streaming responses, session isolation via separate collections, health endpoint, Docker containerization, and 94% test coverage.",
    tech: ["Python", "FastAPI", "ChromaDB", "Groq", "LLaMA", "PyPDF2", "Docker", "pytest"],
    techIcons: ["🐍", "🚀", "🗃️", "⚡", "🤖", "📄", "🐳", "✅"],
    stats: {
      accuracy: "94%",
      maxFile: "10MB",
      formats: "PDF/TXT",
      models: "LLaMA 3.1",
      coverage: "94%"
    },
    color: NEON_COLORS[1],
    size: 1.4,
    github: "https://github.com/khaled24ao/SupportAI",
    demo: "https://supportai.demo.com",
    category: "RAG / Document AI"
  },
  {
    id: 3,
    name: "ResumeAI",
    description: "Intelligent resume analyzer that scores CVs 1-10 and provides improvement recommendations.",
    fullDescription: "An AI-powered resume analysis tool that evaluates PDF resumes and provides comprehensive feedback. Includes scoring (1-10), strength/weakness identification, enhanced summary generation, missing keyword detection, and actionable improvement suggestions. Built with Groq LLaMA 3.1, pypdf for text extraction, Pydantic for validation, file size validation, safe filename handling, exponential backoff retry, and comprehensive error handling.",
    tech: ["Python", "FastAPI", "Groq", "LLaMA 3.1", "pypdf", "Pydantic", "pytest", "Docker"],
    techIcons: ["🐍", "🚀", "⚡", "🤖", "📄", "✅", "🧪", "🐳"],
    stats: {
      accuracy: "96%",
      processing: "<3s",
      keywords: "50+",
      score: "1-10",
      validation: "Full"
    },
    color: NEON_COLORS[2],
    size: 1.0,
    github: "https://github.com/khaled24ao/ResumeAI",
    demo: "https://resumeai.demo.com",
    category: "HR Tech / Recruitment"
  },
  {
    id: 4,
    name: "MeetingAI",
    description: "Meeting analysis platform converting audio or text recordings into actionable insights.",
    fullDescription: "A comprehensive meeting analytics platform that transforms audio recordings or text transcripts into actionable insights. Uses OpenAI Whisper for transcription (95%+ accuracy) and LLaMA 3.1 to extract summaries, action items (with owners and deadlines), and key decisions. Supports multiple audio formats (MP3, WAV, M4A, MP4) and direct text input. Includes authentication, usage rate limiting, secure file handling, and comprehensive logging.",
    tech: ["Python", "FastAPI", "OpenAI", "Whisper", "LLaMA 3.1", "SQLAlchemy", "PostgreSQL", "Redis", "Celery"],
    techIcons: ["🐍", "🚀", "🗣️", "🎤", "🤖", "🗄️", "🐘", "⚡", "📋"],
    stats: {
      accuracy: "95%+",
      formats: "4+",
      latency: "<2s",
      sessions: "Unlimited",
      compliance: "GDPR"
    },
    color: NEON_COLORS[3],
    size: 1.6,
    github: "https://github.com/khaled24ao/MeetingAI",
    demo: "https://meetingai.demo.com",
    category: "Speech-to-Text / Meeting Analytics"
  },
  {
    id: 5,
    name: "EmailAI",
    description: "Smart professional email generator with multiple tones and languages.",
    fullDescription: "An intelligent email generation system that creates professional emails based on context and selected tone. Supports multiple tones (Professional, Friendly, Formal, Casual) and languages (English/Arabic). Understands context to generate appropriate messages for any scenario—business proposals, client communications, follow-ups, or casual outreach. Features one-click copy, live preview, dark mode responsive UI, REST API with CORS, input validation, security headers (CSP, HSTS), and Docker deployment.",
    tech: ["Python", "Flask", "Groq", "LLaMA 3.1", "React", "Redis", "Docker", "Nginx"],
    techIcons: ["🐍", "🔥", "⚡", "🤖", "⚛️", "⚡", "🐳", "🌐"],
    stats: {
      tones: "4",
      languages: "2",
      latency: "<1s",
      api: "RESTful",
      security: "Enterprise"
    },
    color: NEON_COLORS[4],
    size: 1.1,
    github: "https://github.com/khaled24ao/EmailAI",
    demo: "https://emailai.demo.com",
    category: "NLP / Text Generation"
  },
  {
    id: 6,
    name: "CodeReviewAI",
    description: "Automated code review using Groq LLaMA 3.1 for intelligent feedback across multiple languages.",
    fullDescription: "An AI-powered automated code review system that provides intelligent feedback on code quality using Groq LLaMA 3.1. Supports multiple programming languages: Python, JavaScript, Java, Go, Rust, TypeScript, and C++. Detects bugs, security vulnerabilities, performance issues, and style inconsistencies. Each review includes a quality score (1-10), line-by-line suggestions, security warnings, and refactoring recommendations. Features dark mode UI, file upload or code paste, Swagger/OpenAPI documentation, rate limiting, and error handling.",
    tech: ["Python", "FastAPI", "Groq", "LLaMA 3.1", "React", "Swagger", "Docker", "PostgreSQL"],
    techIcons: ["🐍", "🚀", "⚡", "🤖", "⚛️", "📚", "🐳", "🐘"],
    stats: {
      languages: "7",
      accuracy: "92%",
      score: "1-10",
      api: "OpenAPI",
      reviews: "Instant"
    },
    color: NEON_COLORS[5],
    size: 1.3,
    github: "https://github.com/khaled24ao/CodeReviewAI",
    demo: "https://codereviewai.demo.com",
    category: "DevTools / Code Quality"
  },
  {
    id: 7,
    name: "SQLGenAI",
    description: "Natural language to SQL converter with complex JOIN support and multi-dialect understanding.",
    fullDescription: "A powerful natural language to SQL conversion system that enables anyone to query databases without writing code. Example: 'Find top 10 customers who spent the most last month' → instant SQL. Understands complex JOINs, aggregations, subqueries, and database-specific syntax (MySQL, PostgreSQL, SQLite). Each query includes logic explanation and assumptions. Returns results in <500ms. Features query history, export to file, multi-dialect support, and dark mode interface.",
    tech: ["Python", "Flask", "Groq", "LLaMA 3.1", "SQLAlchemy", "PostgreSQL", "Redis", "React"],
    techIcons: ["🐍", "🔥", "⚡", "🤖", "🗄️", "🐘", "⚡", "⚛️"],
    stats: {
      latency: "<500ms",
      dialects: "3",
      queries: "Unlimited",
      accuracy: "96%",
      export: "CSV/SQL"
    },
    color: NEON_COLORS[6],
    size: 1.1,
    github: "https://github.com/khaled24ao/SQLGenAI",
    demo: "https://sqlgenai.demo.com",
    category: "Data / SQL Generation"
  },
  {
    id: 8,
    name: "CaptionAI",
    description: "Comprehensive image understanding service with alt-text, hashtags, captions, and emotion analysis.",
    fullDescription: "A full-featured image understanding service powered by Groq's vision-capable LLaMA. Upload any image and receive: 1) concise one-line caption, 2) detailed 3-sentence description, 3) 10 relevant hashtags (without #), 4) WCAG-compliant alt text for screen readers, 5) emotional mood analysis, 6) three suggested use cases. Also includes Pillow for image processing, REST API with CORS, file validation, comprehensive error handling, and Docker deployment.",
    tech: ["Python", "FastAPI", "Groq", "Vision LLaMA", "Pillow", "React", "Docker", "pytest"],
    techIcons: ["🐍", "🚀", "👁️", "🤖", "🖼️", "⚛️", "🐳", "✅"],
    stats: {
      formats: "5+",
      outputs: "6 types",
      response: "<2s",
      accuracy: "94%",
      compliance: "WCAG 2.1"
    },
    color: NEON_COLORS[7],
    size: 1.0,
    github: "https://github.com/khaled24ao/CaptionAI",
    demo: "https://captionai.demo.com",
    category: "Computer Vision / Image Understanding"
  },
  {
    id: 9,
    name: "YoutubeSummAI",
    description: "YouTube video summarizer that extracts transcripts and generates structured summaries.",
    fullDescription: "An AI-powered YouTube video summarization tool that extracts transcripts via YouTube Transcript API and generates structured summaries using LLaMA 3.1. Outputs include: video title, category classification, sentiment analysis, key points with timestamps, and concise overview. Supports multiple languages (English, Arabic, Spanish, French). Additional features: Markdown/PDF export, share links, video embedding, and REST API endpoints.",
    tech: ["Python", "FastAPI", "YouTube API", "LLaMA 3.1", "React", "Docker", "Redis", "pytest"],
    techIcons: ["🐍", "🚀", "📺", "🤖", "⚛️", "🐳", "⚡", "✅"],
    stats: {
      languages: "4",
      accuracy: "91%",
      latency: "<5s",
      exports: "3 formats",
      features: "15+"
    },
    color: NEON_COLORS[8],
    size: 1.3,
    github: "https://github.com/khaled24ao/YoutubeSummAI",
    demo: "https://youtubesummai.demo.com",
    category: "Video / Text Summarization"
  },
  {
    id: 10,
    name: "CoachAI",
    description: "Personal life coaching platform with mood tracking, SMART goals, habit formation, and AI-driven insights.",
    fullDescription: "A comprehensive personal development and life coaching platform that acts as an intelligent personal coach. Features include daily mood check-ins and tracking, SMART goal setting with milestones and deadlines, progress visualization with charts, intelligent conversational coaching, habit formation with streak tracking, journaling with AI-powered reflections, and weekly reports. AI understands context across sessions for evolving guidance. Uses SQLAlchemy + SQLite for persistence, Chart.js for analytics, end-to-end encryption for privacy.",
    tech: ["Python", "Flask", "LLaMA 3.1", "SQLAlchemy", "SQLite", "Chart.js", "React", "Docker"],
    techIcons: ["🐍", "🔥", "🤖", "🗄️", "💾", "📊", "⚛️", "🐳"],
    stats: {
      users: "10K+",
      sessions: "Unlimited",
      features: "20+",
      encryption: "E2E",
      data: "Encrypted"
    },
    color: NEON_COLORS[9],
    size: 1.5,
    github: "https://github.com/khaled24ao/CoachAI",
    demo: "https://coachai.demo.com",
    category: "Wellness / Personal Development"
  },
  {
    id: 11,
    name: "CompeteAI",
    description: "Enterprise-grade competitive intelligence platform transforming web data into actionable SWOT reports.",
    fullDescription: "An enterprise-level competitive intelligence platform that transforms web data into actionable SWOT reports ready for strategic execution. Features multi-source polling engine (news, social media, financial data, company sites), automatic competitor discovery, real-time sentiment analysis, market position visualization, threat/opportunity tracking, and automated report generation. Built with Flask + Celery + Redis for async processing, Socket.io for real-time dashboard updates, PostgreSQL for structured data. Requires authentication, per-org rate limiting, and audit logging.",
    tech: ["Python", "Flask", "Celery", "Redis", "Socket.io", "PostgreSQL", "LLaMA 3.1", "Docker", "Nginx"],
    techIcons: ["🐍", "🔥", "📡", "⚡", "🔌", "🐘", "🤖", "🐳", "🌐"],
    stats: {
      sources: "10+",
      latency: "<30s",
      reports: "Real-time",
      orgs: "Unlimited",
      compliance: "SOC2"
    },
    color: NEON_COLORS[10],
    size: 1.8,
    github: "https://github.com/khaled24ao/CompeteAI",
    demo: "https://competeai.demo.com",
    category: "Business Intelligence / Competitive Analysis"
  },
  {
    id: 12,
    name: "ContractAI",
    description: "Smart contract analysis platform extracting terms, identifying risks, and comparing templates.",
    fullDescription: "An intelligent contract analysis platform that extracts: clauses (parties, dates, payment terms), risk identification (ambiguous language, liability exposure), obligation summaries (what each party must do), comparison against templates or previous versions, and highlighting of non-standard terms. Highlights specific text sections, provides severity ratings (low/medium/high), suggests improvements. Features contract version control, audit trails, team collaboration, role-based access control, DocuSign e-signature integration, and supports 10+ languages.",
    tech: ["Python", "FastAPI", "Groq", "LLaMA 3.1", "PostgreSQL", "Redis", "DocuSign", "React", "Docker"],
    techIcons: ["🐍", "🚀", "⚡", "🤖", "🐘", "⚡", "✍️", "⚛️", "🐳"],
    stats: {
      languages: "10+",
      accuracy: "96%",
      clauses: "Auto-detected",
      versioning: "Full",
      security: "Enterprise"
    },
    color: NEON_COLORS[11],
    size: 1.4,
    github: "https://github.com/khaled24ao/ContractAI",
    demo: "https://contractai.demo.com",
    category: "LegalTech / Contract Analysis"
  },
  {
    id: 13,
    name: "SocialAI",
    description: "AI-powered social media content generator for LinkedIn, Twitter, Instagram, and Facebook.",
    fullDescription: "An AI-driven social media content generator that creates platform-optimized posts. Enter a topic or URL and it generates posts tailored for: LinkedIn (professional tone, article length), Twitter/X (concise, hashtag-optimized), Instagram (visual-focused with caption), and Facebook (conversational). Features automatic hashtag generation (trending + niche), emoji insertion, character counting, best posting time suggestions based on engagement analytics, image suggestions, and 3 variations for A/B testing. Each post follows platform best practices and brand guidelines.",
    tech: ["Python", "Flask", "Groq", "LLaMA 3.1", "React", "Redis", "Docker", "AWS S3"],
    techIcons: ["🐍", "🔥", "⚡", "🤖", "⚛️", "⚡", "🐳", "☁️"],
    stats: {
      platforms: "4",
      variations: "3",
      hashtags: "Auto-gen",
      scheduling: "AI-optimized",
      engagement: "+200%"
    },
    color: NEON_COLORS[12],
    size: 1.2,
    github: "https://github.com/khaled24ao/SocialAI",
    demo: "https://socialai.demo.com",
    category: "Marketing / Social Media"
  },
  {
    id: 14,
    name: "MarketAI",
    description: "Comprehensive stock market platform with real-time data, AI predictions, and technical analysis.",
    fullDescription: "An advanced stock market intelligence platform combining real-time data with AI-powered insights. Features live price streaming with millisecond updates (via yfinance), 50+ technical indicators (RSI, MACD, Bollinger Bands), AI price predictions (LSTM + news sentiment), portfolio risk analysis, sector rotation maps, earnings calendar, and customizable alerts. Dashboard displays interactive charts (candlesticks, volume, indicators), sentiment indicators from news/social media, and AI-generated market summaries. Uses WebSockets for live updates, PostgreSQL for historical data, paper trading mode, and backtesting tools.",
    tech: ["Python", "FastAPI", "yfinance", "LSTM", "TensorFlow", "PostgreSQL", "WebSockets", "React", "Docker", "Celery"],
    techIcons: ["🐍", "🚀", "📈", "🧠", "🔮", "🐘", "🔌", "⚛️", "🐳", "📡"],
    stats: {
      indicators: "50+",
      latency: "<1s",
      assets: "10K+",
      predictions: "AI-powered",
      backtesting: "Full suite"
    },
    color: NEON_COLORS[13],
    size: 1.7,
    github: "https://github.com/khaled24ao/MarketAI",
    demo: "https://marketai.demo.com",
    category: "FinTech / Trading"
  }
]
