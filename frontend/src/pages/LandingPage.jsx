import React from "react";
import { useApp } from "../context/AppContext";

export function LandingPage() {
  const { navigate } = useApp();

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <a
          className="brand"
          href="#landing"
          onClick={(e) => {
            e.preventDefault();
            navigate("landing");
          }}
        >
          <span className="logo">C</span>
          CollabAI
        </a>
        <span className="sp"></span>
        <button className="btn ghost" onClick={() => navigate("login")}>
          Log in
        </button>
        <button className="btn" onClick={() => navigate("register")}>
          Sign up
        </button>
      </header>

      <section className="hero">
        <div>
          <h1>Work together. Think together. Build together.</h1>
          <p>
            A shared workspace where your team can collaborate with each other and
            AI, all in one place.
          </p>
          <div className="row">
            <button className="btn" onClick={() => navigate("register")}>
              Create your workspace
            </button>
            <button className="btn ghost" onClick={() => navigate("login")}>
              Log in
            </button>
          </div>
        </div>
        <div className="prev" aria-hidden="true">
          <div className="bub h">
            <b>Arman</b> How should we structure our React project?
          </div>
          <div className="bub a">
            <b>CollabAI</b> Use a feature-based layout so each feature owns its
            own folder.
          </div>
          <div className="bub h">
            <b>Saniya</b> Got it, I can see this too. Starting on the group UI.
          </div>
        </div>
      </section>

      <section className="sect">
        <h2>Three places to talk, each with one job</h2>
        <div className="three">
          <div className="card">
            <span className="tag">Only you</span>
            <h3>Personal AI</h3>
            <p>
              A private space for questions, learning and brainstorming. Keep as
              many conversations as you need.
            </p>
          </div>
          <div className="card">
            <span className="tag">Your group</span>
            <h3>Group chat</h3>
            <p>Realtime messages between the people in your group.</p>
          </div>
          <div className="card">
            <span className="tag">Shared</span>
            <h3>Group AI</h3>
            <p>
              One AI conversation the whole group sees, split into Frontend,
              Backend, Database and more, so nothing gets lost.
            </p>
          </div>
        </div>
      </section>

      <section className="sect">
        <h2>Get started in three steps</h2>
        <div className="three">
          <div className="card">
            <h3>1. Create a group</h3>
            <p>Name it and share the invite code.</p>
          </div>
          <div className="card">
            <h3>2. Invite your team</h3>
            <p>Members join with the code and appear in the group.</p>
          </div>
          <div className="card">
            <h3>3. Ask together</h3>
            <p>Chat with people, and ask the AI in the section that fits.</p>
          </div>
        </div>
      </section>

      <div className="cta">
        <h2>Bring your team and your AI into one place</h2>
        <button
          className="btn"
          style={{ background: "#0A0807", color: "#ffffff" }}
          onClick={() => navigate("register")}
        >
          Sign up free
        </button>
      </div>

      <footer className="foot">
        <span>© CollabAI</span>
        <span>Built by Arman and Saniya</span>
      </footer>
    </div>
  );
}
