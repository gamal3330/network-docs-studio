import { Lock, FileImage, FileText, Globe2 } from "lucide-react";
import { copyText, exportDiagram, getPublicDiagramUrl } from "../lib/exportDiagram";
import { t } from "../lib/i18n";
import { useAuthStore } from "../store/authStore";
import { useDiagramStore } from "../store/diagramStore";

export function PublishPanel() {
  const {
    diagram,
    getCurrentDiagram,
    setVisibility,
    showToast
  } = useDiagramStore();
  const user = useAuthStore((state) => state.user);
  const canEdit = user?.role === "admin" || user?.role === "editor";

  const copyPublicLink = async () => {
    setVisibility("public");
    await copyText(getPublicDiagramUrl(diagram.slug));
    showToast(t("publicLinkCopied"));
  };

  const makePrivate = () => {
    setVisibility("private");
  };

  const exportPngAndSvg = async () => {
    const currentDiagram = getCurrentDiagram();
    await exportDiagram(currentDiagram, "png");
    await exportDiagram(currentDiagram, "svg");
    showToast(t("exportedPngSvg"));
  };

  const exportPdf = async () => {
    await exportDiagram(getCurrentDiagram(), "pdf");
    showToast(t("exportedPdf"));
  };

  return (
    <div className="absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-1 rounded-lg border border-slate-200 bg-white/90 p-1.5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:flex">
      {canEdit ? (
        <>
          <Action icon={Lock} label={t("private")} onClick={makePrivate} />
          <Action icon={Globe2} label={t("publicLink")} onClick={copyPublicLink} />
        </>
      ) : null}
      <Action icon={FileImage} label={t("pngSvg")} onClick={exportPngAndSvg} />
      <Action icon={FileText} label={t("pdf")} onClick={exportPdf} />
    </div>
  );
}

function Action({ icon: Icon, label, onClick }: { icon: typeof Lock; label: string; onClick: () => void }) {
  return (
    <button
      className="flex h-9 items-center gap-2 rounded-md px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      onClick={onClick}
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}
