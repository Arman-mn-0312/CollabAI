import React, { createContext, useContext, useState, useEffect } from "react";
import {
  currentUser,
  initialGroups,
  initialPersonalAIConvs,
  initialDirectChats,
} from "../mock/initialData";

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation / Views: 'landing' | 'login' | 'register' | 'dashboard' | 'group-workspace' | 'personal-ai' | 'direct-chats'
  const [currentView, setCurrentView] = useState("landing");
  
  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState("dark");

  // Active Group state
  const [groups, setGroups] = useState(initialGroups);
  const [activeGroupId, setActiveGroupId] = useState("project-team");

  // Personal AI state
  const [personalAIConvs, setPersonalAIConvs] = useState(initialPersonalAIConvs);
  const [activePersonalAIConv, setActivePersonalAIConv] = useState("React Questions");

  // Direct Chats state
  const [directChats, setDirectChats] = useState(initialDirectChats);
  const [activeDirectContact, setActiveDirectContact] = useState("Arjun");

  // Modal State
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  // Sync dataset theme attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Navigate helper
  const navigate = (view) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Active group object
  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];

  // Send Group Chat Message
  const sendGroupChatMessage = (groupId, text) => {
    if (!text.trim()) return;
    const newMessage = {
      id: Date.now(),
      type: "user",
      sender: currentUser.name,
      initials: currentUser.initials,
      color: currentUser.color,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setGroups((prevGroups) =>
      prevGroups.map((g) => {
        if (g.id === groupId) {
          return { ...g, chatMessages: [...g.chatMessages, newMessage] };
        }
        return g;
      })
    );
  };

  // Send Group AI Message
  const sendGroupAIMessage = (groupId, topic, userQuestion) => {
    if (!userQuestion.trim()) return;
    const userMsg = {
      type: "u",
      sender: currentUser.name,
      initials: currentUser.initials,
      color: currentUser.color,
      text: userQuestion.trim(),
    };

    const aiReplyMsg = {
      type: "a",
      sender: "CollabAI",
      initials: "AI",
      color: "#D200D3",
      text: "This is a design preview answer. The real answer comes from the AI backend.",
    };

    setGroups((prevGroups) =>
      prevGroups.map((g) => {
        if (g.id === groupId) {
          const updatedTopics = { ...g.aiTopics };
          const topicList = updatedTopics[topic] ? [...updatedTopics[topic]] : [];
          topicList.push(userMsg, aiReplyMsg);
          updatedTopics[topic] = topicList;
          return { ...g, aiTopics: updatedTopics };
        }
        return g;
      })
    );
  };

  // Send Personal AI Message
  const sendPersonalAIMessage = (convTitle, userMessage) => {
    if (!userMessage.trim()) return;
    const userMsg = { type: "m", text: userMessage.trim() };
    const aiMsg = {
      type: "a",
      text: "Design preview only. The real answer will come from the AI backend.",
    };

    setPersonalAIConvs((prev) => ({
      ...prev,
      [convTitle]: [...(prev[convTitle] || []), userMsg, aiMsg],
    }));
  };

  // Create New Personal AI Conversation
  const createNewPersonalAIConv = () => {
    let baseName = "New chat";
    let count = 1;
    let title = baseName;
    while (personalAIConvs[title]) {
      count++;
      title = `${baseName} ${count}`;
    }
    setPersonalAIConvs((prev) => ({ ...prev, [title]: [] }));
    setActivePersonalAIConv(title);
  };

  // Delete Personal AI Conversation
  const deletePersonalAIConv = (title) => {
    setPersonalAIConvs((prev) => {
      const next = { ...prev };
      delete next[title];
      const remaining = Object.keys(next);
      if (remaining.length > 0) {
        setActivePersonalAIConv(remaining[0]);
      } else {
        next["New chat"] = [];
        setActivePersonalAIConv("New chat");
      }
      return next;
    });
  };

  // Send Direct Message
  const sendDirectMessage = (contactName, text) => {
    if (!text.trim()) return;
    const newMsg = {
      sender: "mine",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setDirectChats((prev) => {
      const contact = prev[contactName];
      if (!contact) return prev;
      return {
        ...prev,
        [contactName]: {
          ...contact,
          messages: [...contact.messages, newMsg],
        },
      };
    });
  };

  // Create Group
  const createGroup = (groupName, groupCode) => {
    if (!groupName.trim()) return;
    const newG = {
      id: groupName.toLowerCase().replace(/\s+/g, "-"),
      name: groupName,
      code: groupCode || `CLB-${Math.floor(1000 + Math.random() * 9000)}`,
      tag: groupName.substring(0, 2).toUpperCase(),
      memberCount: 1,
      newAiAnswers: 0,
      members: [currentUser],
      chatMessages: [],
      aiTopics: {
        General: [],
        Frontend: [],
        Backend: [],
        Database: [],
        Testing: [],
        Research: [],
      },
    };

    setGroups((prev) => [...prev, newG]);
    setActiveGroupId(newG.id);
    navigate("group-workspace");
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        navigate,
        theme,
        toggleTheme,
        currentUser,
        groups,
        activeGroupId,
        setActiveGroupId,
        activeGroup,
        sendGroupChatMessage,
        sendGroupAIMessage,
        personalAIConvs,
        activePersonalAIConv,
        setActivePersonalAIConv,
        sendPersonalAIMessage,
        createNewPersonalAIConv,
        deletePersonalAIConv,
        directChats,
        activeDirectContact,
        setActiveDirectContact,
        sendDirectMessage,
        isCreateGroupOpen,
        setIsCreateGroupOpen,
        createGroup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
