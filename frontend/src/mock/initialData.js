export const currentUser = {
  name: "Arman",
  initials: "AR",
  color: "#c2410c",
  email: "arman@example.com",
  role: "owner"
};

export const initialMembers = [
  { id: "arman", name: "Arman", initials: "AR", color: "#c2410c", role: "owner", status: "online" },
  { id: "saniya", name: "Saniya", initials: "SK", color: "#0f766e", role: "member", status: "online" },
  { id: "rahul", name: "Rahul", initials: "RA", color: "#4338ca", role: "member", status: "online" },
  { id: "priya", name: "Priya", initials: "PR", color: "#be185d", role: "member", status: "offline" },
];

export const initialGroups = [
  {
    id: "project-team",
    name: "Project Team",
    code: "CLB-4821",
    tag: "PT",
    memberCount: 4,
    newAiAnswers: 3,
    members: initialMembers,
    chatMessages: [
      { id: 1, type: "user", sender: "Arman", initials: "AR", color: "#c2410c", text: "Let's start the database design today.", time: "10:02" },
      { id: 2, type: "user", sender: "Saniya", initials: "SK", color: "#0f766e", text: "Okay, I'll work on the group UI.", time: "10:04" },
      { id: 3, type: "user", sender: "Rahul", initials: "RA", color: "#4338ca", text: "I'll prepare the documentation.", time: "10:06" },
      { id: 4, type: "user", sender: "Priya", initials: "PR", color: "#be185d", text: "I'll test the join flow once it's ready. Check the Backend section in Group AI for the auth notes.", time: "10:09" },
    ],
    aiTopics: {
      General: [
        { type: "u", sender: "Arman", initials: "AR", color: "#c2410c", text: "What should we finish first for the MVP?" },
        { type: "a", sender: "CollabAI", initials: "AI", color: "#D200D3", text: "Start with authentication and profile, then create/join group. Group chat and Group AI both depend on group membership, so they come next." }
      ],
      Frontend: [
        { type: "u", sender: "Saniya", initials: "SK", color: "#0f766e", text: "How should we structure our React project?" },
        { type: "a", sender: "CollabAI", initials: "AI", color: "#D200D3", text: "Use a feature-based layout: <code>features/groups</code>, <code>features/member-chat</code>, <code>features/group-ai</code>, with shared components in <code>components/</code>." }
      ],
      Backend: [
        { type: "u", sender: "Arman", initials: "AR", color: "#c2410c", text: "How do we check group access before calling the AI?" },
        { type: "a", sender: "CollabAI", initials: "AI", color: "#D200D3", text: "Verify the token, confirm the user is in <code>group_members</code>, validate the section, then save the message and call the AI provider." },
        { type: "u", sender: "Priya", initials: "PR", color: "#be185d", text: "Should the frontend send the sender id?" },
        { type: "a", sender: "CollabAI", initials: "AI", color: "#D200D3", text: "No. The backend reads it from the logged-in user." }
      ],
      Database: [],
      Testing: [],
      Research: []
    }
  },
  {
    id: "study-group",
    name: "Study Group",
    code: "CLB-9912",
    tag: "SG",
    memberCount: 6,
    newMessages: 12,
    members: initialMembers,
    chatMessages: [
      { id: 1, type: "user", sender: "Rahul", initials: "RA", color: "#4338ca", text: "Hey everyone! When are we reviewing algorithms?", time: "08:30" }
    ],
    aiTopics: {
      General: [
        { type: "u", sender: "Rahul", initials: "RA", color: "#4338ca", text: "Can you explain Big O notation simply?" },
        { type: "a", sender: "CollabAI", initials: "AI", color: "#D200D3", text: "Big O notation describes how execution time or memory space scales relative to the input size <code>N</code>." }
      ]
    }
  },
  {
    id: "research-circle",
    name: "Research Circle",
    code: "CLB-3310",
    tag: "RC",
    memberCount: 3,
    newMessages: 0,
    members: [initialMembers[0], initialMembers[1], initialMembers[2]],
    chatMessages: [],
    aiTopics: {
      General: []
    }
  }
];

export const initialPersonalAIConvs = {
  "React Questions": [
    { type: "m", text: "What is the difference between state and props?" },
    { type: "a", text: "<code>props</code> are passed down from a parent and are read-only. <code>state</code> belongs to the component and can change.<pre>const [count, setCount] = useState(0);</pre>Changing state re-renders the component." }
  ],
  "Python Learning": [],
  "Project Ideas": [],
  "Interview Preparation": []
};

export const initialDirectChats = {
  Arjun: {
    initials: "AJ",
    color: "#4338ca",
    status: "Online",
    isOnline: true,
    unread: 0,
    messages: [
      { sender: "them", text: "Did you push the login page?", time: "09:40" },
      { sender: "mine", text: "Yes, check the feature/arman-auth branch.", time: "09:42" },
      { sender: "them", text: "Perfect, I will review it after lunch.", time: "09:43" }
    ]
  },
  Rahul: {
    initials: "RA",
    color: "#0f766e",
    status: "Online",
    isOnline: true,
    unread: 1,
    messages: [
      { sender: "them", text: "Documentation draft is ready.", time: "Yesterday" },
      { sender: "mine", text: "Great, I will read it tonight.", time: "Yesterday" }
    ]
  },
  Priya: {
    initials: "PR",
    color: "#be185d",
    status: "Last seen 2 hours ago",
    isOnline: false,
    unread: 0,
    messages: []
  }
};
