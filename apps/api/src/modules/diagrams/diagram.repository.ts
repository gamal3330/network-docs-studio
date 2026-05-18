import type { Device, Diagram, NetworkConnection } from "@nds/shared";
import { randomUUID } from "node:crypto";
import { prisma } from "../../db/prisma.js";

export const demoDiagram: Diagram = {
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

const includeDiagram = {
  devices: true,
  connections: true
};

export const diagramRepository = {
  async ensureSeeded() {
    const existing = await prisma.diagram.findFirst({ where: { slug: demoDiagram.slug } });
    if (existing) return;

    await prisma.team.upsert({
      where: { slug: "core" },
      update: {},
      create: {
        id: demoDiagram.teamId,
        name: "Core Network Team",
        slug: "core"
      }
    });

    await this.save(demoDiagram);
  },

  async list() {
    await this.ensureSeeded();
    const diagrams = await prisma.diagram.findMany({
      include: includeDiagram,
      orderBy: { updatedAt: "desc" }
    });
    return diagrams.map(toDiagram);
  },

  async findBySlug(slug: string) {
    await this.ensureSeeded();
    const diagram = await prisma.diagram.findFirst({
      where: { slug },
      include: includeDiagram
    });
    return diagram ? toDiagram(diagram) : undefined;
  },

  async save(diagram: Diagram) {
    await prisma.team.upsert({
      where: { id: diagram.teamId },
      update: {},
      create: {
        id: diagram.teamId,
        name: "Core Network Team",
        slug: "core"
      }
    });

    const saved = await prisma.$transaction(async (tx) => {
      const next = await tx.diagram.upsert({
        where: {
          teamId_slug: {
            teamId: diagram.teamId,
            slug: diagram.slug
          }
        },
        update: {
          name: diagram.name,
          description: diagram.description,
          visibility: diagram.visibility,
          version: { increment: 1 }
        },
        create: {
          id: diagram.id,
          teamId: diagram.teamId,
          name: diagram.name,
          slug: diagram.slug,
          description: diagram.description,
          visibility: diagram.visibility
        }
      });

      await tx.connection.deleteMany({ where: { diagramId: next.id } });
      await tx.device.deleteMany({ where: { diagramId: next.id } });

      if (diagram.devices.length > 0) {
        await tx.device.createMany({
          data: diagram.devices.map((device) => ({
            id: device.id,
            diagramId: next.id,
            name: device.name,
            ipAddress: device.ipAddress,
            type: device.type,
            icon: device.icon,
            location: device.location,
            notes: device.notes,
            status: device.status,
            color: device.color,
            x: device.x,
            y: device.y
          }))
        });
      }

      if (diagram.connections.length > 0) {
        await tx.connection.createMany({
          data: diagram.connections.map((connection) => ({
            id: connection.id,
            diagramId: next.id,
            sourceId: connection.sourceId,
            targetId: connection.targetId,
            label: connection.label,
            kind: connection.kind,
            media: connection.media,
            color: connection.color,
            dashed: connection.dashed
          }))
        });
      }

      return tx.diagram.findUniqueOrThrow({
        where: { id: next.id },
        include: includeDiagram
      });
    });

    return toDiagram(saved);
  },

  async createShareLink(slug: string, mode = "read-only") {
    const diagram = await prisma.diagram.findFirst({ where: { slug } });
    if (!diagram) return undefined;

    return prisma.shareLink.create({
      data: {
        diagramId: diagram.id,
        token: randomUUID(),
        mode
      }
    });
  },

  async createExportJob(slug: string, format: string) {
    const diagram = await prisma.diagram.findFirst({ where: { slug } });
    if (!diagram) return undefined;

    return prisma.exportJob.create({
      data: {
        diagramId: diagram.id,
        format,
        status: "queued"
      }
    });
  }
};

type DiagramRecord = Awaited<ReturnType<typeof prisma.diagram.findFirst>> & {
  devices: DeviceRecord[];
  connections: ConnectionRecord[];
};

type DeviceRecord = {
  id: string;
  name: string;
  ipAddress: string | null;
  type: string;
  icon: string | null;
  location: string | null;
  notes: string | null;
  status: string;
  color: string;
  x: number;
  y: number;
};

type ConnectionRecord = {
  id: string;
  sourceId: string;
  targetId: string;
  label: string | null;
  kind: string;
  media: string;
  color: string;
  dashed: boolean;
};

function toDiagram(record: NonNullable<DiagramRecord>): Diagram {
  return {
    id: record.id,
    teamId: record.teamId,
    name: record.name,
    slug: record.slug,
    description: record.description ?? undefined,
    visibility: record.visibility === "public" ? "public" : "private",
    updatedAt: record.updatedAt.toISOString(),
    devices: record.devices.map(toDevice),
    connections: record.connections.map(toConnection)
  };
}

function toDevice(record: DeviceRecord): Device {
  return {
    id: record.id,
    name: record.name,
    ipAddress: record.ipAddress ?? undefined,
    type: record.type as Device["type"],
    icon: record.icon ?? undefined,
    location: record.location ?? undefined,
    notes: record.notes ?? undefined,
    status: record.status as Device["status"],
    color: record.color,
    x: record.x,
    y: record.y
  };
}

function toConnection(record: ConnectionRecord): NetworkConnection {
  return {
    id: record.id,
    sourceId: record.sourceId,
    targetId: record.targetId,
    label: record.label ?? undefined,
    kind: record.kind as NetworkConnection["kind"],
    media: record.media as NetworkConnection["media"],
    color: record.color,
    dashed: record.dashed
  };
}
