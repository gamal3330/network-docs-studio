import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  Database,
  Monitor,
  Network,
  Router,
  Server,
  Shield,
  Wifi
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import type { DeviceType } from "@nds/shared";
import { deviceTypeLabels, t } from "../lib/i18n";
import { useAuthStore } from "../store/authStore";
import { useDiagramStore } from "../store/diagramStore";

const palette: Array<{ type: DeviceType; icon: typeof Server }> = [
  { type: "router", icon: Router },
  { type: "switch", icon: Network },
  { type: "firewall", icon: Shield },
  { type: "server", icon: Server },
  { type: "cloud", icon: Cloud },
  { type: "database", icon: Database },
  { type: "wireless", icon: Wifi },
  { type: "endpoint", icon: Monitor }
];

export function DevicePalette() {
  const addDevice = useDiagramStore((state) => state.addDevice);
  const deviceCount = useDiagramStore((state) => state.devices.length);
  const user = useAuthStore((state) => state.user);
  const [collapsed, setCollapsed] = useState(false);
  const canEdit = user?.role === "admin" || user?.role === "editor";
  const { screenToFlowPosition } = useReactFlow();

  const addDeviceToViewport = (type: DeviceType) => {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });

    addDevice(type, {
      x: Math.round(position.x / 24) * 24,
      y: Math.round(position.y / 24) * 24
    });
  };

  if (collapsed) {
    return (
      <aside className="hidden w-14 shrink-0 border-inline-end border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950 lg:flex lg:flex-col lg:items-center">
        <button
          className="compact-icon-btn"
          title="Expand devices"
          onClick={() => setCollapsed(false)}
        >
          <ChevronRight />
        </button>
        <div className="mt-4 grid h-9 w-9 place-items-center rounded-md bg-slate-100 text-xs font-black text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          {deviceCount}
        </div>
        <div className="mt-4 flex -rotate-90 whitespace-nowrap text-xs font-bold uppercase tracking-wider text-slate-400">
          {t("devices")}
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden w-64 shrink-0 border-inline-end border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 lg:block">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t("devices")}
          </h2>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            {deviceCount}
          </span>
        </div>
        <button className="compact-icon-btn" title="Collapse devices" onClick={() => setCollapsed(true)}>
          <ChevronLeft />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {palette.map(({ type, icon: Icon }) => (
          <button
            className="flex h-20 flex-col items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 transition enabled:hover:border-sky-400 enabled:hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:enabled:hover:bg-slate-800"
            disabled={!canEdit}
            key={type}
            onClick={() => addDeviceToViewport(type)}
            title={canEdit ? `Add ${deviceTypeLabels[type]}` : t("viewerMode")}
          >
            <Icon className="h-5 w-5" />
            {deviceTypeLabels[type]}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t("connectionClarity")}
        </h2>
        <div className="mt-3 space-y-3 text-xs text-slate-600 dark:text-slate-400">
          <Legend color="#22c55e" label="Solid: physical links" />
          <Legend color="#14b8a6" dashed label="Dashed: overlay tunnels" />
          <Legend color="#6366f1" wide label="Thick: merged path" />
          <Legend color="#a855f7" label="Animated: wireless/VPN" />
        </div>
      </div>
    </aside>
  );
}

function Legend({ color, label, dashed, wide }: { color: string; label: string; dashed?: boolean; wide?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="h-0 w-12 rounded-full border-t"
        style={{
          borderColor: color,
          borderTopWidth: wide ? 4 : 3,
          borderStyle: dashed ? "dashed" : "solid"
        }}
      />
      <span>{label}</span>
    </div>
  );
}
