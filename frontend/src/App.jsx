import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { GroupWorkspacePage } from "./pages/GroupWorkspacePage/GroupWorkspacePage";
import { PersonalAIPage } from "./pages/PersonalAIPage/PersonalAIPage";
import { DirectChatsPage } from "./pages/DirectChatsPage/DirectChatsPage";
import { AppRail } from "./components/layout/AppRail";
import { AppSidebar } from "./components/layout/AppSidebar";
import { BottomNav } from "./components/layout/BottomNav";
import { CreateGroupModal } from "./components/layout/CreateGroupModal";
import { JoinRequestModal } from "./components/groups/JoinRequestModal";

function MainAppContent() {
  const { currentView, authLoading, authError, session, joinInviteCode, setJoinInviteCode } = useApp();

  if (authLoading) {
    return <div className="auth-page">Loading...</div>;
  }

  if (authError) {
    return <div className="auth-page" role="alert">{authError}</div>;
  }

  if (currentView === "landing") {
    return <LandingPage />;
  }

  if (currentView === "login" || currentView === "register") {
    return <AuthPage mode={currentView} />;
  }

  if (!session) {
    return <AuthPage mode="login" />;
  }

  return (
    <div className="app-shell">
      <AppRail />
      <AppSidebar />
      <main className="main-content">
        {currentView === "dashboard" && <DashboardPage />}
        {currentView === "group-workspace" && <GroupWorkspacePage />}
        {currentView === "personal-ai" && <PersonalAIPage />}
        {currentView === "direct-chats" && <DirectChatsPage />}
      </main>
      <BottomNav />
      <CreateGroupModal />
      {joinInviteCode && (
        <JoinRequestModal inviteCode={joinInviteCode} onClose={() => setJoinInviteCode(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
