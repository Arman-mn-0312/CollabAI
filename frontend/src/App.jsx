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

function MainAppContent() {
  const { currentView } = useApp();

  if (currentView === "landing") {
    return <LandingPage />;
  }

  if (currentView === "login" || currentView === "register") {
    return <AuthPage mode={currentView} />;
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
