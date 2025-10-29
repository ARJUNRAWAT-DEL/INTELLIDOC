"""
Dual-Answer MCP Client for AI Document Tool
Combines local models (via MCP) + Groq API with intelligent selection
"""

import asyncio
import json
import subprocess
import sys
import os
from typing import Any, Dict, List, Optional, Tuple
import threading
import time

# The 'mcp' package may not be installed in some environments (it's optional).
# Import it conditionally and provide safe fallbacks so the backend can start
# even when the local MCP client/server plumbing isn't available.
try:
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client
except Exception:
    ClientSession = None  # type: ignore
    StdioServerParameters = None  # type: ignore

    async def stdio_client(*args, **kwargs):  # type: ignore
        raise RuntimeError("mcp client not available")

# Groq API for direct calls
try:
    from groq import Groq
except ImportError:
    Groq = None

from .logger import logger
from .config import settings

class MCPClient:
    """Dual MCP Client: Local models + Groq API with intelligent answer selection"""
    
    def __init__(self):
        self.mcp_session: Optional[ClientSession] = None
        self.mcp_process: Optional[subprocess.Popen] = None
        self.groq_client: Optional[Groq] = None
        self._lock = threading.Lock()
        self._loop = None
        self._thread = None
        self._mcp_connected = False
        self._groq_connected = False
    
    async def _start_mcp_server_and_connect(self):
        """Start local MCP server process and establish connection"""
        try:
            # If the mcp package isn't available, skip starting local MCP.
            if StdioServerParameters is None or ClientSession is None:
                logger.warning("mcp package not available; skipping local MCP startup")
                self._mcp_connected = False
                return

            # Start local MCP server (your existing models)
            server_script = settings.mcp_server_script
            self.mcp_process = subprocess.Popen([
                sys.executable, server_script
            ], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            logger.info("Local MCP server process started")

            # Create client session
            server_params = StdioServerParameters(
                command=sys.executable,
                args=[server_script]
            )

            self.mcp_session = await stdio_client(server_params)
            await self.mcp_session.initialize()

            self._mcp_connected = True
            logger.info("Local MCP client connected successfully")
            
        except Exception as e:
            logger.error(f"Failed to start local MCP server: {e}")
            self._mcp_connected = False
            raise
    
    def _init_groq_client(self):
        """Initialize Groq client"""
        try:
            if Groq is None:
                logger.warning("Groq package not installed")
                return
            
            api_key = settings.groq_api_key or os.getenv("GROQ_API_KEY")
            if not api_key:
                logger.warning("GROQ_API_KEY not found")
                return
            
            self.groq_client = Groq(api_key=api_key)
            self._groq_connected = True
            logger.info("Groq client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {e}")
            self._groq_connected = False
    
    def _run_async_loop(self):
        """Run async event loop in separate thread"""
        self._loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self._loop)
        
        try:
            self._loop.run_until_complete(self._start_mcp_server_and_connect())
            self._loop.run_forever()
        except Exception as e:
            logger.error(f"Dual MCP client loop error: {e}")
        finally:
            self._loop.close()
    
    def start(self):
        """Start dual MCP client"""
        with self._lock:
            if self._thread is not None:
                return
            
            # Initialize Groq client (synchronous)
            self._init_groq_client()
            
            # Start MCP server in background thread
            self._thread = threading.Thread(target=self._run_async_loop, daemon=True)
            self._thread.start()
            
            # Wait for MCP connection
            max_retries = 10
            for _ in range(max_retries):
                if self._mcp_connected:
                    break
                time.sleep(1)
            
            logger.info(f"Dual client status - MCP: {self._mcp_connected}, Groq: {self._groq_connected}")
    
    def stop(self):
        """Stop dual MCP client"""
        with self._lock:
            if self._loop and not self._loop.is_closed():
                self._loop.call_soon_threadsafe(self._loop.stop)
            
            if self.mcp_process:
                self.mcp_process.terminate()
                self.mcp_process.wait()
            
            self._mcp_connected = False
            self._groq_connected = False
            logger.info("Dual MCP client stopped")
    
    async def _call_mcp_tool_async(self, name: str, arguments: dict) -> Any:
        """Call local MCP tool asynchronously"""
        if not self.mcp_session:
            raise Exception("MCP session not initialized")
        
        result = await self.mcp_session.call_tool(name, arguments)
        if result.content and len(result.content) > 0:
            return result.content[0].text
        return None
    
    def _call_mcp_tool_sync(self, name: str, arguments: dict) -> Any:
        """Call local MCP tool synchronously"""
        if not self._mcp_connected:
            raise Exception("Local MCP client not connected")
        
        future = asyncio.run_coroutine_threadsafe(
            self._call_mcp_tool_async(name, arguments), 
            self._loop
        )
        
        try:
            result = future.result(timeout=30)
            return result
        except asyncio.TimeoutError:
            logger.error(f"Local MCP tool call timeout: {name}")
            raise Exception(f"Local MCP tool call timeout: {name}")
    
    def _generate_groq_answer(self, query: str, contexts: List[str]) -> str:
        """Generate answer using Groq API directly with model fallback"""
        if not self._groq_connected:
            return "Groq not available"
        
        # List of models to try in order (MOST POWERFUL FIRST)
        models_to_try = [
            "llama-3.1-70b-versatile",  # Most powerful GROQ model
            "llama-3.1-8b-instant",     # Fast backup
            "mixtral-8x7b-32768",       # Alternative powerful
            "gemma2-9b-it"              # Additional option
        ]
        
        context_text = "\n\n".join(contexts[:4])
        
        system_prompt = """You are an expert AI assistant with advanced analytical capabilities. Your mission is to provide highly accurate, comprehensive, and detailed answers based on the given context.

Instructions:
- Extract and analyze ALL relevant information from the context
- Provide specific details including numbers, dates, names, scores, and percentages
- Explain the significance and meaning of any data mentioned
- Structure your response clearly and logically
- For academic documents: interpret grades, scores, and achievements accurately
- For official documents: explain the content and its implications
- Always provide complete context and background information

Deliver a thorough, well-structured response that demonstrates deep understanding."""
        
        user_prompt = f"""Context:
{context_text}

Question: {query}

Provide a detailed answer based on the context above."""

        for model in models_to_try:
            try:
                completion = self.groq_client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.3,
                    max_tokens=800,
                    top_p=0.9,
                    stream=False
                )
                
                logger.info(f"Successfully used Groq model: {model}")
                return completion.choices[0].message.content.strip()
                
            except Exception as e:
                logger.warning(f"Groq model {model} failed: {e}")
                continue
        
        return "Groq error: All models failed"
    
    def _compare_answers_with_groq(self, query: str, local_answer: str, groq_answer: str) -> Tuple[str, str]:
        """Use Groq to compare and select the best answer"""
        if not self._groq_connected:
            return local_answer, "local (Groq unavailable)"
        
        try:
            comparison_prompt = f"""You are an expert judge evaluating two AI-generated answers to the same question.

Question: {query}

Answer A (Local Model):
{local_answer}

Answer B (Groq Model):
{groq_answer}

Evaluate both answers based on:
1. Accuracy and factual correctness
2. Completeness and thoroughness  
3. Clarity and coherence
4. Relevance to the question

Respond with:
1. The letter of the better answer (A or B)
2. A brief explanation (1-2 sentences)

Format: "Winner: [A/B] - [explanation]"
"""

            # Try models with fallback - POWERFUL MODELS FIRST
            models_to_try = [
                "llama-3.1-70b-versatile", 
                "llama-3.1-8b-instant", 
                "mixtral-8x7b-32768"
            ]
            
            for model in models_to_try:
                try:
                    completion = self.groq_client.chat.completions.create(
                        model=model,  # Use fallback models
                        messages=[
                            {"role": "user", "content": comparison_prompt}
                        ],
                        temperature=0.1,
                        max_tokens=150,
                        stream=False
                    )
                    break
                except Exception as e:
                    logger.warning(f"Comparison model {model} failed: {e}")
                    continue
            else:
                return "local", "Groq comparison failed"
            
            result = completion.choices[0].message.content.strip()
            
            if "Winner: A" in result:
                return local_answer, f"local ({result.split(' - ')[1] if ' - ' in result else 'selected by Groq'})"
            elif "Winner: B" in result:
                return groq_answer, f"groq ({result.split(' - ')[1] if ' - ' in result else 'selected by Groq'})"
            else:
                # Fallback to local if comparison unclear
                return local_answer, "local (comparison unclear)"
                
        except Exception as e:
            logger.error(f"Answer comparison failed: {e}")
            return local_answer, "local (comparison failed)"
    
    # Implement interface methods
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding via local MCP"""
        if self._mcp_connected:
            try:
                result = self._call_mcp_tool_sync("generate_embedding", {"text": text})
                return json.loads(result) if result else []
            except:
                pass
        return []
    
    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings batch via local MCP"""
        if self._mcp_connected:
            try:
                result = self._call_mcp_tool_sync("generate_embeddings_batch", {"texts": texts})
                return json.loads(result) if result else []
            except:
                pass
        return []
    
    def generate_answer(self, query: str, contexts: List[str]) -> str:
        """Generate dual answers and select the best one"""
        local_answer = "Local model unavailable"
        groq_answer = "Groq unavailable"
        
        # Get answer from local MCP server
        if self._mcp_connected:
            try:
                result = self._call_mcp_tool_sync("generate_answer", {
                    "query": query,
                    "contexts": contexts
                })
                local_answer = result or "Local model failed"
                logger.info(f"Local answer: {local_answer[:100]}...")
            except Exception as e:
                logger.error(f"Local answer generation failed: {e}")
                local_answer = f"Local error: {str(e)}"
        
        # Get answer from Groq
        if self._groq_connected:
            groq_answer = self._generate_groq_answer(query, contexts)
            logger.info(f"Groq answer: {groq_answer[:100]}...")
        
        # If only one source available, return it
        if not self._mcp_connected and self._groq_connected:
            return groq_answer
        elif self._mcp_connected and not self._groq_connected:
            return local_answer
        elif not self._mcp_connected and not self._groq_connected:
            return "Both AI sources unavailable"
        
        # Both available - let Groq decide which is better
        best_answer, reason = self._compare_answers_with_groq(query, local_answer, groq_answer)
        logger.info(f"Selected answer: {reason}")
        
        return best_answer
    
    def rerank_results(self, query: str, candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rerank results via local MCP"""
        if self._mcp_connected:
            try:
                result = self._call_mcp_tool_sync("rerank_results", {
                    "query": query,
                    "candidates": candidates
                })
                return json.loads(result) if result else candidates
            except:
                pass
        return candidates
    
    def summarize_text(self, text: str, max_length: int = 160) -> str:
        """Summarize text via local MCP"""
        if self._mcp_connected:
            try:
                result = self._call_mcp_tool_sync("summarize_text", {
                    "text": text,
                    "max_length": max_length
                })
                return result or text[:max_length] + "..."
            except:
                pass
        return text[:max_length] + "..."
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model info from both sources"""
        info = {
            "provider": "Dual (Local + Groq)",
            "local_mcp_connected": self._mcp_connected,
            "groq_connected": self._groq_connected,
            "strategy": "dual_answer_with_groq_selection"
        }
        
        if self._mcp_connected:
            try:
                local_info = self._call_mcp_tool_sync("get_model_info", {})
                info["local_models"] = json.loads(local_info) if local_info else {}
            except:
                info["local_models"] = "unavailable"
        
        if self._groq_connected:
            info["groq_models"] = {
                "text_generation": "llama-3.1-70b-versatile",  # Most powerful
                "comparison": "llama-3.1-70b-versatile"        # Most powerful
            }
        
        return info
    
    def clear_cache(self) -> Dict[str, str]:
        """Clear cache on both sources"""
        results = {}
        
        if self._mcp_connected:
            try:
                result = self._call_mcp_tool_sync("clear_cache", {})
                results["local"] = json.loads(result) if result else {"message": "cleared"}
            except:
                results["local"] = {"message": "failed"}
        
        results["groq"] = {"message": "no cache to clear"}
        
        return {"message": "Cache cleared on available sources", "details": results}

# Global dual MCP client instance
mcp_client = MCPClient()