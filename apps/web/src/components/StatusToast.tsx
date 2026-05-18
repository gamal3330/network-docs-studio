import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, EyeOff, X } from "lucide-react";
import { useEffect } from "react";
import { t } from "../lib/i18n";
import { useDiagramStore } from "../store/diagramStore";

export function StatusToast() {
  const { toast, readOnlyPreview, showToast, toggleReadOnlyPreview } = useDiagramStore();

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => showToast(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [showToast, toast]);

  return (
    <>
      <div className="absolute left-1/2 top-20 z-30 flex -translate-x-1/2 items-center gap-2">
        {readOnlyPreview ? (
          <Badge icon={EyeOff} label={t("previewBadge")} onClose={toggleReadOnlyPreview} />
        ) : null}
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="absolute end-6 top-20 z-40 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-soft dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: -8 }}
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function Badge({ icon: Icon, label, onClose }: { icon: typeof EyeOff; label: string; onClose?: () => void }) {
  return (
    <div className="flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white/95 px-3 text-xs font-bold text-slate-700 shadow-soft dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-300">
      <Icon className="h-3.5 w-3.5" />
      {label}
      {onClose ? (
        <button
          className="-me-1 grid h-5 w-5 place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          onClick={onClose}
          title={t("exitPreview")}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
