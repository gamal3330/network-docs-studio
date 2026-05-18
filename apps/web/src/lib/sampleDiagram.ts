import type { Diagram } from "@nds/shared";

export const sampleDiagram: Diagram = {
  id: "diagram-main",
  teamId: "team-core",
  name: "Main Network",
  slug: "main-network",
  description: "Primary office, cloud, and edge connectivity.",
  visibility: "private",
  updatedAt: new Date().toISOString(),
  devices: [
    {
      id: "internet-edge",
      name: "Internet Edge",
      ipAddress: "203.0.113.10",
      type: "cloud",
      icon: "Cloud",
      location: "ISP handoff",
      notes: "Primary upstream provider",
      status: "healthy",
      color: "#0ea5e9",
      x: 120,
      y: 120
    },
    {
      id: "fw-core",
      name: "Core Firewall",
      ipAddress: "10.10.0.1",
      type: "firewall",
      icon: "Shield",
      location: "HQ - Rack A",
      notes: "Active/standby HA pair",
      status: "warning",
      color: "#f97316",
      x: 430,
      y: 120
    },
    {
      id: "core-switch",
      name: "Core Switch",
      ipAddress: "10.10.0.2",
      type: "switch",
      icon: "Network",
      location: "HQ - Rack A",
      notes: "Layer 3 aggregation",
      status: "healthy",
      color: "#22c55e",
      x: 760,
      y: 120
    },
    {
      id: "prod-cluster",
      name: "Production Cluster",
      ipAddress: "10.20.1.20",
      type: "server",
      icon: "Server",
      location: "Cloud VPC",
      notes: "Customer workloads",
      status: "healthy",
      color: "#6366f1",
      x: 1070,
      y: 20
    },
    {
      id: "branch-vpn",
      name: "Branch VPN",
      ipAddress: "10.30.0.1",
      type: "router",
      icon: "Router",
      location: "Branch office",
      notes: "WireGuard tunnel",
      status: "healthy",
      color: "#14b8a6",
      x: 760,
      y: 340
    },
    {
      id: "wifi",
      name: "Wireless Network",
      ipAddress: "10.40.0.5",
      type: "wireless",
      icon: "Wifi",
      location: "HQ - Floors 1-3",
      notes: "Corporate and guest SSIDs",
      status: "unknown",
      color: "#a855f7",
      x: 1070,
      y: 300
    }
  ],
  connections: [
    {
      id: "edge-fw",
      sourceId: "internet-edge",
      targetId: "fw-core",
      label: "1 Gbps Internet",
      kind: "two-way",
      media: "internet",
      color: "#0ea5e9",
      dashed: false
    },
    {
      id: "fw-core-switch",
      sourceId: "fw-core",
      targetId: "core-switch",
      label: "10G fiber uplink",
      kind: "two-way",
      media: "fiber",
      color: "#22c55e",
      dashed: false
    },
    {
      id: "core-prod",
      sourceId: "core-switch",
      targetId: "prod-cluster",
      label: "Merged cloud routes",
      kind: "merged",
      media: "vpn",
      color: "#6366f1",
      dashed: true
    },
    {
      id: "core-branch",
      sourceId: "core-switch",
      targetId: "branch-vpn",
      label: "Branch VPN",
      kind: "two-way",
      media: "vpn",
      color: "#14b8a6",
      dashed: true
    },
    {
      id: "core-wifi",
      sourceId: "core-switch",
      targetId: "wifi",
      label: "Branching VLANs",
      kind: "fork",
      media: "wireless",
      color: "#a855f7",
      dashed: false
    }
  ]
};
