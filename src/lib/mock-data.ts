export const diseaseFrequencyData = [
  { name: 'Blight', cases: 28, fill: 'var(--chart-1)' },
  { name: 'Rust', cases: 22, fill: 'var(--chart-2)' },
  { name: 'Mildew', cases: 18, fill: 'var(--chart-3)' },
  { name: 'Leaf Spot', cases: 15, fill: 'var(--chart-4)' },
  { name: 'Canker', cases: 10, fill: 'var(--chart-5)' },
  { name: 'Rot', cases: 7, fill: 'var(--chart-1)' },
];

export const cropDistributionData = [
  { name: 'Corn', value: 400, fill: 'var(--chart-1)' },
  { name: 'Tomato', value: 300, fill: 'var(--chart-2)' },
  { name: 'Wheat', value: 250, fill: 'var(--chart-3)' },
  { name: 'Potato', value: 200, fill: 'var(--chart-4)' },
  { name: 'Grapes', value: 150, fill: 'var(--chart-5)' },
];

export const recentScansData = [
  {
    id: "scan-001",
    cropType: "Tomato",
    disease: "Late Blight",
    date: "2024-07-28",
    status: "Action Required",
    image: "https://placehold.co/40x40.png",
    data_ai_hint: "tomato plant"
  },
  {
    id: "scan-002",
    cropType: "Corn",
    disease: "Healthy",
    date: "2024-07-28",
    status: "Healthy",
    image: "https://placehold.co/40x40.png",
    data_ai_hint: "corn field"
  },
  {
    id: "scan-003",
    cropType: "Potato",
    disease: "Early Blight",
    date: "2024-07-27",
    status: "Action Required",
    image: "https://placehold.co/40x40.png",
    data_ai_hint: "potato leaves"
  },
  {
    id: "scan-004",
    cropType: "Wheat",
    disease: "Healthy",
    date: "2024-07-26",
    status: "Healthy",
    image: "https://placehold.co/40x40.png",
    data_ai_hint: "wheat crop"
  },
  {
    id: "scan-005",
    cropType: "Grapes",
    disease: "Powdery Mildew",
    date: "2024-07-25",
    status: "Action Required",
    image: "https://placehold.co/40x40.png",
    data_ai_hint: "grape vine"
  },
]
