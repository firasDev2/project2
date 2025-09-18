import os
import json
import re
import logging
import win32com.client as win32
import numpy as np
from markitdown import MarkItDown
import ollama
import realTime
from rapidfuzz import process

# ---------- Logging ----------
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

if not hasattr(np, "float"):
    np.float = float

# ---------- Utilities ----------
def fuzzy_find(sentence, doc_text, threshold=85):
    """Find closest fuzzy match of a sentence in doc_text."""
    match, score, _ = process.extractOne(sentence, doc_text.split("."))
    if score >= threshold:
        return match
    return None


# ---------- LLM prompt ----------
LLM_PROMPT_TEMPLATE = """Voici un extrait d'un cahier des charges en français :

{doc_text}

Ta tâche :
1. Extrait les *user stories* du texte.
2. Pour chaque user story, indique la phrase originale du cahier des charges que tu as utilisée.
3. Donne la sortie en JSON structuré avec le format suivant :

{{
  "user_stories": [
    {{
      "story": "En tant que [utilisateur], je veux [objectif] afin de [raison].",
      "source_sentence": "..."
    }}
  ]
}}

IMPORTANT : Réponds UNIQUEMENT avec du JSON valide. 
Utilise exactement la phrase du cahier des charges comme source_sentence sans la modifier.
Assure-toi que tous les caractères spéciaux, comme le backslash (\), soient correctement échappés (ex. \\).
N’ajoute pas de texte, pas d’explications, pas de code block Markdown.
La sortie doit commencer par {{ et se terminer par }}.
"""


# ---------- DOCX → Markdown ----------
def convert_to_markdown(docx_path):
    """Convert a Word .docx file to markdown text + save .md file."""
    md = MarkItDown()
    result = md.convert(docx_path)
    output_file = os.path.splitext(docx_path)[0] + ".md"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(result.text_content)
    return result.text_content, output_file


# ---------- LLM Extraction ----------
def stream_llm_response(text):
    """Stream the LLM's thinking process."""
    prompt = LLM_PROMPT_TEMPLATE.format(doc_text=text)
    stream = ollama.chat(
        model="qwen3:1.7b",
        messages=[{"role": "user", "content": prompt}],
        stream=True
    )

    raw_reply = ""
    for chunk in stream:
        delta = chunk.get("message", {}).get("content", "")
        raw_reply += delta
        yield delta
    
    return raw_reply

def extract_user_stories(text):
    """Call LLM to extract user stories from text."""
    log_file = "llm_extraction_debug.log"
    with open(log_file, "w", encoding="utf-8") as f:
        f.write("=== LLM Extraction Debug Log ===\n\n")
    
    def log_debug(msg):
        logger.debug(msg)
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"{msg}\n")
    
    try:
        log_debug("1. Starting LLM request...")
        
        # Get the complete response
        raw_reply = "".join([chunk for chunk in stream_llm_response(text)])

        log_debug("\n2. Raw LLM response received:")
        log_debug("-" * 40)
        log_debug(raw_reply)
        log_debug("-" * 40)

        # sanitize JSON escapes
        sanitized_reply = re.sub(r'(?<!\\)\\(?![\\/"bfnrt])', r'\\\\', raw_reply)
        log_debug("\n3. After JSON escape sanitization:")
        log_debug("-" * 40)
        log_debug(sanitized_reply)
        log_debug("-" * 40)

        # extract JSON block - look for proper JSON structure
        match = re.search(r'{\s*"[^"]+"\s*:[\s\S]*}', sanitized_reply)
        if not match:
            error_msg = "No valid JSON object found in LLM response"
            log_debug(f"\n4. ERROR: {error_msg}")
            raise ValueError(error_msg)

        clean_json = match.group(0).strip()
        
        log_debug("\n4. Extracted and cleaned JSON:")
        log_debug("-" * 40)
        log_debug(clean_json)
        log_debug("-" * 40)

        # Try to parse JSON and log any issues
        try:
            parsed = json.loads(clean_json)
            log_debug("\n5. Successfully parsed JSON!")
            return parsed
        except json.JSONDecodeError as e:
            log_debug(f"\n5. JSON Parse Error!")
            log_debug(f"Error position: line {e.lineno}, column {e.colno}")
            log_debug(f"Error message: {str(e)}")
            log_debug(f"Character at error position: {clean_json[e.pos:e.pos+10]}...")
            raise
    except Exception as e:
        logger.error("Error extracting user stories: %s", str(e))
        return {"user_stories": []}

# ---------- Word Highlighting ----------
def get_word_color_constant(name):
    """Map Word highlight names to integer constants."""
    color_map = {
        "wdYellow": 7,
        "wdBrightGreen": 4,
        "wdTurquoise": 3,
        "wdPink": 5,
        "wdGray25": 16,
        "wdGray50": 15,
        "wdRed": 6,
        "wdBlue": 2,
        "wdViolet": 12,
        "wdDarkBlue": 11,
        "wdDarkRed": 5,
        "wdDarkYellow": 14,
        "wdTeal": 10,
        "wdGreen": 3,
    }
    return color_map.get(name, 7)


def rehighlight_in_word(docx_path, stories):
    """Re-highlight sentences inside a Word document."""
    try:
        sentences = [us["source_sentence"] for us in stories if us.get("source_sentence")]
        color_consts = [
            get_word_color_constant(us.get("color_name", "wdYellow"))
            for us in stories
        ]

        word = realTime.get_word_app()
        doc = realTime.open_doc_in_word(docx_path)
        realTime.highlight_sentences_in_doc(doc, sentences, color_consts)
        return True
    except Exception as e:
        logger.error("Word highlighting error: %s", str(e))
        return False


# ---------- Example usage ----------
if __name__ == "__main__":
    test_file = "example.docx"
    if os.path.exists(test_file):
        md_text, _ = convert_to_markdown(test_file)
        stories = extract_user_stories(md_text)
        rehighlight_in_word(test_file, stories.get("user_stories", []))
        print(json.dumps(stories, indent=2, ensure_ascii=False))
    else:
        print("⚠️ No test DOCX file found.")
