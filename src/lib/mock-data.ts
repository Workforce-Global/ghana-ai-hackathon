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
    image: "https://placehold.co/250x150.png",
    data_ai_hint: "cashew plant disease",
    recommendedActions: ["Apply a copper-based fungicide weekly.", "Prune and destroy infected leaves and twigs.", "Ensure proper tree spacing for better air circulation."],
  },
  {
    id: "scan-002",
    cropType: "Cassava",
    disease: "Mosaic Virus",
    date: "2024-07-28",
    status: "Action Required",
    image: "https://placehold.co/250x150.png",
    data_ai_hint: "cassava leaves",
    recommendedActions: ["Uproot and burn infected plants to prevent spread.", "Use virus-free planting materials for new crops.", "Control whitefly populations, which transmit the virus."],
  },
  {
    id: "scan-003",
    cropType: "Tomato",
    disease: "Healthy",
    date: "2024-07-27",
    status: "Healthy",
    image: "https://placehold.co/250x150.png",
    data_ai_hint: "tomato plant",
    recommendedActions: [],
  },
  {
    id: "scan-004",
    cropType: "Maize",
    disease: "Corn Smut",
    date: "2024-07-26",
    status: "Action Required",
    image: "https://placehold.co/250x150.png",
    data_ai_hint: "maize crop",
    recommendedActions: ["Remove and destroy smut galls before they burst.", "Avoid mechanical injury to plants during cultivation.", "Rotate crops and avoid planting maize in the same field consecutively."]
  },
  {
    id: "scan-005",
    cropType: "Tomato",
    disease: "Late Blight",
    date: "2024-07-25",
    status: "Action Required",
    image: "https://placehold.co/250x150.png",
    data_ai_hint: "tomato plant disease",
    recommendedActions: ["Apply preventative fungicides before symptoms appear.", "Ensure good air flow around plants.", "Water at the base of the plant to keep foliage dry."]
  },
]
