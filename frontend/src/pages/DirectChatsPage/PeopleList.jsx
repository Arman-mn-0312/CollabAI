import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Avatar } from "../../components/common/Avatar";

export function PeopleList() {
  const {
    directChats,
    activeDirectContact,
    setActiveDirectContact,
    selectDirectContact,
    directLoading,
    directError,
    groups,
    currentUser,
  } = useApp();
  const [search, setSearch] = useState("");

  const existingParticipantIds = new Set(
    Object.values(directChats)
      .map((c) => c.participantId)
      .filter(Boolean)
  );

  const availableGroupContactsMap = new Map();
  if (groups && currentUser) {
    for (const group of groups) {
      if (!group.members) continue;
      for (const member of group.members) {
        if (
          member.id &&
          member.id !== currentUser.id &&
          !existingParticipantIds.has(member.id) &&
          !availableGroupContactsMap.has(member.id)
        ) {
          const name = member.full_name || member.username || "User";
          const initials = name
            .split(/\s+/)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "U";
          availableGroupContactsMap.set(member.id, {
            id: `user:${member.id}`,
            userId: member.id,
            name,
            initials,
            color: "#4338ca",
            status: "Group member",
            isAvailableContact: true,
          });
        }
      }
    }
  }

  const existingItems = Object.entries(directChats).map(([conversationId, contact]) => ({
    key: conversationId,
    conversationId,
    userId: contact.participantId,
    contact,
    isAvailableContact: false,
  }));

  const availableItems = Array.from(availableGroupContactsMap.values()).map((contact) => ({
    key: contact.id,
    userId: contact.userId,
    contact,
    isAvailableContact: true,
  }));

  const allPeople = [...existingItems, ...availableItems];

  const filteredPeople = allPeople.filter(({ contact }) =>
    contact.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (item) => {
    if (selectDirectContact) {
      selectDirectContact(item.isAvailableContact ? item.userId : item.conversationId);
    } else {
      setActiveDirectContact(item.conversationId);
    }
  };

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
        {directLoading && <p style={{ color: "var(--mute)", padding: "12px" }}>Loading conversations...</p>}
        {!directLoading && directError && <p style={{ color: "var(--mute)", padding: "12px" }}>{directError}</p>}
        {!directLoading && !directError && filteredPeople.length === 0 && (
          <p style={{ color: "var(--mute)", padding: "12px" }}>No people found.</p>
        )}
        {!directLoading &&
          filteredPeople.map((item) => {
            const { key, conversationId, contact, isAvailableContact } = item;
            const isSelected = !isAvailableContact && conversationId === activeDirectContact;
            const lastMsg = contact.messages ? contact.messages[contact.messages.length - 1] : null;

            return (
              <button
                key={key}
                className={`cv-row ${isSelected ? "on" : ""}`}
                onClick={() => handleSelect(item)}
                style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}
              >
                <Avatar
                  initials={contact.initials}
                  color={contact.color}
                  isOnline={contact.isOnline}
                  size="lg"
                />
                <div style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
                  <span className="n">{contact.name}</span>
                  <small style={{ display: "block" }}>
                    {isAvailableContact ? "Click to chat" : lastMsg ? lastMsg.text : "Say hello"}
                  </small>
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
