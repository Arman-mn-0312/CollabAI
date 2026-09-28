import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { GroupHeader } from "./GroupHeader";
import { GroupChatPane } from "./GroupChatPane";
import { GroupAIPane } from "./GroupAIPane";

export function GroupWorkspacePage() {
  const { activeGroup } = useApp();
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' | 'ai' for mobile view

  if (!activeGroup) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>No group selected</h2>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <GroupHeader group={activeGroup} />

      <div className="mobile-tabs" role="tablist">
        <button
          className={activeTab === "chat" ? "on" : ""}
          onClick={() => setActiveTab("chat")}
          role="tab"
        >
          Group Chat
        </button>
        <button
          className={activeTab === "ai" ? "on" : ""}
          onClick={() => setActiveTab("ai")}
          role="tab"
        >
          Group AI
        </button>
      </div>

      <div className="split-layout">
        <GroupChatPane group={activeGroup} isVisible={activeTab === "chat"} />
        <GroupAIPane group={activeGroup} isVisible={activeTab === "ai"} />
      </div>
    </div>
  );
}
