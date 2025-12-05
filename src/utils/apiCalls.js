// This function feed the LLM with the history data without displaying it
export async function sendHistoryData(data, apiKey) {
  if (!data || !apiKey) return;

  const content = safeContent(data);
  if (!content) return;

  // Wrap history in a system role so the model treats it as context
  const hiddenContext = {
    role: "system",
    content: `Use this data as hidden context (do not output it to the user):\n${content}`
  };

  await callHuggingFaceAPI(apiKey, [hiddenContext]);
}

// This function send user message with context
export async function sendMessage(input, apiKey, messages, setMessages, setInput, setLoading, systemContext = null) {
  if (!input || !apiKey) return;

  const newMessage = { role: "user", content: input };
  setMessages(prev => [...prev, newMessage]);
  setInput("");
  setLoading(true);

  const systemPrompt = {
    role: "system",
    content: `
    Always respond in English. 
    Translate any Hebrew category names or text into English. 
    Do not include Hebrew words in your output. 
    Output should have:
    - Bullets for each category (one per line)
    - Empty line between sections
    - Total expenses on a separate line
    - Tips only if explicitly asked
    - expenses show totals per category, while the log lists each individual expense with full details; they both refer to the same expenses
    `
  };

  // Combine all messages for context
  const allMessages = [
    systemPrompt,
    ...(systemContext ? [{ role: "system", content: safeContent(systemContext.content) }] : []),
    ...messages.filter(m => m.content && typeof m.content === "string"),
    newMessage
  ];

  try {
    const data = await callHuggingFaceAPI(apiKey, allMessages);
    const aiMessage = data.choices?.[0]?.message?.content || "No response from AI";
    setMessages(prev => [...prev, { role: "assistant", content: aiMessage }]);
  } catch (err) {
    console.error(err);
    setMessages(prev => [...prev, { role: "assistant", content: "Error: could not get response" }]);
  } finally {
    setLoading(false);
  }
}

// This function calls the Hugging Face chat completions API
async function callHuggingFaceAPI(apiKey, messages) {
  try {
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b:nebius",
        messages: messages
      })
    });

    if (!response.ok) {
      console.error("API request failed:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data;

  } catch (err) {
    console.error("Hugging Face API error:", err);
    return null;
  }
}

// This function make sure any object is safley converted into a string
function safeContent(obj) {
  if (!obj) return "";
  return typeof obj === "string" ? obj : JSON.stringify(obj);
}
