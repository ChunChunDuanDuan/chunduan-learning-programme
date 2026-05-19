"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";

type Status = "idle" | "loading" | "success" | "error";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleLogin() {
    setStatus("loading");
    setMessage("");

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

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Signed in successfully.");

    router.push("/dashboard");
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

    setEmail("");
    setPassword("");
    setStatus("success");
    setMessage("Signed out successfully.");
  }

  return (
    <section className="max-w-3xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h2 className="text-3xl font-semibold tracking-tight">Sign in</h2>

      <p className="mt-4 text-base leading-7 text-neutral-600">
        Use your private account to access the learning system.
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950"
            placeholder="Email"
            autoComplete="new-password"
            name="private-login-email-field"
            id="private-login-email-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950"
            placeholder="Password"
            autoComplete="new-password"
            name="private-login-password-field"
            id="private-login-password-field"
          />
        </div>

        {message ? (
          <div
            className={`rounded-xl border p-4 text-sm ${status === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
              }`}
          >
            {message}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleLogin}
            disabled={status === "loading"}
            className="rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium !text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
          >
            {status === "loading" ? "Signing in..." : "Sign in"}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={status === "loading"}
            className="rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign out
          </button>
        </div>
      </div>
    </section>
  );
}