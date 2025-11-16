# INTELLIDOC - AI Document Reading & Summarization Platform

> Last updated: 2025-11-16
> 
> **Your AI That Reads So You Don't Have To**

A modern, premium AI-powered document intelligence platform that instantly summarizes, searches, and extracts insights from any document. Built with a stunning Midnight Neon AI aesthetic and interactive micro UI demonstrations.

## Overview

INTELLIDOC combines intelligent document processing with a beautiful, modern web experience:

- **Instant AI Summarization**: Read documents in seconds, not hours
- **Semantic Search**: Ask questions in natural language, get precise answers
- **Multi-format Support**: PDF, DOCX, TXT - we read everything
- **Real-time Processing**: Watch your documents transform instantly
- **Premium UI**: Midnight Neon AI theme with glass morphism effects
- **Interactive Demo**: Live product showcase inside a premium phone mockup

## 🎯 Core Features

### Document Intelligence
✨ **AI-Powered Summarization**
- Instant extraction of key insights and main points
- Context-aware summaries from any document length
- Powered by advanced transformers and BART models

🔍 **Semantic Search**
- Ask questions in natural language
- AI understands context and meaning, not just keywords
- Vector embeddings for intelligent retrieval
- Cross-encoder re-ranking for best results

📎 **Multi-Document Support**
- PDF, Word, and Text files
- Smart text extraction with fallback strategies
- Automatic chunking with context preservation
- Automatic summarization on upload

### User Experience
🎨 **Midnight Neon AI Theme**
- Navy and purple gradient aesthetic (#090D1F, #9A4DFF)
- Glass morphism effects with backdrop blur
- Smooth Framer Motion animations
- Responsive design for all devices

📱 **Interactive Phone Mockup**
- Live demo of the upload → summarize flow
- Shows the complete product experience in 10 seconds
- Realistic device hardware details with premium animations
- Micro-interactions showcase core value proposition

## Architecture

### Backend (`/backend`)
- **Framework**: FastAPI - modern, fast, production-ready
- **Database**: PostgreSQL with pgvector for vector storage
- **ML Models**: 
  - Sentence Transformers (embeddings)
  - Llama 3 / Mistral (text generation)
  - BART (summarization)
  - Cross-encoder (re-ranking)

### Frontend (`/frontend`)
- **Framework**: React 18 + TypeScript with strict mode
- **Build Tool**: Vite 5.4.19 for lightning-fast development
- **Styling**: Tailwind CSS + custom design system
- **Animations**: Framer Motion for premium micro-interactions
- **UI Components**:
  - Hero with floating phone mockup demo
  - SearchResults with EnhancedSearchResults component
  - Premium UploadForm with drag-and-drop
  - Dashboard for document management
  - Contact & Support pages with glass cards

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+ (3.11+ recommended)
- Node.js 18+ (with npm)
- PostgreSQL 13+ (optional - defaults to SQLite)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app/init_db.py  # Initialize database
python start_server.py  # or: uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Development server at localhost:5174
npm run build  # Production build
npm run preview  # Preview production build
```

## 🎨 Design System - Midnight Neon AI

### Color Palette
```javascript
navy-primary:        #090D1F  // Deep space navy
navy-secondary:      #11152B  // Rich navy
navy-tertiary:       #191F35  // Medium navy
accent-neon-purple:  #9A4DFF  // Vibrant purple
accent-neon-cyan:    #4F9CFF  // Bright cyan
text-primary:        #FFFFFF  // White (90% opacity)
text-secondary:      #D4D8E8  // Light gray
```

### Components with Midnight Neon Theme
- ✅ **Hero** - Floating phone mockup with gradient text
- ✅ **Navbar** - Glass effect, neon logo gradient, seamless design
- ✅ **Footer** - Dark theme, decorative neon blobs, no borders
- ✅ **Contact Page** - Glass cards, gradient forms, 3 info sections
- ✅ **Summarize Page** - Dark cards, purple selections, neon inputs
- ✅ **Phone Mockup** - 9 premium enhancements, realistic hardware, shimmer animations
- ✅ **All Pages** - Consistent midnight neon aesthetic

### Premium Phone Mockup Features
1. **Subtle Float Animation** - 5px movement over 5 seconds
2. **Radial Glow** - Violet→blue gradient behind phone
3. **Inner Screen Glow** - Linear gradient with inset shadow for depth
4. **Realistic Notch** - Hardware-accurate with highlight line
5. **Shimmer Animations** - Document lines pulse with moving gradient
6. **Glass Reflection** - Diagonal gradient at 15% opacity
7. **Enhanced Text Contrast** - White 90% with shadows, bright purple accents
8. **Softer Drop Shadow** - 85px blur with purple tone
9. **Modern Proportions** - Thinner bezels, realistic aspect ratio 9:20

## 📱 Interactive Demo - Upload → Summarize Flow

The phone mockup includes a continuous animated demo showcasing the core product:

**Timeline (10 seconds total)**:
1. **Upload Button** (1.5s) - "Upload File" CTA with gradient glow
2. **File Preview** (1.5s) - PDF card appears with document details
3. **AI Analyzing** (2s) - Spinning loader with "Reading 24 pages"
4. **Summary Result** (3.5s) - Glass card with 3 key insights
5. **Loop** - Repeats continuously

Each step has smooth Framer Motion animations with staggered reveals for visual polish.

## 🔌 API Endpoints

### Document Management
```
POST   /upload              Upload and process document
GET    /documents           List user's documents
GET    /documents/{id}      Get document details
DELETE /documents/{id}      Delete document
```

### Search & Intelligence
```
GET    /search?q=query              Semantic search
POST   /summarize                   Summarize document(s)
POST   /chat                        Chat with document
POST   /extract                     Extract specific info
```

## 📊 Data Models

### Document
```python
id: int                    # Unique identifier
title: str                 # Filename
content: str               # Full extracted text
summary: str               # AI-generated summary
created_at: datetime       # Upload timestamp
chunks: List[Chunk]        # Text segments
```

### Chunk
```python
id: int
text: str                  # Text segment
embedding: Vector          # 384-dim vector
document_id: int           # Reference to document
```

## 🧠 AI Pipeline

### Document Upload Flow
1. **Text Extraction** - Multi-format extraction with fallbacks
2. **Text Cleaning** - Normalize formatting and encoding
3. **Smart Chunking** - 800 chars per chunk, 120 char overlap
4. **Summarization** - BART model generates preview
5. **Embedding** - Sentence Transformers → 384-dim vectors
6. **Storage** - Persist to PostgreSQL with pgvector

### Search Flow
1. **Query Embedding** - Convert search query to vector
2. **Vector Search** - Find similar chunks via cosine similarity
3. **Re-ranking** - Cross-encoder scores relevance
4. **Answer Synthesis** - LLM generates coherent response
5. **Source Attribution** - Return references to original docs

## 🛠️ Development

### Hot Development
```bash
# Terminal 1: Backend
cd backend && python start_server.py

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Building for Production
```bash
# Backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
npm run build
```

### Testing
- Backend: Swagger UI at `http://localhost:8000/docs`
- Frontend: React DevTools browser extension
- Full-stack: Open `http://localhost:5174`

## 📦 Project Structure

```
ai-doc-tool/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── crud.py              # DB operations
│   │   ├── ai_utils.py          # AI/ML utilities
│   │   ├── mcp_ai_utils.py      # MCP integration
│   │   ├── db.py                # DB config
│   │   ├── logger.py            # Logging setup
│   │   └── init_db.py           # DB initialization
│   ├── requirements.txt
│   ├── start_server.py          # Server launcher
│   └── uploads/                 # File storage
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.tsx                  # Landing section
│   │   │   ├── PhoneMockup.tsx           # Interactive demo
│   │   │   ├── navbar.tsx                # Header
│   │   │   ├── Footer.tsx                # Footer
│   │   │   ├── UploadForm.tsx            # Upload widget
│   │   │   ├── SearchBar.tsx             # Search input
│   │   │   ├── SearchResults.tsx         # Results display
│   │   │   ├── EnhancedSearchResults.tsx # Modern results
│   │   │   ├── ScreenshotCard.tsx        # Demo card
│   │   │   └── [other components]
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Docs.tsx
│   │   │   ├── Summarize.tsx
│   │   │   ├── ContactPersonal.tsx
│   │   │   ├── [other pages]
│   │   └── App.tsx               # Main app
│   ├── tailwind.config.js        # Tailwind theme
│   ├── vite.config.ts            # Vite config
│   └── tsconfig.json             # TypeScript config
└── mcp_server/
    ├── server.py
    └── groq_server.py
```

## 🚀 Performance & Scaling

### Current Optimizations
- **Model Caching**: Singleton pattern for LLM/embedding models
- **Vector Search**: Efficient cosine similarity with normalization
- **Chunking**: Smart splitting preserves context
- **Re-ranking**: Cross-encoder improves precision
- **Frontend**: Vite for fast HMR and optimized builds

### Future Scalability
- [ ] pgvector approximate nearest neighbor (ANN) search
- [ ] Redis caching for embeddings and results
- [ ] Distributed document processing with Celery
- [ ] Multi-GPU inference with vLLM
- [ ] API rate limiting and request queuing

## 🔐 Security

- **Input Validation**: Pydantic schemas validate all inputs
- **File Upload**: Whitelist format, size limits, scan for malware
- **CORS**: Configurable allowed origins (all origins in dev)
- **Error Handling**: Never expose internal stack traces
- **Data Privacy**: Uploaded documents stored securely
- **Authentication**: Ready for OAuth 2.0 + JWT (see OAUTH_README.md)

## 📝 Recent Updates (v1.2.0)

✨ **UI/UX Enhancements**
- Complete Midnight Neon AI theme redesign
- Premium phone mockup with 9 enhancements
- Interactive upload → summarize flow demo
- Glass morphism effects throughout
- Framer Motion animations on all pages
- Responsive design improvements

🐛 **Bug Fixes**
- Fixed TypeScript errors in Hero and ScreenshotCard
- Removed unused imports and props
- Fixed z-index layering issues
- Improved text contrast for accessibility

## 🎯 Future Roadmap

### Near Term
- [ ] User authentication and profiles
- [ ] Document organization with folders
- [ ] Advanced search filters
- [ ] Export to PDF/Word
- [ ] Dark/Light theme toggle

### Medium Term
- [ ] Real-time collaboration
- [ ] Multi-language support
- [ ] Custom AI model training
- [ ] Batch document processing
- [ ] API webhooks

### Long Term
- [ ] Fully embedded LLM (no external APIs)
- [ ] On-premise deployment
- [ ] Enterprise features (SSO, audit logs)
- [ ] Mobile native app
- [ ] Voice document input

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with clear commits
4. Push to your fork (`git push origin feature/amazing-feature`)
5. Open a Pull Request with detailed description

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 💬 Support & Feedback

- **Issues**: GitHub Issues for bugs and feature requests
- **Documentation**: API docs at `/docs`, code comments inline
- **Community**: Discussions tab on GitHub
- **Contact**: See Contact page in app or reach out via email

---

**Made with ❤️ for document intelligence**
