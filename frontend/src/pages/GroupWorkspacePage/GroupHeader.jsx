import React from "react";
import { Avatar } from "../../components/common/Avatar";

export function GroupHeader({ group }) {
  if (!group) return null;

  return (
    <header className="top-header">
      <div className="g-icon">{group.tag}</div>
      <div>
        <h1>{group.name}</h1>
        <small>
          {group.memberCount || group.members?.length || 1} members · invite code {group.code}
        </small>
      </div>
      <div className="avatar-stack" aria-hidden="true">
        {group.members?.map((m) => (
          <Avatar key={m.id || m.name} initials={m.initials} color={m.color} />
        ))}
      </div>
    </header>
  );
}
