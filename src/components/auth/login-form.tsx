"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase/client";

type Status = "idle" | "loading" | "success" | "error";

function getReadableError(error: unknown) {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error.";
  }
}

export function LoginForm() {
  const [email, setEmail] = useState("chiang.haoyueh2@gmail.com");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  async function handleLogin() {
    setStatus("loading");
    setMessage("");

    if (!supabaseUrl) {
      setStatus("error");
      setMessage("Missing NEXT_PUBLIC_SUPABASE_URL.");
      return;
    }

    if (!hasSupabaseAnonKey) {
      setStatus("error");
      setMessage("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      setStatus("error");
      setMessage("Please enter your password.");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setStatus("error");
        setMessage(`Supabase auth error: ${error.message}`);
        return;
      }

      if (!data.session) {
        setStatus("error");
        setMessage("Login request finished, but no session was returned.");
        return;
      }

      setStatus("success");
      setMessage("Signed in successfully.");
    } catch (error) {
      setStatus("error");
      setMessage(
        [
          "Network or browser error during login.",
          getReadableError(error),
          "",
          `Supabase URL: ${supabaseUrl}`,
          "If this only happens on iPad/iPhone, check Safari content blockers, iCloud Private Relay, VPN, DNS blockers, or cached website data.",
        ].join("\n")
      );
    }
  }

  async function handleSignOut() {
    setStatus("loading");
    setMessage("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setStatus("error");
        setMessage(`Supabase sign out error: ${error.message}`);
        return;
      }

      setStatus("idle");
      setPassword("");
      setMessage("Signed out.");
    } catch (error) {
      setStatus("error");
      setMessage(`Network or browser error during sign out: ${getReadableError(error)}`);
    }
  }

  return (
    <div className="max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-neutral-950">Sign in</h2>

      <p className="mt-2 text-sm leading-6 text-neutral-600">
        Use the email and password configured in Supabase Auth.
      </p>

      <div className="mt-4 rounded-2xl bg-neutral-50 px-4 py-3 text-xs leading-5 text-neutral-500">
        <p>
          Supabase URL:{" "}
          <span className="font-medium text-neutral-700">
            {supabaseUrl ? supabaseUrl : "Missing"}
          </span>
        </p>

        <p>
          Supabase anon key:{" "}
          <span className="font-medium text-neutral-700">
            {hasSupabaseAnonKey ? "Loaded" : "Missing"}
          </span>
        </p>
      </div>

      <label className="mt-6 block">
        <span className="text-sm font-medium text-neutral-800">Email</span>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-neutral-400"
          placeholder="you@example.com"
          autoComplete="email"
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
          autoComplete="current-password"
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
        <pre
          className={`mt-4 whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${status === "error"
              ? "bg-red-50 text-red-700"
              : "bg-neutral-50 text-neutral-600"
            }`}
        >
          {message}
        </pre>
      ) : null}
    </div>
  );
}