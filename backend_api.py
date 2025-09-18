from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse, StreamingResponse
import uvicorn
import os
import json
from integrated1 import convert_to_markdown, extract_user_stories, rehighlight_in_word, stream_llm_response
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process-docx/")
async def process_docx(file: UploadFile = None, text_content: str = Form(None)):
    async def generate():
        if file:
            tmp_path = f"temp_{file.filename}"
            with open(tmp_path, "wb") as f:
                f.write(await file.read())
            md_text, _ = convert_to_markdown(tmp_path)
        elif text_content:
            md_text = text_content
        else:
            yield "data: " + json.dumps({"error": "No input provided"}) + "\n\n"
            return

        # Stream the thinking process
        for chunk in stream_llm_response(md_text):
            yield f"data: {chunk}\n\n"
            
        yield "data: ---\n\n"
        
        # Get and send the final stories
        stories = extract_user_stories(md_text)
        yield "data: " + json.dumps(stories) + "\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)