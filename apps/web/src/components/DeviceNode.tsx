import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Activity, MapPin } from "lucide-react";
import { clsx } from "clsx";
import type { Device } from "@nds/shared";
import { DeviceIcon } from "../lib/icons";
import { t } from "../lib/i18n";

export type DeviceNodeData = {
  device: Device;
  matchesSearch: boolean;
  connectionCount: number;
};

export type DeviceFlowNode = Node<DeviceNodeData, "device">;

const statusStyles = {
  healthy: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-rose-600",
  offline: "bg-slate-400",
  unknown: "bg-slate-500"
};

export function DeviceNode({ data, selected }: NodeProps<DeviceFlowNode>) {
  const { device, matchesSearch, connectionCount } = data;

  return (
    <div
      className={clsx(
        "group relative w-[230px] cursor-move rounded-lg border bg-white/95 p-3 shadow-soft ring-offset-2 transition dark:border-slate-700 dark:bg-slate-900/96",
        selected && "border-sky-500 ring-2 ring-sky-300",
        !matchesSearch && "opacity-25"
      )}
      style={{ borderTop: `5px solid ${device.color}` }}
    >
      <Handle
        className="!h-3 !w-3 !border-2 !border-white !bg-slate-500"
        position={Position.Left}
        type="target"
      />
      <Handle
        className="!h-3 !w-3 !border-2 !border-white !bg-slate-500"
        position={Position.Right}
        type="source"
      />

      <div className="flex items-start gap-3">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-white"
          style={{ background: device.color }}
        >
          <DeviceIcon type={device.type} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={clsx("h-2.5 w-2.5 rounded-full", statusStyles[device.status])} />
            <h3 className="truncate text-sm font-bold text-slate-950 dark:text-white">{device.name}</h3>
          </div>
          <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{device.ipAddress}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <span className="flex min-w-0 items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{device.location || t("unknown")}</span>
        </span>
        <span className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Activity className="h-3.5 w-3.5" />
          {connectionCount} {t("connections")}
        </span>
      </div>

      {device.notes ? (
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{device.notes}</p>
      ) : null}
    </div>
  );
}
