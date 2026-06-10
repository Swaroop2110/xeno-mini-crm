# 🚀 Xeno AI CRM (Mini-CRM)

A full-stack, distributed microservices CRM application featuring AI-powered campaign generation, real-time analytics, and delivery simulation.

## 🌟 Key Features

*   **AI Copilot**: Type a natural language marketing goal (e.g., "Send a 10% discount to high-spending customers in Mumbai"). The system uses **Google Gemini 2.5 Flash** to automatically translate this into a structured JSON query, identify the audience segment, and generate personalized message copy.
*   **Real-time Analytics Dashboard**: Built with **Recharts**, this dashboard polls a MongoDB aggregation pipeline to display real-time campaign statistics (Sent, Delivered, Opened, Clicked, Failed).
*   **Explainability Panel**: Transparently displays Gemini's reasoning and the extracted JSON parameters before executing campaigns.
*   **Interactive Architecture Visualizer**: A custom, animated UI dashboard displaying the distributed flow of the microservices in real-time.
*   **Microservices Architecture**:
    *   **CRM Backend**: Core API handling business logic, MongoDB aggregations, and Gemini integration.
    *   **Channel Service Simulator**: A standalone Node.js service simulating randomized message delivery statuses and firing webhooks back to the CRM.

## 🛠 Tech Stack

*   **Frontend**: React (Vite), TypeScript, Recharts, Lucide Icons, Vanilla CSS (Glassmorphism UI).
*   **Backend**: Node.js, Express, TypeScript, Axios.
*   **Database**: MongoDB (Mongoose) with Complex Aggregation Pipelines.
*   **AI**: Google Generative AI SDK (Gemini 2.5 Flash).
*   **Deployment**: Vercel (Frontend), Render (Backend & Channel Service).

## 🚀 Live Demo

*   **Frontend**: [Vercel Deployment URL]
*   **Backend**: Hosted on Render
*   **Simulator**: Hosted on Render

## ⚙️ Local Development

1. Clone the repository.
2. Setup environment variables in `crm-backend/.env` (`MONGODB_URI`, `GEMINI_API_KEY`).
3. Start the backend: `cd crm-backend && npm install && npx tsx src/index.ts`
4. Start the simulator: `cd channel-service && npm install && npx tsx src/index.ts`
5. Start the frontend: `cd crm-frontend && npm install && npm run dev`

---
*Built as a Full-Stack Assessment*
