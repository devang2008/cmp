// ============================================================
// SIGNUP PAGE CLIENT — Role selection + alias + registration
// ============================================================
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type UserRole = "buyer" | "vendor";
type AliasStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "forbidden";

// Forbidden custom parts (case-insensitive)
const FORBIDDEN_WORDS = [
  'admin', 'system', 'shield', 'support', 'help', 'mod', 'moderator',
  'root', 'test', 'demo', 'guest', 'anon', 'null', 'undefined',
];

const CUSTOM_PART_REGEX = /^[a-zA-Z0-9]{3,16}$/;

export function SignupPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRole = searchParams.get("role") as UserRole | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">(preselectedRole || "");
  const [aliasCustomPart, setAliasCustomPart] = useState("");
  const [aliasStatus, setAliasStatus] = useState<AliasStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Computed full alias
  const rolePrefix = role === "vendor" ? "Vendor" : role === "buyer" ? "Buyer" : "";
  const fullAlias = rolePrefix && aliasCustomPart ? `${rolePrefix}-${aliasCustomPart}` : "";

  // Check alias availability (debounced)
  const checkAlias = useCallback(async (customPart: string, currentRole: string) => {
    if (!currentRole || !customPart) {
      setAliasStatus("idle");
      return;
    }

    // Client-side validation first
    if (!CUSTOM_PART_REGEX.test(customPart)) {
      setAliasStatus("invalid");
      return;
    }

    if (FORBIDDEN_WORDS.includes(customPart.toLowerCase())) {
      setAliasStatus("forbidden");
      return;
    }

    const prefix = currentRole === "vendor" ? "Vendor" : "Buyer";
    const full = `${prefix}-${customPart}`;

    setAliasStatus("checking");
    try {
      const res = await fetch(`/api/alias/check?alias=${encodeURIComponent(full)}`);
      const data = await res.json();
      if (data.available) {
        setAliasStatus("available");
      } else {
        setAliasStatus(data.reason === "forbidden" ? "forbidden" : data.reason === "taken" ? "taken" : "invalid");
      }
    } catch {
      setAliasStatus("invalid");
    }
  }, []);

  // Debounce alias check on input change
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!aliasCustomPart || !role) {
      setAliasStatus("idle");
      return;
    }
    debounceTimer.current = setTimeout(() => {
      checkAlias(aliasCustomPart, role);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [aliasCustomPart, role, checkAlias]);

  // Re-check when role changes (prefix changes)
  useEffect(() => {
    if (aliasCustomPart && role) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        checkAlias(aliasCustomPart, role);
      }, 300);
    }
  }, [role, aliasCustomPart, checkAlias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!role) {
      setError("Please select a role");
      return;
    }
    if (!aliasCustomPart) {
      setError("Please choose an alias");
      return;
    }
    if (aliasStatus !== "available") {
      setError("Please choose an available alias before continuing");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role, preferred_alias: fullAlias } },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          setError("An account with this email already exists. Please sign in.");
          return;
        }
        if (!data.session) {
          setShowVerification(true);
        } else {
          router.push(`/onboard?role=${role}`);
          router.refresh();
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const aliasStatusMessage = () => {
    switch (aliasStatus) {
      case "checking":
        return (
          <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Checking availability...
          </span>
        );
      case "available":
        return (
          <span className="text-[var(--verified)] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Available!
          </span>
        );
      case "taken":
        return (
          <span className="text-[var(--destructive-foreground)] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Already taken — try another
          </span>
        );
      case "forbidden":
        return (
          <span className="text-[var(--destructive-foreground)] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            This name is reserved
          </span>
        );
      case "invalid":
        return (
          <span className="text-[var(--destructive-foreground)] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            3-16 characters, letters and numbers only
          </span>
        );
      default:
        return null;
    }
  };

  if (showVerification) {
    return (
      <div className="w-full max-w-md slide-up text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--verified-soft)] mb-6">
          <svg className="w-8 h-8 text-[var(--verified)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Check Your Email</h2>
        <p className="text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto">
          We&apos;ve sent a verification link to your email. Click it to activate your anonymous SHIELD account.
        </p>
        <div className="bg-white rounded-xl border border-[var(--border)] p-5 mb-6">
          <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
            <svg className="w-5 h-5 text-[var(--primary)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <span>Your identity will be: <strong className="text-[var(--foreground)] font-mono">{fullAlias}</strong></span>
          </div>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border border-[var(--border)] text-[var(--foreground)] font-semibold text-sm hover:bg-[var(--accent)] transition-colors"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md slide-up">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] shadow-lg mb-4">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Create Anonymous Account</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Your identity stays hidden. Only your alias is visible.</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-[var(--border)] shadow-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-[var(--destructive-soft)] text-[var(--destructive-foreground)] text-sm font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  role === "buyer"
                    ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                    : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg className={`w-5 h-5 ${role === "buyer" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  <span className="font-semibold text-sm text-[var(--foreground)]">Buyer</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">I need cybersecurity services</p>
              </button>
              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  role === "vendor"
                    ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                    : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg className={`w-5 h-5 ${role === "vendor" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span className="font-semibold text-sm text-[var(--foreground)]">Vendor</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">I provide security services</p>
              </button>
            </div>
          </div>

          {/* Alias Selection — only shown after role is picked */}
          {role && (
            <div>
              <label htmlFor="signup-alias" className="block text-sm font-semibold text-[var(--foreground)] mb-1.5">
                Choose Your Alias
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--muted-foreground)] select-none">
                  {rolePrefix}-
                </span>
                <input
                  id="signup-alias"
                  type="text"
                  value={aliasCustomPart}
                  onChange={(e) => {
                    // Only allow alphanumeric characters
                    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                    setAliasCustomPart(val.slice(0, 16));
                  }}
                  placeholder="ShadowByte"
                  maxLength={16}
                  className="w-full pl-[72px] pr-10 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                />
                {/* Status icon */}
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {aliasStatus === "available" && (
                    <svg className="w-5 h-5 text-[var(--verified)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  )}
                  {(aliasStatus === "taken" || aliasStatus === "invalid" || aliasStatus === "forbidden") && (
                    <svg className="w-5 h-5 text-[var(--destructive-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  )}
                  {aliasStatus === "checking" && (
                    <svg className="w-5 h-5 text-[var(--muted-foreground)] animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                </span>
              </div>
              {/* Status message */}
              <div className="mt-1.5 text-xs min-h-[1.25rem]">
                {aliasStatusMessage()}
              </div>
              {/* Live preview */}
              {fullAlias && aliasStatus !== "idle" && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent)] text-xs">
                  <svg className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  <span className="text-[var(--muted-foreground)]">Your identity: </span>
                  <span className="font-mono font-semibold text-[var(--foreground)]">{fullAlias}</span>
                </div>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="signup-email" className="block text-sm font-semibold text-[var(--foreground)] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
              />
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Email is used only for login — never shown to other users</p>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="signup-password" className="block text-sm font-semibold text-[var(--foreground)] mb-1.5">
              Password
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="signup-confirm" className="block text-sm font-semibold text-[var(--foreground)] mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <input
                id="signup-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || aliasStatus !== "available"}
            className="w-full py-3 rounded-lg gradient-cta text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Account...
              </>
            ) : (
              "Create Anonymous Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--primary-hover)] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--muted-foreground)]">
        <svg className="w-3.5 h-3.5 text-[var(--verified)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
        <span>Secured with end-to-end encryption</span>
      </div>
    </div>
  );
}
