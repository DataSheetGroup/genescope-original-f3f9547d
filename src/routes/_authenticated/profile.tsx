import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Save, KeyRound, Pencil, X, Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import heartPulse from "@/assets/illustrations/heart-pulse.png";
import fireFlask from "@/assets/illustrations/fire-flask.png";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profile — GeneScope" },
      { name: "description", content: "Manage your GeneScope account details and preferences." },
    ],
  }),
});

type EditableKey = "full_name" | "phone" | "organization" | "bio";

function ProfilePage() {
  const { user, updateProfile, changePassword, logout, refresh } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState<Record<EditableKey, string>>({
    full_name: "",
    phone: "",
    organization: "",
    bio: "",
  });
  const [drafts, setDrafts] = useState<Record<EditableKey, string>>({
    full_name: "",
    phone: "",
    organization: "",
    bio: "",
  });
  const [editingKey, setEditingKey] = useState<EditableKey | null>(null);
  const [rowStatus, setRowStatus] = useState<{ key: EditableKey; kind: "ok" | "err"; msg: string } | null>(null);
  const [savingKey, setSavingKey] = useState<EditableKey | null>(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwStatus, setPwStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;
    const next: Record<EditableKey, string> = {
      full_name: user.full_name ?? "",
      phone: user.phone ?? "",
      organization: user.organization ?? "",
      bio: user.bio ?? "",
    };
    setValues(next);
    setDrafts(next);
  }, [user]);

  const startEdit = (key: EditableKey) => {
    setDrafts((d) => ({ ...d, [key]: values[key] }));
    setEditingKey(key);
    setRowStatus(null);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setRowStatus(null);
  };

  const saveRow = async (key: EditableKey) => {
    setSavingKey(key);
    setRowStatus(null);
    try {
      const payload: Record<string, string | null> = {
        full_name: values.full_name || null,
        phone: values.phone || null,
        organization: values.organization || null,
        bio: values.bio || null,
      };
      payload[key] = drafts[key].trim() || null;
      await updateProfile(payload);
      setValues((v) => ({ ...v, [key]: drafts[key].trim() }));
      setEditingKey(null);
      setRowStatus({ key, kind: "ok", msg: "Updated." });
    } catch (err) {
      setRowStatus({ key, kind: "err", msg: err instanceof Error ? err.message : "Could not save." });
    } finally {
      setSavingKey(null);
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

  const displayName = values.full_name?.trim() || user.email.split("@")[0];

  const inputCls =
    "w-full rounded-2xl bg-cream-dim px-4 py-3 text-sm text-card-foreground placeholder:text-card-foreground/40 focus:outline-none focus:ring-2 focus:ring-coral";

  const EditableRow = ({
    label,
    keyName,
    placeholder,
    multiline,
  }: {
    label: string;
    keyName: EditableKey;
    placeholder?: string;
    multiline?: boolean;
  }) => {
    const isEditing = editingKey === keyName;
    const saving = savingKey === keyName;
    return (
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] md:items-center gap-2 md:gap-6 py-4 border-b border-card-foreground/10 last:border-b-0">
        <dt className="eyebrow text-card-foreground/60">{label}</dt>
        <dd className="text-sm leading-relaxed min-w-0">
          {isEditing ? (
            multiline ? (
              <textarea
                autoFocus
                rows={3}
                value={drafts[keyName]}
                onChange={(e) => setDrafts((d) => ({ ...d, [keyName]: e.target.value }))}
                placeholder={placeholder}
                className={`${inputCls} resize-none`}
              />
            ) : (
              <input
                autoFocus
                value={drafts[keyName]}
                onChange={(e) => setDrafts((d) => ({ ...d, [keyName]: e.target.value }))}
                placeholder={placeholder}
                className={inputCls}
              />
            )
          ) : (
            <div className="py-2 text-card-foreground/90">
              {values[keyName] || <span className="text-card-foreground/40">Not set</span>}
            </div>
          )}
          {rowStatus?.key === keyName && (
            <div className={`mt-1 text-xs ${rowStatus.kind === "ok" ? "text-emerald-600" : "text-coral"}`}>
              {rowStatus.msg}
            </div>
          )}
        </dd>
        <div className="flex items-center gap-2 justify-start md:justify-end">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-card-foreground/20 hover:opacity-80"
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => saveRow(keyName)}
                disabled={saving}
                className="inline-flex items-center justify-center h-9 w-9 rounded-full disabled:opacity-50 hover:opacity-90"
                style={{ background: "var(--coral)", color: "var(--nav-bg)" }}
                aria-label="Save"
              >
                {saving ? <Save className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => startEdit(keyName)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-full hover:opacity-90"
              style={{ background: "var(--coral)", color: "var(--nav-bg)" }}
              aria-label={`Edit ${label}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const StaticRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] md:items-center gap-2 md:gap-6 py-4 border-b border-card-foreground/10 last:border-b-0">
      <dt className="eyebrow text-card-foreground/60">{label}</dt>
      <dd className="text-sm text-card-foreground/90 py-2 min-w-0">{value}</dd>
      <div />
    </div>
  );

  const PwField = ({
    value,
    onChange,
    show,
    setShow,
    placeholder,
  }: {
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    setShow: (v: boolean) => void;
    placeholder: string;
  }) => (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} pr-12`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-card-foreground/60 hover:text-card-foreground hover:bg-card-foreground/5"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );

  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 py-16 space-y-10 z-10">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="eyebrow text-coral mb-4">Account</div>
          <h1 className="display-lg">
            Your profile,
            <br />
            <span className="hl">yours to shape.</span>
          </h1>
        </div>

        {/* Identity card */}
        <div className="rounded-3xl bg-card text-card-foreground p-8 md:p-10 relative overflow-hidden">
          <img src={fireFlask} alt="" className="hidden md:block absolute right-6 top-6 w-20 object-contain opacity-90" />
          <div className="eyebrow text-coral mb-2">Identity</div>
          <h2 className="font-display text-3xl mb-6">
            Signed in as <span className="hl">{displayName}</span>
          </h2>
          <dl>
            <StaticRow label="Email" value={user.email} />
            <StaticRow label="Role" value={<span className="capitalize">{user.role}</span>} />
            <EditableRow label="Full name" keyName="full_name" placeholder="Jane Dela Cruz" />
            <EditableRow label="Phone" keyName="phone" placeholder="+63 900 000 0000" />
            <EditableRow label="Organization" keyName="organization" placeholder="FEU Institute of Technology" />
            <EditableRow label="Bio" keyName="bio" placeholder="A short description of your role or research focus." multiline />
          </dl>
        </div>

        {/* Security card */}
        <div className="rounded-3xl bg-card text-card-foreground p-8 md:p-10 relative overflow-hidden">
          <img src={heartPulse} alt="" className="hidden md:block absolute right-6 top-6 w-20 object-contain opacity-90" />
          <div className="eyebrow text-coral mb-2">Security</div>
          <h2 className="font-display text-3xl mb-6">Change your <span className="hl">password</span></h2>
          <form onSubmit={handlePassword} className="space-y-4 max-w-xl">
            <PwField value={currentPw} onChange={setCurrentPw} show={showCurrent} setShow={setShowCurrent} placeholder="Current password" />
            <PwField value={newPw} onChange={setNewPw} show={showNew} setShow={setShowNew} placeholder="New password" />
            <PwField value={confirmPw} onChange={setConfirmPw} show={showConfirm} setShow={setShowConfirm} placeholder="Confirm new password" />
            <div className="flex items-center gap-4 min-h-[44px] pt-2">
              <div className="flex-1 min-h-[20px]">
                {pwStatus && (
                  <span className={`text-xs ${pwStatus.kind === "ok" ? "text-emerald-600" : "text-coral"}`}>
                    {pwStatus.msg}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={pwSaving || !currentPw || !newPw}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50 transition hover:opacity-90"
                style={{ background: "var(--coral)", color: "var(--nav-bg)" }}
              >
                <KeyRound className="h-4 w-4" />
                {pwSaving ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </div>

        {/* Sign out */}
        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider transition hover:opacity-90"
            style={{ background: "var(--surface-strong)", color: "var(--nav-bg)" }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
