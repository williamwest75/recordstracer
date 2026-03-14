import { useMemo, useRef, useEffect, useState } from "react";
import type { RecordResult } from "@/lib/recordsApi";

interface RelationshipNode {
  id: string;
  label: string;
  type: "person" | "organization" | "donation" | "filing";
  x: number;
  y: number;
}

interface RelationshipEdge {
  from: string;
  to: string;
  label: string;
}

interface RelationshipMapProps {
  results: RecordResult[];
  searchName: string;
}

function extractGraph(results: RecordResult[], searchName: string): { nodes: RelationshipNode[]; edges: RelationshipEdge[] } {
  const nodeMap = new Map<string, RelationshipNode>();
  const edges: RelationshipEdge[] = [];

  const personId = `person-${searchName}`;
  nodeMap.set(personId, { id: personId, label: searchName, type: "person", x: 0, y: 0 });

  for (const r of results) {
    if (r.id.endsWith("-summary")) continue;
    const details = r.details || {};

    // FEC: donor → employer connection
    if (r.category === "donations") {
      const employer = details["Employer"] || details["employer"];
      if (employer && employer !== "N/A" && employer.length > 2) {
        const empKey = `org-${employer.toLowerCase().trim()}`;
        if (!nodeMap.has(empKey)) {
          nodeMap.set(empKey, { id: empKey, label: employer, type: "organization", x: 0, y: 0 });
        }
        const edgeKey = `${personId}->${empKey}`;
        if (!edges.find(e => `${e.from}->${e.to}` === edgeKey)) {
          edges.push({ from: personId, to: empKey, label: "employed by" });
        }

        const amount = details["Amount"] || details["amount"];
        if (amount) {
          const donationId = `donation-${r.id}`;
          nodeMap.set(donationId, { id: donationId, label: amount, type: "donation", x: 0, y: 0 });
          edges.push({ from: personId, to: donationId, label: "donated" });
        }
      }
    }

    // Business registrations: officer → company
    if (r.category === "business") {
      const companyName = details["Entity Name"] || details["entity_name"] || r.source;
      if (companyName && companyName.length > 2) {
        const compKey = `org-${companyName.toLowerCase().trim()}`;
        if (!nodeMap.has(compKey)) {
          nodeMap.set(compKey, { id: compKey, label: companyName, type: "organization", x: 0, y: 0 });
        }
        const edgeKey = `${personId}->${compKey}`;
        if (!edges.find(e => `${e.from}->${e.to}` === edgeKey)) {
          edges.push({ from: personId, to: compKey, label: "officer/agent" });
        }
      }
    }

    // Lobbying: person → client org
    if (r.category === "lobbying") {
      const client = details["Client"] || details["client"] || details["Registrant"];
      if (client && client.length > 2) {
        const clientKey = `org-${client.toLowerCase().trim()}`;
        if (!nodeMap.has(clientKey)) {
          nodeMap.set(clientKey, { id: clientKey, label: client, type: "organization", x: 0, y: 0 });
        }
        edges.push({ from: personId, to: clientKey, label: "lobbying for" });
      }
    }

    // Contracts
    if (r.category === "contracts") {
      const agency = details["Agency"] || details["agency"] || details["Awarding Agency"];
      if (agency && agency.length > 2) {
        const agencyKey = `org-${agency.toLowerCase().trim()}`;
        if (!nodeMap.has(agencyKey)) {
          nodeMap.set(agencyKey, { id: agencyKey, label: agency, type: "organization", x: 0, y: 0 });
        }
        edges.push({ from: personId, to: agencyKey, label: "contract with" });
      }
    }
  }

  // Layout: radial around center person
  const nodes = Array.from(nodeMap.values());
  const centerX = 300;
  const centerY = 200;
  const radius = 150;
  let nonCenterIdx = 0;
  const nonCenterCount = nodes.length - 1;

  for (const node of nodes) {
    if (node.id === personId) {
      node.x = centerX;
      node.y = centerY;
    } else {
      const angle = (2 * Math.PI * nonCenterIdx) / Math.max(nonCenterCount, 1) - Math.PI / 2;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
      nonCenterIdx++;
    }
  }

  return { nodes, edges };
}

const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  person: { bg: "hsl(var(--accent) / 0.15)", border: "hsl(var(--accent))", text: "hsl(var(--accent))" },
  organization: { bg: "hsl(var(--primary) / 0.1)", border: "hsl(var(--primary))", text: "hsl(var(--primary))" },
  donation: { bg: "hsl(var(--success) / 0.1)", border: "hsl(142 76% 36%)", text: "hsl(142 76% 36%)" },
  filing: { bg: "hsl(var(--muted))", border: "hsl(var(--muted-foreground))", text: "hsl(var(--muted-foreground))" },
};

export default function RelationshipMap({ results, searchName }: RelationshipMapProps) {
  const { nodes, edges } = useMemo(() => extractGraph(results, searchName), [results, searchName]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  if (nodes.length <= 1 || edges.length === 0) return null;

  const svgWidth = 600;
  const svgHeight = 400;

  return (
    <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5" r="3" /><circle cx="5" cy="19" r="3" /><circle cx="19" cy="19" r="3" />
            <line x1="12" y1="8" x2="5" y2="16" /><line x1="12" y1="8" x2="19" y2="16" />
          </svg>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Relationship Map
          </h2>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
            {nodes.length} entities · {edges.length} connections
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Connections discovered across FEC donations, business filings, lobbying, and contracts
        </p>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[600px] mx-auto"
          style={{ minHeight: 300 }}
        >
          {/* Edges */}
          {edges.map((edge, i) => {
            const from = nodes.find(n => n.id === edge.from);
            const to = nodes.find(n => n.id === edge.to);
            if (!from || !to) return null;
            const isHighlighted = hoveredNode === edge.from || hoveredNode === edge.to;
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2 - 8;
            return (
              <g key={i}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={isHighlighted ? "hsl(var(--accent))" : "hsl(var(--border))"}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeDasharray={edge.label === "donated" ? "4 2" : undefined}
                  opacity={hoveredNode && !isHighlighted ? 0.2 : 0.8}
                />
                {isHighlighted && (
                  <text x={midX} y={midY} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const colors = NODE_COLORS[node.type] || NODE_COLORS.filing;
            const r = node.type === "person" ? 28 : node.type === "donation" ? 18 : 22;
            const isHighlighted = hoveredNode === node.id;
            const isConnectedToHovered = hoveredNode && edges.some(
              e => (e.from === hoveredNode && e.to === node.id) || (e.to === hoveredNode && e.from === node.id)
            );
            const dimmed = hoveredNode && !isHighlighted && !isConnectedToHovered;
            
            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: "pointer", opacity: dimmed ? 0.25 : 1, transition: "opacity 0.2s" }}
              >
                <circle
                  cx={node.x} cy={node.y} r={r}
                  fill={colors.bg}
                  stroke={colors.border}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                />
                <text
                  x={node.x} y={node.y + r + 14}
                  textAnchor="middle" fontSize="10"
                  fill="hsl(var(--foreground))"
                  fontWeight={node.type === "person" ? "600" : "400"}
                >
                  {node.label.length > 20 ? node.label.slice(0, 18) + "…" : node.label}
                </text>
                {node.type === "person" && (
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="14">👤</text>
                )}
                {node.type === "organization" && (
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="12">🏢</text>
                )}
                {node.type === "donation" && (
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="11">💰</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="px-5 py-3 border-t border-border flex flex-wrap gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-accent/20 border border-accent" /> Person</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-primary/10 border border-primary" /> Organization</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full" style={{ background: "hsl(142 76% 36% / 0.1)", borderColor: "hsl(142 76% 36%)", borderWidth: 1, borderStyle: "solid" }} /> Donation</span>
        <span className="italic">Hover to explore connections</span>
      </div>
    </div>
  );
}
