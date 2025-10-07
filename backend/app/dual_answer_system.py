"""
Dual Answer System: Local Models + GROQ
Generates answers from both sources and selects the best one
"""

import time
from typing import List, Dict, Any, Tuple, Optional
from .logger import logger
from . import ai_utils  # Your existing working models


def generate_groq_answer(groq_client, query: str, contexts: List[str]) -> str:
    """Generate answer using GROQ API"""
    if not groq_client:
        return "GROQ unavailable"
    
    try:
        # Prepare context - limit to avoid token limits
        context_text = "\n\n".join(contexts[:4])
        if len(context_text) > 2000:
            context_text = context_text[:2000] + "..."
        
        system_prompt = """You are an expert AI assistant with deep analytical capabilities. Your task is to provide comprehensive, accurate, and detailed answers based on the given context. 

Instructions:
1. Analyze the context thoroughly and extract all relevant information
2. Provide specific details, numbers, dates, and facts from the context
3. Structure your answer clearly with proper explanations
4. If the context contains academic records, certificates, or official documents, interpret and explain the data accurately
5. Be precise about grades, scores, percentages, and their meaning
6. Write in complete sentences with proper context and background

Respond with a detailed, well-structured answer that demonstrates deep understanding of the content."""
        
        user_prompt = f"""Context:
{context_text}

Question: {query}

Based on the context above, provide a comprehensive and detailed answer. Include:
- Specific facts, numbers, dates, and details from the document
- Clear explanations of any grades, scores, or achievements mentioned
- Proper interpretation of any academic or official information
- Complete background context to help understand the information

Answer:"""

        # Try models with fallback - ORDER BY POWER (most powerful first)
        models_to_try = [
            "llama-3.1-70b-versatile",  # Most powerful GROQ model
            "llama-3.1-8b-instant",     # Fast but still good
            "mixtral-8x7b-32768",       # Alternative powerful model
            "gemma2-9b-it"              # Backup option
        ]
        
        for model in models_to_try:
            try:
                completion = groq_client.chat.completions.create(
                    model=model,  # Try each model
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.3,  # Slightly higher for more detailed responses
                    max_tokens=800,   # Increased for comprehensive answers
                    top_p=0.9,
                    stream=False
                )
                
                answer = completion.choices[0].message.content.strip()
                logger.info(f"GROQ answer generated using {model}: {len(answer)} chars")
                return answer
                
            except Exception as e:
                logger.warning(f"GROQ model {model} failed: {e}")
                continue
        
        # If all models fail
        logger.error("All GROQ models failed")
        return "GROQ error: All models unavailable"
        
    except Exception as e:
        logger.error(f"GROQ answer generation failed: {e}")
        return f"GROQ error: {str(e)[:100]}"


def compare_answers_with_groq(groq_client, query: str, local_answer: str, groq_answer: str) -> Tuple[str, str]:
    """Use GROQ to compare and select the best answer"""
    if not groq_client:
        return local_answer, "local (GROQ comparison unavailable)"
    
    try:
        comparison_prompt = f"""You are an expert judge evaluating two AI-generated answers to the same question.

Question: {query}

Answer A (Local Model):
{local_answer}

Answer B (GROQ Model):
{groq_answer}

Evaluate both answers based on:
1. Accuracy and factual correctness
2. Completeness and thoroughness  
3. Clarity and coherence
4. Relevance to the question
5. Use of specific details from context

Respond with ONLY:
"Winner: A" OR "Winner: B" followed by a brief reason (1 sentence).

Format: "Winner: [A/B] - [brief reason]"
"""

        # Try models with fallback for comparison - POWERFUL MODELS FIRST
        models_to_try = [
            "llama-3.1-70b-versatile",  # Most powerful for comparison
            "llama-3.1-8b-instant", 
            "mixtral-8x7b-32768"
        ]
        
        for model in models_to_try:
            try:
                completion = groq_client.chat.completions.create(
                    model=model,  # Try each model for comparison
                    messages=[
                        {"role": "user", "content": comparison_prompt}
                    ],
                    temperature=0.1,
                    max_tokens=100,
                    stream=False
                )
                
                result = completion.choices[0].message.content.strip()
                logger.info(f"Answer comparison result using {model}: {result}")
                break
                
            except Exception as e:
                logger.warning(f"Comparison model {model} failed: {e}")
                continue
        else:
            # If all comparison models fail, default to local
            logger.error("All comparison models failed, defaulting to local")
            return local_answer, "local (GROQ comparison failed)"
        
        if "Winner: A" in result:
            reason = result.split(" - ")[1] if " - " in result else "selected by GROQ comparison"
            return local_answer, f"local ({reason})"
        elif "Winner: B" in result:
            reason = result.split(" - ")[1] if " - " in result else "selected by GROQ comparison"  
            return groq_answer, f"groq ({reason})"
        else:
            # Default to local if comparison is unclear
            return local_answer, "local (comparison unclear)"
            
    except Exception as e:
        logger.error(f"Answer comparison failed: {e}")
        return local_answer, "local (comparison failed)"


def generate_dual_answers(groq_client, query: str, contexts: List[str]) -> Dict[str, Any]:
    """
    Generate answers from both local models and GROQ, then select the best one
    
    Returns:
        {
            'answer': str,           # The selected best answer
            'source': str,           # 'local', 'groq', or 'local (reason)'
            'local_answer': str,     # Answer from your local models
            'groq_answer': str,      # Answer from GROQ
            'selection_reason': str, # Why this answer was selected
            'processing_time': float
        }
    """
    start_time = time.time()
    
    # Generate answer from your existing local models
    logger.info("Generating answer from local models...")
    try:
        # Convert string contexts to dict format expected by synthesize_answer
        context_dicts = [{"text": ctx} for ctx in contexts]
        local_answer = ai_utils.synthesize_answer(query, context_dicts)
        if not local_answer or local_answer.strip() == "":
            local_answer = "Local model could not generate an answer."
    except Exception as e:
        logger.error(f"Local answer generation failed: {e}")
        local_answer = f"Local model error: {str(e)[:100]}"
    
    logger.info(f"Local answer: {local_answer[:100]}...")
    
    # Generate answer from GROQ if available
    if groq_client:
        logger.info("Generating answer from GROQ...")
        groq_answer = generate_groq_answer(groq_client, query, contexts)
        logger.info(f"GROQ answer: {groq_answer[:100]}...")
        
        # If only one source worked, return that
        if "error" in local_answer.lower() and "error" not in groq_answer.lower():
            selected_answer = groq_answer
            source = "groq"
            reason = "local model failed"
        elif "error" not in local_answer.lower() and "error" in groq_answer.lower():
            selected_answer = local_answer
            source = "local"
            reason = "GROQ failed"
        else:
            # Both worked - use GROQ to compare and select the best
            selected_answer, source_info = compare_answers_with_groq(
                groq_client, query, local_answer, groq_answer
            )
            source = source_info.split(" (")[0]  # Extract 'local' or 'groq'
            reason = source_info
    else:
        # No GROQ available - use local only
        groq_answer = "GROQ not available"
        selected_answer = local_answer
        source = "local"
        reason = "GROQ not configured"
    
    processing_time = time.time() - start_time
    
    result = {
        'answer': selected_answer,
        'source': source,
        'local_answer': local_answer,
        'groq_answer': groq_answer,
        'selection_reason': reason,
        'processing_time': processing_time
    }
    
    logger.info(f"Dual answer result: {source} selected ({reason})")
    return result