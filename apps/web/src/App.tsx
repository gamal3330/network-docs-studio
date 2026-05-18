import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DevicePalette } from "./components/DevicePalette";
import { DiagramCanvas } from "./components/DiagramCanvas";
import { Inspector } from "./components/Inspector";
import { LoginPage } from "./components/LoginPage";
import { StatusToast } from "./components/StatusToast";
import { TopBar } from "./components/TopBar";
import { UserAdmin } from "./components/UserAdmin";
import { useAuthStore } from "./store/authStore";
import { useDiagramStore } from "./store/diagramStore";

export function App() {
  const darkMode = useDiagramStore((state) => state.darkMode);
  const loadDiagrams = useDiagramStore((state) => state.loadDiagrams);
  const loadDiagram = useDiagramStore((state) => state.loadDiagram);
  const hydrate = useAuthStore((state) => state.hydrate);
  const authReady = useAuthStore((state) => state.authReady);
  const user = useAuthStore((state) => state.user);
  const [showUsers, setShowUsers] = useState(false);

  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!user) return;
    void loadDiagrams();
    void loadDiagram("main-network");
  }, [loadDiagram, loadDiagrams, user]);

  if (!authReady) return null;
  if (!user) return <LoginPage />;

  return (
    <div className={darkMode ? "dark" : ""} lang="en">
      <motion.div
        animate={{ opacity: 1 }}
        className="flex h-screen min-h-[720px] flex-col overflow-hidden bg-white text-slate-950 dark:bg-slate-950"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <TopBar onManageUsers={() => setShowUsers(true)} />
        <StatusToast />
        <div className="flex min-h-0 flex-1">
          <DevicePalette />
          <DiagramCanvas />
          <Inspector />
        </div>
        {showUsers ? <UserAdmin onClose={() => setShowUsers(false)} /> : null}
      </motion.div>
    </div>
  );
}
