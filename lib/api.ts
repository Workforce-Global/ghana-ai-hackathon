export interface PredictionResult {
  model_used: string
  result: {
    predicted_class: number
    label: string
    confidence: number
  }
}

export async function predictDisease(imageFile: File): Promise<PredictionResult> {
  const formData = new FormData()
  formData.append("file", imageFile)
  formData.append("model_name", "efficientnet")

  const response = await fetch("https://agrosaviour-backend-947103695812.europe-west1.run.app/predict/", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to predict disease")
  }

  return response.json()
}
