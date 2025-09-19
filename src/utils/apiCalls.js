// Convert anything to safe string
function safeContent(obj) {
  if (!obj) return "";
  return typeof obj === "string" ? obj : JSON.stringify(obj);
}

// Feed initial data without displaying it
export async function sendChatData(data, apiKey) {
  if (!data) return;

  const content = safeContent(data);
  if (!content) return;

  const systemMessage = {
    role: "system",
    content: `
    You are an assistant that summarizes and analyzes expense data.
    Do NOT output the full raw data.
    When answering, provide:
    - A short summary of key categories (e.g., Housing, Insurance, Food, etc.)
    - Total expenses
    - Suggestions for saving money in 3-5 concise bullet points
    - Avoid long Markdown tables
    - Output in plain text or a simple numbered list
    - Do not include Hebrew or other languages, just english
    Use this data as hidden context:\n${content}`
  };

  try {
    await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b:nebius",
        messages: [systemMessage]
      })
    });
  } catch (err) {
    console.error(err);
  }
}

// Send user message with context
export async function sendMessage(input, apiKey, messages, setMessages, setInput, setLoading, systemContext = null) {
  if (!input || !apiKey) return;

  const newMessage = { role: "user", content: input };
  setMessages(prev => [...prev, newMessage]);
  setInput("");
  setLoading(true);

  // Include systemContext if exists
  const allMessages = [
    ...(systemContext ? [{ role: "system", content: safeContent(systemContext.content) }] : []),
    ...messages.filter(m => m.content && typeof m.content === "string"),
    newMessage
  ];

  try {
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b:nebius",
        messages: allMessages
      })
    });

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "No response from AI";
    setMessages(prev => [...prev, { role: "assistant", content: aiMessage }]);
  } catch (err) {
    console.error(err);
    setMessages(prev => [...prev, { role: "assistant", content: "Error: could not get response" }]);
  } finally {
    setLoading(false);
  }
}
