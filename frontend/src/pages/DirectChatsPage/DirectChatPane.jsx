import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Avatar } from "../../components/common/Avatar";

export function DirectChatPane() {
  const { directChats, activeDirectContact, sendDirectMessage } = useApp();
  const [text, setText] = useState("");
  const msgsEndRef = useRef(null);

  const contact = directChats[activeDirectContact];
  const messages = contact?.messages || [];

  const scrollToBottom = () => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeDirectContact]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendDirectMessage(activeDirectContact, text);
    setText("");
  };

  if (!contact) {
    return (
      <div className="chat" style={{ flex: 1, display: "grid", placeItems: "center" }}>
        <p style={{ color: "var(--mute)" }}>Select a contact to start chatting</p>
      </div>
    );
  }

  return (
    <div className="chat" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <header className="top-header" style={{ padding: "12px 24px" }}>
        <Avatar
          initials={contact.initials}
          color={contact.color}
          isOnline={contact.isOnline}
          size="lg"
        />
        <div>
          <h1 style={{ fontSize: "17px", lineHeight: "1.2" }}>{activeDirectContact}</h1>
          <small>{contact.status || "Direct message"}</small>
        </div>
        <span className="sp"></span>
        <button
          aria-label="Search in chat"
          title="Search in chat"
          style={{ width: "36px", height: "36px", borderRadius: "10px", color: "var(--mute)" }}
        >
          ⌕
        </button>
        <button
          aria-label="More"
          title="More options"
          style={{ width: "36px", height: "36px", borderRadius: "10px", color: "var(--mute)" }}
        >
          ⋯
        </button>
      </header>

      <div className="bubbles-msgs">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h2 style={{ fontSize: "22px", margin: "10px 0 6px" }}>
              Start your chat with {activeDirectContact}
            </h2>
            <p style={{ color: "var(--mute)" }}>
              Messages here are just between the two of you.
            </p>
          </div>
        ) : (
          <>
            <div className="day-divider">Today</div>
            {messages.map((m, idx) => (
              <div key={idx} className={`b ${m.sender}`}>
                <p>{m.text}</p>
                {m.time && <time>{m.time}</time>}
              </div>
            ))}
          </>
        )}
        <div ref={msgsEndRef} />
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          aria-label={`Message ${activeDirectContact}`}
          placeholder={`Message ${activeDirectContact}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
      <p className="form-hint">
        Enter to send. Only you and {activeDirectContact} can see this chat.
      </p>
    </div>
  );
}
