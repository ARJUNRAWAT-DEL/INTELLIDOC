"""
Simplified Model Manager - GROQ-focused approach
Improved local quality with extractive answer generation and hybrid reranking.
"""

from typing import Dict, List, Any, Optional
import re
from collections import Counter

from .logger import logger
import threading
import time
from .config import settings as cfg

# Simplified imports - only what we absolutely need
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
    logger.info("Sentence transformers available for embeddings")
except ImportError as e:
    logger.warning(f"Sentence transformers not available: {e}")
    SENTENCE_TRANSFORMERS_AVAILABLE = False

# Simple fallback for text generation
class SimpleTextGenerator:
    """Simple fallback text generator"""
    def __init__(self):
        self.name = "Simple Fallback Generator"
    
    def __call__(self, prompt, **kwargs):
        # Simple rule-based response for key queries
        if any(word in prompt.lower() for word in ['score', 'mark', 'grade', 'percentage']):
            return "Based on the document context, please refer to the specific scores and grades mentioned in the uploaded document."
        return "Please refer to the GROQ AI response for detailed analysis."

class SimplifiedModelManager:
    """Simplified model manager focused on GROQ integration"""

    _STOP_WORDS = {
        "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "how",
        "i", "in", "is", "it", "its", "of", "on", "or", "that", "the", "to", "was", "were", "what",
        "when", "where", "which", "who", "why", "with", "your", "you", "me", "my", "we", "our", "their",
        "this", "these", "those", "can", "could", "should", "would", "do", "does", "did", "about"
    }

    _QUERY_EXPANSIONS = {
        "score": ["marks", "grade", "percentage", "result", "cgpa", "gpa"],
        "marks": ["score", "grade", "percentage", "result"],
        "grade": ["score", "marks", "percentage", "result"],
        "date": ["deadline", "schedule", "exam", "due", "last"],
        "deadline": ["date", "last", "due"],
        "fees": ["fee", "amount", "payment", "cost"],
        "eligibility": ["criteria", "requirements", "qualification"],
    }

    def __init__(self):
        self._models = {}
        self._loading_lock = threading.Lock()
        self._device = "cpu"  # Keep it simple
        
        logger.info("Simplified ModelManager initialized - GROQ-focused approach")
        logger.info("Hugging Face authentication disabled - using public models only")
        logger.info(f"ModelManager initialized with device: {self._device}")
        
        # Preload only critical models
        self._preload_critical_models()
        
    def _preload_critical_models(self):
        """Preload only essential models"""
        logger.info("Preloading critical models...")
        
        # Only load embeddings if available
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                logger.info(f"Loading embedding model: {cfg.embedding_model}")
                start_time = time.time()
                
                self._models['embeddings'] = SentenceTransformer(
                    cfg.embedding_model,
                    device=self._device
                )
                
                load_time = time.time() - start_time
                logger.info(f"Embedding model loaded in {load_time:.2f}s")
            except Exception as e:
                logger.error(f"Failed to load embedding model: {e}")
                self._models['embeddings'] = None
        else:
            logger.warning("Sentence transformers not available - embeddings disabled")
            self._models['embeddings'] = None
        
        # Simple text generator fallback
        self._models['text_generator'] = SimpleTextGenerator()
        
        logger.info("Critical models loaded")

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Get embeddings for texts"""
        if self._models.get('embeddings') is None:
            logger.error("No embedding model available")
            # Return dummy embeddings
            return [[0.0] * 384 for _ in texts]
        
        try:
            embeddings = self._models['embeddings'].encode(texts, normalize_embeddings=True)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return [[0.0] * 384 for _ in texts]
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate single embedding - for compatibility"""
        if self._models.get('embeddings') is None:
            logger.error("No embedding model available")
            return [0.0] * 384
        
        try:
            embedding = self._models['embeddings'].encode([text], normalize_embeddings=True)
            return embedding[0].tolist()
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return [0.0] * 384
    
    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings batch - alias for get_embeddings for compatibility"""
        return self.get_embeddings(texts)

    def generate_answer(self, query: str, contexts: List[str]) -> str:
        """Generate grounded extractive answer from contexts."""
        if not contexts:
            return "No relevant context found for the query."

        answer = self._extractive_answer(query, contexts)
        if answer:
            return answer

        # Final fallback if extraction fails
        context_text = " ".join(contexts[:2]).strip()
        if not context_text:
            return "I could not find the answer in the provided context."
        preview = context_text[:420] + "..." if len(context_text) > 420 else context_text
        return preview

    def get_reranker(self):
        """Get reranker - simplified version"""
        # Return None for now - GROQ will handle the quality
        return None

    def summarize_text(self, text: str) -> str:
        """
        Summarize text using simple extraction approach
        """
        if not text or len(text.strip()) == 0:
            return "No content to summarize."
        
        try:
            # Simple text summarization - extract key sentences
            sentences = text.split('.')
            sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
            
            if len(sentences) <= 3:
                return text[:500] + "..." if len(text) > 500 else text
            
            # Take first sentence, middle sentence, and last sentence
            summary_sentences = []
            if sentences:
                summary_sentences.append(sentences[0])
                if len(sentences) > 2:
                    mid_idx = len(sentences) // 2
                    summary_sentences.append(sentences[mid_idx])
                if len(sentences) > 1:
                    summary_sentences.append(sentences[-1])
            
            summary = '. '.join(summary_sentences) + '.'
            
            # Ensure reasonable length
            if len(summary) > 1000:
                summary = summary[:1000] + "..."
            
            logger.info(f"Generated simple summary: {len(summary)} characters")
            return summary
            
        except Exception as e:
            logger.error(f"Summarization failed: {e}")
            # Fallback to truncated text
            return text[:300] + "..." if len(text) > 300 else text

    def rerank_results(self, query: str, candidates: List[Any]) -> List[Any]:
        """Hybrid reranking with semantic score + lexical relevance."""
        if not candidates:
            return candidates

        input_is_string_list = isinstance(candidates[0], str)
        packed_candidates: List[Dict[str, Any]] = []

        for idx, candidate in enumerate(candidates):
            if isinstance(candidate, dict):
                packed_candidates.append(candidate)
            else:
                packed_candidates.append({"text": str(candidate), "_idx": idx})

        try:
            expanded_terms = self._expanded_query_terms(query)
            query_text = query.lower().strip()
            wants_numeric = self._is_numeric_query(query_text)

            for candidate in packed_candidates:
                text = str(candidate.get("text", ""))
                text_lower = text.lower()
                lexical = self._lexical_relevance(expanded_terms, text)
                semantic = float(candidate.get("score", 0.0))
                phrase_boost = 0.2 if query_text and query_text in text_lower else 0.0
                numeric_boost = 0.1 if wants_numeric and re.search(r"\d", text) else 0.0

                hybrid_score = (semantic * 0.65) + (lexical * 0.35) + phrase_boost + numeric_boost
                candidate["rerank_score"] = float(hybrid_score)

            reranked = sorted(
                packed_candidates,
                key=lambda c: c.get("rerank_score", c.get("score", 0.0)),
                reverse=True,
            )
            logger.info(f"Reranked {len(candidates)} candidates with hybrid scoring")

            if input_is_string_list:
                return [c.get("text", "") for c in reranked]
            return reranked

        except Exception as e:
            logger.error(f"Reranking failed: {e}")
            return candidates

    def _normalize_token(self, token: str) -> str:
        return re.sub(r"[^a-z0-9%\-]", "", token.lower())

    def _tokenize(self, text: str) -> List[str]:
        raw = re.split(r"\s+", text.lower())
        out: List[str] = []
        for t in raw:
            n = self._normalize_token(t)
            if len(n) > 1 and n not in self._STOP_WORDS:
                out.append(n)
        return out

    def _expanded_query_terms(self, query: str) -> set:
        terms = set(self._tokenize(query))
        expanded = set(terms)
        for t in list(terms):
            for extra in self._QUERY_EXPANSIONS.get(t, []):
                expanded.add(extra)
        return expanded

    def _lexical_relevance(self, query_terms: set, text: str) -> float:
        if not query_terms:
            return 0.0
        tokens = self._tokenize(text)
        if not tokens:
            return 0.0
        token_counts = Counter(tokens)
        overlap = query_terms.intersection(set(tokens))
        coverage = len(overlap) / max(1, len(query_terms))
        freq_score = sum(token_counts.get(t, 0) for t in overlap) / max(1, len(tokens))
        return (coverage * 0.75) + (freq_score * 0.25)

    def _is_numeric_query(self, query: str) -> bool:
        return any(k in query for k in ["how many", "total", "count", "score", "marks", "grade", "percentage", "amount", "fee"])

    def _is_date_query(self, query: str) -> bool:
        return any(k in query for k in ["date", "deadline", "when", "schedule", "last date", "exam date"])

    def _split_sentences(self, text: str) -> List[str]:
        parts = re.split(r"(?<=[.!?])\s+|\n+", text)
        return [p.strip() for p in parts if len(p.strip()) >= 25]

    def _extractive_answer(self, query: str, contexts: List[str]) -> str:
        query_lower = query.lower().strip()
        query_terms = self._expanded_query_terms(query_lower)
        wants_numeric = self._is_numeric_query(query_lower)
        wants_date = self._is_date_query(query_lower)

        sentence_rows: List[Dict[str, Any]] = []
        for cidx, ctx in enumerate(contexts[:8]):
            for sidx, sentence in enumerate(self._split_sentences(ctx)):
                sent_lower = sentence.lower()
                lexical = self._lexical_relevance(query_terms, sentence)
                phrase_boost = 0.2 if query_lower and query_lower in sent_lower else 0.0
                numeric_boost = 0.12 if wants_numeric and re.search(r"\d", sentence) else 0.0
                date_boost = 0.12 if wants_date and re.search(r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{1,2}\s+[A-Za-z]+\s+\d{4}\b", sentence) else 0.0
                length_penalty = 0.05 if len(sentence.split()) > 60 else 0.0
                score = lexical + phrase_boost + numeric_boost + date_boost - length_penalty

                if score <= 0.04:
                    continue

                sentence_rows.append({
                    "context_idx": cidx,
                    "sentence_idx": sidx,
                    "text": sentence,
                    "score": score,
                })

        if not sentence_rows:
            return ""

        # Pick strongest evidence, then restore natural order for readability.
        top = sorted(sentence_rows, key=lambda r: r["score"], reverse=True)[:5]
        top_sorted = sorted(top, key=lambda r: (r["context_idx"], r["sentence_idx"]))

        dedup = []
        seen = set()
        for row in top_sorted:
            key = re.sub(r"\W+", "", row["text"].lower())
            if key and key not in seen:
                seen.add(key)
                dedup.append(row["text"])

        if not dedup:
            return ""

        answer = " ".join(dedup)
        if len(answer) > 1200:
            answer = answer[:1197].rstrip() + "..."
        return answer

    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            "device": self._device,
            "models_loaded": list(self._models.keys()),
            "embedding_available": self._models.get('embeddings') is not None,
            "approach": "GROQ-focused with minimal local models"
        }

    def clear_cache(self):
        """Clear model cache"""
        # Simple implementation
        logger.info("Model cache cleared")

# Create global instance
model_manager = SimplifiedModelManager()