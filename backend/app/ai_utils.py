from __future__ import annotations
import re
import math
from typing import List, Dict, Any, Iterable, Optional

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
from copy import deepcopy

from PyPDF2 import PdfReader
import docx
import chardet

# Use model manager lazily. Default to simplified manager for reliability,
# and allow opting into the full manager via PREFER_FULL_MODEL_MANAGER=true.
from .logger import logger
model_manager = None
prefer_full_manager = os.getenv("PREFER_FULL_MODEL_MANAGER", "false").lower() in ("true", "1", "yes")

if prefer_full_manager:
    try:
        from .model_manager import model_manager as _mm
        model_manager = _mm
        logger.info("Using full model_manager (PREFER_FULL_MODEL_MANAGER=true)")
    except Exception as e:
        try:
            logger.warning(f"Could not import full model_manager, falling back to simplified manager: {e}")
        except Exception:
            pass

if model_manager is None:
    try:
        from .model_manager_simple import model_manager as _mm
        model_manager = _mm
    except Exception as e2:
        # Avoid failing imports for quick local debug (e.g. running debug_extract.py)
        try:
            logger.warning(f"Could not import model_manager_simple (heavy ML libs missing): {e2}")
        except Exception:
            pass
        model_manager = None

# =========================
# Utilities
# =========================

def clean_text(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _detect_page_marker(text: str) -> tuple[Optional[int], Optional[int], str]:
    match = re.match(r"^\[\[PAGE:(\d+)\|PARA:(\d+)\]\]\s*(.*)$", text or "", re.DOTALL)
    if not match:
        return None, None, text
    page_number = int(match.group(1))
    paragraph_number = int(match.group(2))
    clean = match.group(3).strip()
    return page_number, paragraph_number, clean


def strip_chunk_metadata(text: str) -> str:
    _, _, clean = _detect_page_marker(text)
    return clean


def parse_chunk_metadata(text: str) -> Dict[str, Any]:
    page_number, paragraph_number, clean = _detect_page_marker(text)
    return {
        "text": clean,
        "page_number": page_number,
        "paragraph_number": paragraph_number,
    }

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


def extract_pages_from_file(filepath: str) -> List[Dict[str, Any]]:
    """Extract text page-by-page where possible."""
    if filepath.lower().endswith(".pdf"):
        pages: List[Dict[str, Any]] = []
        if pdfplumber is not None:
            try:
                with pdfplumber.open(filepath) as pdf:
                    for index, page in enumerate(pdf.pages, start=1):
                        pages.append({"page_number": index, "text": clean_text(page.extract_text() or "")})
                if pages:
                    return pages
            except Exception:
                logger.exception(f"pdfplumber page extraction failed for {filepath}")

        try:
            reader = PdfReader(filepath)
            for index, page in enumerate(reader.pages, start=1):
                pages.append({"page_number": index, "text": clean_text(page.extract_text() or "")})
            if pages:
                return pages
        except Exception:
            logger.exception(f"PyPDF2 page extraction failed for {filepath}")

    # Non-PDF fallback: treat the document as a single logical page
    extracted = extract_text_from_file(filepath)
    if extracted:
        return [{"page_number": 1, "text": extracted}]
    return []

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


def _chunk_page_text(page_text: str, page_number: int, chunk_size: int, overlap: int) -> List[Dict[str, Any]]:
    page_chunks = smart_chunks(page_text, chunk_size, overlap)
    chunk_rows: List[Dict[str, Any]] = []
    for paragraph_number, chunk in enumerate(page_chunks, start=1):
        chunk_rows.append({
            "text": f"[[PAGE:{page_number}|PARA:{paragraph_number}]] {chunk}",
            "page_number": page_number,
            "paragraph_number": paragraph_number,
            "clean_text": chunk,
        })
    return chunk_rows

# =========================
# Embeddings
# =========================
def generate_embedding(text: str) -> List[float]:
    """Generate normalized embedding using model manager"""
    return model_manager.generate_embedding(text)

def generate_embeddings_in_chunks(text: str, chunk_size: int = 800, overlap: int = 120) -> List[Dict[str, Any]]:
    """Generate embeddings for text chunks efficiently with optimized batching for large documents"""
    return generate_embeddings_in_pages([{"page_number": 1, "text": text}], chunk_size, overlap)


def generate_embeddings_in_pages(pages: List[Dict[str, Any]], chunk_size: int = 1200, overlap: int = 200) -> List[Dict[str, Any]]:
    """Generate embeddings for page-aware chunks efficiently with optimized batching for SPEED"""
    if not pages:
        return []

    chunk_rows: List[Dict[str, Any]] = []
    for page in pages:
        page_number = int(page.get("page_number") or len(chunk_rows) + 1)
        page_text = (page.get("text") or "").strip()
        if not page_text:
            continue
        chunk_rows.extend(_chunk_page_text(page_text, page_number, chunk_size, overlap))

    if not chunk_rows:
        return []

    clean_chunks = [row["clean_text"] for row in chunk_rows]
    
    # OPTIMIZED: Use larger batch sizes for faster throughput
    if len(clean_chunks) > 256:
        logger.info(f"Processing {len(clean_chunks)} chunks with OPTIMIZED batch size (128) for maximum speed")
        batch_size = 128  # INCREASED from 50 to 128
        all_embeddings: List[List[float]] = []
        total_batches = (len(clean_chunks) + batch_size - 1) // batch_size
        for batch_idx, i in enumerate(range(0, len(clean_chunks), batch_size)):
            batch_chunks = clean_chunks[i:i + batch_size]
            batch_embeddings = model_manager.generate_embeddings_batch(batch_chunks)
            all_embeddings.extend(batch_embeddings)
            logger.info(f"✓ Batch {batch_idx + 1}/{total_batches} processed ({len(batch_chunks)} chunks) - {((batch_idx + 1) / total_batches * 100):.0f}%")
    elif len(clean_chunks) > 64:
        logger.info(f"Processing {len(clean_chunks)} chunks with standard batch size (64)")
        batch_size = 64
        all_embeddings: List[List[float]] = []
        for batch_idx, i in enumerate(range(0, len(clean_chunks), batch_size)):
            batch_chunks = clean_chunks[i:i + batch_size]
            batch_embeddings = model_manager.generate_embeddings_batch(batch_chunks)
            all_embeddings.extend(batch_embeddings)
    elif len(clean_chunks) > 1:
        logger.info(f"Processing {len(clean_chunks)} chunks with single batch")
        all_embeddings = model_manager.generate_embeddings_batch(clean_chunks)
    else:
        all_embeddings = [generate_embedding(clean_chunks[0])]

    result: List[Dict[str, Any]] = []
    for row, embedding in zip(chunk_rows, all_embeddings):
        result.append({
            "text": row["text"],
            "embedding": embedding,
            "page_number": row["page_number"],
            "paragraph_number": row["paragraph_number"],
            "clean_text": row["clean_text"],
        })
    return result

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

# ── Intent detection helpers ─────────────────────────────────────────────────

_GREETING_WORDS = {
    "hi", "hii", "hiii", "hello", "hey", "hiya", "heya", "howdy",
    "greetings", "sup", "yo", "hola", "namaste", "ola", "hai",
}

_GREETING_PATTERNS = [
    r"^h+[ie]+y*[!?.]*$",
    r"^good\s+(morning|afternoon|evening|day)[!?.]*$",
    r"^how\s+are\s+you[!?.]*$",
    r"^what'?s\s+up[!?.]*$",
    r"^(thanks?|thank\s+you|ty|thx)[!?. ]*$",
    r"^(bye|goodbye|see\s+you|take\s+care)[!?.]*$",
    r"^(ok|okay|cool|great|perfect|nice|got\s+it|sounds\s+good)[!?.]*$",
]

_SUMMARY_TRIGGERS = {
    "summarize", "summarise", "summary", "summarization",
    "overview", "brief me", "brief on", "what is this about",
    "what is this document", "what does this document say",
    "tell me about this document", "explain this document",
    "give me an overview", "what is the document about",
    "gist of", "main points of this", "tldr", "tl;dr",
}

_GENERAL_KNOWLEDGE_PATTERNS = [
    r"interview\s+tip", r"interview\s+prep", r"how\s+to\s+prepare",
    r"career\s+advice", r"job\s+tip", r"salary\s+negotiat",
    r"how\s+to\s+improve", r"best\s+practice", r"recommend\s+me",
    r"what\s+should\s+i\s+(do|say|wear|bring)",
    r"how\s+do\s+i\s+", r"can\s+you\s+help\s+me\s+with",
    r"write\s+me\s+a\s+cover\s+letter", r"improve\s+my\s+cv",
    r"improve\s+my\s+resume",
]


def _detect_intent(query: str) -> str:
    """
    Returns one of: 'greeting' | 'summary' | 'general_knowledge' | 'document_qa'
    """
    q = query.strip()
    q_lower = q.lower()
    q_clean = re.sub(r"[^a-z\s]", "", q_lower).strip()
    words = set(q_clean.split())

    # ── Greeting ─────────────────────────────────────────────────────────────
    if len(words) <= 4 and words & _GREETING_WORDS:
        return "greeting"
    for pattern in _GREETING_PATTERNS:
        if re.match(pattern, q_lower):
            return "greeting"

    # ── Explicit summary request ──────────────────────────────────────────────
    if any(trigger in q_lower for trigger in _SUMMARY_TRIGGERS):
        return "summary"

    # ── General knowledge / advisory request ─────────────────────────────────
    for pattern in _GENERAL_KNOWLEDGE_PATTERNS:
        if re.search(pattern, q_lower):
            return "general_knowledge"

    return "document_qa"


def synthesize_answer(
    query: str,
    contexts: List[Dict[str, Any]],
    answer_length: str = "balanced",
    answer_mode: str = "qa"
) -> str:
    """Synthesize answer from contexts using intent-aware routing."""
    intent = _detect_intent(query)
    logger.info(f"Query intent: '{intent}' for query: '{query}'")

    # ── Greeting: respond conversationally, never summarize ──────────────────
    if intent == "greeting":
        return (
            "Hello! I'm your document assistant. I can answer questions about your "
            "uploaded document, summarize it, extract key points, or identify action items. "
            "What would you like to know?"
        )

    context_text = "\n\n".join([c["text"] for c in contexts[:8]])

    # ── Explicit summary request ─────────────────────────────────────────────
    if intent == "summary" or answer_mode == "summary":
        full_text = " ".join(c["text"] for c in contexts)
        return generate_summary(full_text)

    # ── Key points mode ──────────────────────────────────────────────────────
    if answer_mode == "keypoints":
        full_text = " ".join(c["text"] for c in contexts)
        return generate_summary(full_text)

    # ── Handle page count questions ──────────────────────────────────────────
    if any(phrase in query.lower() for phrase in ["total pages", "number of pages", "how many pages", "page count"]):
        return (
            "I cannot determine the total number of pages from the document text. "
            "Page count is stored in document metadata during upload."
        )

    # ── Handle exam / last-date extraction ──────────────────────────────────
    if "exam" in query.lower():
        extracted = extract_date_from_context(context_text)
        if extracted:
            return f"The Preliminary Examination is scheduled for {extracted}."

    if "last date" in query.lower():
        extracted = extract_date_from_context(context_text)
        if extracted:
            return f"The last date is {extracted}."

    # ── General QA via local model ────────────────────────────────────────────
    length_instructions = {
        "short": "Keep the answer to 3-5 lines.",
        "balanced": "Give a clear, focused answer with key points.",
        "detailed": "Give a detailed answer with sections and bullet points where useful.",
    }
    mode_instructions = {
        "qa": "Answer the user's question directly and precisely based on the document.",
        "pageexplanation": "Explain the selected page or page range in plain language.",
        "actionitems": "Extract actionable items, deadlines, and follow-ups.",
        "general_knowledge": "Use the document context plus general knowledge to answer helpfully.",
    }
    effective_mode = "general_knowledge" if intent == "general_knowledge" else answer_mode
    instruction_block = (
        f"Instruction: {mode_instructions.get(effective_mode, mode_instructions['qa'])}\n"
        f"Length: {length_instructions.get(answer_length, length_instructions['balanced'])}\n"
        "Stay grounded in the provided context. Cite page numbers when available."
    )

    context_texts = [c["text"] for c in contexts[:8]]
    logger.info(f"Generating local answer for query: '{query}' with {len(context_texts)} contexts")
    formatted_query = f"{query}\n\n{instruction_block}"
    raw_answer = model_manager.generate_answer(formatted_query, context_texts)
    cleaned = clean_answer(query, raw_answer)
    logger.info(f"Local answer: '{cleaned[:100]}...'")
    return cleaned
