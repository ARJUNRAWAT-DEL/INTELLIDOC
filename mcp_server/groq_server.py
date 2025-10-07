#!/usr/bin/env python3
"""
Groq-powered MCP Server for AI Document Tool
Uses Groq API for fast, reliable AI inference
"""

import asyncio
import json
import sys
import os
from typing import Any, Dict, List, Optional
import logging
import numpy as np
from datetime import datetime

# MCP imports
from mcp.server import Server
from mcp.server.models import InitializationOptions
from mcp.server.stdio import stdio_server
from mcp.types import (
    CallToolRequest,
    CallToolResult,
    ListToolsRequest,
    ListToolsResult,
    Tool,
    TextContent,
    ErrorCode,
    McpError,
)

# Groq API
try:
    from groq import Groq
except ImportError:
    print("Please install groq: pip install groq")
    sys.exit(1)

# Simple embedding using sentence transformers (lightweight model)
try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

# Initialize MCP Server
app = Server("ai-doc-tool-groq")

# Global variables
groq_client = None
embedding_model = None
cache = {}

def init_groq_client():
    """Initialize Groq client"""
    global groq_client
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise Exception("GROQ_API_KEY environment variable not set")
    
    groq_client = Groq(api_key=api_key)
    print("✅ Groq client initialized")

def init_embedding_model():
    """Initialize lightweight embedding model"""
    global embedding_model
    if SentenceTransformer is None:
        print("⚠️ SentenceTransformers not available, using simple embeddings")
        return
    
    try:
        # Use a small, fast embedding model
        embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ Embedding model initialized")
    except Exception as e:
        print(f"⚠️ Could not load embedding model: {e}")
        embedding_model = None

def simple_text_embedding(text: str, dim: int = 384) -> List[float]:
    """Simple hash-based embedding fallback"""
    import hashlib
    hash_obj = hashlib.md5(text.encode())
    hash_hex = hash_obj.hexdigest()
    
    # Convert hex to numbers and normalize
    numbers = [int(hash_hex[i:i+2], 16) for i in range(0, len(hash_hex), 2)]
    
    # Pad or truncate to desired dimension
    while len(numbers) < dim:
        numbers.extend(numbers[:dim-len(numbers)])
    numbers = numbers[:dim]
    
    # Normalize to unit vector
    norm = np.linalg.norm(numbers)
    if norm > 0:
        numbers = [x / norm for x in numbers]
    
    return numbers

@app.list_tools()
async def list_tools() -> list[Tool]:
    """List available AI tools"""
    return [
        Tool(
            name="generate_embedding",
            description="Generate normalized embedding for text using fast embedding model",
            inputSchema={
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "Text to generate embedding for"
                    }
                },
                "required": ["text"]
            }
        ),
        Tool(
            name="generate_embeddings_batch",
            description="Generate embeddings for multiple texts efficiently",
            inputSchema={
                "type": "object", 
                "properties": {
                    "texts": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of texts to generate embeddings for"
                    }
                },
                "required": ["texts"]
            }
        ),
        Tool(
            name="generate_answer",
            description="Generate comprehensive answer using Groq API",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "User's question"
                    },
                    "contexts": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of relevant context texts"
                    }
                },
                "required": ["query", "contexts"]
            }
        ),
        Tool(
            name="rerank_results",
            description="Rerank search results using Groq API",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query"
                    },
                    "candidates": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "text": {"type": "string"},
                                "score": {"type": "number"},
                                "doc_id": {"type": "integer"},
                                "doc_title": {"type": "string"}
                            }
                        },
                        "description": "List of search result candidates"
                    }
                },
                "required": ["query", "candidates"]
            }
        ),
        Tool(
            name="summarize_text",
            description="Generate summary using Groq API",
            inputSchema={
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "Text to summarize"
                    },
                    "max_length": {
                        "type": "integer",
                        "description": "Maximum summary length",
                        "default": 160
                    }
                },
                "required": ["text"]
            }
        ),
        Tool(
            name="get_model_info",
            description="Get information about Groq models",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        Tool(
            name="clear_cache",
            description="Clear response cache",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Handle tool calls"""
    try:
        print(f"🔧 Groq MCP: Handling tool call: {name}")
        
        if name == "generate_embedding":
            text = arguments["text"]
            
            if embedding_model:
                embedding = embedding_model.encode(text, normalize_embeddings=True).tolist()
            else:
                embedding = simple_text_embedding(text)
            
            return [TextContent(type="text", text=json.dumps(embedding))]
        
        elif name == "generate_embeddings_batch":
            texts = arguments["texts"]
            
            if embedding_model:
                embeddings = embedding_model.encode(texts, normalize_embeddings=True, batch_size=16).tolist()
            else:
                embeddings = [simple_text_embedding(text) for text in texts]
            
            return [TextContent(type="text", text=json.dumps(embeddings))]
        
        elif name == "generate_answer":
            query = arguments["query"]
            contexts = arguments["contexts"]
            
            # Prepare context for Groq
            context_text = "\n\n".join(contexts[:5])  # Use top 5 contexts
            
            system_prompt = """You are an expert AI assistant that provides comprehensive, accurate answers based on the given context. 
            
            Instructions:
            - Answer based ONLY on the provided context
            - Be thorough and provide detailed explanations
            - If you cannot find information in the context, say so clearly
            - Provide specific details and examples when available
            - Write in a clear, professional manner
            - Give at least 2-3 sentences with complete explanations"""
            
            user_prompt = f"""Context:
{context_text}

Question: {query}

Please provide a comprehensive answer based on the context above."""

            completion = groq_client.chat.completions.create(
                model="llama-3.1-70b-versatile",  # Fast and accurate
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,
                max_tokens=500,
                top_p=0.9,
                stream=False
            )
            
            answer = completion.choices[0].message.content.strip()
            return [TextContent(type="text", text=answer)]
        
        elif name == "rerank_results":
            query = arguments["query"]
            candidates = arguments["candidates"]
            
            if not candidates:
                return [TextContent(type="text", text=json.dumps([]))]
            
            # Use Groq to score relevance (simplified reranking)
            rerank_prompt = f"""Rate the relevance of each text to the query on a scale of 0-100.
Query: {query}

Texts:
"""
            for i, candidate in enumerate(candidates[:10]):  # Limit to 10 for speed
                rerank_prompt += f"{i+1}. {candidate['text'][:200]}...\n"
            
            rerank_prompt += "\nReturn only a JSON array of scores [score1, score2, ...] with no other text."
            
            try:
                completion = groq_client.chat.completions.create(
                    model="llama-3.1-8b-instant",  # Faster model for reranking
                    messages=[
                        {"role": "user", "content": rerank_prompt}
                    ],
                    temperature=0,
                    max_tokens=100,
                    stream=False
                )
                
                scores_text = completion.choices[0].message.content.strip()
                scores = json.loads(scores_text)
                
                # Apply new scores
                for i, candidate in enumerate(candidates[:len(scores)]):
                    candidate["rerank_score"] = scores[i]
                
                # Sort by rerank score
                reranked = sorted(candidates, key=lambda x: x.get("rerank_score", x.get("score", 0)), reverse=True)
                
            except Exception as e:
                print(f"Reranking failed: {e}, using original order")
                reranked = candidates
            
            return [TextContent(type="text", text=json.dumps(reranked))]
        
        elif name == "summarize_text":
            text = arguments["text"]
            max_length = arguments.get("max_length", 160)
            
            # Truncate if text is too long
            max_input = 2000
            if len(text) > max_input:
                text = text[:max_input] + "..."
            
            completion = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "user", 
                        "content": f"Summarize this text in approximately {max_length} characters:\n\n{text}"
                    }
                ],
                temperature=0.1,
                max_tokens=100,
                stream=False
            )
            
            summary = completion.choices[0].message.content.strip()
            return [TextContent(type="text", text=summary)]
        
        elif name == "get_model_info":
            info = {
                "provider": "Groq",
                "text_model": "llama-3.1-70b-versatile",
                "embedding_model": "all-MiniLM-L6-v2" if embedding_model else "simple-hash",
                "device": "cloud",
                "status": "connected",
                "timestamp": datetime.utcnow().isoformat(),
                "cache_size": len(cache)
            }
            return [TextContent(type="text", text=json.dumps(info))]
        
        elif name == "clear_cache":
            cache.clear()
            return [TextContent(type="text", text=json.dumps({"message": "Cache cleared successfully"}))]
        
        else:
            raise McpError(ErrorCode.METHOD_NOT_FOUND, f"Unknown tool: {name}")
    
    except Exception as e:
        print(f"❌ Groq MCP error in {name}: {e}")
        raise McpError(ErrorCode.INTERNAL_ERROR, f"Tool execution failed: {str(e)}")

async def main():
    """Run the Groq MCP server"""
    print("🚀 Starting Groq-powered MCP AI Server...")
    
    try:
        # Initialize services
        init_groq_client()
        init_embedding_model()
        
        print("✅ All services initialized successfully")
        print("🔗 Architecture: FastAPI → MCP Client → Groq MCP Server → Groq API")
        
    except Exception as e:
        print(f"❌ Failed to initialize services: {e}")
        sys.exit(1)
    
    # Run the server
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream, 
            write_stream, 
            InitializationOptions(
                server_name="ai-doc-tool-groq",
                server_version="1.0.0",
                capabilities=app.get_capabilities(
                    notification_options=None,
                    experimental_capabilities=None
                )
            )
        )

if __name__ == "__main__":
    asyncio.run(main())