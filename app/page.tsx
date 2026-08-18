"use client";

import { FormEvent, useEffect, useState } from "react";

type Feedback = {
  id: string;
  content: string;
  channel: string;
  customerLabel: string | null;
  featureArea: string | null;
  status: string;
  sentiment: string | null;
  createdAt: string;
};

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("Test12345");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadFeedback() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/feedback", {
        credentials: "include",
      });

      if (response.status === 401) {
        setLoggedIn(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to load feedback (${response.status})`);
      }

      const data = await response.json();
      setFeedback(data.feedback || []);
      setLoggedIn(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load feedback."
      );
    } finally {
      setLoading(false);
      setCheckingAuth(false);
    }
  }

  async function checkAuth() {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        setLoggedIn(true);
        await loadFeedback();
      } else {
        setLoggedIn(false);
      }
    } catch {
      setLoggedIn(false);
    } finally {
      setCheckingAuth(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoggingIn(true);
    setLoginError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      setLoggedIn(true);
      await loadFeedback();
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : "Login failed."
      );
    } finally {
      setLoggingIn(false);
      setCheckingAuth(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setLoggedIn(false);
    setFeedback([]);
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-500">Loading LOOP...</p>
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-zinc-900">LOOP</h1>
            <p className="mt-2 text-zinc-500">
              AI Customer Feedback Intelligence Platform
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
                required
              />
            </div>

            {loginError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {loggingIn ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">LOOP</h1>
            <p className="mt-1 text-zinc-500">
              AI Customer Feedback Intelligence Platform
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Logout
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Total Feedback</p>
            <p className="mt-2 text-3xl font-bold">{feedback.length}</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">New</p>
            <p className="mt-2 text-3xl font-bold">
              {feedback.filter((item) => item.status === "NEW").length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Manual</p>
            <p className="mt-2 text-3xl font-bold">
              {feedback.filter((item) => item.channel === "MANUAL").length}
            </p>
          </div>
        </div>

        <section className="rounded-xl bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h2 className="text-xl font-semibold text-zinc-900">
              Customer Feedback
            </h2>
          </div>

          {loading && (
            <div className="p-8 text-center text-zinc-500">
              Loading feedback...
            </div>
          )}

          {error && (
            <div className="p-8 text-center text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && feedback.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
              No feedback yet.
            </div>
          )}

          {!loading && !error && feedback.length > 0 && (
            <div className="divide-y divide-zinc-200">
              {feedback.map((item) => (
                <div key={item.id} className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-medium text-zinc-900">
                        {item.content}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2 text-sm text-zinc-500">
                        <span>{item.channel}</span>

                        {item.customerLabel && (
                          <span>• {item.customerLabel}</span>
                        )}

                        {item.featureArea && (
                          <span>• {item.featureArea}</span>
                        )}
                      </div>
                    </div>

                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}