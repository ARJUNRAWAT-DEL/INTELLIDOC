import hashlib
import json
import time
from typing import Dict, List, Any, Optional
from functools import lru_cache
import threading
from .logger import logger

class CacheManager:
    """Smart caching system for embeddings and search results"""
    
    def __init__(self):
        self._embedding_cache = {}
        self._search_cache = {}
        self._cache_lock = threading.RLock()
        self._max_cache_size = 1000  # Maximum cached items
        self._cache_ttl = 3600  # 1 hour TTL
        
        logger.info("CacheManager initialized")
    
    def _generate_cache_key(self, text: str) -> str:
        """Generate consistent cache key from text"""
        return hashlib.md5(text.encode('utf-8')).hexdigest()
    
    def _is_cache_valid(self, timestamp: float) -> bool:
        """Check if cache entry is still valid"""
        return time.time() - timestamp < self._cache_ttl
    
    def _cleanup_old_entries(self, cache_dict: dict):
        """Remove expired cache entries"""
        current_time = time.time()
        expired_keys = [
            key for key, value in cache_dict.items()
            if current_time - value.get('timestamp', 0) > self._cache_ttl
        ]
        for key in expired_keys:
            del cache_dict[key]
        
        # If still too large, remove oldest entries
        if len(cache_dict) > self._max_cache_size:
            sorted_items = sorted(
                cache_dict.items(),
                key=lambda x: x[1].get('timestamp', 0)
            )
            items_to_remove = len(cache_dict) - self._max_cache_size
            for i in range(items_to_remove):
                key = sorted_items[i][0]
                del cache_dict[key]
    
    def get_embedding(self, text: str) -> Optional[List[float]]:
        """Get cached embedding if available"""
        cache_key = self._generate_cache_key(text)
        
        with self._cache_lock:
            if cache_key in self._embedding_cache:
                entry = self._embedding_cache[cache_key]
                if self._is_cache_valid(entry['timestamp']):
                    logger.debug(f"Cache hit for embedding: {cache_key}")
                    return entry['embedding']
                else:
                    # Remove expired entry
                    del self._embedding_cache[cache_key]
        
        return None
    
    def cache_embedding(self, text: str, embedding: List[float]):
        """Cache an embedding"""
        cache_key = self._generate_cache_key(text)
        
        with self._cache_lock:
            self._embedding_cache[cache_key] = {
                'embedding': embedding,
                'timestamp': time.time()
            }
            
            # Cleanup if needed
            if len(self._embedding_cache) > self._max_cache_size * 1.2:
                self._cleanup_old_entries(self._embedding_cache)
        
        logger.debug(f"Cached embedding: {cache_key}")
    
    def get_search_results(self, query: str, doc_id: Optional[int] = None) -> Optional[List[Dict[str, Any]]]:
        """Get cached search results if available"""
        search_key = f"{query}_{doc_id or 'all'}"
        cache_key = self._generate_cache_key(search_key)
        
        with self._cache_lock:
            if cache_key in self._search_cache:
                entry = self._search_cache[cache_key]
                if self._is_cache_valid(entry['timestamp']):
                    logger.debug(f"Cache hit for search: {cache_key}")
                    return entry['results']
                else:
                    del self._search_cache[cache_key]
        
        return None
    
    def cache_search_results(self, query: str, results: List[Dict[str, Any]], doc_id: Optional[int] = None):
        """Cache search results"""
        search_key = f"{query}_{doc_id or 'all'}"
        cache_key = self._generate_cache_key(search_key)
        
        with self._cache_lock:
            self._search_cache[cache_key] = {
                'results': results,
                'timestamp': time.time()
            }
            
            # Cleanup if needed
            if len(self._search_cache) > self._max_cache_size * 1.2:
                self._cleanup_old_entries(self._search_cache)
        
        logger.debug(f"Cached search results: {cache_key}")
    
    def clear_cache(self):
        """Clear all caches"""
        with self._cache_lock:
            self._embedding_cache.clear()
            self._search_cache.clear()
        logger.info("All caches cleared")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self._cache_lock:
            return {
                'embedding_cache_size': len(self._embedding_cache),
                'search_cache_size': len(self._search_cache),
                'max_cache_size': self._max_cache_size,
                'cache_ttl': self._cache_ttl
            }

# Global cache manager instance
cache_manager = CacheManager()