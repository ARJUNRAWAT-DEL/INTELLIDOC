import torch
import os
import warnings
import logging
from typing import Dict, List, Any, Optional
import asyncio
import atexit

# Import config and logger first
from .config import settings
from .logger import logger
from .cache_manager import cache_manager
import threading
import time

# Safe imports with fallbacks
try:
    from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer
    TRANSFORMERS_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Transformers import failed: {e}")
    TRANSFORMERS_AVAILABLE = False
    # Create dummy classes to prevent import errors
    class pipeline:
        def __init__(self, *args, **kwargs):
            pass
        def __call__(self, *args, **kwargs):
            return "Transformers not available"
    
    class AutoModelForCausalLM:
        @staticmethod
        def from_pretrained(*args, **kwargs):
            return None
    
    class AutoTokenizer:
        @staticmethod
        def from_pretrained(*args, **kwargs):
            return None

try:
    from sentence_transformers import SentenceTransformer, CrossEncoder
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Sentence transformers import failed: {e}")
    SENTENCE_TRANSFORMERS_AVAILABLE = False

# Suppress specific flash-attention and transformers warnings
warnings.filterwarnings("ignore", message=".*flash-attention.*")
warnings.filterwarnings("ignore", message=".*numerical differences.*")
warnings.filterwarnings("ignore", message=".*expect numerical differences.*")
warnings.filterwarnings("ignore", message=".*use_auth_token.*")
warnings.filterwarnings("ignore", category=FutureWarning)

# Create a filter for transformers logging
class FlashAttentionFilter(logging.Filter):
    def filter(self, record):
        return not any(phrase in record.getMessage().lower() for phrase in 
                      ['flash-attention', 'numerical differences', 'flash_attn'])

# Apply filter to transformers logger
transformers_logger = logging.getLogger("transformers")
transformers_logger.addFilter(FlashAttentionFilter())

class ModelManager:
    """Optimized local model manager for pipelines"""

    def __init__(self):
        self._models = {}
        self._loading_lock = threading.Lock()
        self._shutdown_event = threading.Event()
        
        # Register cleanup function for graceful shutdown
        atexit.register(self._cleanup_on_exit)
        
        # Check library availability
        if not TRANSFORMERS_AVAILABLE:
            logger.error("Transformers library not available - text generation will be limited")
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            logger.error("Sentence transformers library not available - embeddings will be limited")
        
        # Check for force CPU environment variable
        force_cpu = os.environ.get("FORCE_CPU", "false").lower() in ("true", "1", "yes")
        if force_cpu:
            self._device = "cpu"
            logger.info("Forcing CPU mode due to FORCE_CPU environment variable")
        else:
            self._device = "cuda" if torch.cuda.is_available() else "cpu"

        # Disable Hugging Face authentication to avoid gated model issues
        try:
            # Remove any existing token that might cause gated model access attempts
            for token_key in ["HUGGINGFACE_HUB_TOKEN", "HF_TOKEN", "HUGGING_FACE_HUB_TOKEN"]:
                if token_key in os.environ:
                    del os.environ[token_key]
            
            # Set HF_HUB_OFFLINE to prefer cached models
            os.environ["HF_HUB_OFFLINE"] = "0"  # Allow downloads but don't require auth
            
            # Suppress flash-attention warnings
            os.environ["TRANSFORMERS_VERBOSITY"] = "error"  # Reduce transformer warnings
            
            logger.info("Hugging Face authentication disabled - using public models only")
        except Exception as e:
            logger.warning(f"HF setup failed: {e} - continuing without authentication")

        logger.info(f"ModelManager initialized with device: {self._device}")

        # Preload critical models
        self._preload_critical_models()

    def _cleanup_on_exit(self):
        """Cleanup function called on exit"""
        try:
            logger.info("Cleaning up model manager on exit...")
            self._shutdown_event.set()
            self.clear_cache()
            logger.info("Model manager cleanup completed")
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")

    def _preload_critical_models(self):
        """Preload embedding model (most frequently used)"""
        try:
            logger.info("Preloading critical models...")
            _ = self.get_embedder()
            logger.info("Critical models loaded")
        except Exception as e:
            logger.error(f"Failed to preload critical models: {e}")

    def get_embedder(self) -> SentenceTransformer:
        """Get embedding model with caching and error handling"""
        if self._shutdown_event.is_set():
            logger.warning("Shutdown in progress, skipping embedding model loading")
            raise RuntimeError("System is shutting down")
            
        if 'embedder' not in self._models:
            with self._loading_lock:
                # Double-check after acquiring lock
                if 'embedder' not in self._models and not self._shutdown_event.is_set():
                    logger.info(f"Loading embedding model: {settings.embedding_model}")
                    start_time = time.time()

                    try:
                        # Clear any tokens from environment to avoid gated model attempts
                        for token_key in ["HUGGINGFACE_HUB_TOKEN", "HF_TOKEN", "HUGGING_FACE_HUB_TOKEN"]:
                            if token_key in os.environ:
                                del os.environ[token_key]
                        
                        self._models['embedder'] = SentenceTransformer(
                            settings.embedding_model,
                            device=self._device,
                            use_auth_token=False  # Explicitly disable token usage
                        )

                        load_time = time.time() - start_time
                        logger.info(f"Embedding model loaded in {load_time:.2f}s")
                        
                    except Exception as e:
                        logger.error(f"Failed to load embedding model: {e}")
                        try:
                            logger.info("Trying fallback embedding model...")
                            self._models['embedder'] = SentenceTransformer(
                                'all-MiniLM-L6-v2',  # Simple public model
                                device=self._device,
                                use_auth_token=False
                            )
                            logger.info("Fallback embedding model loaded successfully")
                        except Exception as e2:
                            logger.error(f"Fallback embedding model also failed: {e2}")
                            raise e2
                            
        return self._models['embedder']

    def get_summarizer(self):
        """Get summarization pipeline with caching and CUDA error handling"""
        if self._shutdown_event.is_set():
            logger.warning("Shutdown in progress, skipping summarizer loading")
            return None
            
        if 'summarizer' not in self._models:
            with self._loading_lock:
                # Double-check after acquiring lock
                if 'summarizer' not in self._models and not self._shutdown_event.is_set():
                    logger.info(f"Loading summarization model: {settings.summarization_model}")
                    start_time = time.time()

                    try:
                        self._models['summarizer'] = pipeline(
                            "summarization",
                            model=settings.summarization_model,
                            device=0 if self._device == "cuda" else -1
                        )
                        load_time = time.time() - start_time
                        logger.info(f"Summarization model loaded in {load_time:.2f}s on {self._device}")
                        
                    except Exception as e:
                        if "cuda" in str(e).lower() and self._device == "cuda":
                            logger.warning(f"CUDA error loading summarizer: {e}. Falling back to CPU")
                            try:
                                self._models['summarizer'] = pipeline(
                                    "summarization",
                                    model=settings.summarization_model,
                                    device=-1
                                )
                                load_time = time.time() - start_time
                                logger.info(f"Summarization model loaded on CPU in {load_time:.2f}s")
                            except Exception as e2:
                                logger.error(f"Failed to load summarizer on CPU: {e2}")
                                self._models['summarizer'] = None
                        else:
                            logger.error(f"Failed to load summarizer: {e}")
                            self._models['summarizer'] = None
        return self._models['summarizer']

    def get_reranker(self) -> Optional[CrossEncoder]:
        """Get reranking model with graceful fallback"""
        if self._shutdown_event.is_set():
            logger.warning("Shutdown in progress, skipping reranker loading")
            return None
            
        if 'reranker' not in self._models:
            with self._loading_lock:
                if 'reranker' not in self._models and not self._shutdown_event.is_set():
                    try:
                        logger.info(f"Loading reranker model: {settings.reranker_model}")
                        start_time = time.time()

                        self._models['reranker'] = CrossEncoder(
                            settings.reranker_model,
                            device=self._device
                        )

                        load_time = time.time() - start_time
                        logger.info(f"Reranker model loaded in {load_time:.2f}s")

                    except Exception as e:
                        logger.warning(f"Failed to load reranker: {e}")
                        self._models['reranker'] = None
        return self._models['reranker']

    def get_text_generator(self):
        """Get text generation pipeline with fallback chain"""
        if self._shutdown_event.is_set():
            logger.warning("Shutdown in progress, skipping text generator loading")
            return None
            
        if 'text_generator' not in self._models:
            with self._loading_lock:
                if 'text_generator' not in self._models and not self._shutdown_event.is_set():
                    self._models['text_generator'] = self._load_text_generator()
        return self._models['text_generator']

    def _load_text_generator(self):
        """Load text generation model with fallback strategy"""
        # Use specific model if configured
        if hasattr(settings, 'text_generation_model') and settings.text_generation_model:
            models_to_try = [
                (settings.text_generation_model, "text-generation"),
                ("microsoft/Phi-3-mini-4k-instruct", "text-generation"),
                ("google/flan-t5-base", "text2text-generation"),
                ("distilgpt2", "text-generation")
            ]
        else:
            # Use only safe, non-gated models that work with current torch version
            models_to_try = [
                ("google/flan-t5-base", "text2text-generation"),
                ("google/flan-t5-small", "text2text-generation"),
                ("distilgpt2", "text-generation"),
                ("gpt2", "text-generation")
            ]

        for model_name, task in models_to_try:
            if self._shutdown_event.is_set():
                logger.info("Shutdown in progress, stopping text generator loading")
                return "FALLBACK_MODE"
                
            try:
                logger.info(f"Attempting to load text generator: {model_name}")
                start_time = time.time()

                text_generator = pipeline(
                    task,
                    model=model_name,
                    device=0 if self._device == "cuda" else -1
                )

                load_time = time.time() - start_time
                logger.info(f"Text generator loaded successfully: {model_name} in {load_time:.2f}s")
                return text_generator

            except Exception as e:
                logger.warning(f"Failed to load {model_name}: {e}")
                continue

        logger.error("All text generation models failed to load")
        logger.info("Using simple fallback text generator")
        return "FALLBACK_MODE"

    def generate_embedding(self, text: str) -> List[float]:
        """Generate normalized embedding for text with caching and CUDA error handling"""
        if self._shutdown_event.is_set():
            logger.warning("Shutdown in progress, returning default embedding")
            return [0.0] * 384
            
        # Check cache first
        cached_embedding = cache_manager.get_embedding(text)
        if cached_embedding is not None:
            return cached_embedding
        
        try:
            # Generate new embedding
            embedder = self.get_embedder()
            embedding = embedder.encode(text, normalize_embeddings=True)
            embedding_list = embedding.tolist()
            
            # Cache the result
            cache_manager.cache_embedding(text, embedding_list)
            
            return embedding_list
            
        except Exception as e:
            if self._shutdown_event.is_set():
                logger.info("Shutdown in progress, skipping embedding generation")
                return [0.0] * 384
                
            logger.error(f"Embedding generation failed: {e}")
            return [0.0] * 384

    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts with maximum accuracy"""
        if self._shutdown_event.is_set():
            logger.warning("Shutdown in progress, returning default embeddings")
            return [[0.0] * 384 for _ in texts]
            
        if not texts:
            return []
            
        # Handle empty or None texts
        processed_texts = []
        for text in texts:
            if text is None or text == "":
                processed_texts.append(" ")
            else:
                processed_texts.append(str(text))
        
        # Check cache for each text
        embeddings = []
        uncached_texts = []
        uncached_indices = []
        
        for i, text in enumerate(processed_texts):
            cached_embedding = cache_manager.get_embedding(text)
            if cached_embedding is not None:
                embeddings.append(cached_embedding)
            else:
                embeddings.append(None)
                uncached_texts.append(text)
                uncached_indices.append(i)
        
        # Generate embeddings for uncached texts
        if uncached_texts and not self._shutdown_event.is_set():
            try:
                embedder = self.get_embedder()
                new_embeddings = embedder.encode(uncached_texts, normalize_embeddings=True, batch_size=16)
                new_embeddings_list = new_embeddings.tolist()
                
                # Cache and place new embeddings
                for idx, embedding in zip(uncached_indices, new_embeddings_list):
                    cache_manager.cache_embedding(processed_texts[idx], embedding)
                    embeddings[idx] = embedding
                    
            except Exception as e:
                logger.error(f"Batch embedding generation failed: {e}")
                for idx in uncached_indices:
                    embeddings[idx] = [0.0] * 384
        
        return embeddings

    def generate_embeddings_batch_fallback(self, texts: List[str]) -> List[List[float]]:
        """Fallback method for batch embedding generation"""
        logger.info("Using fallback batch embedding generation")
        if not texts:
            return []
        
        embeddings = []
        for text in texts:
            try:
                embedding = self.generate_embedding(text or " ")
                embeddings.append(embedding)
            except Exception as e:
                logger.error(f"Failed to generate embedding for text: {e}")
                embeddings.append([0.0] * 384)  # Default embedding dimension
        
        return embeddings

    def summarize_text(self, text: str, max_length: int = 160, min_length: int = 60) -> str:
        """Generate summary using local pipeline"""
        if not text or len(text.split()) < 60:
            return text
        
        try:
            summarizer = self.get_summarizer()
            if summarizer is None:
                logger.warning("No summarizer available, using text truncation")
                fallback_length = min(max_length * 4, len(text))
                return text[:fallback_length] + "..." if len(text) > fallback_length else text
            
            max_input_words = 400
            words = text.split()
            if len(words) > max_input_words:
                text = " ".join(words[:max_input_words])
                logger.info(f"Truncated input text from {len(words)} to {max_input_words} words")

            result = summarizer(
                text,
                max_new_tokens=min(100, max_length),
                min_length=min(min_length, 30),
                do_sample=False
            )
            return result[0]["summary_text"]
            
        except Exception as e:
            error_msg = str(e).lower()
            if "cuda" in error_msg and "assert" in error_msg:
                logger.warning(f"CUDA assertion error during summarization: {e}")
                logger.info("Attempting to reload summarizer on CPU")
                
                try:
                    # Clear the failed model and force CPU reload
                    if 'summarizer' in self._models:
                        del self._models['summarizer']
                    
                    # Clear CUDA cache
                    if torch.cuda.is_available():
                        torch.cuda.empty_cache()
                    
                    # Force CPU loading
                    with self._loading_lock:
                        logger.info(f"Reloading summarization model on CPU: {settings.summarization_model}")
                        self._models['summarizer'] = pipeline(
                            "summarization",
                            model=settings.summarization_model,
                            device=-1  # Force CPU
                        )
                        logger.info("Summarizer successfully reloaded on CPU")
                    
                    # Retry summarization on CPU
                    result = self._models['summarizer'](
                        text,
                        max_new_tokens=min(100, max_length),
                        min_length=min(min_length, 30),
                        do_sample=False
                    )
                    return result[0]["summary_text"]
                    
                except Exception as e2:
                    logger.error(f"CPU fallback also failed: {e2}")
            else:
                logger.error(f"Summarization failed: {e}")
            
            # Final fallback: simple text truncation
            fallback_length = min(max_length * 4, len(text))
            return text[:fallback_length] + "..." if len(text) > fallback_length else text

    def rerank_results(self, query: str, candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rerank search results using cross-encoder"""
        if not candidates:
            return []
        reranker = self.get_reranker()
        if reranker is None:
            logger.warning("Reranker not available, returning original order")
            return candidates
        try:
            pairs = [(query, c["text"]) for c in candidates]
            scores = reranker.predict(pairs)
            for c, s in zip(candidates, scores):
                c["rerank_score"] = float(s)
            return sorted(candidates, key=lambda x: x.get("rerank_score", 0.0), reverse=True)
        except Exception as e:
            logger.error(f"Reranking failed: {e}")
            return candidates

    def generate_answer(self, query: str, contexts: List[str]) -> str:
        """Generate answer using local text generation pipeline"""
        text_generator = self.get_text_generator()
        if text_generator is None:
            return "I could not generate an answer due to model unavailability."
        if text_generator == "FALLBACK_MODE":
            return self._generate_simple_answer(query, contexts)

        # Maximize context processing for highest accuracy - original settings
        max_context_length = 1000  # Increased even higher than original 800 for max accuracy
        truncated_contexts = []
        total = 0
        for ctx in contexts[:6]:  # Use even more contexts for maximum accuracy
            words = ctx.split()
            if total + len(words) > max_context_length:
                remaining = max_context_length - total
                if remaining > 150:  # Higher threshold for better context preservation
                    truncated_contexts.append(" ".join(words[:remaining]))
                break
            truncated_contexts.append(ctx)
            total += len(words)
        context_text = "\n\n".join(truncated_contexts)

        prompt = f"Question: {query}\nContext: {context_text}\nAnswer:"
        prompt_words = prompt.split()
        if len(prompt_words) > 1500:  # Much higher limit for maximum accuracy
            head = f"Question: {query}\nAnswer:"
            remain = 1500 - len(head.split())
            if remain > 300:  # Higher threshold
                ctx_words = context_text.split()
                truncated = " ".join(ctx_words[:remain])
                prompt = f"Question: {query}\nContext: {truncated}\nAnswer:"
            else:
                prompt = head

        try:
            model_name = getattr(getattr(text_generator, "model", None), "config", None)
            model_name = getattr(model_name, "_name_or_path", "") if model_name else ""
            model_name = (model_name or "").lower()
            logger.info(f"Using model for generation: {model_name}")

            if "flan" in model_name or "t5" in model_name:
                # Maximum accuracy prompt for T5 models
                input_text = f"Provide a comprehensive and detailed answer with thorough explanation: {query}\n\nContext: {context_text[:800]}\n\nAnswer:"
                result = text_generator(
                    input_text,
                    max_new_tokens=300,  # Maximized for thorough explanations
                    do_sample=False,  # Deterministic for consistency
                    num_beams=5,  # Higher beam search for best quality
                    early_stopping=False,  # Let it generate fully
                    pad_token_id=getattr(text_generator.tokenizer, "eos_token_id", None)
                )
                answer = result[0]["generated_text"]

            elif any(x in model_name for x in ["phi-3", "instruct"]):
                # Special handling for Phi-3 models
                simple_prompt = f"""Question: {query}

Context: {context_text}

Answer: """
                
                try:
                    logger.info(f"Generating with Phi-3 using simple prompt (length: {len(simple_prompt)} chars)")
                    
                    # Use simpler parameters for Phi-3 to avoid issues
                    result = text_generator(
                        simple_prompt,
                        max_new_tokens=200,
                        do_sample=False,  # Use greedy decoding for more reliable output
                        pad_token_id=getattr(text_generator.tokenizer, "eos_token_id", None),
                        eos_token_id=getattr(text_generator.tokenizer, "eos_token_id", None),
                        return_full_text=False  # Only return the generated part
                    )
                    
                    if isinstance(result, list) and len(result) > 0:
                        if isinstance(result[0], dict) and "generated_text" in result[0]:
                            answer = result[0]["generated_text"].strip()
                        else:
                            answer = str(result[0]).strip()
                    else:
                        answer = str(result).strip()
                    
                    logger.info(f"Phi-3 generated answer: '{answer[:100]}...' (length: {len(answer)})")
                    
                    # Clean up the answer
                    if answer.startswith(simple_prompt):
                        answer = answer[len(simple_prompt):].strip()
                    
                    # If still empty, try with different parameters
                    if not answer or len(answer.strip()) < 10:
                        logger.warning("Phi-3 generated empty/short answer, trying with sampling...")
                        result = text_generator(
                            simple_prompt,
                            max_new_tokens=150,
                            do_sample=True,
                            temperature=0.7,
                            top_p=0.9,
                            pad_token_id=getattr(text_generator.tokenizer, "eos_token_id", None)
                        )
                        
                        if isinstance(result, list) and len(result) > 0:
                            answer = result[0].get("generated_text", "").strip()
                            if answer.startswith(simple_prompt):
                                answer = answer[len(simple_prompt):].strip()
                
                except Exception as e:
                    logger.error(f"Phi-3 generation failed: {e}")
                    logger.info("Falling back to rule-based answer")
                    return self._generate_simple_answer(query, [context_text])
                    
            elif any(x in model_name for x in ["llama", "mistral"]):
                # Keep original handling for other instruct models
                instruct_prompt = f"""### Instruction:
You are an expert assistant. Your task is to provide comprehensive, detailed answers based on the context provided. Give thorough explanations with specific details from the context. Make sure to explain the reasoning behind your answer and include relevant supporting information. Write at least 2-3 sentences with complete explanations.

### Context:
{context_text}

### Question:
{query}

### Answer:
"""
                try:
                    result = text_generator(
                        instruct_prompt,
                        max_new_tokens=400,
                        do_sample=True,
                        temperature=0.3,
                        top_p=0.85,
                        repetition_penalty=1.05,
                        pad_token_id=getattr(text_generator.tokenizer, "eos_token_id", None)
                    )
                    full_text = result[0]["generated_text"]
                    if "### Answer:" in full_text:
                        answer = full_text.split("### Answer:")[-1].strip()
                        answer = answer.split("###")[0].strip()
                    else:
                        answer = full_text[len(instruct_prompt):].strip()
                except Exception as e:
                    logger.warning(f"Instruct format failed, trying simple prompt: {e}")
                    simple_prompt = f"Based on this context, provide a detailed explanation:\n\nContext: {context_text}\n\nQuestion: {query}\n\nDetailed Answer:"
                    try:
                        result = text_generator(simple_prompt, max_new_tokens=300, do_sample=True, temperature=0.3)
                        full_text = result[0]["generated_text"]
                        answer = full_text[len(simple_prompt):].strip()
                    except Exception as e2:
                        logger.error(f"Both instruction formats failed: {e2}")
                        return self._generate_simple_answer(query, [context_text])
            else:
                result = text_generator(
                    prompt,
                    max_new_tokens=350,  # Maximized for comprehensive answers
                    do_sample=True,
                    temperature=0.3,  # Higher for better explanations
                    top_p=0.9,  # More diverse sampling
                    pad_token_id=getattr(text_generator.tokenizer, "eos_token_id", None),
                    use_cache=False  # Fix for potential cache issues
                )
                full_text = result[0]["generated_text"]
                if full_text.startswith(prompt):
                    answer = full_text[len(prompt):].strip()
                else:
                    answer = full_text.strip()

            if not answer:
                return "I could not find the answer in the document."
            
            # Allow longer, more comprehensive answers
            if len(answer.split()) > 500:  # Much more generous limit
                # Keep more content - first 8 sentences instead of 5
                sentences = answer.split('.')[:8]
                answer = '.'.join(sentences) + '.'

            # Return full answer for comprehensive responses
            answer = answer.strip()
            
            # Clean up any formatting issues but preserve content
            if answer and not answer.endswith(('.', '!', '?')):
                # Only add period if the answer doesn't end with punctuation
                answer += '.'
                
            return answer if answer else "I could not find the answer in the document."

        except Exception as e:
            logger.error(f"Answer generation failed: {e}")
            logger.info("Falling back to simple answer generation")
            return self._generate_simple_answer(query, contexts)

    def _generate_simple_answer(self, query: str, contexts: List[str]) -> str:
        """Enhanced rule-based answer generation when models fail"""
        if not contexts:
            return "No relevant information found in the documents."
        combined_text = " ".join(contexts[:4])  # Use more contexts
        query_words = set(query.lower().split())
        sentences = []
        for context in contexts[:3]:  # Check more contexts
            context_sentences = context.split('. ')
            for sentence in context_sentences:
                sentence_words = set(sentence.lower().split())
                if query_words.intersection(sentence_words):
                    sentences.append(sentence.strip())
                    if len(sentences) >= 4:  # Collect more sentences
                        break
            if len(sentences) >= 4:
                break
        if sentences:
            # Return more comprehensive fallback answer
            return ". ".join(sentences[:4]) + "."
        else:
            # Return more context if no specific match
            return combined_text[:400] + "..." if len(combined_text) > 400 else combined_text

    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models"""
        info = {
            "device": self._device,
            "loaded_models": list(self._models.keys()),
            "model_configs": {
                "embedding_model": settings.embedding_model,
                "summarization_model": settings.summarization_model,
                "reranker_model": settings.reranker_model
            }
        }
        if torch.cuda.is_available():
            info["gpu_memory"] = {
                "allocated": torch.cuda.memory_allocated() / 1024**2,  # MB
                "cached": torch.cuda.memory_reserved() / 1024**2       # MB
            }
        return info

    def clear_cache(self):
        """Clear model cache to free memory"""
        try:
            logger.info("Clearing model cache")
            self._shutdown_event.set()
            
            with self._loading_lock:
                models_to_clear = list(self._models.keys())
                for model_name in models_to_clear:
                    try:
                        del self._models[model_name]
                        logger.info(f"Cleared model: {model_name}")
                    except Exception as e:
                        logger.error(f"Error clearing model {model_name}: {e}")
                
                self._models.clear()
            
            try:
                cache_manager.clear_cache()
            except Exception as e:
                logger.error(f"Error clearing cache manager: {e}")
            
            try:
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                    logger.info("CUDA cache cleared")
            except Exception as e:
                logger.error(f"Error clearing CUDA cache: {e}")
                
            logger.info("Model cache cleared successfully")
        except Exception as e:
            logger.error(f"Error during cache clearing: {e}")

# Global model manager instance
model_manager = ModelManager()

# Add alias methods for compatibility with different model manager classes
class SimplifiedModelManager(ModelManager):
    """Simplified model manager for compatibility"""
    
    def __init__(self):
        super().__init__()
        logger.info("SimplifiedModelManager initialized")

    def _generate_simple_answer(self, query: str, contexts: List[str]) -> str:
        """Enhanced rule-based answer generation when models fail"""
        if not contexts:
            return "No relevant information found in the documents."
        combined_text = " ".join(contexts[:4])  # Use more contexts
        query_words = set(query.lower().split())
        sentences = []
        for context in contexts[:3]:  # Check more contexts
            context_sentences = context.split('. ')
            for sentence in context_sentences:
                sentence_words = set(sentence.lower().split())
                if query_words.intersection(sentence_words):
                    sentences.append(sentence.strip())
                    if len(sentences) >= 4:  # Collect more sentences
                        break
            if len(sentences) >= 4:
                break
        if sentences:
            # Return more comprehensive fallback answer
            return ". ".join(sentences[:4]) + "."
        else:
            # Return more context if no specific match
            return combined_text[:400] + "..." if len(combined_text) > 400 else combined_text

    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models"""
        info = {
            "device": self._device,
            "loaded_models": list(self._models.keys()),
            "model_configs": {
                "embedding_model": settings.embedding_model,
                "summarization_model": settings.summarization_model,
                "reranker_model": settings.reranker_model
            }
        }
        if torch.cuda.is_available():
            info["gpu_memory"] = {
                "allocated": torch.cuda.memory_allocated() / 1024**2,  # MB
                "cached": torch.cuda.memory_reserved() / 1024**2       # MB
            }
        return info

    def clear_cache(self):
        """Clear model cache to free memory"""
        try:
            logger.info("Clearing model cache")
            self._shutdown_event.set()
            
            # Clear models in a thread-safe way
            with self._loading_lock:
                models_to_clear = list(self._models.keys())
                for model_name in models_to_clear:
                    try:
                        del self._models[model_name]
                        logger.info(f"Cleared model: {model_name}")
                    except Exception as e:
                        logger.error(f"Error clearing model {model_name}: {e}")
                
                self._models.clear()
            
            # Clear caches
            try:
                cache_manager.clear_cache()
            except Exception as e:
                logger.error(f"Error clearing cache manager: {e}")
            
            # Clear CUDA cache if available
            try:
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                    logger.info("CUDA cache cleared")
            except Exception as e:
                logger.error(f"Error clearing CUDA cache: {e}")
                
            logger.info("Model cache cleared successfully")
        except Exception as e:
            logger.error(f"Error during cache clearing: {e}")

# Create alias for compatibility
simplified_model_manager = model_manager
