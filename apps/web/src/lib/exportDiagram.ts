import type { Diagram } from "@nds/shared";

type ExportFormat = "json" | "svg" | "png" | "pdf";

export async function exportDiagram(diagram: Diagram, format: ExportFormat) {
  if (format === "json") {
    downloadFile(`${diagram.slug}.json`, "application/json", JSON.stringify(diagram, null, 2));
    return;
  }

  if (format === "svg") {
    downloadFile(`${diagram.slug}.svg`, "image/svg+xml", renderSvg(diagram));
    return;
  }

  if (format === "png") {
    await exportPng(diagram);
    return;
  }

  downloadFile(`${diagram.slug}.html`, "text/html", renderPrintableHtml(diagram));
}

export function getPublicDiagramUrl(slug: string) {
  return `${window.location.origin}/connections/${slug}`;
}

export async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.focus();
  input.select();
  document.execCommand("copy");
  input.remove();
}

function downloadFile(filename: string, type: string, content: string) {
  const blob = new Blob([content], { type });
  downloadBlob(filename, blob);
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function exportPng(diagram: Diagram) {
  const svg = renderSvg(diagram);
  const xml = new DOMParser().parseFromString(svg, "image/svg+xml");
  const svgElement = xml.documentElement;
  const width = Number(svgElement.getAttribute("width") ?? 1400);
  const height = Number(svgElement.getAttribute("height") ?? 900);
  const svgBlob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas export is unavailable");

    context.fillStyle = "#f8fafc";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((nextBlob) => {
        if (nextBlob) resolve(nextBlob);
        else reject(new Error("PNG export failed"));
      }, "image/png");
    });

    downloadBlob(`${diagram.slug}.png`, blob);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function renderSvg(diagram: Diagram) {
  const xs = diagram.devices.map((device) => device.x);
  const ys = diagram.devices.map((device) => device.y);
  const minX = Math.min(...xs, 0) - 80;
  const minY = Math.min(...ys, 0) - 80;
  const maxX = Math.max(...xs, 1200) + 320;
  const maxY = Math.max(...ys, 720) + 220;

  const connections = diagram.connections
    .map((connection) => {
      const source = diagram.devices.find((device) => device.id === connection.sourceId);
      const target = diagram.devices.find((device) => device.id === connection.targetId);
      if (!source || !target) return "";

      const sx = source.x + 115;
      const sy = source.y + 70;
      const tx = target.x + 115;
      const ty = target.y + 70;
      const mx = (sx + tx) / 2;
      const my = (sy + ty) / 2;

      return `
        <line x1="${sx}" y1="${sy}" x2="${tx}" y2="${ty}" stroke="${connection.color}" stroke-width="${connection.kind === "merged" ? 5 : 3}" stroke-dasharray="${connection.dashed ? "9 7" : ""}" marker-end="url(#arrow)" />
        <rect x="${mx - 68}" y="${my - 15}" width="136" height="30" rx="7" fill="white" stroke="${connection.color}" />
        <text x="${mx}" y="${my + 5}" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">${escapeXml(connection.label || connection.media)}</text>
      `;
    })
    .join("");

  const devices = diagram.devices
    .map(
      (device) => `
        <g transform="translate(${device.x}, ${device.y})">
          <rect width="230" height="140" rx="8" fill="#ffffff" stroke="#cbd5e1" />
          <rect width="230" height="6" rx="3" fill="${device.color}" />
          <circle cx="24" cy="34" r="7" fill="${statusColor(device.status)}" />
          <text x="42" y="40" font-size="16" font-weight="800" fill="#0f172a">${escapeXml(device.name)}</text>
          <text x="18" y="70" font-size="13" font-weight="700" fill="#475569">${escapeXml(device.type)} • ${escapeXml(device.ipAddress || "")}</text>
          <text x="18" y="96" font-size="12" fill="#64748b">${escapeXml(device.location || "Unknown location")}</text>
          <text x="18" y="120" font-size="12" fill="#64748b">${escapeXml(device.notes || "")}</text>
        </g>
      `
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}" width="${maxX - minX}" height="${maxY - minY}">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#334155" />
    </marker>
  </defs>
  <rect x="${minX}" y="${minY}" width="${maxX - minX}" height="${maxY - minY}" fill="#f8fafc" />
  ${connections}
  ${devices}
</svg>`;
}

function renderPrintableHtml(diagram: Diagram) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeXml(diagram.name)}</title>
    <style>
      body { margin: 32px; font-family: Inter, Arial, sans-serif; color: #0f172a; direction: ltr; }
      h1 { margin-bottom: 4px; }
      table { width: 100%; border-collapse: collapse; margin-top: 24px; }
      th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
      th { background: #f1f5f9; }
      .hint { color: #64748b; }
      @media print { button { display: none; } }
    </style>
  </head>
  <body>
    <button onclick="window.print()">Print / Save PDF</button>
    <h1>${escapeXml(diagram.name)}</h1>
    <p class="hint">Generated by Network Docs Studio. Use browser print to save as PDF.</p>
    ${renderSvg(diagram)}
    <h2>Devices</h2>
    <table>
      <thead><tr><th>Name</th><th>IP</th><th>Type</th><th>Status</th><th>Location</th><th>Notes</th></tr></thead>
      <tbody>
        ${diagram.devices
          .map(
            (device) =>
              `<tr><td>${escapeXml(device.name)}</td><td>${escapeXml(device.ipAddress || "")}</td><td>${escapeXml(device.type)}</td><td>${escapeXml(device.status)}</td><td>${escapeXml(device.location || "")}</td><td>${escapeXml(device.notes || "")}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>
  </body>
</html>`;
}

function statusColor(status: string) {
  if (status === "healthy") return "#22c55e";
  if (status === "warning") return "#f59e0b";
  if (status === "critical") return "#e11d48";
  if (status === "offline") return "#94a3b8";
  return "#64748b";
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
