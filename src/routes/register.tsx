import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { AuthShell, authButtonClass, authInputClass, authLabelClass } from "@/components/AuthShell";
import { useAuth } from "@/lib/auth-context";
import { isAuthenticated } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account · GeneScope" },
      { name: "description", content: "Request access to the GeneScope clinical decision-support workspace." },
    ],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && isAuthenticated()) {
      throw redirect({ to: "/" });
    }
  },
  ssr: false,
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ email: email.trim(), password, full_name: fullName.trim() || undefined });
      setSuccess(true);
      setTimeout(() => navigate({ to: "/" }), 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Only emails on the approved partner-domain allowlist will be granted access."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-cream underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-6" onSubmit={onSubmit} noValidate>
        <div>
          <label className={authLabelClass}>Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={submitting || success}
            placeholder="Dr. Jane Doe"
            className={authInputClass}
          />
        </div>
        <div>
          <label className={authLabelClass}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={submitting || success}
            placeholder="you@partner.org"
            className={authInputClass}
          />
        </div>
        <div>
          <label className={authLabelClass}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={submitting || success}
            placeholder="At least 8 characters"
            className={authInputClass}
          />
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div role="status" className="flex items-start gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Account created. Redirecting…</span>
          </div>
        )}

        <button type="submit" disabled={submitting || success} className={authButtonClass} style={{ background: "var(--gradient-brand)" }}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Creating account…" : success ? "Success" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
