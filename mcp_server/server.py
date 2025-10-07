#!/usr/bin/env python3
"""
Local Models MCP Server for AI Document Tool
Handles local AI models: embeddings, text generation, reranking
"""

import asyncio
import json
import sys
import os
from typing import Any, Dict, List, Optional

# MCP imports
from mcp.server import Server
from mcp.server.models import InitializationOptions
from mcp.server.stdio import stdio_server
from mcp.types import (
    Tool,
    TextContent,
    ErrorCode,
    McpError,
)

# Import your existing AI components

sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))
from app.model_manager import model_manager
from app.cache_manager import cache_manager
from app.logger import logger

# Initialize MCP Server for Local Models
app = Server("local-ai-models")

@app.list_tools()
async def list_tools() -> list[Tool]:
    """List available AI tools"""
    return [
        Tool(
            name="generate_embedding",
            description="Generate normalized embedding for text",
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
            description="Generate comprehensive answer from query and contexts",
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
            description="Rerank search results using cross-encoder",
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
            description="Generate summary of text",
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
            description="Get information about loaded models",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        Tool(
            name="clear_cache",
            description="Clear model and embedding caches",
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
        logger.info(f"MCP Server: Handling tool call: {name}")
        
        if name == "generate_embedding":
            text = arguments["text"]
            embedding = model_manager.generate_embedding(text)
            return [TextContent(type="text", text=json.dumps(embedding))]
        
        elif name == "generate_embeddings_batch":
            texts = arguments["texts"]
            embeddings = model_manager.generate_embeddings_batch(texts)
            return [TextContent(type="text", text=json.dumps(embeddings))]
        
        elif name == "generate_answer":
            query = arguments["query"]
            contexts = arguments["contexts"]
            answer = model_manager.generate_answer(query, contexts)
            return [TextContent(type="text", text=answer)]
        
        elif name == "rerank_results":
            query = arguments["query"]
            candidates = arguments["candidates"]
            reranked = model_manager.rerank_results(query, candidates)
            return [TextContent(type="text", text=json.dumps(reranked))]
        
        elif name == "summarize_text":
            text = arguments["text"]
            max_length = arguments.get("max_length", 160)
            summary = model_manager.summarize_text(text, max_length)
            return [TextContent(type="text", text=summary)]
        
        elif name == "get_model_info":
            model_info = model_manager.get_model_info()
            cache_stats = cache_manager.get_cache_stats()
            info = {**model_info, "cache_stats": cache_stats}
            return [TextContent(type="text", text=json.dumps(info))]
        
        elif name == "clear_cache":
            model_manager.clear_cache()
            return [TextContent(type="text", text=json.dumps({"message": "Cache cleared successfully"}))]
        
        else:
            raise McpError(ErrorCode.METHOD_NOT_FOUND, f"Unknown tool: {name}")
    
    except Exception as e:
        logger.error(f"MCP Server error in {name}: {e}")
        raise McpError(ErrorCode.INTERNAL_ERROR, f"Tool execution failed: {str(e)}")

async def main():
    """Run the MCP server"""
    logger.info("Starting MCP AI Server...")
    
    # Initialize models on startup
    try:
        logger.info("Initializing AI models...")
        model_info = model_manager.get_model_info()
        logger.info(f"Models initialized: {model_info}")
    except Exception as e:
        logger.error(f"Failed to initialize models: {e}")
    
    # Run the server
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream, 
            write_stream, 
            InitializationOptions(
                server_name="ai-doc-tool",
                server_version="1.0.0",
                capabilities=app.get_capabilities(
                    notification_options=None,
                    experimental_capabilities=None
                )
            )
        )

if __name__ == "__main__":
    asyncio.run(main())