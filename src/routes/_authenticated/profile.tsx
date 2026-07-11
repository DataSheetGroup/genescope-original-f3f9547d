import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Save, KeyRound, ShieldCheck, UserRound, Mail, Building2, Phone } from "lucide-react";
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

  const displayName = user.full_name?.trim() || user.email.split("@")[0];

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 lg:py-16">
      {/* Editorial header */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-6 border-b border-foreground/10 pb-8 mb-10">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-foreground/60">§ Account · Profile</div>
          <h1 className="mt-3 font-display text-4xl md:text-5xl leading-[1.05]">Your profile</h1>
          <p className="mt-3 text-sm text-foreground/70 max-w-lg">
            Manage the identity attached to your GeneScope workspace.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider transition hover:opacity-90 justify-self-start md:justify-self-end"
          style={{ background: "var(--coral)", color: "var(--nav-bg)" }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      {/* Identity summary — full width, symmetric */}
      <section className="rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-6 md:p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="flex items-center gap-4 md:col-span-2">
            <div
              className="h-16 w-16 shrink-0 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: "var(--coral)", color: "var(--nav-bg)" }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-display text-2xl truncate">{displayName}</div>
              <div className="text-xs text-foreground/60 truncate">{user.email}</div>
            </div>
          </div>
          <Stat icon={<UserRound className="h-3.5 w-3.5" />} label="Role" value={user.role} />
          <Stat icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Status" value="Active" />
        </div>
      </section>

      {/* Two symmetric cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal info */}
        <form onSubmit={handleSave} className="rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-6 md:p-8 flex flex-col">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground/60">
            <UserRound className="h-3.5 w-3.5" />
            <span>01 · Personal info</span>
          </div>
          <h2 className="mt-3 font-display text-2xl">Identity</h2>
          <p className="mt-1 text-xs text-foreground/60">Stored securely in your GeneScope database.</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email" icon={<Mail className="h-3.5 w-3.5" />} value={user.email} readOnly />
            <Field label="Full name" icon={<UserRound className="h-3.5 w-3.5" />} value={fullName} onChange={setFullName} placeholder="Jane Dela Cruz" />
            <Field label="Phone" icon={<Phone className="h-3.5 w-3.5" />} value={phone} onChange={setPhone} placeholder="+63 900 000 0000" />
            <Field label="Organization" icon={<Building2 className="h-3.5 w-3.5" />} value={organization} onChange={setOrganization} placeholder="FEU Institute of Technology" />
          </div>
          <div className="mt-4">
            <label className="block text-[11px] uppercase tracking-[0.2em] text-foreground/60 mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="A short description of your role or research focus."
              className="w-full rounded-2xl border border-foreground/15 bg-background/40 px-4 py-3 text-sm focus:outline-none focus:border-coral resize-none"
            />
          </div>

          <div className="mt-auto pt-6 flex items-center gap-4 min-h-[52px]">
            <div className="flex-1 min-h-[20px]">
              {status && (
                <span className={`text-xs ${status.kind === "ok" ? "text-emerald-400" : "text-coral"}`}>
                  {status.msg}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50 transition hover:opacity-90"
              style={{ background: "var(--surface-strong)", color: "var(--nav-bg)" }}
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>

        {/* Password */}
        <form onSubmit={handlePassword} className="rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-6 md:p-8 flex flex-col">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground/60">
            <KeyRound className="h-3.5 w-3.5" />
            <span>02 · Security</span>
          </div>
          <h2 className="mt-3 font-display text-2xl">Change password</h2>
          <p className="mt-1 text-xs text-foreground/60">Use at least 8 characters. You'll stay signed in.</p>

          <div className="mt-6 space-y-4">
            <Field label="Current password" type="password" value={currentPw} onChange={setCurrentPw} />
            <Field label="New password" type="password" value={newPw} onChange={setNewPw} />
            <Field label="Confirm new password" type="password" value={confirmPw} onChange={setConfirmPw} />
          </div>

          <div className="mt-auto pt-6 flex items-center gap-4 min-h-[52px]">
            <div className="flex-1 min-h-[20px]">
              {pwStatus && (
                <span className={`text-xs ${pwStatus.kind === "ok" ? "text-emerald-400" : "text-coral"}`}>
                  {pwStatus.msg}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={pwSaving || !currentPw || !newPw}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50 transition hover:opacity-90"
              style={{ background: "var(--surface-strong)", color: "var(--nav-bg)" }}
            >
              <KeyRound className="h-4 w-4" />
              {pwSaving ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-background/30 px-4 py-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-foreground/60">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 font-display text-lg capitalize">{value}</div>
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
  icon,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-foreground/60 mb-1.5">
        {icon}
        {label}
      </span>
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
