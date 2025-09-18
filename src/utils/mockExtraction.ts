interface BackendStory {
  story: string;
  source_sentence: string;
}

export async function extractRequirementsStream(
  content: string,
  onToken: (token: string) => void
) {
  const formData = new FormData();
  formData.append("text_content", content);

  try {
    const response = await fetch("http://localhost:8000/process-docx", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No readable stream available");
    }

    const decoder = new TextDecoder();
    let userStories: BackendStory[] = [];

    let lastChunk = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      lastChunk += chunk;

      // Process complete SSE messages
      const messages = lastChunk.split("\n\n");
      lastChunk = messages.pop() || ""; // Keep the incomplete chunk

      for (const message of messages) {
        if (message.startsWith("data: ")) {
          const data = message.slice(6).trim();
          if (data && data !== "---") {
            try {
              // Try to parse as JSON first
              const parsed = JSON.parse(data);
              if (parsed.user_stories && Array.isArray(parsed.user_stories)) {
                userStories = parsed.user_stories;
                console.log("Received user stories:", userStories);
              }
            } catch {
              // If it's not JSON, it's thinking output
              onToken(data + "\n");
            }
          }
        }
      }
    }

    // Transform the stories into the expected format
    return userStories.map((story, index) => ({
      id: `story-${index + 1}`,
      title: story.story || "",
      role: story.story?.split(",")[0]?.replace("En tant que", "")?.trim() || "",
      feature: story.story?.split(",")[1]?.trim() || "",
      benefit: story.story?.split(",")[2]?.trim() || "",
      elements: [
        {
          id: `element-${index + 1}`,
          category: "user-story" as const,
          content: story.story || "",
          sourceText: story.source_sentence || "",
          confidence: 1,
          validated: false,
        },
      ],
      priority: "medium" as const,
      status: "extracted" as const,
      modules: [],
    }));
  } catch (error) {
    console.error("Stream reading error:", error);
    throw error;
  }
}
