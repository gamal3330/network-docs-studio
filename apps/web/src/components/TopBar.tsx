import {
  AlignCenter,
  Download,
  Eye,
  FilePlus2,
  LogOut,
  Moon,
  Plus,
  Redo2,
  Save,
  Search,
  Share2,
  Sun,
  Users,
  Undo2
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { copyText, exportDiagram, getPublicDiagramUrl } from "../lib/exportDiagram";
import { t } from "../lib/i18n";
import { useAuthStore } from "../store/authStore";
import { useDiagramStore } from "../store/diagramStore";

export function TopBar({ onManageUsers }: { onManageUsers: () => void }) {
  const {
    diagram,
    diagrams,
    search,
    darkMode,
    readOnlyPreview,
    setSearch,
    createDiagram,
    loadDiagram,
    addDevice,
    autoAlign,
    undo,
    redo,
    saveCurrentDiagram,
    toggleDarkMode,
    toggleReadOnlyPreview,
    showToast,
    getCurrentDiagram
  } = useDiagramStore();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const canEdit = user?.role === "admin" || user?.role === "editor";
  const { screenToFlowPosition } = useReactFlow();
  const addServerToViewport = () => {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });

    addDevice("server", {
      x: Math.round(position.x / 24) * 24,
      y: Math.round(position.y / 24) * 24
    });
  };

  const shareDiagram = async () => {
    await copyText(getPublicDiagramUrl(diagram.slug));
    showToast(t("shareCopied"));
  };

  const exportSvg = async () => {
    await exportDiagram(getCurrentDiagram(), "svg");
    showToast(t("exportedSvg"));
  };

  const switchDiagram = (slug: string) => {
    void loadDiagram(slug);
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex min-w-[210px] items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">
            ND
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-slate-950 dark:text-white">{diagram.name}</h1>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">/connections/{diagram.slug}</p>
          </div>
        </div>
      </div>

      <div className="hidden min-w-[210px] max-w-[260px] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-2 dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <select
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none dark:text-slate-100"
          title={t("diagrams")}
          value={diagram.slug}
          onChange={(event) => switchDiagram(event.target.value)}
        >
          {diagrams.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden min-w-[240px] flex-1 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900 md:flex">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {canEdit ? (
          <>
            <div className="hidden items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900 lg:flex">
              <button className="compact-icon-btn" title={t("undo")} onClick={undo}>
                <Undo2 />
              </button>
              <button className="compact-icon-btn" title={t("redo")} onClick={redo}>
                <Redo2 />
              </button>
            </div>

            <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
              <button className="compact-icon-btn" title={t("add")} onClick={addServerToViewport}>
                <Plus />
              </button>
              <button className="compact-icon-btn" title={t("newDiagram")} onClick={() => void createDiagram()}>
                <FilePlus2 />
              </button>
              <button className="compact-icon-btn" title={t("autoAlign")} onClick={autoAlign}>
                <AlignCenter />
              </button>
            </div>

            <button className="primary-toolbar-btn" title={t("save")} onClick={() => void saveCurrentDiagram()}>
              <Save className="h-4 w-4" />
              <span>{t("save")}</span>
            </button>
          </>
        ) : (
          <span className="hidden rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:inline-flex">
            {t("viewerMode")}
          </span>
        )}

        <div className="hidden items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900 sm:flex">
          <button
            className={
              readOnlyPreview ? "compact-icon-btn border-sky-300 bg-sky-100 text-sky-700 dark:bg-sky-950" : "compact-icon-btn"
            }
            title={readOnlyPreview ? t("exitPreview") : t("preview")}
            onClick={toggleReadOnlyPreview}
          >
            <Eye />
          </button>
          <button className="compact-icon-btn" title={t("share")} onClick={shareDiagram}>
            <Share2 />
          </button>
          <button className="compact-icon-btn" title={t("export")} onClick={exportSvg}>
            <Download />
          </button>
          <button className="compact-icon-btn" title={t("toggleDark")} onClick={toggleDarkMode}>
            {darkMode ? <Sun /> : <Moon />}
          </button>
          {user?.role === "admin" ? (
            <button className="compact-icon-btn" title={t("manageUsers")} onClick={onManageUsers}>
              <Users />
            </button>
          ) : null}
          <button className="compact-icon-btn" title={t("logout")} onClick={logout}>
            <LogOut />
          </button>
        </div>
      </div>
    </header>
  );
}
