"""
MCP-compatible AI utilities
Routes AI operations through MCP client instead of direct model access
"""

from __future__ import annotations
import re
import math
from typing import List, Dict, Any, Iterable

# PDF / DOCX / TXT extraction (robust fallbacks)
try:
    import pdfplumber
except Exception:
    pdfplumber = None

# pdfminer fallback (more robust for some PDFs)
try:
    from pdfminer.high_level import extract_text as pdfminer_extract_text
except Exception:
    pdfminer_extract_text = None

# Optional OCR fallback (for scanned/image PDFs)
try:
    from pdf2image import convert_from_path
except Exception:
    convert_from_path = None

try:
    import pytesseract
except Exception:
    pytesseract = None
import os
import shutil

from PyPDF2 import PdfReader
import docx
import chardet

# Use MCP client instead of model manager
from .mcp_client import mcp_client
from .logger import logger

# =========================
# Utilities (unchanged)
# =========================

def clean_text(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

# =========================
# Extraction (unchanged)
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
                logger.exception(f"pdfplumber failed to extract text from {filepath}")
        reader = PdfReader(filepath)
        try:
            texts = [page.extract_text() or "" for page in reader.pages]
            joined = " ".join(texts).strip()
            if joined:
                return clean_text(joined)
        except Exception:
            logger.exception(f"PyPDF2 failed to extract text from {filepath}")

        # Try pdfminer as a last-resort fallback before giving up
        if pdfminer_extract_text is not None:
            try:
                miner_text = pdfminer_extract_text(filepath) or ""
                if miner_text.strip():
                    return clean_text(miner_text)
            except Exception:
                logger.exception(f"pdfminer failed to extract text from {filepath}")

        # If we reach here, extraction failed for this PDF
        # As last resort, try OCR if available (useful for scanned PDFs)
        # Prepare poppler and tesseract paths from environment if provided
        poppler_path = os.getenv("POPLER_PATH")
        tesseract_cmd = os.getenv("TESSERACT_CMD")
        if tesseract_cmd:
            try:
                pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
            except Exception:
                logger.exception(f"Failed to set pytesseract command to {tesseract_cmd}")

        # If explicit env vars not provided, try to detect binaries on PATH
        detected_tesseract = shutil.which("tesseract")
        detected_pdftoppm = shutil.which("pdftoppm")

        if not poppler_path and detected_pdftoppm:
            poppler_path = None  # let pdf2image use system pdftoppm

        if convert_from_path is not None and pytesseract is not None:
            try:
                # Limit pages to avoid huge memory usage
                max_pages = 50
                # pass poppler_path explicitly if provided
                if poppler_path:
                    images = convert_from_path(filepath, dpi=300, poppler_path=poppler_path)
                else:
                    images = convert_from_path(filepath, dpi=300)
                text_parts = []
                for i, img in enumerate(images):
                    if i >= max_pages:
                        break
                    try:
                        page_text = pytesseract.image_to_string(img)
                        if page_text:
                            text_parts.append(page_text)
                    except Exception:
                        logger.exception(f"pytesseract failed on page {i} of {filepath}")
                # cleanup images
                try:
                    for im in images:
                        try:
                            im.close()
                        except Exception:
                            pass
                except Exception:
                    pass

                ocr_text = "\n\n".join(text_parts).strip()
                if ocr_text:
                    logger.info(f"OCR extracted text from {filepath} (pages: {min(len(images), max_pages)})")
                    return clean_text(ocr_text)
            except Exception as e:
                # Common failure reasons: poppler not installed or not in PATH
                logger.exception(f"OCR fallback failed for {filepath}: {e}")
        else:
            # Log helpful hints if OCR libs are missing
            if convert_from_path is None:
                logger.info("pdf2image not available — OCR fallback disabled (install pdf2image and poppler)")
            if pytesseract is None:
                logger.info("pytesseract not available — OCR fallback disabled (install Tesseract and pytesseract)")

        return ""

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
# Chunking (unchanged)
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
# MCP-based Embeddings
# =========================
def generate_embedding(text: str) -> List[float]:
    """Generate normalized embedding using MCP client"""
    return mcp_client.generate_embedding(text)

def generate_embeddings_in_chunks(text: str, chunk_size: int = 800, overlap: int = 120) -> List[Dict[str, Any]]:
    """Generate embeddings for text chunks efficiently with MCP client"""
    chunks = smart_chunks(text, chunk_size, overlap)
    
    if not chunks:
        return []
    
    # For very large documents, prioritize accuracy over speed
    if len(chunks) > 100:  # Large document with many chunks
        logger.info(f"Processing {len(chunks)} chunks via MCP with maximum accuracy settings")
        batch_size = 50  # Reduced batch size for better quality
        all_embeddings = []
        
        # Sequential processing for maximum accuracy via MCP
        for i in range(0, len(chunks), batch_size):
            batch_chunks = chunks[i:i + batch_size]
            batch_embeddings = mcp_client.generate_embeddings_batch(batch_chunks)
            all_embeddings.extend(batch_embeddings)
            logger.info(f"Processed batch {i//batch_size + 1}/{(len(chunks) + batch_size - 1)//batch_size} via MCP")
        
        return [{"text": chunk, "embedding": emb} for chunk, emb in zip(chunks, all_embeddings)]
    
    # Standard batch processing for smaller documents
    elif len(chunks) > 1:
        embeddings = mcp_client.generate_embeddings_batch(chunks)
        return [{"text": chunk, "embedding": emb} for chunk, emb in zip(chunks, embeddings)]
    else:
        return [{"text": chunks[0], "embedding": generate_embedding(chunks[0])}]

# =========================
# MCP-based Re-ranking
# =========================
def rerank_candidates(query: str, candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Rerank candidates using MCP client"""
    return mcp_client.rerank_results(query, candidates)

# =========================
# MCP-based Summaries
# =========================
def generate_summary(text: str) -> str:
    """Generate summary using MCP client"""
    return mcp_client.summarize_text(text)

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
    """Synthesize answer from contexts using MCP client"""
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

    # Use MCP client for answer generation
    context_texts = [c['text'] for c in contexts[:8]]  # Increased to 8 for maximum accuracy
    logger.info(f"Generating answer via MCP for query: '{query}' with {len(context_texts)} contexts")
    raw_answer = mcp_client.generate_answer(query, context_texts)
    logger.info(f"Generated raw answer via MCP: '{raw_answer[:100]}...' (length: {len(raw_answer)})")
    cleaned_answer = clean_answer(query, raw_answer)
    logger.info(f"Final cleaned answer: '{cleaned_answer[:100]}...' (length: {len(cleaned_answer)})")
    return cleaned_answer