import { FormEvent, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import type { AuthUser } from "../lib/api";
import { t } from "../lib/i18n";
import { useAuthStore } from "../store/authStore";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function UserAdmin({ onClose }: { onClose: () => void }) {
  const users = useAuthStore((state) => state.users);
  const loadUsers = useAuthStore((state) => state.loadUsers);
  const createUser = useAuthStore((state) => state.createUser);
  const updateUser = useAuthStore((state) => state.updateUser);
  const deleteUser = useAuthStore((state) => state.deleteUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AuthUser["role"]>("editor");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!emailPattern.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsCreating(true);
      await createUser({ name: name.trim(), email: email.trim(), password, role });
      setName("");
      setEmail("");
      setPassword("");
      setRole("editor");
      setMessage(t("userCreated"));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to create user.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/50 p-6">
      <section className="max-h-[86vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">{t("userManagement")}</h2>
          <button className="icon-btn" onClick={onClose}>×</button>
        </div>

        <form className="mt-5 grid gap-3 md:grid-cols-5" onSubmit={submit}>
          <input className="field" placeholder={t("name")} value={name} onChange={(event) => setName(event.target.value)} required />
          <input className="field" placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <input className="field" minLength={6} placeholder={t("password")} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <select className="field" value={role} onChange={(event) => setRole(event.target.value as AuthUser["role"])}>
            <option value="admin">{t("admin")}</option>
            <option value="editor">{t("editor")}</option>
            <option value="viewer">{t("viewer")}</option>
          </select>
          <button className="toolbar-btn justify-center disabled:cursor-not-allowed disabled:opacity-60" disabled={isCreating} type="submit">
            {isCreating ? t("creatingUser") : t("createUser")}
          </button>
        </form>

        {error ? (
          <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
            {message}
          </p>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
          {users.map((user) => (
            <div className="grid grid-cols-[1fr_1fr_140px_48px] items-center gap-3 border-b border-slate-200 p-3 text-sm last:border-b-0 dark:border-slate-800" key={user.id}>
              <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
              <div className="text-slate-500">{user.email}</div>
              <select
                className="field h-9"
                value={user.role}
                onChange={(event) => void updateUser(user.id, { role: event.target.value as AuthUser["role"] })}
              >
                <option value="admin">{t("admin")}</option>
                <option value="editor">{t("editor")}</option>
                <option value="viewer">{t("viewer")}</option>
              </select>
              <button className="icon-btn" onClick={() => void deleteUser(user.id)} title={t("deleteUser")}>
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
