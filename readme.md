# AI Document Search Tool

An intelligent document search application that uses AI embeddings and natural language processing to provide semantic search capabilities across uploaded documents.

## Overview

This project consists of a **FastAPI backend** and a **React TypeScript frontend** that together provide:
- Document upload and text extraction (PDF, DOCX, TXT)
- AI-powered text chunking and embedding generation
- Semantic search with vector similarity
- Intelligent answer synthesis using large language models
- Modern, responsive web interface

## Architecture

### Backend (`/backend`)
- **Framework**: FastAPI with SQLAlchemy ORM
- **Database**: PostgreSQL with pgvector extension support
- **AI Models**: 
  - Sentence Transformers for embeddings
  - Hugging Face transformers for text generation
  - Cross-encoder for result re-ranking
  - BART for summarization

### Frontend (`/frontend`)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI**: Modern, responsive design with gradient backgrounds

## Features

### Document Processing
- **Multi-format Support**: PDF, DOCX, and TXT files
- **Intelligent Text Extraction**: Uses pdfplumber and PyPDF2 for PDFs, python-docx for Word documents
- **Smart Chunking**: Contextual text splitting with configurable overlap
- **Automatic Summarization**: Generates document summaries using BART model

### AI-Powered Search
- **Semantic Search**: Uses sentence transformers for contextual understanding
- **Vector Embeddings**: Normalized embeddings for optimal similarity matching
- **Re-ranking**: Cross-encoder model improves result relevance
- **Answer Synthesis**: LLM-powered answer generation from retrieved contexts

### Web Interface
- **Drag & Drop Upload**: Intuitive file upload interface
- **Real-time Search**: Instant search results with loading states
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Error Handling**: Comprehensive error states and user feedback

## Technology Stack

### Backend Dependencies
```
fastapi              # Modern, fast web framework
uvicorn             # ASGI web server
sqlalchemy          # SQL ORM
psycopg2-binary     # PostgreSQL adapter
pgvector            # Vector database extension
pydantic            # Data validation
python-multipart    # File upload support
transformers        # Hugging Face models
sentence-transformers # Embedding models
torch               # PyTorch for deep learning
pdfplumber          # PDF text extraction
python-docx         # Word document processing
PyPDF2              # Alternative PDF processing
chardet             # Character encoding detection
```

### Frontend Dependencies
```
react               # UI library
react-dom           # React DOM renderer
typescript          # Type safety
vite                # Build tool
tailwindcss         # Utility-first CSS
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (optional, uses in-memory similarity for now)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m app.init_db  # Initialize database
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### POST `/upload`
Upload and process a document
- **Body**: FormData with file
- **Response**: `{"id": int, "title": str, "message": str}`
- **Processing**: Extracts text, generates summary, creates embeddings, stores in database

### GET `/search`
Search documents with natural language queries
- **Query Parameter**: `q` (search query)
- **Response**: `AnswerOut` schema with query, answer, and sources
- **Process**: Generates query embedding → retrieves similar chunks → re-ranks → synthesizes answer

## Data Models

### Document
```python
class Document(Base):
    id: int
    title: str          # Original filename
    content: str        # Full extracted text
    summary: str        # AI-generated summary
    chunks: List[Chunk] # Related text chunks
```

### Chunk
```python
class Chunk(Base):
    id: int
    text: str           # Chunk content
    embedding: List[float]  # Normalized vector embedding
    doc_id: int         # Foreign key to document
```

## AI Pipeline

### 1. Document Upload
1. **Text Extraction**: Multi-format extraction with fallback strategies
2. **Text Cleaning**: Normalize whitespace and formatting
3. **Summarization**: Generate preview summary (first 1500 words → BART)
4. **Chunking**: Smart splitting on natural boundaries (800 chars, 120 overlap)
5. **Embedding**: Generate normalized vectors using sentence transformers
6. **Storage**: Persist document and chunks with embeddings

### 2. Search Process
1. **Query Embedding**: Convert search query to vector representation
2. **Similarity Search**: Cosine similarity against all chunk embeddings
3. **Re-ranking**: Cross-encoder scores query-passage pairs for relevance
4. **Answer Synthesis**: LLM generates coherent answer from top contexts
5. **Source Attribution**: Return relevant document sources

## Model Details

### Embedding Model
- **Model**: `sentence-transformers/multi-qa-MiniLM-L6-cos-v1`
- **Purpose**: Semantic similarity and retrieval
- **Output**: 384-dimensional normalized vectors

### Text Generation Models (Fallback Chain)
1. **Primary**: `meta-llama/Meta-Llama-3-8B-Instruct`
2. **Secondary**: `mistralai/Mistral-7B-Instruct-v0.2`
3. **Fallback**: `google/flan-t5-large`

### Specialized Models
- **Re-ranking**: `cross-encoder/ms-marco-MiniLM-L-6-v2`
- **Summarization**: `facebook/bart-large-cnn`

## Configuration

### Environment Variables
```bash
# Database (optional - uses SQLite by default)
DATABASE_URL=postgresql://user:pass@localhost/dbname

# CORS (production)
ALLOWED_ORIGINS=["https://yourdomain.com"]
```

### Customizable Parameters
- **Chunk Size**: Default 800 characters
- **Chunk Overlap**: Default 120 characters  
- **Search Results**: Top 10 retrieved, top 3 used for synthesis
- **Upload Directory**: `uploads/` folder

## Project Structure

```
ai-doc-tool/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── crud.py          # Database operations
│   │   ├── ai_utils.py      # AI/ML utilities
│   │   ├── db.py            # Database configuration
│   │   ├── embeddings.py    # Embedding utilities
│   │   └── init_db.py       # Database initialization
│   ├── requirements.txt
│   ├── uploads/             # Uploaded files storage
│   └── pgvector/            # Vector database setup
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   ├── UploadForm.tsx
│   │   │   └── navbar.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx          # Main application
│   │   └── main.tsx         # React entry point
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
└── CLAUDE.md                # This documentation file
```

## Usage Examples

### Document Upload
1. Select a PDF, DOCX, or TXT file
2. Click "Upload" 
3. System extracts text, generates embeddings, and stores in database
4. Receive confirmation with document ID

### Semantic Search
1. Enter natural language query: "What is the exam date?"
2. System finds relevant text chunks using vector similarity
3. Re-ranks results for relevance
4. Synthesizes coherent answer from top contexts
5. Returns answer with source attribution

## Performance Considerations

### Scaling
- **Current**: In-memory cosine similarity (suitable for small-medium datasets)
- **Future**: pgvector extension for efficient approximate nearest neighbor search
- **Model Loading**: Singleton pattern prevents repeated model initialization
- **Memory**: Models cached in memory for faster inference

### Optimization
- **Chunking**: Smart splitting preserves context while enabling granular search
- **Normalization**: L2-normalized embeddings for efficient similarity computation
- **Re-ranking**: Cross-encoder improves precision over initial retrieval
- **Caching**: Potential for embedding and result caching

## Development

### Backend Development
```bash
# Auto-reload during development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
# Hot module replacement
npm run dev
```

### Testing
- Backend: FastAPI automatic documentation at `/docs`
- Frontend: React DevTools and browser testing
- API Testing: Use provided Swagger UI or tools like Postman

## Security Considerations

- **CORS**: Currently allows all origins (narrow for production)
- **File Upload**: Limited to specific formats, stored in uploads directory
- **Input Validation**: Pydantic schemas validate all API inputs
- **Error Handling**: Comprehensive exception handling prevents information leakage

## Future Enhancements

### Planned Features
- [ ] User authentication and document ownership
- [ ] Advanced search filters and facets
- [ ] Multiple language support
- [ ] Batch document processing
- [ ] Export search results
- [ ] Document versioning
- [ ] Real-time collaboration features

### Technical Improvements
- [ ] pgvector integration for scalable vector search
- [ ] Redis caching for embeddings and results
- [ ] Distributed computing for large document processing
- [ ] API rate limiting and authentication
- [ ] Comprehensive logging and monitoring
- [ ] Containerization with Docker
- [ ] CI/CD pipeline integration

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions, issues, or contributions, please:
- Open an issue on GitHub
- Review the API documentation at `/docs`
- Check the browser console for frontend errors
- Verify model downloads and GPU availability for backend issues