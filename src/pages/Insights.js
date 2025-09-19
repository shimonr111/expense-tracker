import React, { useState, useEffect } from 'react';
import { Version } from '../App.js';
import { getHuggingFaceKey, db } from '../utils/firebase-config.js';
import { sendMessage, sendChatData } from '../utils/apiCalls.js';
import { ref, get } from "firebase/database";

const Insights = () => {
  const [apiKey, setApiKey] = useState(null);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [systemContext, setSystemContext] = useState(null);

  // Fetch HF API key from Firebase on mount
  useEffect(() => {
    async function fetchKey() {
      try {
        const key = await getHuggingFaceKey();
        setApiKey(key);
        const historyRef = ref(db, "history");
        const snapshot = await get(historyRef);
        let data;
        if (snapshot.exists()) {
          data = snapshot.val();
        } else {
          console.log("No history data available");
        }
        // Store as hidden system context (won't be shown in chat)
        setSystemContext({ role: "system", content: data });
        await sendChatData(data, key, setMessages);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchKey();
  }, []);

  const handleSendMessage = async () => {
    await sendMessage(input, apiKey, messages, setMessages, setInput, setLoading, systemContext);
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!apiKey) return <p>Loading API key...</p>;

  return (
    <div>
      <h1>Insights</h1>
      <div className="chat-container">
        <div className="chat-messages" style={{ maxHeight: "400px", overflowY: "auto" }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ textAlign: msg.role === "user" ? "right" : "left" }}>
              <span style={{
                background: msg.role === "user" ? "#DCF8C6" : "#F1F0F0",
                padding: "5px 10px",
                borderRadius: "10px",
                display: "inline-block",
                margin: "5px 0"
              }}>
                {msg.content}
              </span>
            </div>
          ))}
          {loading && <p>AI is typing...</p>}
        </div>

        <div className="chat-input" style={{ marginTop: "10px" }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask about your expenses..."
            style={{ width: "100%", padding: "8px" }}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
      <div id="version-label">{Version}</div>
    </div>
  );
};

export default Insights;
