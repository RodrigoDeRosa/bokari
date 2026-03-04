import autoLayout from '../utils/autoLayout';
import type { BokariNode, BokariEdge, FixedGroupChild } from '../types';

// ── English template (EUR) ─────────────────────────────────────────────

const rawNodesEN = [
  // ── Tier 0: Income sources ──────────────────────────────────────
  {
    id: "salary",
    type: "rootNode",
    position: { x: 450, y: 50 },
    data: {
      label: "Salary",
      value: 5000,
      annualGrowth: 3,
    },
  },
  {
    id: "side-hustle",
    type: "rootNode",
    position: { x: 850, y: 50 },
    data: {
      label: "Side Hustle",
      value: 1000,
      annualGrowth: 5,
    },
  },

  // ── Tier 1: Aggregator ─────────────────────────────────────────
  {
    id: "total-income",
    type: "aggregatorNode",
    position: { x: 650, y: 230 },
    data: {
      label: "Total Income",
      value: 6000,
    },
  },

  // ── Tier 2: 50 / 30 / 20 split ────────────────────────────────
  {
    id: "needs",
    type: "proportionalNode",
    position: { x: 200, y: 410 },
    data: {
      label: "Needs",
      value: 3000,
      proportion: 50,
    },
  },
  {
    id: "wants",
    type: "proportionalNode",
    position: { x: 650, y: 410 },
    data: {
      label: "Wants",
      value: 1800,
      proportion: 30,
    },
  },
  {
    id: "save-invest",
    type: "proportionalNode",
    position: { x: 1100, y: 410 },
    data: {
      label: "Save & Invest",
      value: 1200,
      proportion: 20,
    },
  },

  // ── Tier 3 — Needs children ────────────────────────────────────
  {
    id: "housing",
    type: "fixedGroupNode",
    position: { x: -20, y: 620 },
    data: {
      label: "Housing",
      value: 1500,
      children: [
        { id: "housing-rent", label: "Rent", value: 1200 },
        { id: "housing-utilities", label: "Utilities", value: 130 },
        { id: "housing-insurance", label: "Insurance", value: 170 },
      ],
    },
  },
  {
    id: "groceries",
    type: "fixedNode",
    position: { x: 220, y: 620 },
    data: {
      label: "Groceries",
      value: 400,
    },
  },
  {
    id: "transportation",
    type: "fixedNode",
    position: { x: 340, y: 620 },
    data: {
      label: "Transportation",
      value: 200,
    },
  },
  {
    id: "buffer",
    type: "relativeNode",
    position: { x: 460, y: 620 },
    data: {
      label: "Buffer",
      value: 900,
    },
  },

  // ── Tier 3 — Wants children ────────────────────────────────────
  {
    id: "dining",
    type: "fixedNode",
    position: { x: 550, y: 620 },
    data: {
      label: "Dining & Fun",
      value: 500,
    },
  },
  {
    id: "subscriptions",
    type: "fixedNode",
    position: { x: 670, y: 620 },
    data: {
      label: "Subscriptions",
      value: 100,
    },
  },
  {
    id: "discretionary",
    type: "relativeNode",
    position: { x: 790, y: 620 },
    data: {
      label: "Discretionary",
      value: 1200,
    },
  },

  // ── Tier 3 — Save & Invest children ───────────────────────────
  {
    id: "emergency",
    type: "proportionalNode",
    position: { x: 960, y: 620 },
    data: {
      label: "Emergency Fund",
      value: 300,
      proportion: 25,
      isInvestment: true,
      expectedReturn: 4,
    },
  },
  {
    id: "retirement",
    type: "proportionalNode",
    position: { x: 1100, y: 620 },
    data: {
      label: "Retirement",
      value: 600,
      proportion: 50,
    },
  },
  {
    id: "growth-stocks",
    type: "relativeNode",
    position: { x: 1240, y: 620 },
    data: {
      label: "Growth Stocks",
      value: 300,
    },
  },

  // ── Tier 4 — Asset nodes (injection targets) ─────────────────
  {
    id: "retirement-portfolio",
    type: "assetNode",
    position: { x: 0, y: 0 },
    data: {
      label: "Retirement Portfolio",
      value: 0,
      initialValue: 30000,
      expectedReturn: 7,
    },
  },
  {
    id: "growth-portfolio",
    type: "assetNode",
    position: { x: 0, y: 0 },
    data: {
      label: "Growth Portfolio",
      value: 0,
      initialValue: 20000,
      expectedReturn: 10,
    },
  },
];

// ── Spanish (AR) template (ARS) ────────────────────────────────────────

const rawNodesES = [
  // ── Tier 0: Income sources ──────────────────────────────────────
  {
    id: "salary",
    type: "rootNode",
    position: { x: 450, y: 50 },
    data: {
      label: "Sueldo",
      value: 1500000,
      annualGrowth: 3,
    },
  },
  {
    id: "side-hustle",
    type: "rootNode",
    position: { x: 850, y: 50 },
    data: {
      label: "Ingreso Extra",
      value: 500000,
      annualGrowth: 5,
    },
  },

  // ── Tier 1: Aggregator ─────────────────────────────────────────
  {
    id: "total-income",
    type: "aggregatorNode",
    position: { x: 650, y: 230 },
    data: {
      label: "Ingreso Total",
      value: 2000000,
    },
  },

  // ── Tier 2: 50 / 30 / 20 split ────────────────────────────────
  {
    id: "needs",
    type: "proportionalNode",
    position: { x: 200, y: 410 },
    data: {
      label: "Necesidades",
      value: 1000000,
      proportion: 50,
    },
  },
  {
    id: "wants",
    type: "proportionalNode",
    position: { x: 650, y: 410 },
    data: {
      label: "Gustos",
      value: 600000,
      proportion: 30,
    },
  },
  {
    id: "save-invest",
    type: "proportionalNode",
    position: { x: 1100, y: 410 },
    data: {
      label: "Ahorro e Inversión",
      value: 400000,
      proportion: 20,
    },
  },

  // ── Tier 3 — Needs children ────────────────────────────────────
  {
    id: "housing",
    type: "fixedGroupNode",
    position: { x: -20, y: 620 },
    data: {
      label: "Vivienda",
      value: 350000,
      children: [
        { id: "housing-rent", label: "Alquiler", value: 250000 },
        { id: "housing-utilities", label: "Servicios", value: 40000 },
        { id: "housing-insurance", label: "Seguro", value: 60000 },
      ],
    },
  },
  {
    id: "groceries",
    type: "fixedNode",
    position: { x: 220, y: 620 },
    data: {
      label: "Supermercado",
      value: 120000,
    },
  },
  {
    id: "transportation",
    type: "fixedNode",
    position: { x: 340, y: 620 },
    data: {
      label: "Transporte",
      value: 60000,
    },
  },
  {
    id: "buffer",
    type: "relativeNode",
    position: { x: 460, y: 620 },
    data: {
      label: "Margen",
      value: 470000,
    },
  },

  // ── Tier 3 — Wants children ────────────────────────────────────
  {
    id: "dining",
    type: "fixedNode",
    position: { x: 550, y: 620 },
    data: {
      label: "Salidas",
      value: 200000,
    },
  },
  {
    id: "subscriptions",
    type: "fixedNode",
    position: { x: 670, y: 620 },
    data: {
      label: "Suscripciones",
      value: 30000,
    },
  },
  {
    id: "discretionary",
    type: "relativeNode",
    position: { x: 790, y: 620 },
    data: {
      label: "Discrecional",
      value: 370000,
    },
  },

  // ── Tier 3 — Save & Invest children ───────────────────────────
  {
    id: "emergency",
    type: "proportionalNode",
    position: { x: 960, y: 620 },
    data: {
      label: "Fondo de Emergencia",
      value: 100000,
      proportion: 25,
      isInvestment: true,
      expectedReturn: 4,
    },
  },
  {
    id: "retirement",
    type: "proportionalNode",
    position: { x: 1100, y: 620 },
    data: {
      label: "Jubilación",
      value: 200000,
      proportion: 50,
    },
  },
  {
    id: "growth-stocks",
    type: "relativeNode",
    position: { x: 1240, y: 620 },
    data: {
      label: "Acciones",
      value: 100000,
    },
  },

  // ── Tier 4 — Asset nodes (injection targets) ─────────────────
  {
    id: "retirement-portfolio",
    type: "assetNode",
    position: { x: 0, y: 0 },
    data: {
      label: "Portafolio Jubilación",
      value: 0,
      initialValue: 10000000,
      expectedReturn: 7,
    },
  },
  {
    id: "growth-portfolio",
    type: "assetNode",
    position: { x: 0, y: 0 },
    data: {
      label: "Portafolio Crecimiento",
      value: 0,
      initialValue: 6500000,
      expectedReturn: 10,
    },
  },
];

// ── Shared edges (identical structure for both templates) ──────────────

const rawEdges = [
  // Tier 0 → Tier 1 (both incomes feed the aggregator)
  {
    source: "salary",
    sourceHandle: null,
    target: "total-income",
    targetHandle: null,
    id: "reactflow__edge-salary-total-income",
  },
  {
    source: "side-hustle",
    sourceHandle: null,
    target: "total-income",
    targetHandle: null,
    id: "reactflow__edge-side-hustle-total-income",
  },

  // Tier 1 → Tier 2 (50/30/20 split)
  {
    source: "total-income",
    sourceHandle: null,
    target: "needs",
    targetHandle: null,
    id: "reactflow__edge-total-income-needs",
  },
  {
    source: "total-income",
    sourceHandle: null,
    target: "wants",
    targetHandle: null,
    id: "reactflow__edge-total-income-wants",
  },
  {
    source: "total-income",
    sourceHandle: null,
    target: "save-invest",
    targetHandle: null,
    id: "reactflow__edge-total-income-save-invest",
  },

  // Tier 2 → Tier 3: Needs children
  {
    source: "needs",
    sourceHandle: null,
    target: "housing",
    targetHandle: null,
    id: "reactflow__edge-needs-housing",
  },
  {
    source: "needs",
    sourceHandle: null,
    target: "groceries",
    targetHandle: null,
    id: "reactflow__edge-needs-groceries",
  },
  {
    source: "needs",
    sourceHandle: null,
    target: "transportation",
    targetHandle: null,
    id: "reactflow__edge-needs-transportation",
  },
  {
    source: "needs",
    sourceHandle: null,
    target: "buffer",
    targetHandle: null,
    id: "reactflow__edge-needs-buffer",
  },

  // Tier 2 → Tier 3: Wants children
  {
    source: "wants",
    sourceHandle: null,
    target: "dining",
    targetHandle: null,
    id: "reactflow__edge-wants-dining",
  },
  {
    source: "wants",
    sourceHandle: null,
    target: "subscriptions",
    targetHandle: null,
    id: "reactflow__edge-wants-subscriptions",
  },
  {
    source: "wants",
    sourceHandle: null,
    target: "discretionary",
    targetHandle: null,
    id: "reactflow__edge-wants-discretionary",
  },

  // Tier 2 → Tier 3: Save & Invest children
  {
    source: "save-invest",
    sourceHandle: null,
    target: "emergency",
    targetHandle: null,
    id: "reactflow__edge-save-invest-emergency",
  },
  {
    source: "save-invest",
    sourceHandle: null,
    target: "retirement",
    targetHandle: null,
    id: "reactflow__edge-save-invest-retirement",
  },
  {
    source: "save-invest",
    sourceHandle: null,
    target: "growth-stocks",
    targetHandle: null,
    id: "reactflow__edge-save-invest-growth-stocks",
  },

  // Tier 3 → Tier 4: Injection edges (budget → asset)
  {
    source: "retirement",
    target: "retirement-portfolio",
    sourceHandle: null,
    targetHandle: null,
    id: "reactflow__edge-retirement-retirement-portfolio",
    data: { isInjection: true },
  },
  {
    source: "growth-stocks",
    target: "growth-portfolio",
    sourceHandle: null,
    targetHandle: null,
    id: "reactflow__edge-growth-stocks-growth-portfolio",
    data: { isInjection: true },
  },
];

// ── Fingerprinting (position-independent template comparison) ──────────

interface NodeFingerprint {
  id: string;
  type: string;
  label: string;
  value: number;
  proportion?: number;
  children?: { id: string; label: string; value: number }[];
  isInvestment?: boolean;
  expectedReturn?: number;
  annualGrowth?: number;
  initialValue?: number;
}

function buildNodeFingerprint(node: BokariNode): NodeFingerprint {
  const fp: NodeFingerprint = {
    id: node.id,
    type: node.type ?? '',
    label: node.data.label,
    value: node.data.value,
  };
  if (node.data.proportion != null) fp.proportion = node.data.proportion;
  if (node.data.children) {
    fp.children = node.data.children.map((c: FixedGroupChild) => ({
      id: c.id, label: c.label, value: c.value,
    }));
  }
  if (node.data.isInvestment) fp.isInvestment = true;
  if (node.data.expectedReturn != null) fp.expectedReturn = node.data.expectedReturn;
  if (node.data.annualGrowth != null) fp.annualGrowth = node.data.annualGrowth;
  if (node.data.initialValue != null) fp.initialValue = node.data.initialValue;
  return fp;
}

function buildFingerprint(nodes: BokariNode[], edges: BokariEdge[]): string {
  const nodeFPs = nodes.map(buildNodeFingerprint).sort((a, b) => a.id.localeCompare(b.id));
  const edgeFPs = edges.map((e) => `${e.source}->${e.target}`).sort();
  return JSON.stringify({ nodes: nodeFPs, edges: edgeFPs });
}

// Lazily cached template fingerprints
let cachedFingerprints: Set<string> | null = null;

function getTemplateFingerprints(): Set<string> {
  if (!cachedFingerprints) {
    cachedFingerprints = new Set([
      buildFingerprint(rawNodesEN as BokariNode[], rawEdges as BokariEdge[]),
      buildFingerprint(rawNodesES as BokariNode[], rawEdges as BokariEdge[]),
    ]);
  }
  return cachedFingerprints;
}

/**
 * Returns true if the current nodes/edges match any known template
 * (ignoring positions, measured, selected, dragging, etc.).
 */
export function isOnTemplate(nodes: BokariNode[], edges: BokariEdge[]): boolean {
  return getTemplateFingerprints().has(buildFingerprint(nodes, edges));
}

// ── Template selection by locale ──────────────────────────────────────

interface TemplateData {
  nodes: BokariNode[];
  edges: BokariEdge[];
  currency: string;
}

export function getTemplateForLocale(locale: string): TemplateData {
  if (locale.startsWith('es')) {
    return {
      nodes: autoLayout(rawNodesES as BokariNode[], rawEdges as BokariEdge[]),
      edges: rawEdges as BokariEdge[],
      currency: 'ARS',
    };
  }
  return {
    nodes: autoLayout(rawNodesEN as BokariNode[], rawEdges as BokariEdge[]),
    edges: rawEdges as BokariEdge[],
    currency: 'EUR',
  };
}

// ── Legacy exports (backward compatibility) ───────────────────────────

export const exampleNodes = autoLayout(rawNodesEN as BokariNode[], rawEdges as BokariEdge[]);
export const exampleEdges = rawEdges;
