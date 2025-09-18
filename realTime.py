import os
import sys
import win32com.client as win32
from rapidfuzz import process  # Ensure rapidfuzz is imported
from tkinter import messagebox
import re  # For better normalization
import unicodedata  # For Unicode NFC normalization
import datetime  # For timestamp in logs

def get_word_app():
    try:
        word = win32.GetActiveObject("Word.Application")
        print("[info] Attached to running Word instance.")
    except Exception:
        print("[info] No running Word found — launching new Word instance.")
        word = win32.Dispatch("Word.Application")
        word.Visible = True
    return word

def open_or_use_active_doc(word, filename="testing_paragraph.docx"):
    docs = word.Documents
    print(f"[info] Word has {docs.Count} document(s) open.")
    
    # First, try to open the specified file
    path = os.path.join(os.getcwd(), filename)
    if not os.path.exists(path):
        print(f"[error] File not found at: {path}")
        raise SystemExit(1)
        
    # If there are open documents, ask user what to do
    if docs.Count > 0:
        doc = word.ActiveDocument
        doc_name = getattr(doc, 'Name', '<unknown>')
        if not messagebox.askyesno("Confirm Document", 
            f"Use currently open document '{doc_name}'?\n\n" +
            f"Click 'No' to open '{filename}' instead."):
            # User clicked No - close current document and open new one
            print(f"[info] Opening file: {path}")
            return docs.Open(path)
        return doc
    
    # No open documents - just open the specified file
    print(f"[info] Opening file: {path}")
    return docs.Open(path)




def highlight_sentences_in_doc(doc, sentences, color_consts, threshold=85, log_file="highlight_log.md"):
    from win32com.client import constants
    
    # Initialize Markdown log
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(log_file, 'w', encoding='utf-8') as f:
        f.write(f"# Highlighting Log\n\n**Timestamp:** {timestamp}\n\n**Document:** {doc.Name}\n**Threshold:** {threshold}\n\n")
        f.write("## Document Preparation\n")
        f.write("- Track revisions disabled.\n")
        f.write("- All revisions accepted.\n\n")

    # Precautions for French docs
    doc.TrackRevisions = False
    doc.AcceptAllRevisions()

    full_text = doc.Content.Text
    # Enhanced normalization: NFC, remove control chars, handle French typography
    full_text = unicodedata.normalize('NFC', full_text)
    normalized_full_text = re.sub(r'[\x00-\x08\x0B-\x1F\x7F-\x9F]', '',  # Remove control chars
                                  re.sub(r'\s+', ' ', full_text
                                         .replace('\r', ' ').replace('\n', ' ').replace('\xa0', ' ')  # nbsp
                                         .replace('–', '-').replace('—', '-')
                                         .replace('«', '"').replace('»', '"')
                                         .replace('‘', "'").replace('’', "'").replace('“', '"').replace('”', '"')
                                         .strip()))
    # Improved sentence splitting for French: handle ellipsis, quotes, and special chars
    doc_sentences = [s.strip() for s in re.split(r'(?<=[.!?\-"\]])\s+', normalized_full_text) if s.strip()]

    with open(log_file, 'a', encoding='utf-8') as f:
        f.write("## Extracted Document Sentences\n")
        f.write("These are the split sentences from the document after normalization (control chars removed):\n\n")
        for i, s in enumerate(doc_sentences):
            f.write(f"- **Sentence {i+1}:** `{s[:100]}...` (length: {len(s)})\n")
        f.write("\n")

    # Deduplicate sentences
    unique_sentences = list(dict.fromkeys(sentences))
    if len(unique_sentences) < len(sentences):
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"## Input Sentences\n- Original count: {len(sentences)}\n- Unique count: {len(unique_sentences)} (duplicates removed)\n\n")

    for idx, (sentence, color) in enumerate(zip(unique_sentences, color_consts)):
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"## Processing Input Sentence {idx + 1}\n")
            f.write(f"**Original:** `{sentence}`\n\n")
        
        print(f"[info] Processing sentence {idx + 1}/{len(unique_sentences)}: {sentence[:50]}...")
        
        sentence = unicodedata.normalize('NFC', sentence)
        normalized_sentence = re.sub(r'[\x00-\x08\x0B-\x1F\x7F-\x9F]', '',  # Remove control chars
                                     re.sub(r'\s+', ' ', sentence
                                            .replace('\xa0', ' ')
                                            .replace('–', '-').replace('—', '-')
                                            .replace('«', '"').replace('»', '"')
                                            .replace('‘', "'").replace('’', "'").replace('“', '"').replace('”', '"')
                                            .strip()))
        sentence_len = len(normalized_sentence)

        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"**Normalized:** `{normalized_sentence}` (length: {sentence_len})\n\n")

        match, score, _ = process.extractOne(normalized_sentence, doc_sentences, score_cutoff=threshold)

        if match and score >= threshold:
            print(f"  🔍 Fuzzy match found: {match[:50]}... (score: {score})")
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(f"### Fuzzy Matching\n- Best match: `{match}`\n- Score: {score}\n\n")

            rng = doc.Content.Duplicate
            search_complete = False
            attempt = 0
            while not search_complete:
                attempt += 1
                with open(log_file, 'a', encoding='utf-8') as f:
                    f.write(f"### Search Attempt {attempt}\n")
                
                found = False
                if sentence_len > 250:
                    find_text = normalized_sentence[:250]
                    with open(log_file, 'a', encoding='utf-8') as f:
                        f.write(f"- Using prefix for long sentence: `{find_text}`\n")
                    found = rng.Find.Execute(FindText=find_text, Forward=True, MatchCase=False, MatchWholeWord=False,
                                             MatchWildcards=False, MatchSoundsLike=False, MatchAllWordForms=False)
                    if found:
                        rng.MoveEnd(Unit=constants.wdCharacter, Count=sentence_len - 250)
                        found_text = re.sub(r'\s+', ' ', unicodedata.normalize('NFC', rng.Text)
                                            .replace('\xa0', ' ').replace('–', '-').replace('—', '-')
                                            .replace('«', '"').replace('»', '"')
                                            .replace('‘', "'").replace('’', "'").replace('“', '"').replace('”', '"')
                                            .strip())
                        with open(log_file, 'a', encoding='utf-8') as f:
                            f.write(f"- Extended range text: `{found_text}`\n")
                            f.write(f"- Comparison: `{found_text}` == `{normalized_sentence}` ?\n")
                        if found_text == normalized_sentence:
                            rng.HighlightColorIndex = color
                            print(f"  ✅ Highlighted long sentence: {normalized_sentence[:50]}...")
                            with open(log_file, 'a', encoding='utf-8') as f:
                                f.write("- **Match!** Highlighted.\n\n")
                            break
                        else:
                            print(f"  ⚠️ Mismatch in extended range: {found_text[:50]}... vs. {normalized_sentence[:50]}...")
                            with open(log_file, 'a', encoding='utf-8') as f:
                                f.write("- **Mismatch.** Collapsing range and continuing.\n\n")
                            rng.Collapse(Direction=constants.wdCollapseEnd)
                            rng.Move(Unit=constants.wdCharacter, Count=1)
                    else:
                        search_complete = True
                        with open(log_file, 'a', encoding='utf-8') as f:
                            f.write("- No find. Search complete.\n\n")
                else:
                    find_text = normalized_sentence
                    with open(log_file, 'a', encoding='utf-8') as f:
                        f.write(f"- Direct search text: `{find_text}`\n")
                    found = rng.Find.Execute(FindText=find_text, Forward=True, MatchCase=False, MatchWholeWord=False,
                                             MatchWildcards=False, MatchSoundsLike=False, MatchAllWordForms=False)
                    if found:
                        rng.HighlightColorIndex = color
                        print(f"  ✅ Highlighted: {normalized_sentence[:50]}...")
                        with open(log_file, 'a', encoding='utf-8') as f:
                            f.write("- **Found and highlighted.**\n\n")
                        break
                    else:
                        if sentence_len > 100:
                            half_text = normalized_sentence[:sentence_len//2]
                            with open(log_file, 'a', encoding='utf-8') as f:
                                f.write(f"- Fallback: Using half text: `{half_text}`\n")
                            found = rng.Find.Execute(FindText=half_text, Forward=True, MatchCase=False, MatchWholeWord=False,
                                                     MatchWildcards=False, MatchSoundsLike=False, MatchAllWordForms=False)
                            if found:
                                rng.MoveEnd(Unit=constants.wdCharacter, Count=sentence_len - len(half_text))
                                found_text = re.sub(r'\s+', ' ', unicodedata.normalize('NFC', rng.Text)
                                                    .replace('\xa0', ' ').replace('–', '-').replace('—', '-')
                                                    .replace('«', '"').replace('»', '"')
                                                    .replace('‘', "'").replace('’', "'").replace('“', '"').replace('”', '"')
                                                    .strip())
                                with open(log_file, 'a', encoding='utf-8') as f:
                                    f.write(f"- Extended fallback text: `{found_text}`\n")
                                    f.write(f"- Comparison: `{found_text}` == `{normalized_sentence}` ?\n")
                                if found_text == normalized_sentence:
                                    rng.HighlightColorIndex = color
                                    print(f"  ✅ Highlighted via fallback: {normalized_sentence[:50]}...")
                                    with open(log_file, 'a', encoding='utf-8') as f:
                                        f.write("- **Fallback match!** Highlighted.\n\n")
                                    break
                                else:
                                    print(f"  ⚠️ Fallback mismatch: {found_text[:50]}... vs. {normalized_sentence[:50]}...")
                                    with open(log_file, 'a', encoding='utf-8') as f:
                                        f.write("- **Fallback mismatch.**\n\n")
                            rng.Collapse(Direction=constants.wdCollapseEnd)
                            rng.Move(Unit=constants.wdCharacter, Count=1)
                        search_complete = True
                        with open(log_file, 'a', encoding='utf-8') as f:
                            f.write("- No find (direct or fallback). Search complete.\n\n")
        else:
            print(f"  ❌ No fuzzy match for: {normalized_sentence[:50]}... (best score: {score})")
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write("### Fuzzy Matching\n- No match above threshold (best score: {score})\n\n".format(score=score))

    print(f"[info] Detailed logs saved to {log_file}")



def open_doc_in_word(file_path):
    word = win32.gencache.EnsureDispatch("Word.Application")
    word.Visible = True

    # Normalize path (avoid dialog issue)
    abs_path = os.path.abspath(file_path)

    # Check if file is already open
    for doc in word.Documents:
        if doc.FullName.lower() == abs_path.lower():
            print(f"[info] Using already open document: {doc.FullName}")
            return doc

    # Otherwise, open it fresh
    doc = word.Documents.Open(abs_path)
    print(f"[info] Opened new document: {doc.FullName}")
    return doc
            
def main():
    # Example usage (can be removed if not needed)
    sentences = [
        "Le système doit permettre aux clients de créer un compte utilisateur.",
        "Les utilisateurs doivent pouvoir ajouter des produits à leur panier.",
    ]
    color_consts = [
        win32.constants.wdYellow,
        win32.constants.wdBrightGreen,
    ]
    word = get_word_app()
    doc = open_or_use_active_doc(word, filename="testing_paragraph.docx")
    print("[info] Starting highlighting...")
    highlight_sentences_in_doc(doc, sentences, color_consts)
    try:
        doc.Save()
        print("[info] Document saved.")
    except Exception as e:
        print("[warn] Could not save document automatically:", e)
    print("[done] Finished.")
    
    for s in sentences:
        print(f"[sentence] {repr(s)}")

if __name__ == "__main__":
    main()