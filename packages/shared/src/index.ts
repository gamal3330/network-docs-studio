import { z } from "zod";

export const deviceTypes = [
  "router",
  "switch",
  "firewall",
  "server",
  "cloud",
  "database",
  "wireless",
  "endpoint",
  "custom"
] as const;

export const deviceStatuses = ["healthy", "warning", "critical", "offline", "unknown"] as const;

export const connectionKinds = [
  "one-way",
  "two-way",
  "fork",
  "merged"
] as const;

export const connectionMedia = [
  "ethernet",
  "fiber",
  "wireless",
  "vpn",
  "internet",
  "custom"
] as const;

export const deviceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  ipAddress: z.string().optional(),
  type: z.enum(deviceTypes),
  icon: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(deviceStatuses),
  color: z.string(),
  x: z.number(),
  y: z.number()
});

export const connectionSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  label: z.string().optional(),
  kind: z.enum(connectionKinds),
  media: z.enum(connectionMedia),
  color: z.string(),
  dashed: z.boolean()
});

export const diagramSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  visibility: z.enum(["private", "public"]),
  devices: z.array(deviceSchema),
  connections: z.array(connectionSchema),
  updatedAt: z.string()
});

export type DeviceType = (typeof deviceTypes)[number];
export type DeviceStatus = (typeof deviceStatuses)[number];
export type ConnectionKind = (typeof connectionKinds)[number];
export type ConnectionMedia = (typeof connectionMedia)[number];
export type Device = z.infer<typeof deviceSchema>;
export type NetworkConnection = z.infer<typeof connectionSchema>;
export type Diagram = z.infer<typeof diagramSchema>;
