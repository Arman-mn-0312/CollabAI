import React from "react";
import { ConversationList } from "./ConversationList";
import { PersonalAIChatPane } from "./PersonalAIChatPane";

export function PersonalAIPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="cols-layout">
        <ConversationList />
        <PersonalAIChatPane />
      </div>
    </div>
  );
}
