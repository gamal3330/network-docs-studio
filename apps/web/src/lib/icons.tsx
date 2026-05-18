import {
  Cloud,
  Database,
  Globe2,
  HardDrive,
  Monitor,
  Network,
  Router,
  Server,
  Shield,
  Wifi
} from "lucide-react";
import type { DeviceType } from "@nds/shared";

const iconClass = "h-5 w-5";

export function DeviceIcon({ type }: { type: DeviceType }) {
  switch (type) {
    case "router":
      return <Router className={iconClass} />;
    case "switch":
      return <Network className={iconClass} />;
    case "firewall":
      return <Shield className={iconClass} />;
    case "server":
      return <Server className={iconClass} />;
    case "cloud":
      return <Cloud className={iconClass} />;
    case "database":
      return <Database className={iconClass} />;
    case "wireless":
      return <Wifi className={iconClass} />;
    case "endpoint":
      return <Monitor className={iconClass} />;
    default:
      return <HardDrive className={iconClass} />;
  }
}

export function MediaIcon({ media }: { media: string }) {
  return media === "internet" ? <Globe2 className="h-4 w-4" /> : <Network className="h-4 w-4" />;
}
