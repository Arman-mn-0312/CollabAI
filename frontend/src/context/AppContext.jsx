import React, { createContext, useContext, useState, useEffect } from "react";
import { initialPersonalAIConvs } from "../mock/initialData";
import { supabase } from "../lib/supabaseClient";
import {
  listDirectConversations,
  createDirectConversation,
  listDirectMessages,
  sendDirectMessage as sendDirectMessageRequest,
  subscribeToDirectMessages,
} from "../lib/directChatApi";
import * as groupsApi from "../lib/groupsApi";

const AppContext = createContext();

const protectedViews = new Set(["dashboard", "group-workspace", "personal-ai", "direct-chats"]);

function formatCurrentUser(user) {
  const metadata = user.user_metadata || {};
  const name = metadata.full_name || metadata.username || user.email || "User";
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: user.id,
    name,
    username: metadata.username || null,
    email: user.email || "",
    initials: initials || "U",
    color: "#c2410c",
    role: "member",
  };
}

function formatMessage(message, userId) {
  const senderId = message.senderId || message.sender_id;
  const createdAt = message.createdAt || message.created_at;
  const content = message.content || message.text || "";
  const dateObj = createdAt ? new Date(createdAt) : new Date();
  const timeStr = isNaN(dateObj.getTime())
    ? ""
    : dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return {
    id: message.id,
    sender: senderId === userId ? "mine" : "them",
    senderId: senderId,
    text: content,
    time: timeStr,
    createdAt: createdAt || new Date().toISOString(),
  };
}

function formatConversation(conversation, userId) {
  const participant = conversation.otherParticipant || {};
  const name = participant.name || participant.username || participant.id || "Unknown user";
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const latestMessage = conversation.latestMessage
    ? formatMessage(conversation.latestMessage, userId)
    : null;

  return {
    id: conversation.id,
    participantId: participant.id || null,
    name,
    initials: initials || "??",
    color: "#4338ca",
    status: "Direct message",
    isOnline: false,
    unread: 0,
    messages: latestMessage ? [latestMessage] : [],
  };
}

export function AppProvider({ children }) {
  // Navigation / Views: 'landing' | 'login' | 'register' | 'dashboard' | 'group-workspace' | 'personal-ai' | 'direct-chats'
  const [currentView, setCurrentView] = useState("landing");
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState("dark");

  // Active Group state
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState(null);

  // Personal AI state
  const [personalAIConvs, setPersonalAIConvs] = useState(initialPersonalAIConvs);
  const [activePersonalAIConv, setActivePersonalAIConv] = useState("React Questions");

  // Direct Chats state
  const [directChats, setDirectChats] = useState({});
  const [activeDirectContact, setActiveDirectContact] = useState(null);
  const [directUserId, setDirectUserId] = useState(null);
  const [directLoading, setDirectLoading] = useState(true);
  const [directSending, setDirectSending] = useState(false);
  const [directError, setDirectError] = useState(null);

  // Modal State
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [joinInviteCode, setJoinInviteCode] = useState(
    new URLSearchParams(window.location.search).get("invite") || null
  );

  // Sync dataset theme attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Navigate helper
  const navigate = (view) => {
    if (protectedViews.has(view) && !session) {
      setCurrentView("login");
      return;
    }
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.session || !data.user) {
      throw new Error("Login did not create a session");
    }
    setSession(data.session);
    setCurrentUser(formatCurrentUser(data.user));
    setCurrentView("dashboard");
    return data;
  };

  const register = async ({ fullName, username, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username || null,
          avatar_url: null,
        },
      },
    });
    if (error) throw error;
    if (data.session && data.user) {
      setSession(data.session);
      setCurrentUser(formatCurrentUser(data.user));
      setCurrentView("dashboard");
    }
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setCurrentUser(null);
    setCurrentView("landing");
  };

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        if (mounted) {
          setAuthError("Unable to load your authentication session.");
          setAuthLoading(false);
        }
        return;
      }
      if (!mounted) return;
      setAuthError(null);
      setSession(data.session);
      setCurrentUser(data.session?.user ? formatCurrentUser(data.session.user) : null);
      setCurrentView(data.session ? "dashboard" : "landing");
      setAuthLoading(false);
    }

    loadSession();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setCurrentUser(nextSession?.user ? formatCurrentUser(nextSession.user) : null);
      if (!nextSession) setCurrentView("landing");
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Active group object
  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0] || null;

  useEffect(() => {
    let cancelled = false;
    async function loadGroups() {
      if (!session?.user) {
        setGroups([]);
        setActiveGroupId(null);
        setGroupsLoading(false);
        return;
      }
      setGroupsLoading(true);
      setGroupsError(null);
      try {
        const data = await groupsApi.listGroups();
        if (!cancelled) {
          const detailedGroups = await Promise.all(
            data.map(async (group) => {
              try {
                const groupDetails = await groupsApi.getGroup(group.id);
                return {
                  ...group,
                  ...groupDetails,
                  tag: group.name.slice(0, 2).toUpperCase(),
                  memberCount: groupDetails.group_members?.length || group.member_count,
                  members: (groupDetails.group_members || []).map((m) => ({
                    ...m.profiles,
                    role: m.role,
                  })),
                };
              } catch {
                return {
                  ...group,
                  tag: group.name.slice(0, 2).toUpperCase(),
                  memberCount: group.member_count,
                  members: [],
                };
              }
            })
          );
          if (!cancelled) {
            setGroups(detailedGroups);
            setActiveGroupId((current) =>
              current && detailedGroups.some((group) => group.id === current) ? current : detailedGroups[0]?.id || null
            );
          }
        }
      } catch (error) {
        if (!cancelled) setGroupsError(error.message || "Unable to load groups");
      } finally {
        if (!cancelled) setGroupsLoading(false);
      }
    }
    loadGroups();
    return () => { cancelled = true; };
  }, [session]);

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
      color: "#00D2B4",
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

  useEffect(() => {
    let cancelled = false;

    async function loadDirectConversations() {
      if (!session?.user) {
        setDirectChats({});
        setDirectUserId(null);
        setActiveDirectContact(null);
        setDirectLoading(false);
        setDirectError(null);
        return;
      }
      setDirectLoading(true);
      setDirectError(null);
      try {
        const conversations = await listDirectConversations();
        if (cancelled) return;
        setDirectUserId(session.user.id);
        setDirectChats((previous) => {
          const nextChats = {};
          for (const conversation of conversations) {
            const formatted = formatConversation(conversation, session.user.id);
            const prevMessages = previous[conversation.id]?.messages;
            nextChats[conversation.id] = {
              ...formatted,
              messages: prevMessages && prevMessages.length > 0 ? prevMessages : formatted.messages,
            };
          }
          return nextChats;
        });
        setActiveDirectContact((previous) =>
          previous && conversations.some((c) => c.id === previous) ? previous : conversations[0]?.id || null
        );
      } catch (error) {
        if (!cancelled) setDirectError(error.message || "Unable to load direct chats");
      } finally {
        if (!cancelled) setDirectLoading(false);
      }
    }

    loadDirectConversations();

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!activeDirectContact || !directUserId) return undefined;
    let cancelled = false;

    async function loadMessages() {
      setDirectError(null);
      try {
        const messages = await listDirectMessages(activeDirectContact);
        if (cancelled) return;
        setDirectChats((previous) => ({
          ...previous,
          [activeDirectContact]: {
            ...previous[activeDirectContact],
            messages: messages.map((message) => formatMessage(message, directUserId)),
          },
        }));
      } catch (error) {
        if (!cancelled) setDirectError(error.message || "Unable to load messages");
      }
    }

    loadMessages();
    const unsubscribe = subscribeToDirectMessages(activeDirectContact, (message) => {
      const senderId = message.sender_id || message.senderId;
      console.log(`[DirectChat Frontend] Realtime callback triggered for message ${message.id} from sender ${senderId} (currentUser: ${directUserId})`);
      if (senderId === directUserId || cancelled) {
        console.log(`[DirectChat Frontend] Ignoring message ${message.id}: sender is current user or subscription cancelled`);
        return;
      }
      setDirectChats((previous) => {
        const contact = previous[activeDirectContact];
        if (!contact || contact.messages.some((item) => item.id === message.id)) {
          console.log(`[DirectChat Frontend] Message ${message.id} ignored (contact missing or duplicate)`);
          return previous;
        }
        console.log(`[DirectChat Frontend] Appending Realtime message ${message.id} to contact ${activeDirectContact}`);
        return {
          ...previous,
          [activeDirectContact]: {
            ...contact,
            messages: [...contact.messages, formatMessage(message, directUserId)],
          },
        };
      });
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [activeDirectContact, directUserId]);

  const sendDirectMessage = async (conversationId, text) => {
    const trimmedText = text.trim();
    if (!trimmedText || directSending) return;
    const sendTime = Date.now();
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    const optimisticMessage = {
      id: tempId,
      sender: "mine",
      senderId: directUserId,
      text: trimmedText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt: new Date().toISOString(),
      isPending: true,
    };

    console.log(`[DirectChat Frontend] Optimistic message added locally for ${conversationId}`);
    setDirectChats((previous) => {
      const contact = previous[conversationId];
      if (!contact) return previous;
      return {
        ...previous,
        [conversationId]: {
          ...contact,
          messages: [...contact.messages, optimisticMessage],
        },
      };
    });

    setDirectSending(true);
    setDirectError(null);
    try {
      const message = await sendDirectMessageRequest(conversationId, trimmedText);
      console.log(`[DirectChat Frontend] API returned message in ${Date.now() - sendTime} ms. Reconciling optimistic message.`);
      const formattedReal = formatMessage(message, directUserId);
      setDirectChats((previous) => {
        const contact = previous[conversationId];
        if (!contact) return previous;
        const exists = contact.messages.some((m) => m.id === message.id);
        const updatedMessages = contact.messages.map((m) =>
          m.id === tempId ? formattedReal : m
        );
        if (!exists && !updatedMessages.some((m) => m.id === message.id)) {
          updatedMessages.push(formattedReal);
        }
        return {
          ...previous,
          [conversationId]: {
            ...contact,
            messages: updatedMessages,
          },
        };
      });
    } catch (error) {
      setDirectChats((previous) => {
        const contact = previous[conversationId];
        if (!contact) return previous;
        return {
          ...previous,
          [conversationId]: {
            ...contact,
            messages: contact.messages.filter((m) => m.id !== tempId),
          },
        };
      });
      setDirectError(error.message || "Unable to send message");
      throw error;
    } finally {
      setDirectSending(false);
    }
  };

  const selectDirectContact = async (contactOrId) => {
    if (!contactOrId) return;

    if (typeof contactOrId === "string" && directChats[contactOrId]) {
      setActiveDirectContact(contactOrId);
      return;
    }

    const targetUserId = typeof contactOrId === "string" ? contactOrId : contactOrId.userId || contactOrId.id;
    if (!targetUserId) return;

    const existingConv = Object.values(directChats).find(
      (chat) => chat.participantId === targetUserId
    );
    if (existingConv) {
      setActiveDirectContact(existingConv.id);
      return;
    }

    setDirectError(null);
    try {
      const rawConv = await createDirectConversation(targetUserId);
      const formatted = formatConversation(rawConv, session.user.id);
      setDirectChats((previous) => ({
        ...previous,
        [formatted.id]: formatted,
      }));
      setActiveDirectContact(formatted.id);
    } catch (error) {
      setDirectError(error.message || "Unable to start direct chat");
    }
  };

  // Create Group
  const createGroup = async (groupName, description = "") => {
    const group = await groupsApi.createGroup(groupName, description);
    const nextGroup = { ...group, tag: group.name.slice(0, 2).toUpperCase(), memberCount: 1, members: [] };
    setGroups((prev) => [...prev, nextGroup]);
    setActiveGroupId(nextGroup.id);
    navigate("group-workspace");
    return nextGroup;
  };

  const loadGroupDetails = async (groupId) => {
    const group = await groupsApi.getGroup(groupId);
    const nextGroup = { ...group, tag: group.name.slice(0, 2).toUpperCase(), memberCount: group.group_members.length, members: group.group_members.map((member) => ({ ...member.profiles, role: member.role })) };
    setGroups((prev) => prev.map((item) => item.id === groupId ? { ...item, ...nextGroup } : item));
    return nextGroup;
  };

  const leaveGroup = async (groupId) => {
    await groupsApi.leaveGroup(groupId);
    setGroups((prev) => prev.filter((group) => group.id !== groupId));
    setActiveGroupId(null);
    navigate("dashboard");
  };

  const removeGroupMember = async (groupId, userId) => {
    await groupsApi.removeMember(groupId, userId);
    await loadGroupDetails(groupId);
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        navigate,
        session,
        authLoading,
        authError,
        currentUser,
        login,
        register,
        logout,
        theme,
        toggleTheme,
        groups,
        groupsLoading,
        groupsError,
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
        selectDirectContact,
        sendDirectMessage,
        directLoading,
        directSending,
        directError,
        isCreateGroupOpen,
        setIsCreateGroupOpen,
        createGroup,
        joinInviteCode,
        setJoinInviteCode,
        loadGroupDetails,
        leaveGroup,
        removeGroupMember,
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
