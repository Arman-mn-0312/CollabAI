import React from "react";
import { PeopleList } from "./PeopleList";
import { DirectChatPane } from "./DirectChatPane";

export function DirectChatsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="cols-layout">
        <PeopleList />
        <DirectChatPane />
      </div>
    </div>
  );
}
