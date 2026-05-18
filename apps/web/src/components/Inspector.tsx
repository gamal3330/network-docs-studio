import { useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal, Trash2 } from "lucide-react";
import { labelForOption, t } from "../lib/i18n";
import { useAuthStore } from "../store/authStore";
import { connectionKinds, connectionMedia, useDiagramStore } from "../store/diagramStore";
import type { DeviceStatus, DeviceType } from "@nds/shared";

const deviceTypes: DeviceType[] = [
  "router",
  "switch",
  "firewall",
  "server",
  "cloud",
  "database",
  "wireless",
  "endpoint",
  "custom"
];
const statuses: DeviceStatus[] = ["healthy", "warning", "critical", "offline", "unknown"];

export function Inspector() {
  const {
    devices,
    connections,
    selectedDeviceId,
    updateDevice,
    removeDevice,
    updateConnectionStyle
  } = useDiagramStore();
  const user = useAuthStore((state) => state.user);
  const [collapsed, setCollapsed] = useState(false);
  const canEdit = user?.role === "admin" || user?.role === "editor";
  const selected = devices.find((device) => device.id === selectedDeviceId);

  if (collapsed) {
    return (
      <aside className="hidden w-14 shrink-0 border-inline-start border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950 xl:flex xl:flex-col xl:items-center">
        <button
          className="compact-icon-btn"
          title="Expand device details"
          onClick={() => setCollapsed(false)}
        >
          <ChevronLeft />
        </button>
        <div className="mt-4 grid h-9 w-9 place-items-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
          <SlidersHorizontal className="h-4 w-4" />
        </div>
        <div className="mt-16 flex -rotate-90 whitespace-nowrap text-xs font-bold uppercase tracking-wider text-slate-400">
          Device details
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden w-80 shrink-0 overflow-y-auto border-inline-start border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 xl:block">
      {selected ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white">{t("deviceDetails")}</h2>
            <div className="flex items-center gap-1">
              <button className="compact-icon-btn" title="Collapse device details" onClick={() => setCollapsed(true)}>
                <ChevronRight />
              </button>
              {canEdit ? (
                <button className="compact-icon-btn" title={t("removeDevice")} onClick={() => removeDevice(selected.id)}>
                  <Trash2 />
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <Field disabled={!canEdit} label={t("name")} value={selected.name} onChange={(name) => updateDevice(selected.id, { name })} />
            <Field
              disabled={!canEdit}
              label="IP"
              value={selected.ipAddress ?? ""}
              onChange={(ipAddress) => updateDevice(selected.id, { ipAddress })}
            />
            <Select
              disabled={!canEdit}
              label={t("type")}
              value={selected.type}
              options={deviceTypes}
              onChange={(type) => updateDevice(selected.id, { type: type as DeviceType })}
            />
            <Field
              disabled={!canEdit}
              label={t("location")}
              value={selected.location ?? ""}
              onChange={(location) => updateDevice(selected.id, { location })}
            />
            <Select
              disabled={!canEdit}
              label={t("status")}
              value={selected.status}
              options={statuses}
              onChange={(status) => updateDevice(selected.id, { status: status as DeviceStatus })}
            />
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("color")}
              <input
                className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900"
                type="color"
                value={selected.color}
                disabled={!canEdit}
                onChange={(event) => updateDevice(selected.id, { color: event.target.value })}
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("notes")}
              <textarea
                className="mt-1 h-24 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                disabled={!canEdit}
                value={selected.notes ?? ""}
                onChange={(event) => updateDevice(selected.id, { notes: event.target.value })}
              />
            </label>
          </div>
        </>
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white">{t("deviceDetails")}</h2>
            <button className="compact-icon-btn" title="Collapse device details" onClick={() => setCollapsed(true)}>
              <ChevronRight />
            </button>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{t("selectNode")}</p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-sm font-bold text-slate-950 dark:text-white">{t("connections")}</h2>
        <div className="mt-3 space-y-3">
          {connections.map((connection) => (
            <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800" key={connection.id}>
              <Field
                disabled={!canEdit}
                label={t("label")}
                value={connection.label ?? ""}
                onChange={(label) => updateConnectionStyle(connection.id, { label })}
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Select
                  disabled={!canEdit}
                  label={t("kind")}
                  value={connection.kind}
                  options={connectionKinds}
                  onChange={(kind) => updateConnectionStyle(connection.id, { kind: kind as never })}
                />
                <Select
                  disabled={!canEdit}
                  label={t("media")}
                  value={connection.media}
                  options={connectionMedia}
                  onChange={(media) => updateConnectionStyle(connection.id, { media: media as never })}
                />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <input
                  className="h-9 w-12 rounded-md border border-slate-200 dark:border-slate-800"
                  type="color"
                  value={connection.color}
                  disabled={!canEdit}
                  onChange={(event) => updateConnectionStyle(connection.id, { color: event.target.value })}
                />
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <input
                    checked={connection.dashed}
                    disabled={!canEdit}
                    type="checkbox"
                    onChange={(event) => updateConnectionStyle(connection.id, { dashed: event.target.checked })}
                  />
                  {t("dashed")}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Field({
  label,
  value,
  disabled,
  onChange
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {label}
      <input
        className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Select({
  label,
  value,
  disabled,
  options,
  onChange
}: {
  label: string;
  value: string;
  disabled?: boolean;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {label}
      <select
        className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labelForOption(option)}
          </option>
        ))}
      </select>
    </label>
  );
}
