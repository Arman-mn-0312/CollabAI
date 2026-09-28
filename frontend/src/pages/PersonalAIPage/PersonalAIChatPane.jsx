import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";

const STARTER_CHIPS = [
  "Explain this concept simply",
  "Help me plan my week",
  "Review my project idea",
  "Quiz me on Python",
];

export function PersonalAIChatPane() {
  const {
    personalAIConvs,
    activePersonalAIConv,
    sendPersonalAIMessage,
    deletePersonalAIConv,
  } = useApp();

  const [inputVal, setInputVal] = useState("");
  const [copiedIdx, setCopiedIdx] = useState(null);
  const msgsEndRef = useRef(null);

  const messages = personalAIConvs[activePersonalAIConv] || [];

  const scrollToBottom = () => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    sendPersonalAIMessage(activePersonalAIConv, inputVal);
    setInputVal("");
  };

  const handleCopy = (text, idx) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="chat" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <header className="top-header" style={{ padding: "12px 24px" }}>
        <span className="av aiav" style={{ width: "32px", height: "32px" }}>
          ✦
        </span>
        <div>
          <h1 style={{ fontSize: "17px" }}>{activePersonalAIConv}</h1>
          <small>Private. Only you can see this conversation.</small>
        </div>
        <span className="sp"></span>
        <button
          onClick={() => {
            const newName = prompt("Enter new name for conversation:", activePersonalAIConv);
            if (newName && newName.trim() && newName !== activePersonalAIConv) {
              // Simple inline rename support handled in context or parent if needed
            }
          }}
          aria-label="Rename"
          title="Rename conversation"
          style={{ width: "36px", height: "36px", borderRadius: "10px", color: "var(--mute)" }}
        >
          ✎
        </button>
        <button
          onClick={() => deletePersonalAIConv(activePersonalAIConv)}
          aria-label="Delete conversation"
          title="Delete conversation"
          style={{ width: "36px", height: "36px", borderRadius: "10px", color: "var(--mute)" }}
        >
          🗑
        </button>
      </header>

      <div className="bubbles-msgs">
        {messages.length === 0 ? (
          <div className="empty-state" style={{ maxWidth: "420px" }}>
            <span
              className="av aiav"
              style={{ margin: "auto", width: "48px", height: "48px", fontSize: "20px" }}
            >
              ✦
            </span>
            <h2 style={{ fontSize: "22px", margin: "12px 0 6px" }}>What can I help with?</h2>
            <p style={{ color: "var(--mute)" }}>
              Ask anything. This chat is private to you.
            </p>
            <div className="chips">
              {STARTER_CHIPS.map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setInputVal(chip);
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div
              key={idx}
              className={`b ${m.type === "m" ? "mine" : "ai"}`}
            >
              {m.type === "a" && <div className="who">CollabAI</div>}
              <div dangerouslySetInnerHTML={{ __html: m.text }} />
              {m.type === "a" && (
                <button
                  className="copy-btn"
                  type="button"
                  onClick={() => handleCopy(m.text.replace(/<[^>]+>/g, ""), idx)}
                >
                  {copiedIdx === idx ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
          ))
        )}
        <div ref={msgsEndRef} />
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          aria-label="Ask your AI"
          placeholder="Ask your AI anything"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
      <p className="form-hint">Your Personal AI is separate from your groups.</p>
    </div>
  );
}
