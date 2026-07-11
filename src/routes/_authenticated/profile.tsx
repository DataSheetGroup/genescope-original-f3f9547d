import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Save, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profile — GeneScope" },
      { name: "description", content: "Manage your GeneScope account details and preferences." },
    ],
  }),
});

function ProfilePage() {
  const { user, updateProfile, changePassword, logout, refresh } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [bio, setBio] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwStatus, setPwStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;
    setFullName(user.full_name ?? "");
    setPhone(user.phone ?? "");
    setOrganization(user.organization ?? "");
    setBio(user.bio ?? "");
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        organization: organization.trim() || null,
        bio: bio.trim() || null,
      });
      setStatus({ kind: "ok", msg: "Profile updated." });
    } catch (err) {
      setStatus({ kind: "err", msg: err instanceof Error ? err.message : "Could not save." });
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus(null);
    if (newPw.length < 8) {
      setPwStatus({ kind: "err", msg: "New password must be at least 8 characters." });
      return;
    }
    if (newPw !== confirmPw) {
      setPwStatus({ kind: "err", msg: "Passwords do not match." });
      return;
    }
    setPwSaving(true);
    try {
      await changePassword(currentPw, newPw);
      setPwStatus({ kind: "ok", msg: "Password updated." });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      setPwStatus({ kind: "err", msg: err instanceof Error ? err.message : "Could not update password." });
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center text-foreground/70">
        Loading your profile…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-foreground/60">Account</div>
          <h1 className="mt-2 font-display text-4xl">Your profile</h1>
          <p className="mt-2 text-sm text-foreground/70">
            Manage the info attached to your GeneScope account.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold uppercase tracking-wider bg-coral text-nav-bg hover:opacity-90 transition"
          style={{ background: "var(--coral)", color: "var(--nav-bg)" }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        {/* Identity card */}
        <aside className="rounded-3xl border border-foreground/10 p-6 h-fit bg-foreground/[0.02]">
          <div className="flex items-center gap-3">
            <div
              className="h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: "var(--coral)", color: "var(--nav-bg)" }}
            >
              {(user.full_name || user.email).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-display text-lg truncate">{user.full_name || user.email.split("@")[0]}</div>
              <div className="text-xs text-foreground/60 truncate">{user.email}</div>
            </div>
          </div>
          <div className="mt-5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-foreground/70">
              <UserRound className="h-3.5 w-3.5" />
              <span className="uppercase tracking-wider">Role</span>
              <span className="ml-auto font-semibold text-foreground">{user.role}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/70">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="uppercase tracking-wider">Status</span>
              <span className="ml-auto font-semibold text-foreground">Active</span>
            </div>
          </div>
        </aside>

        {/* Forms */}
        <div className="space-y-8">
          <form onSubmit={handleSave} className="rounded-3xl border border-foreground/10 p-6 lg:p-8 bg-foreground/[0.02]">
            <h2 className="font-display text-xl">Personal info</h2>
            <p className="mt-1 text-xs text-foreground/60">Stored securely in your GeneScope database.</p>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <Field label="Email" value={user.email} readOnly />
              <Field label="Full name" value={fullName} onChange={setFullName} placeholder="Jane Dela Cruz" />
              <Field label="Phone" value={phone} onChange={setPhone} placeholder="+63 900 000 0000" />
              <Field label="Organization" value={organization} onChange={setOrganization} placeholder="FEU Institute of Technology" />
            </div>
            <div className="mt-4">
              <label className="block text-[11px] uppercase tracking-wider text-foreground/60 mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="A short description of your role or research focus."
                className="w-full rounded-2xl border border-foreground/15 bg-background/40 px-4 py-3 text-sm focus:outline-none focus:border-coral"
              />
            </div>

            <div className="mt-6 flex items-center gap-4 min-h-[28px]">
              {status && (
                <span className={`text-xs ${status.kind === "ok" ? "text-emerald-400" : "text-coral"}`}>
                  {status.msg}
                </span>
              )}
              <button
                type="submit"
                disabled={saving}
                className="ml-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50 transition hover:opacity-90"
                style={{ background: "var(--surface-strong)", color: "var(--nav-bg)" }}
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>

          <form onSubmit={handlePassword} className="rounded-3xl border border-foreground/10 p-6 lg:p-8 bg-foreground/[0.02]">
            <h2 className="font-display text-xl">Change password</h2>
            <p className="mt-1 text-xs text-foreground/60">Use at least 8 characters. You'll stay signed in.</p>
            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              <Field label="Current" type="password" value={currentPw} onChange={setCurrentPw} />
              <Field label="New" type="password" value={newPw} onChange={setNewPw} />
              <Field label="Confirm new" type="password" value={confirmPw} onChange={setConfirmPw} />
            </div>
            <div className="mt-6 flex items-center gap-4 min-h-[28px]">
              {pwStatus && (
                <span className={`text-xs ${pwStatus.kind === "ok" ? "text-emerald-400" : "text-coral"}`}>
                  {pwStatus.msg}
                </span>
              )}
              <button
                type="submit"
                disabled={pwSaving || !currentPw || !newPw}
                className="ml-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50 transition hover:opacity-90"
                style={{ background: "var(--surface-strong)", color: "var(--nav-bg)" }}
              >
                {pwSaving ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  readOnly,
  type = "text",
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wider text-foreground/60 mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full rounded-2xl border border-foreground/15 bg-background/40 px-4 py-3 text-sm focus:outline-none focus:border-coral ${readOnly ? "opacity-70 cursor-not-allowed" : ""}`}
      />
    </label>
  );
}
