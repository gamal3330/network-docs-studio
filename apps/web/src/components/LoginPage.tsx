import { FormEvent, useState } from "react";
import { Network } from "lucide-react";
import { t } from "../lib/i18n";
import { useAuthStore } from "../store/authStore";

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("admin@local.test");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch {
      setError("Invalid login details");
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-white">
      <form className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-soft" onSubmit={submit}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-white text-slate-950">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black">Network Docs Studio</h1>
              <p className="text-sm text-slate-400">{t("login")}</p>
            </div>
          </div>
        </div>

        <label className="block text-sm font-bold text-slate-300">
          Email
          <input
            className="mt-2 h-11 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-white outline-none focus:border-sky-400"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="mt-4 block text-sm font-bold text-slate-300">
          {t("password")}
          <input
            className="mt-2 h-11 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-white outline-none focus:border-sky-400"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? <p className="mt-4 rounded-md bg-rose-950 px-3 py-2 text-sm text-rose-100">{error}</p> : null}

        <button className="mt-6 h-11 w-full rounded-md bg-white font-black text-slate-950" type="submit">
          {t("login")}
        </button>
      </form>
    </main>
  );
}
