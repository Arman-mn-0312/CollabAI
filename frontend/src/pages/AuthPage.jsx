import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthPage({ mode = "login" }) {
  const { navigate, login, register } = useApp();
  const [isRegister, setIsRegister] = useState(mode === "register");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setIsRegister(mode === "register");
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (isRegister && !fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setError("Email and password are required.");
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        const data = await register({
          fullName: fullName.trim(),
          username: username.trim(),
          email: normalizedEmail,
          password,
        });
        if (!data.session) {
          setMessage("Account created. Check your email to confirm your account, then log in.");
        }
      } else {
        await login(normalizedEmail, password);
      }
    } catch (authError) {
      const code = authError?.code;
      if (code === "user_already_exists" || code === "email_exists") {
        setError("An account with this email already exists.");
      } else if (code === "invalid_credentials") {
        setError("Incorrect email or password.");
      } else if (code === "email_not_confirmed") {
        setError("Please confirm your email before logging in.");
      } else if (authError?.message?.toLowerCase().includes("password")) {
        setError("Password must meet Supabase's password requirements.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
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

        <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p>
          {isRegister
            ? "Start collaborating with your team and AI."
            : "Log in to your workspace."}
        </p>

        {error && <p role="alert" style={{ color: "var(--pink)", marginBottom: "12px" }}>{error}</p>}
        {message && <p role="status" style={{ color: "var(--mag)", marginBottom: "12px" }}>{message}</p>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <label htmlFor="auth-name">Full name</label>
              <input
                id="auth-name"
                className="fld"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          )}

          {isRegister && (
            <div>
              <label htmlFor="auth-username">Username (optional)</label>
              <input
                id="auth-username"
                className="fld"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          )}

          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            className="fld"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            className="fld"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
          />

          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? "Please wait..." : isRegister ? "Create account" : "Log in"}
          </button>
        </form>

        <div className="sm">
          {!isRegister ? (
            <button
              className="ghost-link"
              onClick={() => setError("Password reset is not available yet.")}
              style={{ color: "var(--mute)" }}
            >
              Forgot password?
            </button>
          ) : (
            <span></span>
          )}

          <span>
            {isRegister ? "Have an account? " : "No account? "}
            <button
              onClick={() => {
                const nextMode = isRegister ? "login" : "register";
                setIsRegister(!isRegister);
                navigate(nextMode);
              }}
              style={{ color: "var(--pink)", fontWeight: 500 }}
            >
              {isRegister ? "Log in" : "Sign up"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
