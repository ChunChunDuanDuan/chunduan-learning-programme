"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("chiang.haoyueh2@gmail.com");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleLogin() {
    setStatus("loading");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Signed in successfully.");
  }

  async function handleSignOut() {
    setStatus("loading");
    setMessage("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("idle");
    setPassword("");
    setMessage("Signed out.");
  }

  return (
    <div className="max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-neutral-950">Sign in</h2>

      <p className="mt-2 text-sm leading-6 text-neutral-600">
        Use the email and password configured in Supabase Auth.
      </p>

      <label className="mt-6 block">
        <span className="text-sm font-medium text-neutral-800">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-neutral-400"
          placeholder="you@example.com"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-neutral-800">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-neutral-400"
          placeholder="Your password"
        />
      </label>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={handleLogin}
          disabled={status === "loading"}
          className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Working..." : "Sign in"}
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={status === "loading"}
          className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Sign out
        </button>
      </div>

      {message ? (
        <p
          className={`mt-4 text-sm ${
            status === "error" ? "text-red-600" : "text-neutral-600"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}