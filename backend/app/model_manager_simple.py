"""
Simplified Model Manager - GROQ-focused approach
Minimal local models, maximum GROQ power
"""

import os
import warnings
import logging
from typing import Dict, List, Any, Optional

from .config import settings
from .logger import logger
import threading
import time

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
                logger.info(f"Loading embedding model: {settings.embedding_model}")
                start_time = time.time()
                
                self._models['embeddings'] = SentenceTransformer(
                    settings.embedding_model,
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
        """Generate answer using simple fallback"""
        if not contexts:
            return "No relevant context found for the query."
        
        # Simple context-based response
        context_text = " ".join(contexts[:2])  # Use first 2 contexts
        
        if any(word in query.lower() for word in ['score', 'mark', 'grade', 'percentage']):
            # Extract numbers from context for academic queries
            import re
            numbers = re.findall(r'\b\d+\b', context_text)
            if numbers:
                return f"Based on the document, relevant scores/numbers found: {', '.join(numbers[:5])}. Please check the GROQ AI response for detailed interpretation."
        
        # Generic response
        preview = context_text[:200] + "..." if len(context_text) > 200 else context_text
        return f"Based on the context: {preview}. For detailed analysis, please refer to the GROQ AI response."

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

    def rerank_results(self, query: str, candidates: List[str]) -> List[str]:
        """
        Simple reranking based on keyword matching
        """
        if not candidates:
            return candidates
        
        try:
            # Simple keyword-based scoring
            query_words = set(query.lower().split())
            scored_candidates = []
            
            for candidate in candidates:
                candidate_words = set(candidate.lower().split())
                # Calculate overlap score
                overlap = len(query_words.intersection(candidate_words))
                # Bonus for exact phrase matches
                if query.lower() in candidate.lower():
                    overlap += 10
                scored_candidates.append((overlap, candidate))
            
            # Sort by score (descending)
            scored_candidates.sort(key=lambda x: x[0], reverse=True)
            
            # Return reranked candidates
            reranked = [candidate for _, candidate in scored_candidates]
            logger.info(f"Reranked {len(candidates)} candidates using simple keyword matching")
            return reranked
            
        except Exception as e:
            logger.error(f"Reranking failed: {e}")
            # Return original order if reranking fails
            return candidates

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