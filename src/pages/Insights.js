import React, { useState, useEffect, useRef } from 'react';
import { Version } from '../App.js';
import { getHuggingFaceKey, db } from '../utils/firebase-config.js';
import { sendMessage, sendHistoryData } from '../utils/apiCalls.js';
import { ref, get } from "firebase/database";
import { renderLoading } from '../utils/helpFunctions.js';

// This component represents the "Insights" page
const Insights = () => {
  const [apiKey, setApiKey] = useState(null); // stores Hugging Face API key
  const [error, setError] = useState(null); // stores any error message
  const [messages, setMessages] = useState([]); // chat history (array of messages)
  const [input, setInput] = useState(""); // text inside the input field
  const [loading, setLoading] = useState(false); // true when AI is generating a response
  const [systemContext, setSystemContext] = useState(null); // a hidden message that holds past history or context, not shown in chat
  const chatContainerRef = useRef(null);

  // Side effects on mount
  useEffect(() => {
    async function fetchKey() {
      try {
        const key = await getHuggingFaceKey(); // retrieve API key
        setApiKey(key);
        const historyRef = ref(db, "history/2_2025/expenses"); // read history data from data base
        const snapshot = await get(historyRef);
        let data;
        if (snapshot.exists()) {
          data = snapshot.val();
        } else {
          console.log("No history data available");
        }
        setSystemContext({ role: "system", content: data }); // Store as hidden system context (won't be shown in chat)
        await sendHistoryData(data, key);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchKey();
  }, []);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // This function is called when the user clicks the "Send" button
  const handleSendMessage = async () => {
    await sendMessage(input, apiKey, messages, setMessages, setInput, setLoading, systemContext);
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>; // if there is an error, show it in red text
  if (!apiKey) return renderLoading("Loading..."); // if API key is not loaded yet, show a loading message

  return (
    <div>
      <h1>Insights</h1>
      <div className="chat-container">
        <div ref={chatContainerRef} className="chat-messages" style={{ maxHeight: "400px", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ textAlign: msg.role === "user" ? "right" : "left" }}>
              <span style={{
                background: msg.role === "user" ? "#DCF8C6" : "#F1F0F0",
                padding: "5px 10px",
                borderRadius: "10px",
                display: "inline-block",
                margin: "5px 0",
                whiteSpace: "pre-wrap"
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
            style={{ width: "100%", padding: "8px", fontSize: "16px" }}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
      <div id="version-label">{Version}</div>
    </div>
  );
};

export default Insights;
