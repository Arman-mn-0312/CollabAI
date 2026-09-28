import React from "react";
import { useApp } from "../../context/AppContext";

export function ConversationList() {
  const {
    personalAIConvs,
    activePersonalAIConv,
    setActivePersonalAIConv,
    createNewPersonalAIConv,
  } = useApp();

  return (
    <div className="convs-list">
      <button className="btn" onClick={createNewPersonalAIConv}>
        + New chat
      </button>

      {Object.keys(personalAIConvs).map((title) => {
        const isSelected = title === activePersonalAIConv;
        const msgCount = personalAIConvs[title]?.length || 0;

        return (
          <button
            key={title}
            className={`cv-row ${isSelected ? "on" : ""}`}
            onClick={() => setActivePersonalAIConv(title)}
          >
            <span className="n">{title}</span>
            <small>{msgCount ? "Private chat" : "No messages yet"}</small>
          </button>
        );
      })}
    </div>
  );
}
