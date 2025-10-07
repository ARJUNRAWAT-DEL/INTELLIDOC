#!/usr/bin/env python3
"""
Test script to demonstrate CUDA error handling and CPU fallback
"""

import os
import sys
sys.path.append('.')

def test_cuda_fallback():
    """Test CUDA error handling and CPU fallback"""
    print("=== Testing CUDA Error Handling and CPU Fallback ===\n")
    
    try:
        from app.model_manager import model_manager
        
        print(f"Device detected: {model_manager._device}")
        print("Testing normal operation...")
        
        # Test 1: Embedding generation
        print("\n1. Testing embedding generation...")
        try:
            embedding = model_manager.generate_embedding("This is a test sentence for embedding.")
            print(f"   ✓ Embedding generated successfully (dimension: {len(embedding)})")
        except Exception as e:
            print(f"   ✗ Embedding failed: {e}")
        
        # Test 2: Batch embedding generation
        print("\n2. Testing batch embedding generation...")
        try:
            embeddings = model_manager.generate_embeddings_batch([
                "First test sentence",
                "Second test sentence", 
                "Third test sentence"
            ])
            print(f"   ✓ Batch embeddings generated successfully ({len(embeddings)} embeddings)")
        except Exception as e:
            print(f"   ✗ Batch embedding failed: {e}")
        
        # Test 3: Text summarization (most likely to trigger CUDA errors)
        print("\n3. Testing text summarization...")
        test_text = """
        Artificial Intelligence (AI) has revolutionized many aspects of our daily lives and continues to be one of the most significant technological advancements of the 21st century. From voice assistants like Siri and Alexa to recommendation systems on Netflix and Amazon, AI is everywhere. Machine learning, a subset of AI, enables computers to learn and improve from experience without being explicitly programmed. Deep learning, which uses neural networks with multiple layers, has been particularly successful in image recognition, natural language processing, and game playing. However, AI also presents challenges including job displacement, privacy concerns, and the need for ethical guidelines. The future of AI holds promise for breakthroughs in healthcare, transportation, and scientific research, but it requires careful consideration of its societal impacts.
        """
        
        try:
            summary = model_manager.summarize_text(test_text.strip())
            print(f"   ✓ Summarization successful: {summary[:100]}...")
        except Exception as e:
            print(f"   ✗ Summarization failed: {e}")
        
        print("\n=== Test completed successfully! ===")
        print("\nTo force CPU mode in production, set environment variable:")
        print("export FORCE_CPU=true")
        
    except Exception as e:
        print(f"Test setup failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_cuda_fallback()