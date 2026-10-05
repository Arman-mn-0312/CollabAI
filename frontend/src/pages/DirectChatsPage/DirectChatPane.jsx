import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Avatar } from "../../components/common/Avatar";
import { Send } from "lucide-react";

export function DirectChatPane() {
  const {
    directChats,
    activeDirectContact,
    sendDirectMessage,
    directLoading,
    directSending,
    directError,
  } = useApp();
  const [text, setText] = useState("");
  const containerRef = useRef(null);

  const contact = directChats[activeDirectContact];
  const messages = contact?.messages || [];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const frameId = requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
    return () => cancelAnimationFrame(frameId);
  }, [messages, activeDirectContact]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setText("");
    try {
      await sendDirectMessage(activeDirectContact, text);
    } catch {
      // The shared error state displays the request failure.
    }
  };

  if (directLoading) {
    return (
      <div className="chat" style={{ flex: 1, display: "grid", placeItems: "center" }}>
        <p style={{ color: "var(--mute)" }}>Loading direct chats...</p>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="chat" style={{ flex: 1, display: "grid", placeItems: "center" }}>
        <div className="empty-state">
          <p style={{ color: "var(--mute)" }}>{directError || "Select a contact to start chatting"}</p>
        </div>
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
          <h1 style={{ fontSize: "17px", lineHeight: "1.2" }}>{contact.name}</h1>
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

      <div ref={containerRef} className="bubbles-msgs">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h2 style={{ fontSize: "22px", margin: "10px 0 6px" }}>
              Start your chat with {contact.name}
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
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          aria-label={`Message ${contact.name}`}
          placeholder={`Message ${contact.name}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={directSending}
        />
        <button
          type="submit"
          disabled={directSending}
          aria-label="Send message"
          title="Send message"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </form>
      {directError && <p className="form-hint" style={{ color: "var(--danger, #dc2626)" }}>{directError}</p>}
      <p className="form-hint">
        Enter to send. Only you and {contact.name} can see this chat.
      </p>
    </div>
  );
}
