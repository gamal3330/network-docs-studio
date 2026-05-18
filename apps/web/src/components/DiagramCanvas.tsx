import { useEffect, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  SelectionMode,
  useReactFlow
} from "@xyflow/react";
import { DeviceNode } from "./DeviceNode";
import type { DeviceNodeData } from "./DeviceNode";
import { t } from "../lib/i18n";
import { PublishPanel } from "./PublishPanel";
import { useAuthStore } from "../store/authStore";
import { toEdges, toNodes, useDiagramStore } from "../store/diagramStore";

const nodeTypes = { device: DeviceNode };

export function DiagramCanvas() {
  const {
    devices,
    connections,
    search,
    selectedDeviceId,
    lastAddedDeviceId,
    readOnlyPreview,
    selectDevice,
    onNodesChange,
    moveDevice,
    addConnection
  } = useDiagramStore();
  const user = useAuthStore((state) => state.user);
  const canEdit = user?.role === "admin" || user?.role === "editor";
  const { setCenter } = useReactFlow();
  const nodes = useMemo(
    () => toNodes(devices, connections, search, selectedDeviceId),
    [connections, devices, search, selectedDeviceId]
  );
  const edges = useMemo(() => toEdges(connections), [connections]);
  const lastAddedDevice = useMemo(
    () => devices.find((device) => device.id === lastAddedDeviceId),
    [devices, lastAddedDeviceId]
  );

  useEffect(() => {
    if (!lastAddedDevice) return;

    window.requestAnimationFrame(() => {
      setCenter(lastAddedDevice.x + 115, lastAddedDevice.y + 70, {
        duration: 450,
        zoom: 1
      });
    });
  }, [lastAddedDevice, setCenter]);

  return (
    <main className="relative min-w-0 flex-1 bg-panel dark:bg-slate-900">
      <ReactFlow
        className="nds-flow"
        colorMode="system"
        defaultEdgeOptions={{ interactionWidth: 28 }}
        edges={edges}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        maxZoom={2}
        minZoom={0.2}
        multiSelectionKeyCode={["Meta", "Shift"]}
        nodes={nodes}
        nodesConnectable={!readOnlyPreview && canEdit}
        nodesDraggable={!readOnlyPreview && canEdit}
        nodeTypes={nodeTypes}
        onConnect={canEdit ? addConnection : undefined}
        onNodeClick={(_, node) => selectDevice(node.id)}
        onNodeDragStart={(_, node) => selectDevice(node.id)}
        onNodeDragStop={canEdit ? (_, node) => moveDevice(node.id, node.position) : undefined}
        onNodesChange={canEdit ? onNodesChange : undefined}
        onPaneClick={() => selectDevice(undefined)}
        panOnScroll
        proOptions={{ hideAttribution: true }}
        selectionMode={SelectionMode.Partial}
        snapGrid={[24, 24]}
        snapToGrid
      >
        <Panel position="top-left">
          <div className="rounded-md border border-slate-200 bg-white/95 px-3 py-2 text-xs font-bold text-slate-700 shadow-soft dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-300">
            {nodes.length} {t("canvasCount")}
          </div>
        </Panel>
        <Background color="#94a3b8" gap={24} size={1.2} variant={BackgroundVariant.Dots} />
        <MiniMap
          maskColor="rgba(15, 23, 42, 0.08)"
          nodeBorderRadius={8}
          nodeColor={(node) =>
            node.id === selectedDeviceId ? "#0ea5e9" : String((node.data as DeviceNodeData).device.color)
          }
          pannable
          zoomable
        />
        <Controls position="bottom-right" />
      </ReactFlow>
      <PublishPanel />
    </main>
  );
}
