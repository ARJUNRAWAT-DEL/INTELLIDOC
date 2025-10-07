#!/usr/bin/env python3
"""
Startup script for AI Document Tool with optimized configuration
"""
import os
import sys
import warnings
import subprocess

# Suppress warnings before importing anything
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", message=".*flash-attention.*")
warnings.filterwarnings("ignore", message=".*numerical differences.*")

# Set environment variables to suppress flash-attention warnings
os.environ["TRANSFORMERS_VERBOSITY"] = "error"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

def main():
    """Start the server with proper warning suppression"""
    
    print("🚀 Starting AI Document Tool Server")
    print("📝 Flash-attention warnings suppressed")
    print("🔧 Using eager attention implementation for Phi-3")
    print("=" * 50)
    
    # Change to backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    # Start uvicorn server with suppressed warnings
    cmd = [
        sys.executable, "-m", "uvicorn", 
        "app.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ]
    
    try:
        # Redirect stderr to suppress C++ level warnings (optional)
        with open(os.devnull, 'w') as devnull:
            process = subprocess.Popen(
                cmd,
                # stderr=devnull,  # Uncomment this line to completely suppress stderr
                env=os.environ
            )
            process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        process.terminate()
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()