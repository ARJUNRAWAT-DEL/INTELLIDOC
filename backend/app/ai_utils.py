from __future__ import annotations
import re
import math
from typing import List, Dict, Any, Iterable

# PDF / DOCX / TXT extraction (robust fallbacks)
try:
    import pdfplumber
except Exception:
    pdfplumber = None

from PyPDF2 import PdfReader
import docx
import chardet

# Use optimized model manager
from .model_manager_simple import model_manager
from .logger import logger

# =========================
# Utilities
# =========================

def clean_text(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

# =========================
# Extraction
# =========================
def extract_text_from_file(filepath: str) -> str:
    if filepath.lower().endswith(".pdf"):
        if pdfplumber is not None:
            try:
                pages = []
                with pdfplumber.open(filepath) as pdf:
                    for p in pdf.pages:
                        pages.append(p.extract_text() or "")
                return clean_text("\n\n".join(pages))
            except Exception:
                pass
        reader = PdfReader(filepath)
        return clean_text(" ".join([(page.extract_text() or "") for page in reader.pages]))

    if filepath.lower().endswith(".docx"):
        doc = docx.Document(filepath)
        return clean_text("\n".join([p.text for p in doc.paragraphs]))

    if filepath.lower().endswith(".txt"):
        with open(filepath, "rb") as f:
            raw = f.read()
            encoding = (chardet.detect(raw)["encoding"] or "utf-8")
        with open(filepath, "r", encoding=encoding, errors="ignore") as f:
            return clean_text(f.read())

    return ""

# =========================
# Chunking
# =========================
def _split_on_separators(text: str, seps: List[str]) -> List[str]:
    parts = [text]
    for sep in seps:
        new_parts = []
        for p in parts:
            new_parts.extend(re.split(sep, p))
        parts = new_parts
    return [p.strip() for p in parts if p.strip()]

def smart_chunks(text: str, chunk_size: int = 800, overlap: int = 120) -> List[str]:
    if not text:
        return []
    
    # For large documents, use adaptive chunking
    word_count = len(text.split())
    if word_count > 10000:  # Large document detected
        chunk_size = min(1200, chunk_size + 400)  # Larger chunks for large docs
        overlap = min(200, overlap + 80)  # More overlap to preserve context
    
    blocks = _split_on_separators(text, seps=[r"\n{2,}", r"(?<=[\.\?\!])\s", r"\n", r" - ", r" • "])
    chunks, buff, size = [], [], 0
    for b in blocks:
        if size + len(b) > chunk_size and buff:
            chunks.append(" ".join(buff).strip())
            if overlap > 0:
                over = (" ".join(buff)).split()
                overlap_words = " ".join(over[-overlap // 5:])
                buff, size = [overlap_words, b], len(overlap_words) + len(b)
            else:
                buff, size = [b], len(b)
        else:
            buff.append(b)
            size += len(b)
    if buff:
        chunks.append(" ".join(buff).strip())
    return chunks

# =========================
# Embeddings
# =========================
def generate_embedding(text: str) -> List[float]:
    """Generate normalized embedding using model manager"""
    return model_manager.generate_embedding(text)

def generate_embeddings_in_chunks(text: str, chunk_size: int = 800, overlap: int = 120) -> List[Dict[str, Any]]:
    """Generate embeddings for text chunks efficiently with optimized batching for large documents"""
    chunks = smart_chunks(text, chunk_size, overlap)
    
    if not chunks:
        return []
    
    # For very large documents, prioritize accuracy over speed
    if len(chunks) > 100:  # Large document with many chunks
        logger.info(f"Processing {len(chunks)} chunks with maximum accuracy settings for large document")
        batch_size = 50  # Reduced batch size for better quality
        all_embeddings = []
        
        # Sequential processing for maximum accuracy (no concurrent processing)
        for i in range(0, len(chunks), batch_size):
            batch_chunks = chunks[i:i + batch_size]
            batch_embeddings = model_manager.generate_embeddings_batch(batch_chunks)
            all_embeddings.extend(batch_embeddings)
            logger.info(f"Processed batch {i//batch_size + 1}/{(len(chunks) + batch_size - 1)//batch_size} with high accuracy settings")
        
        return [{"text": chunk, "embedding": emb} for chunk, emb in zip(chunks, all_embeddings)]
    
    # Standard batch processing for smaller documents
    elif len(chunks) > 1:
        embeddings = model_manager.generate_embeddings_batch(chunks)
        return [{"text": chunk, "embedding": emb} for chunk, emb in zip(chunks, embeddings)]
    else:
        return [{"text": chunks[0], "embedding": generate_embedding(chunks[0])}]

# =========================
# Re-ranking
# =========================
def rerank_candidates(query: str, candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Rerank candidates using model manager"""
    return model_manager.rerank_results(query, candidates)

# =========================
# Summaries
# =========================
def generate_summary(text: str) -> str:
    """Generate summary using model manager"""
    return model_manager.summarize_text(text)

# =========================
# Answer synthesis
# =========================
def extract_date_from_context(context_text: str):
    match = re.search(r"(\d{1,2}\s+[A-Za-z]+\s+\d{4})", context_text)
    if match:
        return match.group(1)
    return None

def clean_answer(query: str, answer: str) -> str:
    if not answer or answer.strip() in ["[1]", "[2]", "[3]", "", "Answer in one clear sentence."]:
        return "I could not find the answer in the document."
    
    # Detect potential hallucinations for factual questions
    query_lower = query.lower()
    answer_lower = answer.lower()
    
    # Check for page count hallucinations
    if any(phrase in query_lower for phrase in ["total pages", "number of pages", "how many pages", "page count"]):
        if any(phrase in answer_lower for phrase in ["total", "pages", "page"]) and any(char.isdigit() for char in answer):
            logger.warning(f"Potential page count hallucination detected: {answer}")
            return "I cannot determine the total number of pages from the document content. This information would need to be extracted from document metadata."
    
    # Only check for numeric hallucinations on very short answers (removed the restrictive check)
    if any(phrase in query_lower for phrase in ["how many", "total", "number of", "count"]):
        # Only flag if answer is extremely short AND contains numbers
        if any(char.isdigit() for char in answer) and len(answer.strip().split()) < 5:  # Much more lenient
            logger.warning(f"Potential numeric hallucination detected for query '{query}': {answer}")
            return "I could not find specific numerical information to answer this question accurately in the provided context."
    
    # Removed the 80-word limit that was causing truncation
    # Allow longer, more detailed answers
    return answer.strip()

def synthesize_answer(query: str, contexts: List[Dict[str, Any]]) -> str:
    """Synthesize answer from contexts using model manager"""
    context_text = "\n\n".join([c['text'] for c in contexts[:8]])  # Increased to 8 for maximum accuracy

    # Handle summaries
    if "summary" in query.lower():
        full_text = " ".join(c['text'] for c in contexts)
        return generate_summary(full_text)

    # Handle exam dates
    if "exam" in query.lower():
        extracted = extract_date_from_context(context_text)
        if extracted:
            return f"The Preliminary Examination is scheduled for {extracted}."

    # Handle last date
    if "last date" in query.lower():
        extracted = extract_date_from_context(context_text)
        if extracted:
            return f"The last date is {extracted}."
    
    # Handle page count questions - these require document metadata, not text content
    if any(phrase in query.lower() for phrase in ["total pages", "number of pages", "how many pages", "page count"]):
        logger.warning(f"Page count question detected: {query}")
        return "I cannot determine the total number of pages from the document content. Page count information would need to be extracted from document metadata during upload."

    # Use model manager for answer generation
    context_texts = [c['text'] for c in contexts[:8]]  # Increased to 8 for maximum accuracy
    logger.info(f"Generating answer for query: '{query}' with {len(context_texts)} contexts")
    raw_answer = model_manager.generate_answer(query, context_texts)
    logger.info(f"Generated raw answer: '{raw_answer[:100]}...' (length: {len(raw_answer)})")
    cleaned_answer = clean_answer(query, raw_answer)
    logger.info(f"Final cleaned answer: '{cleaned_answer[:100]}...' (length: {len(cleaned_answer)})")
    return cleaned_answer
