// Role-based access control for GeneScope.
// Approved roles: admin, researcher, clinician, viewer.
// pending/denied are blocked at the auth layer.

export type Role = "admin" | "researcher" | "clinician" | "viewer" | string;

export type Permission =
  | "predict.run"       // execute the model (POST /predict)
  | "predict.view"      // see the Predict page
  | "performance.view"  // see Performance / model-eval page
  | "history.view"
  | "dashboard.view"
  | "about.view"
  | "profile.view";

const MATRIX: Record<string, Permission[]> = {
  admin:      ["predict.run", "predict.view", "performance.view", "history.view", "dashboard.view", "about.view", "profile.view"],
  researcher: ["predict.run", "predict.view", "performance.view", "history.view", "dashboard.view", "about.view", "profile.view"],
  clinician:  ["predict.run", "predict.view",                     "history.view", "dashboard.view", "about.view", "profile.view"],
  viewer:     [               "predict.view",                     "history.view", "dashboard.view", "about.view", "profile.view"],
  // legacy fallbacks — treat as researcher-equivalent
  developer:  ["predict.run", "predict.view", "performance.view", "history.view", "dashboard.view", "about.view", "profile.view"],
  client:     [               "predict.view",                     "history.view", "dashboard.view", "about.view", "profile.view"],
};

export function normalizeRole(role?: string | null): string {
  return (role ?? "").trim().toLowerCase();
}

export function can(role: string | null | undefined, permission: Permission): boolean {
  const perms = MATRIX[normalizeRole(role)];
  return !!perms && perms.includes(permission);
}

export const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  researcher: "Researcher",
  clinician: "Clinician",
  viewer: "Viewer (read-only)",
  developer: "Developer",
  client: "Client",
};
