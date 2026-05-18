import type { Connection, Edge, NodeChange } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import { create } from "zustand";
import type { ConnectionKind, ConnectionMedia, Device, Diagram, NetworkConnection } from "@nds/shared";
import type { DeviceFlowNode } from "../components/DeviceNode";
import { fetchDiagram, fetchDiagrams, saveDiagram } from "../lib/api";
import { deviceTypeLabels, t } from "../lib/i18n";
import { sampleDiagram } from "../lib/sampleDiagram";

type Snapshot = Pick<DiagramState, "devices" | "connections">;

type DiagramState = {
  diagram: Diagram;
  diagrams: Diagram[];
  devices: Device[];
  connections: NetworkConnection[];
  selectedDeviceId?: string;
  lastAddedDeviceId?: string;
  readOnlyPreview: boolean;
  toast?: string;
  search: string;
  darkMode: boolean;
  history: Snapshot[];
  future: Snapshot[];
  loadDiagrams: () => Promise<void>;
  loadDiagram: (slug: string) => Promise<void>;
  createDiagram: () => Promise<void>;
  saveCurrentDiagram: () => Promise<void>;
  getCurrentDiagram: () => Diagram;
  setVisibility: (visibility: Diagram["visibility"]) => void;
  toggleReadOnlyPreview: () => void;
  showToast: (message: string) => void;
  setSearch: (search: string) => void;
  toggleDarkMode: () => void;
  selectDevice: (id?: string) => void;
  addDevice: (type?: Device["type"], position?: { x: number; y: number }) => void;
  updateDevice: (id: string, patch: Partial<Device>) => void;
  moveDevice: (id: string, position: { x: number; y: number }) => void;
  removeDevice: (id: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  addConnection: (connection: Connection) => void;
  updateConnectionStyle: (id: string, patch: Partial<NetworkConnection>) => void;
  autoAlign: () => void;
  undo: () => void;
  redo: () => void;
};

const colors = ["#0ea5e9", "#22c55e", "#f97316", "#6366f1", "#14b8a6", "#e11d48"];

function snapshot(state: DiagramState): Snapshot {
  return {
    devices: structuredClone(state.devices),
    connections: structuredClone(state.connections)
  };
}

function withHistory(state: DiagramState, patch: Partial<DiagramState>): Partial<DiagramState> {
  return {
    ...patch,
    history: [...state.history, snapshot(state)].slice(-40),
    future: []
  };
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  diagram: sampleDiagram,
  diagrams: [sampleDiagram],
  devices: sampleDiagram.devices,
  connections: sampleDiagram.connections,
  selectedDeviceId: sampleDiagram.devices[1]?.id,
  lastAddedDeviceId: undefined,
  readOnlyPreview: false,
  toast: undefined,
  search: "",
  darkMode: false,
  history: [],
  future: [],
  loadDiagrams: async () => {
    try {
      const diagrams = await fetchDiagrams();
      set({ diagrams });
    } catch {
      set({ toast: t("loadFailed") });
    }
  },
  loadDiagram: async (slug) => {
    try {
      const diagram = await fetchDiagram(slug);
      set({
        diagram,
        diagrams: await fetchDiagrams().catch(() => get().diagrams),
        devices: diagram.devices,
        connections: diagram.connections,
        selectedDeviceId: diagram.devices[0]?.id,
        history: [],
        future: [],
        toast: t("loaded")
      });
    } catch {
      set({ toast: t("loadFailed") });
    }
  },
  saveCurrentDiagram: async () => {
    try {
      const diagram = await saveDiagram(get().getCurrentDiagram());
      set({
        diagram,
        diagrams: await fetchDiagrams().catch(() => get().diagrams),
        devices: diagram.devices,
        connections: diagram.connections,
        history: [],
        future: [],
        toast: t("saved")
      });
    } catch {
      set({ toast: t("saveFailed") });
    }
  },
  createDiagram: async () => {
    const state = get();
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const diagram: Diagram = {
      id,
      teamId: state.diagram.teamId,
      name: `New Diagram ${state.diagrams.length + 1}`,
      slug: `diagram-${timestamp}`,
      description: "",
      visibility: "private",
      devices: [],
      connections: [],
      updatedAt: new Date().toISOString()
    };

    try {
      const saved = await saveDiagram(diagram);
      const diagrams = await fetchDiagrams().catch(() => [...state.diagrams, saved]);
      set({
        diagram: saved,
        diagrams,
        devices: [],
        connections: [],
        selectedDeviceId: undefined,
        lastAddedDeviceId: undefined,
        history: [],
        future: [],
        search: "",
        toast: t("newDiagramCreated")
      });
    } catch {
      set({ toast: t("saveFailed") });
    }
  },
  getCurrentDiagram: () => {
    const state = get();
    return {
      ...state.diagram,
      devices: state.devices,
      connections: state.connections,
      updatedAt: new Date().toISOString()
    };
  },
  setVisibility: (visibility) =>
    set((state) => ({
      diagram: { ...state.diagram, visibility, updatedAt: new Date().toISOString() },
      toast: visibility === "public" ? t("publicLinkEnabled") : t("diagramPrivate")
    })),
  toggleReadOnlyPreview: () =>
    set((state) => ({
      readOnlyPreview: !state.readOnlyPreview,
      toast: !state.readOnlyPreview ? t("previewOn") : t("editModeOn")
    })),
  showToast: (message) => set({ toast: message }),
  setSearch: (search) => set({ search }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  selectDevice: (id) => set({ selectedDeviceId: id }),
  addDevice: (type = "server", position) =>
    set((state) => {
      if (state.readOnlyPreview) {
        return { toast: t("readOnlyEnabled") };
      }

      const id = crypto.randomUUID();
      const nextDevice: Device = {
        id,
        name: `${t("newDeviceSuffix")} ${deviceTypeLabels[type]}`,
        ipAddress: "10.0.0.10",
        type,
        icon: type,
        location: t("unassigned"),
        notes: "",
        status: "unknown",
        color: colors[state.devices.length % colors.length],
        x: position?.x ?? 220 + state.devices.length * 40,
        y: position?.y ?? 260 + state.devices.length * 24
      };

      return withHistory(state, {
        devices: [...state.devices, nextDevice],
        selectedDeviceId: id,
        lastAddedDeviceId: id,
        search: ""
      });
    }),
  updateDevice: (id, patch) =>
    set((state) =>
      state.readOnlyPreview
        ? { toast: t("readOnlyEnabled") }
        : withHistory(state, {
            devices: state.devices.map((device) => (device.id === id ? { ...device, ...patch } : device))
          })
    ),
  moveDevice: (id, position) =>
    set((state) => ({
      devices: state.devices.map((device) =>
        device.id === id ? { ...device, x: position.x, y: position.y } : device
      ),
      selectedDeviceId: id
    })),
  removeDevice: (id) =>
    set((state) =>
      state.readOnlyPreview
        ? { toast: t("readOnlyEnabled") }
        : withHistory(state, {
            devices: state.devices.filter((device) => device.id !== id),
            connections: state.connections.filter(
              (connection) => connection.sourceId !== id && connection.targetId !== id
            ),
            selectedDeviceId: state.selectedDeviceId === id ? undefined : state.selectedDeviceId
          })
    ),
  onNodesChange: (changes) => {
    const positionChanges = changes.filter(
      (change): change is NodeChange & { id: string; position: { x: number; y: number } } =>
        change.type === "position" && Boolean("position" in change && change.position)
    );

    if (positionChanges.length === 0) {
      return;
    }

    set((current) =>
      ({
        devices: current.devices.map((device) => {
          const change = positionChanges.find((item) => item.id === device.id);
          return change ? { ...device, x: change.position.x, y: change.position.y } : device;
        })
      })
    );
  },
  addConnection: (connection) => {
    if (get().readOnlyPreview) {
      set({ toast: t("readOnlyEnabled") });
      return;
    }

    if (!connection.source || !connection.target) return;
    set((state) =>
      withHistory(state, {
        connections: [
          ...state.connections,
          {
            id: crypto.randomUUID(),
            sourceId: connection.source,
            targetId: connection.target,
            label: t("newConnection"),
            kind: "two-way",
            media: "ethernet",
            color: "#22c55e",
            dashed: false
          }
        ]
      })
    );
  },
  updateConnectionStyle: (id, patch) =>
    set((state) =>
      state.readOnlyPreview
        ? { toast: t("readOnlyEnabled") }
        : withHistory(state, {
            connections: state.connections.map((connection) =>
              connection.id === id ? { ...connection, ...patch } : connection
            )
          })
    ),
  autoAlign: () =>
    set((state) =>
      state.readOnlyPreview
        ? { toast: t("readOnlyEnabled") }
        : withHistory(state, {
            devices: state.devices.map((device, index) => ({
              ...device,
              x: 140 + (index % 3) * 330,
              y: 100 + Math.floor(index / 3) * 220
            }))
          })
    ),
  undo: () =>
    set((state) => {
      const previous = state.history.at(-1);
      if (!previous) return state;
      return {
        devices: previous.devices,
        connections: previous.connections,
        history: state.history.slice(0, -1),
        future: [snapshot(state), ...state.future]
      };
    }),
  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next) return state;
      return {
        devices: next.devices,
        connections: next.connections,
        history: [...state.history, snapshot(state)],
        future: state.future.slice(1)
      };
    })
}));

export function toNodes(
  devices: Device[],
  connections: NetworkConnection[],
  search: string,
  selectedDeviceId?: string
): DeviceFlowNode[] {
  const normalizedSearch = search.trim().toLowerCase();
  const connectedCounts = connections.reduce<Record<string, number>>((acc, connection) => {
    acc[connection.sourceId] = (acc[connection.sourceId] ?? 0) + 1;
    acc[connection.targetId] = (acc[connection.targetId] ?? 0) + 1;
    return acc;
  }, {});

  return devices.map<DeviceFlowNode>((device) => ({
    id: device.id,
    type: "device",
    position: { x: device.x, y: device.y },
    selected: device.id === selectedDeviceId,
    data: {
      device,
      matchesSearch:
        !normalizedSearch ||
        [device.name, device.ipAddress, device.location, device.type].some((value) =>
          value?.toLowerCase().includes(normalizedSearch)
        ),
      connectionCount: connectedCounts[device.id] ?? 0
    }
  }));
}

export function toEdges(connections: NetworkConnection[]): Edge[] {
  return connections.map((connection) => {
    const animated = connection.media === "wireless" || connection.media === "vpn";
    const markerEnd =
      connection.kind === "one-way" || connection.kind === "two-way" ? { type: MarkerType.ArrowClosed } : undefined;
    const markerStart = connection.kind === "two-way" ? { type: MarkerType.ArrowClosed } : undefined;

    return {
      id: connection.id,
      source: connection.sourceId,
      target: connection.targetId,
      label: connection.label,
      type: connection.kind === "merged" ? "smoothstep" : "bezier",
      animated,
      markerEnd,
      markerStart,
      data: connection,
      style: {
        stroke: connection.color,
        strokeWidth: connection.kind === "merged" ? 4 : 3,
        strokeDasharray: connection.dashed ? "9 7" : undefined
      },
      labelStyle: {
        fill: "#0f172a",
        fontWeight: 700,
        fontSize: 12
      },
      labelBgStyle: {
        fill: "rgba(255, 255, 255, 0.94)",
        stroke: connection.color,
        strokeWidth: 1
      },
      labelBgPadding: [8, 5],
      labelBgBorderRadius: 7
    };
  });
}

export const connectionKinds: ConnectionKind[] = ["one-way", "two-way", "fork", "merged"];
export const connectionMedia: ConnectionMedia[] = ["ethernet", "fiber", "wireless", "vpn", "internet", "custom"];
