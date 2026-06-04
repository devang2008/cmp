// ============================================================
// SIGNUP PAGE CLIENT — Role selection + alias + registration
// Uses /api/cmp/auth/signup and /api/cmp/alias/check
// ============================================================
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type UserRole = "buyer" | "vendor";
type AliasStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "forbidden";

const FORBIDDEN_WORDS = [
  'admin', 'system', 'shield', 'support', 'help', 'mod', 'moderator',
  'root', 'test', 'demo', 'guest', 'anon', 'null', 'undefined', 'staff',
];

const CUSTOM_PART_REGEX = /^[a-zA-Z0-9]{3,16}$/;

export function SignupPageClient() {
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [aliasCustomPart, setAliasCustomPart] = useState("");
  const [aliasStatus, setAliasStatus] = useState<AliasStatus>("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAlias, setSuccessAlias] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      const res = await fetch("/api/cmp/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus("Verification email resent. Check your inbox.");
      } else {
        setResendStatus(data.error || "Failed to resend email.");
      }
    } catch {
      setResendStatus("Failed to resend email.");
    } finally {
      setResending(false);
    }
  };

  // Computed
  const rolePrefix = selectedRole === "vendor" ? "Vendor" : selectedRole === "buyer" ? "Buyer" : "";
  const fullAlias = rolePrefix && aliasCustomPart ? `${rolePrefix}-${aliasCustomPart}` : "";

  // Debounced alias availability check
  useEffect(() => {
    if (!aliasCustomPart || !selectedRole) {
      setAliasStatus("idle");
      return;
    }

    // Client-side validation first (no API call needed)
    if (!CUSTOM_PART_REGEX.test(aliasCustomPart)) {
      setAliasStatus("invalid");
      return;
    }

    // Client-side forbidden check
    if (FORBIDDEN_WORDS.includes(aliasCustomPart.toLowerCase())) {
      setAliasStatus("forbidden");
      return;
    }

    setAliasStatus("checking");

    // Debounce: wait 500ms after last keystroke
    const timer = setTimeout(async () => {
      const prefix = selectedRole === "vendor" ? "Vendor" : "Buyer";
      const checkAlias = `${prefix}-${aliasCustomPart}`;
      try {
        const res = await fetch(
          `/api/cmp/alias/check?alias=${encodeURIComponent(checkAlias)}`
        );
        const { available, reason } = await res.json();
        if (reason === "forbidden") {
          setAliasStatus("forbidden");
        } else if (available) {
          setAliasStatus("available");
        } else {
          setAliasStatus("taken");
        }
      } catch {
        setAliasStatus("idle");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [aliasCustomPart, selectedRole]);

  const isFormValid =
    selectedRole &&
    aliasStatus === "available" &&
    email &&
    password.length >= 8 &&
    password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const prefix = selectedRole === "vendor" ? "Vendor" : "Buyer";
      const alias = `${prefix}-${aliasCustomPart}`;

      const res = await fetch("/api/cmp/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          alias,
          role: selectedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account");
        return;
      }

      setSuccessAlias(alias);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Alias status indicator component
  const renderAliasStatus = () => {
    switch (aliasStatus) {
      case "checking":
        return (
          <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Checking...
          </span>
        );
      case "available":
        return (
          <span className="text-[var(--verified)] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {fullAlias} is available
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
      case "invalid":
        return (
          <span className="text-amber-600 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            Letters and numbers only, 3-16 characters
          </span>
        );
      case "forbidden":
        return (
          <span className="text-[var(--destructive-foreground)] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            That word is not allowed
          </span>
        );
      default:
        return null;
    }
  };

  // ── Success card ────────────────────────────
  if (successAlias) {
    return (
      <div className="w-full max-w-md slide-up text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-6 shadow-md">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          Check your email!
        </h2>
        <p className="text-[var(--muted-foreground)] text-sm mb-4 max-w-sm mx-auto">
          We sent a verification link to <span className="font-semibold text-[var(--foreground)]">{email}</span>.<br />
          Click the link in the email to activate your account.
        </p>
        <p className="text-xs text-[var(--muted-foreground)] mb-2">
          The link expires in 24 hours.
        </p>
        <p className="text-xs text-[var(--muted-foreground)]/70 mb-6 italic">
          Did not receive it? Check your spam folder.
        </p>

        {resendStatus && (
          <div className="mb-4 text-xs font-medium text-cyan-400">
            {resendStatus}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-sm font-semibold text-[var(--primary-hover)] hover:underline disabled:opacity-50"
          >
            {resending ? "Resending..." : "Resend verification email"}
          </button>
          
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg gradient-cta text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md mt-2"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Signup form ────────────────────────────
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

          {/* ── Field 1: Role Selection ── */}
          <div>
            <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole("buyer")}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedRole === "buyer"
                    ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                    : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg className={`w-5 h-5 ${selectedRole === "buyer" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  <span className="font-semibold text-sm text-[var(--foreground)]">Buyer</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">I need cybersecurity services</p>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("vendor")}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedRole === "vendor"
                    ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                    : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg className={`w-5 h-5 ${selectedRole === "vendor" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span className="font-semibold text-sm text-[var(--foreground)]">Vendor</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">I provide security services</p>
              </button>
            </div>
          </div>

          {/* ── Field 2: Alias (Codename) ── */}
          {selectedRole && (
            <div>
              <label htmlFor="signup-alias" className="block text-sm font-semibold text-[var(--foreground)] mb-1">
                Choose your codename
              </label>
              <p className="text-xs text-[var(--muted-foreground)] mb-2">
                This is your anonymous identity on SHIELD. It cannot be changed after signup.
              </p>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm font-semibold text-[var(--primary)] select-none pointer-events-none">
                  {rolePrefix}-
                </span>
                <input
                  id="signup-alias"
                  type="text"
                  value={aliasCustomPart}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                    setAliasCustomPart(val.slice(0, 16));
                  }}
                  placeholder="e.g. Shadow, Phantom, Cipher"
                  maxLength={16}
                  className="w-full pl-[80px] pr-10 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                />
                {/* Status icon inside input */}
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {aliasStatus === "available" && (
                    <svg className="w-5 h-5 text-[var(--verified)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  )}
                  {(aliasStatus === "taken" || aliasStatus === "forbidden") && (
                    <svg className="w-5 h-5 text-[var(--destructive-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  )}
                  {aliasStatus === "invalid" && (
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
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

              {/* Status message below input */}
              <div className="mt-1.5 text-xs min-h-[1.25rem]">
                {renderAliasStatus()}
              </div>

              {/* Live preview — only when alias is valid and available */}
              {fullAlias && aliasStatus === "available" && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent)] text-xs">
                  <svg className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  <span className="text-[var(--muted-foreground)]">Your identity will be: </span>
                  <span className="font-mono font-semibold text-[var(--foreground)]">{fullAlias}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Field 3: Email ── */}
          <div>
            <label htmlFor="signup-email" className="block text-sm font-semibold text-[var(--foreground)] mb-1.5">
              Email address
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
                placeholder="Enter your email"
                required
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
              />
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Email is used only for login — never shown to other users</p>
          </div>

          {/* ── Field 4: Password ── */}
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="w-full pl-11 pr-11 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* ── Field 5: Confirm Password ── */}
          <div>
            <label htmlFor="signup-confirm" className="block text-sm font-semibold text-[var(--foreground)] mb-1.5">
              Confirm password
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
                placeholder="Repeat your password"
                required
                minLength={8}
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-[var(--destructive-foreground)]">Passwords do not match</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full py-3 rounded-lg gradient-cta text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </>
            ) : (
              "Create my account"
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
