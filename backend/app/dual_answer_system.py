"""
Dual Answer System: Local Models + GROQ
Generates answers from both sources and selects the best one
"""

import time
import re
from typing import List, Dict, Any, Tuple, Optional
from .logger import logger
from . import ai_utils  # Your existing working models
from .schemas import Citation


def _is_weak_answer(answer: str) -> bool:
    if not answer:
        return True
    text = answer.strip().lower()
    weak_markers = [
        "please refer to the groq ai response",
        "groq unavailable",
        "could not generate",
        "could not find",
        "error:",
        "model error",
        "based on the context:",
    ]
    if any(marker in text for marker in weak_markers):
        return True
    return len(text.split()) < 12


def _is_ats_query(query: str) -> bool:
    q = query.lower()
    return "ats" in q or ("resume" in q and "score" in q) or ("cv" in q and "score" in q)


def _split_sentences(text: str) -> List[str]:
    parts = re.split(r"(?<=[.!?])\s+|\n+", text)
    return [p.strip() for p in parts if len(p.strip()) > 20]


def _format_groq_answer(query: str, raw_answer: str, contexts: List[str]) -> str:
    answer = (raw_answer or "").strip()
    if not answer:
        answer = "I could not find enough context to answer this question accurately."

    # Remove old forced sections if a model still emits them.
    lower_answer = answer.lower()
    for marker in ["key points:", "would you like to know more?"]:
        pos = lower_answer.find(marker)
        if pos != -1:
            answer = answer[:pos].strip()
            lower_answer = answer.lower()

    # Respect explicit formatting if already present.
    if "direct answer:" in lower_answer or "elaboration:" in lower_answer:
        return answer

    # Adaptive brief + elaboration formatting.
    sentences = _split_sentences(answer)
    if not sentences:
        return answer

    if len(sentences) == 1:
        return f"Direct Answer: {sentences[0]}"

    direct_answer = sentences[0]
    elaboration = " ".join(sentences[1:5])

    return f"Direct Answer: {direct_answer}\n\nElaboration: {elaboration}"


def generate_groq_answer(
    groq_client,
    query: str,
    contexts: List[str],
    answer_length: str = "balanced",
    answer_mode: str = "summary"
) -> str:
    """Generate answer using GROQ API with enhanced quality prompting"""
    if not groq_client:
        return "GROQ unavailable"
    
    try:
        # Prepare richer context for better grounded generation - use MORE context
        context_text = "\n\n".join(contexts[:12])  # Increased from 8 to 12
        if len(context_text) > 6000:  # Increased from 4500 to 6000
            context_text = context_text[:6000] + "..."

        has_context = len(context_text.strip()) > 0
        
        # IMPROVED: More detailed length instructions that push for quality
        length_instructions = {
            "short": "Provide a concise but comprehensive answer in 2-3 well-structured paragraphs with specific details from the context.",
            "balanced": "Provide a thorough explanation with multiple well-developed paragraphs, key points, and supporting evidence from the document. Include specific examples, numbers, or quotes where relevant.",
            "detailed": "Provide an in-depth, comprehensive answer with multiple sections, detailed explanations, bullet points for key insights, supporting evidence, specific examples, and actionable recommendations based on the context.",
        }
        
        mode_instructions = {
            "summary": "Summarize the key information from the document comprehensively. Cover all major topics with sufficient detail and specific examples.",
            "qa": "Answer the user's question thoroughly and precisely. Go beyond surface-level answers - provide depth, context, and supporting details from the document.",
            "keypoints": "Extract and explain the top key points in detail, not just list them. For each point, provide context and supporting evidence.",
            "pageexplanation": "Provide a detailed, comprehensive explanation of the selected page or page range. Cover all important information, details, and context.",
            "actionitems": "Extract all actionable items, deadlines, follow-ups, and related information. Provide context and details for each item.",
        }
        
        instruction_block = (
            f"Answer mode: {mode_instructions.get(answer_mode, mode_instructions['summary'])}\n"
            f"Answer length: {length_instructions.get(answer_length, length_instructions['balanced'])}\n"
            "IMPORTANT: Provide thorough, detailed responses that exceed basic expectations. Always stay grounded in the context and cite specific details when available."
        )
        
        ats_query = _is_ats_query(query)

        if has_context:
            system_prompt = """You are an expert, highly knowledgeable document analyst with deep domain expertise.

Your task is to provide COMPREHENSIVE, HIGH-QUALITY answers based ONLY on the provided context.

Core Instructions:
1. Provide thorough, detailed answers that go beyond surface-level responses
2. Use only facts present in the context; do not guess or hallucinate
3. Include concrete details (numbers, dates, names, specific examples) when available
4. Organize your response with clear structure and well-developed paragraphs
5. Explain the significance of data points and provide context for all information
6. If evidence is missing, explicitly state that the context does not contain it
7. For document data (scores, grades, dates), provide comprehensive explanations of what each value means
8. Include supporting evidence and specific examples for all claims

Output format:
1) "Direct Answer:" - Clear, direct response to the question (1-2 sentences)
2) "Comprehensive Explanation:" - Detailed, well-structured explanation with multiple paragraphs, supporting evidence, and specific examples
3) "Key Insights:" - Important takeaways and implications from the information provided
"""
            user_prompt = f"""Context:
{context_text}

Question: {query}
{instruction_block}

Provide a comprehensive, high-quality response that thoroughly addresses the question with detailed explanations, supporting evidence, and specific examples from the context.

If the question asks for an ATS score and the document appears to be a resume/CV, provide:
- Estimated ATS Score (0-100)
- Score Breakdown (Keywords, Formatting, Experience Clarity, Skills Alignment)
- Top 5 improvements to increase ATS score
- A brief note that score is an estimate based on available text

Answer:"""
        else:
            system_prompt = """You are an expert AI assistant with comprehensive knowledge across multiple domains.

No document context is available for this query. Provide a thorough, high-quality answer using general knowledge.

Rules:
1. Provide comprehensive, detailed answers that exceed basic expectations
2. Clearly note that your answer is based on general knowledge (not uploaded docs)
3. Organize response with clear structure and well-developed paragraphs
4. Include practical examples, actionable advice, and supporting details
5. Cover multiple perspectives and important considerations

Output format:
1) "Direct Answer:" - Clear response (2-3 sentences)
2) "Comprehensive Explanation:" - Detailed, multi-paragraph explanation with examples
3) "Key Insights:" - Important considerations and recommendations
"""

            if ats_query:
                user_prompt = f"""Question: {query}
{instruction_block}

Provide a comprehensive ATS-focused response. Include:
- Detailed overview of typical ATS systems and how they work
- Comprehensive scoring framework with all major scoring categories
- Detailed scoring rubric by category with best practices
- Complete resume optimization checklist with specific strategies
- Common ATS mistakes to avoid
- Request that user share resume text for exact document-based analysis

Make this answer detailed, actionable, and comprehensive."""
            else:
                user_prompt = f"""Question: {query}
{instruction_block}

Provide a comprehensive, high-quality answer using general knowledge. Clearly note this is general guidance (not extracted from uploaded docs), but ensure the answer is detailed, well-structured, with multiple paragraphs, specific examples, and actionable insights.

Make this answer exceed basic expectations in quality and detail."""

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
                    temperature=0.2,
                    max_tokens=2000,  # INCREASED from 1200 to 2000 for longer answers
                    top_p=0.9,
                    stream=False
                )
                
                answer = completion.choices[0].message.content.strip()
                answer = _format_groq_answer(query, answer, contexts)
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


def generate_dual_answers(
    groq_client,
    query: str,
    contexts: List[str],
    answer_length: str = "balanced",
    answer_mode: str = "summary"
) -> Dict[str, Any]:
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
        local_answer = ai_utils.synthesize_answer(query, context_dicts, answer_length=answer_length, answer_mode=answer_mode)
        if not local_answer or local_answer.strip() == "":
            local_answer = "Local model could not generate an answer."
    except Exception as e:
        logger.error(f"Local answer generation failed: {e}")
        local_answer = f"Local model error: {str(e)[:100]}"
    
    logger.info(f"Local answer: {local_answer[:100]}...")
    
    # Generate answer from GROQ if available
    if groq_client:
        logger.info("Generating answer from GROQ...")
        groq_answer = generate_groq_answer(groq_client, query, contexts, answer_length=answer_length, answer_mode=answer_mode)
        logger.info(f"GROQ answer: {groq_answer[:100]}...")

        local_weak = _is_weak_answer(local_answer)
        groq_weak = _is_weak_answer(groq_answer)

        if local_weak and not groq_weak:
            selected_answer = groq_answer
            source = "groq"
            reason = "local answer low quality; GROQ stronger"
        elif groq_weak and not local_weak:
            selected_answer = local_answer
            source = "local"
            reason = "GROQ answer low quality"
        elif not groq_weak and not local_weak:
            selected_answer = groq_answer
            source = "groq"
            reason = "GROQ preferred for detailed, structured explanation"
        else:
            # If only one source has an explicit error, prefer the other.
            if "error" in local_answer.lower() and "error" not in groq_answer.lower():
                selected_answer = groq_answer
                source = "groq"
                reason = "local model failed"
            elif "error" not in local_answer.lower() and "error" in groq_answer.lower():
                selected_answer = local_answer
                source = "local"
                reason = "GROQ failed"
            else:
                # Both worked - use GROQ to compare and select the best.
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


# Phase 1: Citations extraction function
def extract_citations_from_contexts(
    query: str,
    answer: str,
    chunks: List[Dict[str, Any]]  # [{id, text, doc_id, doc_title}]
) -> List[Citation]:
    """
    Extract relevant citations from chunks based on answer content
    
    Args:
        query: The original query
        answer: The generated answer
        chunks: List of relevant chunks with metadata
    
    Returns:
        List of Citation objects with quotes and references
    """
    citations: List[Citation] = []
    
    if not chunks or not answer:
        return citations
    
    try:
        # Find sentences in the answer
        answer_sentences = re.split(r'[.!?]+', answer)
        answer_sentences = [s.strip() for s in answer_sentences if len(s.strip()) > 10]
        
        # For each answer sentence, find supporting chunks
        for sentence in answer_sentences[:5]:  # Limit to top 5 sentences
            # Remove formatting markers
            clean_sentence = re.sub(r'Direct Answer:|Elaboration:|^\s*[-*]|\d+\)\s*', '', sentence).strip()
            
            if len(clean_sentence) < 10:
                continue
            
            # Find best matching chunks
            best_matches = _find_matching_chunks(clean_sentence, chunks)
            
            for chunk in best_matches[:2]:  # Top 2 matches per sentence
                # Extract a relevant quote from the chunk
                quote = _extract_quote_from_chunk(clean_sentence, chunk.get("text", ""))
                
                if quote:
                    citation = Citation(
                        quote=quote[:150],  # Limit quote length
                        chunk_id=chunk.get("id", 0),
                        doc_id=chunk.get("doc_id", 0),
                        doc_title=chunk.get("doc_title", "Unknown"),
                        confidence=0.85,
                        page_number=chunk.get("page_number"),
                        paragraph_number=chunk.get("paragraph_number"),
                        section_title=chunk.get("section_title")
                    )
                    citations.append(citation)
        
        # Remove duplicate citations
        unique_citations = {}
        for cit in citations:
            key = (cit.chunk_id, cit.quote[:50])
            if key not in unique_citations:
                unique_citations[key] = cit
        
        return list(unique_citations.values())[:10]  # Return max 10 citations
    
    except Exception as e:
        logger.warning(f"Error extracting citations: {e}")
        return citations


def _find_matching_chunks(sentence: str, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Find chunks most relevant to the given sentence"""
    
    scored_chunks = []
    
    sentence_words = set(word.lower() for word in re.findall(r'\b\w+\b', sentence))
    
    for chunk in chunks:
        chunk_text = chunk.get("text", "").lower()
        chunk_words = set(re.findall(r'\b\w+\b', chunk_text))
        
        # Calculate jaccard similarity
        if len(sentence_words) == 0 or len(chunk_words) == 0:
            similarity = 0
        else:
            intersection = len(sentence_words & chunk_words)
            union = len(sentence_words | chunk_words)
            similarity = intersection / union if union > 0 else 0
        
        if similarity > 0:
            scored_chunks.append((chunk, similarity))
    
    # Sort by similarity and return top matches
    scored_chunks.sort(key=lambda x: x[1], reverse=True)
    return [c[0] for c in scored_chunks[:5]]


def _extract_quote_from_chunk(sentence: str, chunk_text: str) -> str:
    """Extract a relevant quote from chunk text that matches the sentence"""
    
    # Try to find the most relevant sentence in the chunk
    sentences = re.split(r'[.!?]+', chunk_text)
    
    sentence_words = set(word.lower() for word in re.findall(r'\b\w+\b', sentence))
    
    best_quote = ""
    best_match = 0
    
    for sent in sentences:
        sent_words = set(word.lower() for word in re.findall(r'\b\w+\b', sent))
        
        if len(sentence_words) == 0:
            continue
        
        match_count = len(sentence_words & sent_words)
        match_ratio = match_count / len(sentence_words)
        
        if match_ratio > best_match and len(sent.strip()) > 10:
            best_match = match_ratio
            best_quote = sent.strip()
    
    return best_quote if best_quote else chunk_text[:100]