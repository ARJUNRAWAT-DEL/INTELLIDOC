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
    """Clean up the raw GROQ answer. Only add structure if not already present."""
    answer = (raw_answer or "").strip()
    if not answer:
        return "I could not find enough context to answer this question accurately."

    # Strip any stray trailing prompts the model sometimes emits
    lower_answer = answer.lower()
    for marker in ["would you like to know more?", "let me know if you need"]:
        pos = lower_answer.find(marker)
        if pos != -1:
            answer = answer[:pos].strip()
            lower_answer = answer.lower()

    # If the model already formatted the answer with sections, keep it as-is
    structured_markers = [
        "direct answer:", "elaboration:", "comprehensive explanation:",
        "key insights:", "supporting evidence:", "summary:", "overview:",
    ]
    if any(m in lower_answer for m in structured_markers):
        return answer

    # For greetings and short responses, return as-is
    sentences = _split_sentences(answer)
    if not sentences or len(sentences) <= 2:
        return answer

    # For longer unstructured answers, lightly wrap with Direct Answer / Elaboration
    direct_answer = sentences[0]
    elaboration = " ".join(sentences[1:5])
    return f"Direct Answer: {direct_answer}\n\nElaboration: {elaboration}"


def generate_groq_answer(
    groq_client,
    query: str,
    contexts: List[str],
    answer_length: str = "balanced",
    answer_mode: str = "qa"
) -> str:
    """Generate answer using GROQ API with intent-aware prompting."""
    if not groq_client:
        return "GROQ unavailable"

    try:
        # ── Step 1: detect intent so we can craft the right prompt ───────────
        from .ai_utils import _detect_intent
        intent = _detect_intent(query)
        logger.info(f"GROQ: detected intent='{intent}' for query='{query}'")

        # ── Greeting — respond conversationally, skip RAG entirely ───────────
        if intent == "greeting":
            return (
                "Hello! I'm your document assistant. I can answer questions about your "
                "uploaded document, summarize it, extract key points, or identify action items. "
                "What would you like to know?"
            )

        # ── Build context string ──────────────────────────────────────────────
        context_text = "\n\n".join(contexts[:12])
        if len(context_text) > 6000:
            context_text = context_text[:6000] + "..."
        has_context = len(context_text.strip()) > 0

        ats_query = _is_ats_query(query)

        length_map = {
            "short":    "Answer in 2-3 focused paragraphs.",
            "balanced": "Answer in 3-5 well-structured paragraphs with key evidence.",
            "detailed": "Answer comprehensively with sections, bullet points, and specific evidence.",
        }
        length_instruction = length_map.get(answer_length, length_map["balanced"])

        # ══════════════════════════════════════════════════════════════════════
        # INTENT: summary — full document overview
        # ══════════════════════════════════════════════════════════════════════
        if intent == "summary" or answer_mode == "summary":
            system_prompt = (
                "You are a professional document analyst. Your job is to produce a clear, "
                "structured summary of the document based ONLY on the provided context. "
                "Cover the main purpose, key points, and any important conclusions. "
                "Do NOT add information not present in the context."
            )
            user_prompt = (
                f"Document context:\n{context_text}\n\n"
                f"Please provide a comprehensive summary of this document.\n"
                f"Length: {length_instruction}"
            )

        # ══════════════════════════════════════════════════════════════════════
        # INTENT: general_knowledge — advisory / how-to / tips (use doc as context)
        # ══════════════════════════════════════════════════════════════════════
        elif intent == "general_knowledge":
            if has_context:
                system_prompt = (
                    "You are an expert advisor. The user has uploaded a document "
                    "(could be a CV, report, contract, etc.) and is asking for practical advice.\n\n"
                    "Your approach:\n"
                    "1. Read the document context carefully to understand what it contains.\n"
                    "2. Use the document details (skills, experience, role, content) to give "
                    "PERSONALISED, specific advice — not generic tips.\n"
                    "3. Combine document evidence with relevant general knowledge.\n"
                    "4. Be concrete, actionable, and structured.\n"
                    "5. Never ignore what is in the document — tailor every point to it."
                )
                user_prompt = (
                    f"Document context:\n{context_text}\n\n"
                    f"User question: {query}\n\n"
                    f"Provide personalised, actionable advice based on the document above.\n"
                    f"Length: {length_instruction}\n\n"
                    "Structure your answer with clear sections and specific points drawn "
                    "from the document content."
                )
            else:
                system_prompt = (
                    "You are an expert advisor. No document has been uploaded, so answer "
                    "using your general knowledge. Be practical and specific."
                )
                user_prompt = (
                    f"Question: {query}\n\n"
                    f"Provide practical, actionable advice.\n"
                    f"Length: {length_instruction}"
                )

        # ══════════════════════════════════════════════════════════════════════
        # INTENT: document_qa — specific question about document content
        # ══════════════════════════════════════════════════════════════════════
        else:
            if has_context:
                system_prompt = (
                    "You are a precise document analyst. Answer the user's question "
                    "using ONLY the information in the provided context.\n\n"
                    "Rules:\n"
                    "1. Answer directly — start with the answer, not with preamble.\n"
                    "2. Support your answer with specific evidence (quotes, numbers, dates) from the context.\n"
                    "3. If the answer is not in the context, say so clearly.\n"
                    "4. Never hallucinate or add information not present in the context.\n\n"
                    "Format:\n"
                    "- Direct Answer: (1-2 sentences)\n"
                    "- Supporting Evidence: (specific details from the document)\n"
                    "- Additional Context: (only if relevant)"
                )
                extra = ""
                if ats_query:
                    extra = (
                        "\n\nIf this is a CV/resume and the user asks for an ATS score, provide:\n"
                        "- Estimated ATS Score (0-100) with justification\n"
                        "- Score breakdown by category (Keywords, Formatting, Experience, Skills)\n"
                        "- Top 5 specific improvements to boost the score"
                    )
                user_prompt = (
                    f"Document context:\n{context_text}\n\n"
                    f"Question: {query}\n"
                    f"Length: {length_instruction}{extra}"
                )
            else:
                system_prompt = (
                    "You are a helpful AI assistant. No document context is available. "
                    "Answer using general knowledge and note that no document was found."
                )
                user_prompt = (
                    f"Question: {query}\n\n"
                    f"Note: No document context is available — answer from general knowledge.\n"
                    f"Length: {length_instruction}"
                )

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