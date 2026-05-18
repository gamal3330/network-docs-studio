import type { ConnectionKind, ConnectionMedia, DeviceStatus, DeviceType } from "@nds/shared";

export const translations = {
  add: "Add",
  autoAlign: "Auto-align",
  canvasCount: "nodes on canvas",
  color: "Color",
  connectionClarity: "Connection clarity",
  connections: "Connections",
  createUser: "Create user",
  creatingUser: "Creating...",
  dashed: "Dashed",
  deleteUser: "Delete user",
  deviceDetails: "Device details",
  devices: "Devices",
  diagramPrivate: "Diagram is private",
  diagrams: "Diagrams",
  editModeOn: "Editor mode enabled",
  export: "Export",
  exportedPdf: "Printable PDF file downloaded",
  exportedPngSvg: "PNG/SVG package exported",
  exportedSvg: "SVG export downloaded",
  exitPreview: "Exit read-only preview",
  kind: "Kind",
  label: "Label",
  loadFailed: "Failed to load diagram",
  loaded: "Diagram loaded from database",
  login: "Login",
  logout: "Logout",
  location: "Location",
  manageUsers: "Manage users",
  media: "Media",
  name: "Name",
  newConnection: "New link",
  newDiagram: "New diagram",
  newDiagramCreated: "New diagram created",
  newDeviceSuffix: "New",
  notes: "Notes",
  password: "Password",
  pdf: "PDF",
  pngSvg: "PNG/SVG",
  preview: "Preview read-only link",
  previewBadge: "Read-only preview",
  previewOn: "Read-only preview enabled",
  private: "Private",
  publicLink: "Public link",
  publicLinkCopied: "Public link copied",
  publicLinkEnabled: "Public link enabled",
  readOnlyEnabled: "Read-only preview is enabled",
  redo: "Redo",
  removeDevice: "Remove device",
  role: "Role",
  save: "Save",
  saveFailed: "Failed to save diagram",
  saved: "Diagram saved",
  searchPlaceholder: "Search nodes, IPs, locations",
  selectNode: "Select a node to edit its metadata.",
  share: "Share",
  shareCopied: "Share link copied",
  status: "Status",
  toggleDark: "Toggle dark mode",
  type: "Type",
  undo: "Undo",
  unassigned: "Unassigned",
  unknown: "Unknown",
  userManagement: "User management",
  userCreated: "User created",
  users: "Users",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
  viewerMode: "Viewer mode"
} as const;

export function t(key: keyof typeof translations) {
  return translations[key];
}

export const deviceTypeLabels: Record<DeviceType, string> = {
  router: "Router",
  switch: "Switch",
  firewall: "Firewall",
  server: "Server",
  cloud: "Cloud",
  database: "Database",
  wireless: "Wireless",
  endpoint: "Endpoint",
  custom: "Custom"
};

export const statusLabels: Record<DeviceStatus, string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical",
  offline: "Offline",
  unknown: "Unknown"
};

export const connectionKindLabels: Record<ConnectionKind, string> = {
  "one-way": "One-way",
  "two-way": "Two-way",
  fork: "Fork",
  merged: "Merged"
};

export const connectionMediaLabels: Record<ConnectionMedia, string> = {
  ethernet: "Ethernet",
  fiber: "Fiber",
  wireless: "Wireless",
  vpn: "VPN",
  internet: "Internet",
  custom: "Custom"
};

export function labelForOption(value: string) {
  return (
    deviceTypeLabels[value as DeviceType] ??
    statusLabels[value as DeviceStatus] ??
    connectionKindLabels[value as ConnectionKind] ??
    connectionMediaLabels[value as ConnectionMedia] ??
    value
  );
}
