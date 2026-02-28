import autoLayout from '../utils/autoLayout';
import type { BokariNode, BokariEdge } from '../types';

const rawNodes = [
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
      isInvestment: true,
      expectedReturn: 7,
    },
  },
  {
    id: "growth-stocks",
    type: "relativeNode",
    position: { x: 1240, y: 620 },
    data: {
      label: "Growth Stocks",
      value: 300,
      isInvestment: true,
      expectedReturn: 10,
    },
  },
];

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
];

export const exampleNodes = autoLayout(rawNodes as BokariNode[], rawEdges as BokariEdge[]);
export const exampleEdges = rawEdges;
