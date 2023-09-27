export const initialNodes = [
  {
    id: "0",
    type: "rootNode",
    position: { x: 634, y: 100 },
    data: { label: "Bank Balance", value: 4302.21, proportion: 0 },
    width: 100,
    height: 68,
    selected: false,
    dragging: false,
    positionAbsolute: { x: 634, y: 100 },
  },
  {
    id: "5b3dada3-9e29-44a8-bfae-358de5fc2bc5",
    type: "fixedNode",
    position: { x: 230, y: 251 },
    data: { label: "Rent", value: 1231, proportion: 0 },
    width: 100,
    height: 68,
    selected: false,
    positionAbsolute: { x: 230, y: 251 },
    dragging: false,
  },
  {
    id: "02eacf28-c697-4cd1-aa2a-8667f8e6a5fb",
    type: "fixedNode",
    position: { x: 366, y: 252 },
    data: { label: "Health Insurance", value: 114.23, proportion: 0 },
    width: 100,
    height: 82,
    selected: false,
    dragging: false,
    positionAbsolute: { x: 366, y: 252 },
  },
  {
    id: "ca99b439-c48a-44f4-a5be-5b79989c2869",
    type: "fixedNode",
    position: { x: 289, y: 344 },
    data: { label: "Phone", value: 23.12, proportion: 0 },
    width: 100,
    height: 68,
    selected: false,
    dragging: false,
    positionAbsolute: { x: 289, y: 344 },
  },
  {
    id: "55d9f88e-b4aa-4538-888e-ffaf31dcd13f",
    type: "leafNode",
    position: { x: 258, y: 601 },
    data: { label: "Base Expenses", value: 1368.35, proportion: 0 },
    width: 100,
    height: 68,
    selected: false,
    dragging: false,
  },
  {
    id: "8b706699-e87c-4dd8-a8b1-e3160d0b3689",
    type: "relativeNode",
    position: { x: 838, y: 201 },
    data: { label: "Post Expenses", value: 1609.73 },
    width: 100,
    height: 68,
    selected: false,
    positionAbsolute: { x: 838, y: 201 },
    dragging: false,
  },
  {
    id: "0873ae13-2120-4af9-889f-82681e851e4a",
    type: "fixedNode",
    position: { x: 588, y: 599 },
    data: { label: "Monthly Budget", value: 1000, proportion: 0 },
    width: 100,
    height: 68,
    selected: false,
    dragging: false,
    positionAbsolute: { x: 588, y: 599 },
  },
  {
    id: "bc0857be-6c86-40e2-a4d6-8eb8e3621a95",
    type: "fixedNode",
    position: { x: 435, y: 600 },
    data: { label: "Credit Card", value: 324.13, proportion: 0 },
    width: 100,
    height: 68,
    selected: false,
    dragging: false,
    positionAbsolute: { x: 435, y: 600 },
  },
  {
    id: "bb25f5d1-5947-4b2c-914d-e01aefb71f8a",
    type: "proportionalNode",
    position: { x: 714, y: 312 },
    data: { label: "Cash Savings", value: 804.865, proportion: 50 },
    width: 100,
    height: 82,
    selected: false,
    dragging: false,
    positionAbsolute: { x: 714, y: 312 },
  },
  {
    id: "8812b0d6-82d9-455c-901d-8a5fb8c974a4",
    type: "proportionalNode",
    position: { x: 856, y: 447 },
    data: { label: "S&P ETF", value: 563.4055, proportion: 70 },
    width: 100,
    height: 68,
    selected: false,
    dragging: false,
    positionAbsolute: { x: 856, y: 447 },
  },
  {
    id: "3f2bbee4-6950-4215-be67-7a31d079a3df",
    type: "relativeNode",
    position: { x: 989, y: 307 },
    data: { label: "Long Term Investing", value: 804.865 },
    width: 100,
    height: 82,
    selected: false,
    positionAbsolute: { x: 989, y: 307 },
    dragging: false,
  },
  {
    id: "717ee3e4-b8ea-467e-8b72-7032ef81f6cf",
    type: "relativeNode",
    position: { x: 1184, y: 439 },
    data: { label: "Play Money", value: 80.48649999999998 },
    width: 100,
    height: 68,
    selected: false,
    positionAbsolute: { x: 1184, y: 439 },
    dragging: false,
  },
  {
    id: "43e1ac1a-af48-408c-94ec-57272995f7cd",
    type: "proportionalNode",
    position: { x: 1009, y: 438 },
    data: { label: "Bonds ETF", value: 160.973, proportion: 20 },
    width: 100,
    height: 82,
    selected: false,
    dragging: false,
    positionAbsolute: { x: 1009, y: 438 },
  },
  {
    id: "2fb2efae-032a-40ff-9f55-ba76f44e6147",
    type: "leafNode",
    position: { x: 995, y: 590 },
    data: { label: "Transfer to Broker", value: 804.865, proportion: 0 },
    width: 100,
    height: 82,
    selected: false,
    dragging: false,
    positionAbsolute: { x: 995, y: 590 },
  },
  {
    id: "70a984e2-db51-4f09-a71f-e1e03c64f6d0",
    type: "leafNode",
    position: { x: 755, y: 578 },
    data: {
      label: "Transfer to Savings Account",
      value: 804.865,
      proportion: 0,
    },
    width: 100,
    height: 96,
    selected: false,
    positionAbsolute: { x: 755, y: 578 },
    dragging: false,
  },
];

export const initialEdges = [
  {
    source: "5b3dada3-9e29-44a8-bfae-358de5fc2bc5",
    sourceHandle: "a",
    target: "55d9f88e-b4aa-4538-888e-ffaf31dcd13f",
    targetHandle: null,
    id:
      "reactflow__edge-5b3dada3-9e29-44a8-bfae-358de5fc2bc5a-55d9f88e-b4aa-4538-888e-ffaf31dcd13f",
  },
  {
    source: "ca99b439-c48a-44f4-a5be-5b79989c2869",
    sourceHandle: "a",
    target: "55d9f88e-b4aa-4538-888e-ffaf31dcd13f",
    targetHandle: null,
    id:
      "reactflow__edge-ca99b439-c48a-44f4-a5be-5b79989c2869a-55d9f88e-b4aa-4538-888e-ffaf31dcd13f",
  },
  {
    source: "02eacf28-c697-4cd1-aa2a-8667f8e6a5fb",
    sourceHandle: "a",
    target: "55d9f88e-b4aa-4538-888e-ffaf31dcd13f",
    targetHandle: null,
    id:
      "reactflow__edge-02eacf28-c697-4cd1-aa2a-8667f8e6a5fba-55d9f88e-b4aa-4538-888e-ffaf31dcd13f",
  },
  {
    source: "0",
    sourceHandle: "a",
    target: "5b3dada3-9e29-44a8-bfae-358de5fc2bc5",
    targetHandle: null,
    id: "reactflow__edge-0a-5b3dada3-9e29-44a8-bfae-358de5fc2bc5",
  },
  {
    source: "0",
    target: "8b706699-e87c-4dd8-a8b1-e3160d0b3689",
    id: "reactflow__edge-0-8b706699-e87c-4dd8-a8b1-e3160d0b3689",
  },
  {
    source: "0",
    sourceHandle: "a",
    target: "02eacf28-c697-4cd1-aa2a-8667f8e6a5fb",
    targetHandle: null,
    id: "reactflow__edge-0a-02eacf28-c697-4cd1-aa2a-8667f8e6a5fb",
  },
  {
    source: "0",
    sourceHandle: "a",
    target: "ca99b439-c48a-44f4-a5be-5b79989c2869",
    targetHandle: null,
    id: "reactflow__edge-0a-ca99b439-c48a-44f4-a5be-5b79989c2869",
  },
  {
    source: "0",
    sourceHandle: "a",
    target: "bc0857be-6c86-40e2-a4d6-8eb8e3621a95",
    targetHandle: null,
    id: "reactflow__edge-0a-bc0857be-6c86-40e2-a4d6-8eb8e3621a95",
  },
  {
    source: "0",
    sourceHandle: "a",
    target: "0873ae13-2120-4af9-889f-82681e851e4a",
    targetHandle: null,
    id: "reactflow__edge-0a-0873ae13-2120-4af9-889f-82681e851e4a",
  },
  {
    source: "8b706699-e87c-4dd8-a8b1-e3160d0b3689",
    sourceHandle: "a",
    target: "bb25f5d1-5947-4b2c-914d-e01aefb71f8a",
    targetHandle: null,
    id:
      "reactflow__edge-8b706699-e87c-4dd8-a8b1-e3160d0b3689a-bb25f5d1-5947-4b2c-914d-e01aefb71f8a",
  },
  {
    source: "8b706699-e87c-4dd8-a8b1-e3160d0b3689",
    target: "3f2bbee4-6950-4215-be67-7a31d079a3df",
    id:
      "reactflow__edge-8b706699-e87c-4dd8-a8b1-e3160d0b3689-3f2bbee4-6950-4215-be67-7a31d079a3df",
  },
  {
    source: "3f2bbee4-6950-4215-be67-7a31d079a3df",
    sourceHandle: "a",
    target: "8812b0d6-82d9-455c-901d-8a5fb8c974a4",
    targetHandle: null,
    id:
      "reactflow__edge-3f2bbee4-6950-4215-be67-7a31d079a3dfa-8812b0d6-82d9-455c-901d-8a5fb8c974a4",
  },
  {
    source: "3f2bbee4-6950-4215-be67-7a31d079a3df",
    target: "717ee3e4-b8ea-467e-8b72-7032ef81f6cf",
    id:
      "reactflow__edge-3f2bbee4-6950-4215-be67-7a31d079a3df-717ee3e4-b8ea-467e-8b72-7032ef81f6cf",
  },
  {
    source: "3f2bbee4-6950-4215-be67-7a31d079a3df",
    sourceHandle: "a",
    target: "43e1ac1a-af48-408c-94ec-57272995f7cd",
    targetHandle: null,
    id:
      "reactflow__edge-3f2bbee4-6950-4215-be67-7a31d079a3dfa-43e1ac1a-af48-408c-94ec-57272995f7cd",
  },
  {
    source: "8812b0d6-82d9-455c-901d-8a5fb8c974a4",
    sourceHandle: "a",
    target: "2fb2efae-032a-40ff-9f55-ba76f44e6147",
    targetHandle: null,
    id:
      "reactflow__edge-8812b0d6-82d9-455c-901d-8a5fb8c974a4a-2fb2efae-032a-40ff-9f55-ba76f44e6147",
  },
  {
    source: "43e1ac1a-af48-408c-94ec-57272995f7cd",
    sourceHandle: "a",
    target: "2fb2efae-032a-40ff-9f55-ba76f44e6147",
    targetHandle: null,
    id:
      "reactflow__edge-43e1ac1a-af48-408c-94ec-57272995f7cda-2fb2efae-032a-40ff-9f55-ba76f44e6147",
  },
  {
    source: "717ee3e4-b8ea-467e-8b72-7032ef81f6cf",
    sourceHandle: "a",
    target: "2fb2efae-032a-40ff-9f55-ba76f44e6147",
    targetHandle: null,
    id:
      "reactflow__edge-717ee3e4-b8ea-467e-8b72-7032ef81f6cfa-2fb2efae-032a-40ff-9f55-ba76f44e6147",
  },
  {
    source: "bb25f5d1-5947-4b2c-914d-e01aefb71f8a",
    sourceHandle: "a",
    target: "70a984e2-db51-4f09-a71f-e1e03c64f6d0",
    targetHandle: null,
    id:
      "reactflow__edge-bb25f5d1-5947-4b2c-914d-e01aefb71f8aa-70a984e2-db51-4f09-a71f-e1e03c64f6d0",
  },
];