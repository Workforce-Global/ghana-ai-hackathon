export const diseaseFrequencyData = [
  { name: 'Blight', cases: 28, fill: 'var(--chart-1)' },
  { name: 'Rust', cases: 22, fill: 'var(--chart-2)' },
  { name: 'Mildew', cases: 18, fill: 'var(--chart-3)' },
  { name: 'Leaf Spot', cases: 15, fill: 'var(--chart-4)' },
  { name: 'Canker', cases: 10, fill: 'var(--chart-5)' },
  { name: 'Rot', cases: 7, fill: 'var(--chart-1)' },
];

export const cropDistributionData = [
  { name: 'Cashew', value: 400, fill: 'var(--chart-1)' },
  { name: 'Cassava', value: 300, fill: 'var(--chart-2)' },
  { name: 'Tomato', value: 250, fill: 'var(--chart-3)' },
  { name: 'Maize', value: 200, fill: 'var(--chart-4)' },
];

export const recentScansData = [
  {
    id: "scan-001",
    cropType: "Cashew",
    disease: "Anthracnose",
    date: "2024-07-28",
    status: "Action Required",
    image: "https://placehold.co/40x40.png",
    data_ai_hint: "cashew plant disease"
  },
  {
    id: "scan-002",
    cropType: "Cassava",
    disease: "Mosaic Virus",
    date: "2024-07-28",
    status: "Action Required",
    image: "https://placehold.co/40x40.png",
    data_ai_hint: "cassava leaves"
  },
  {
    id: "scan-003",
    cropType: "Tomato",
    disease: "Healthy",
    date: "2024-07-27",
    status: "Healthy",
    image: "https://placehold.co/40x40.png",
    data_ai_hint: "tomato plant"
  },
  {
    id: "scan-004",
    cropType: "Maize",
    disease: "Corn Smut",
    date: "2024-07-26",
    status: "Action Required",
    image: "https://placehold.co/40x40.png",
    data_ai_hint: "maize crop"
  },
  {
    id: "scan-005",
    cropType: "Tomato",
    disease: "Late Blight",
    date: "2024-07-25",
    status: "Action Required",
    image: "https://placehold.co/40x40.png",
    data_ai_hint: "tomato plant disease"
  },
]
