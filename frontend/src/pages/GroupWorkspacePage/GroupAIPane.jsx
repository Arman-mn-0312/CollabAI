import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Avatar } from "../../components/common/Avatar";

const TOPICS = ["General", "Frontend", "Backend", "Database", "Testing", "Research"];

export function GroupAIPane({ group, isVisible = true }) {
  const { sendGroupAIMessage } = useApp();
  const [currentTopic, setCurrentTopic] = useState("General");
  const [inputVal, setInputVal] = useState("");
  const msgsEndRef = useRef(null);

  const topicMessages = group?.aiTopics?.[currentTopic] || [];

  const scrollToBottom = () => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [topicMessages, currentTopic]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    sendGroupAIMessage(group.id, currentTopic, inputVal);
    setInputVal("");
  };

  return (
    <section className={`pane ${isVisible ? "show" : ""}`} id="ai" aria-label="Group AI">
      <div className="ph">
        <h2>✦ Group AI</h2>
        <p>One AI conversation the whole group can see, split by topic.</p>
      </div>

      <div className="sec-tags" role="tablist">
        {TOPICS.map((topic) => (
          <button
            key={topic}
            className={topic === currentTopic ? "on" : ""}
            onClick={() => setCurrentTopic(topic)}
            role="tab"
            aria-selected={topic === currentTopic}
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="msgs">
        {topicMessages.length === 0 ? (
          <div className="empty-state">
            <strong>No questions in {currentTopic} yet</strong>
            Ask the AI something and your whole group will see it here.
          </div>
        ) : (
          topicMessages.map((m, idx) => (
            <div key={idx} className={`m ${m.type === "a" ? "ai" : ""}`}>
              <Avatar
                initials={m.type === "a" ? "AI" : m.initials}
                color={m.color}
                isAI={m.type === "a"}
              />
              <div className="t">
                <b>{m.type === "a" ? "CollabAI" : m.sender}</b>
                <p dangerouslySetInnerHTML={{ __html: m.text }} />
              </div>
            </div>
          ))
        )}
        <div ref={msgsEndRef} />
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          aria-label="Ask the group AI"
          placeholder="Ask the group AI"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
        />
        <button type="submit">Ask AI</button>
      </form>
    </section>
  );
}
