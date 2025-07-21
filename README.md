# Ghana AI Hackathon – Crop Disease Detection & Reporting App (AgroSaviour)

This project is a cross-platform Tauri + Next.js application developed during the Ghana AI Hackathon. It empowers farmers and agronomists to detect, classify, and receive actionable insights on crop diseases affecting common Ghanaian crops using AI models embedded in a desktop/web hybrid app.

---

## 🧠 Features

- 🌾 **AI-Powered Detection** – Classifies diseases in Cassava, Cashew, Maize, and Tomato using MobileNet/EfficientNet models.
- 📷 **Image Upload Interface** – Analyze images from phones, cameras, or drones.
- 🧾 **Auto-generated Reports** – Includes disease name, description, and tailored farming recommendations.
- ☁️ **Firebase Integration** – User authentication and cloud storage for disease reports.
- 💻 **Tauri Desktop Bundle** – Offline access and performance-focused desktop app.
- 📊 **Admin Dashboard (optional)** – Manage report submissions, feedback, and model versions.

---

## 🏗️ Tech Stack

| Layer           | Tech Used              |
|----------------|------------------------|
| Frontend       | Next.js + Tailwind CSS |
| Backend API    | Firebase Functions / FastAPI (WIP) |
| ML Models      | PyTorch (MobileNet v3, EfficientNet B0) |
| Desktop Layer  | Tauri (Rust + WebView) |
| Cloud Platform | Firebase Hosting + Firestore |

---

## ⚙️ Getting Started

### 1. Clone and install dependencies:

```
git clone https://github.com/Workforce-Global/ghana-ai-hackathon.git
cd ghana-ai-hackathon
npm install
npx tauri dev
```
