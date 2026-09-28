import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Avatar } from "../../components/common/Avatar";

export function GroupChatPane({ group, isVisible = true }) {
  const { sendGroupChatMessage } = useApp();
  const [text, setText] = useState("");
  const msgsEndRef = useRef(null);

  const scrollToBottom = () => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [group?.chatMessages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendGroupChatMessage(group.id, text);
    setText("");
  };

  return (
    <section className={`pane ${isVisible ? "show" : ""}`} id="chat" aria-label="Group chat">
      <div className="ph">
        <h2># Group Chat</h2>
        <p>Talk with your teammates. Only people in this group see it.</p>
      </div>

      <div className="msgs" style={{ paddingTop: "12px" }}>
        {group?.chatMessages?.map((m) => (
          <div key={m.id} className="m">
            <Avatar initials={m.initials} color={m.color} />
            <div className="t">
              <b>{m.sender}</b>
              {m.time && <time>{m.time}</time>}
              <p>{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={msgsEndRef} />
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          aria-label={`Message ${group?.name || "group"}`}
          placeholder={`Message ${group?.name || "group"}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </section>
  );
}
