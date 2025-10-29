#!/usr/bin/env python
"""
Small helper to debug PDF text extraction using the project's extractors.

Usage:
  cd backend
  python debug_extract.py uploads\<taskid>_yourfile.pdf

The script will print sizes and outputs from both `ai_utils` and `mcp_ai_utils` extraction functions.
"""
import sys
import os
import argparse

# Ensure we can import the app package (backend/app)
# Ensure repo root (backend/) is on sys.path so we can import the `app` package
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import as package so relative imports inside modules (like `from .model_manager_simple`) work
from app.ai_utils import extract_text_from_file as extract_local
# Skip importing MCP-based extractor to avoid pulling heavy or optional MCP dependencies
# which are not needed for local extraction debugging.
extract_mcp = None


def run(path: str):
    path = os.path.abspath(path)
    print(f"File: {path}")
    if not os.path.exists(path):
        print("ERROR: file not found")
        return
    print(f"Size: {os.path.getsize(path)} bytes")

    print('\n=== ai_utils.extract_text_from_file ===')
    try:
        text = extract_local(path)
        print(f"Returned text length: {len(text or '')}")
        if text and len(text) > 0:
            print('\n--- preview (first 1000 chars) ---')
            print(text[:1000])
    except Exception as e:
        print('Exception from ai_utils:')
        import traceback
        traceback.print_exc()

    if extract_mcp is not None:
        print('\n=== mcp_ai_utils.extract_text_from_file ===')
        try:
            text2 = extract_mcp(path)
            print(f"Returned text length: {len(text2 or '')}")
            if text2 and len(text2) > 0:
                print('\n--- preview (first 1000 chars) ---')
                print(text2[:1000])
        except Exception:
            print('Exception from mcp_ai_utils:')
            import traceback
            traceback.print_exc()
    else:
        print('\nNote: mcp_ai_utils import failed or MCP client not available; skipped MCP extractor')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('file', help='Path to PDF file to test')
    args = ap.parse_args()
    run(args.file)
