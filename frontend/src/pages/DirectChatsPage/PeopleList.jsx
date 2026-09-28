import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Avatar } from "../../components/common/Avatar";

export function PeopleList() {
  const { directChats, activeDirectContact, setActiveDirectContact } = useApp();
  const [search, setSearch] = useState("");

  const filteredPeople = Object.keys(directChats).filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="convs-list" style={{ minHeight: 0 }}>
      <h2 style={{ fontSize: "18px", padding: "8px 12px 4px" }}>Messages</h2>
      <input
        className="search-input"
        placeholder="Search people"
        aria-label="Search people"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" }}>
        {filteredPeople.map((person) => {
          const contact = directChats[person];
          const isSelected = person === activeDirectContact;
          const lastMsg = contact.messages[contact.messages.length - 1];

          return (
            <button
              key={person}
              className={`cv-row ${isSelected ? "on" : ""}`}
              onClick={() => setActiveDirectContact(person)}
              style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}
            >
              <Avatar
                initials={contact.initials}
                color={contact.color}
                isOnline={contact.isOnline}
                size="lg"
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <span className="n">{person}</span>
                <small>{lastMsg ? lastMsg.text : "Say hello"}</small>
              </div>
              {contact.unread > 0 && !isSelected && (
                <span className="unread-badge">{contact.unread}</span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
