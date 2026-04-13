# Kinetic Observatory: AI Spatial DataOps & 3D Analytics Studio

![Home Page](./src/assets/screen.png)

## Overview
The **Kinetic Observatory: AI Spatial DataOps & 3D Analytics Studio** is a cutting-edge platform designed to transform complex, multi-dimensional datasets into immersive, interactive 3D landscapes. By harnessing the power of Artificial Intelligence and advanced rendering technologies, this system allows users to _"Visualize the Invisible"_—revealing hidden patterns, anomalies, and correlations in data that traditional 2D graphs cannot capture.

## Purpose & Motive
The motive behind this system is to bridge the gap between complex data science and intuitive human understanding. Modern enterprises generate massive amounts of data, yet standard dashboards (bar charts, line graphs) often fail to convey the multi-layered depth of this information. 

This studio was developed to:
1. **Reduce cognitive load** when analyzing high-dimensional data.
2. **Leverage AI** to automate tedious data-cleaning tasks (like handling missing values and outlier normalization).
3. **Provide spatial context** to data through 3D visualization, making it easier for human brains to intuitively spot clusters, trends, and topological anomalies.

## What Can You Achieve?
With this project, organizations, analysts, and data scientists can:
- **Discover Unknown Patterns**: Use 3D spatial mapping to find unexpected correlations easily.
- **Save Time with AI Data Prep**: The built-in "Smart Clean Insight Engine" automatically prepares raw data for rendering.
- **Analyze Data Distributions**: Review deep Data Quality Reports and Data Distribution Analyses before rendering.
- **Collaborate in Real-Time**: Deploy and share interactive 3D spaces instead of presenting static, flat PDFs.
- **Monitor System Health**: Track live computational feeds, memory usage, and node health dynamically from a centralized dashboard.

## Core Features

### 1. The Dashboard (Command Center)
- **Features:** A unified interface to monitor active data pipelines, review computational health metrics (compute load, memory usage), and manage "Active Nodes" (e.g., NODE-992-AX) in real-time.
- **Purpose (High Availability Standards):** Ensures system uptime and microservice visibility. Real-time compute tracking prevents heavy server loads from blocking the main UX, adhering to enterprise SaaS monitoring benchmarks.

### 2. The Data Studio & Ingestion Engine
- **Features:** Drag & Drop `.CSV` processing with an AI Smart Clean Engine. It topologically analyzes schemas, suggesting automated median/mode compensations and Z-Score signal scaling.
- **Purpose (Data Integrity & AutoML):** Data scientists spend ~80% of their time prepping raw data. This engine autonomously sanitizes and normalizes variance, enforcing "Garbage-Free" parameters before any mathematical deployment occurs.

### 3. Comprehensive 3D Chart Libraries
- **Features:** Hardware-accelerated WebGL charts (Scatter, Bar, Line, Surface) featuring dynamic viewport "frustum normalization" so large datasets render perfectly within bounds.
- **Purpose (Spatial Narrative):** Standard Business Intelligence (Tableau, PowerBI) maps in 2D. 3D WebGL provides critical spatial dimensions needed for complex N-dimensional pattern routing (genomics, logistics, financial spreads).

### 4. Advanced Machine Learning Simulator
- **Features:** A live ML testing environment displaying strict "Train vs Test" dual-metric bounds and real-time Confusion Matrices based on physical variance-sensitive algorithms (`Ridge`/`Logistic`).
- **Purpose (Model Governance):** Separating train vs test data prohibits hazardous model "overfitting." The generated Confusion Matrices follow MLOps evaluation schemas to ensure algorithms aren't skewing blindly between false positives/negatives when cleaning pipelines run.

### 5. Collaboration & Asset Management
- **Features:** Shared Project Workspaces featuring `<Canvas>` Object integration for architectural reference files mapped next to raw numeric data streams.
- **Purpose (Data Observability & ECM):** Bridges the gap between siloed data science units and creative directors. Real-time data syncs enforce single-source-of-truth architectures preventing dangerous "data drift."

---

## Enterprise Value & Industry Standards

This project structurally adheres to modern **Data Science** and **MLOps (Machine Learning Operations)** parameters:

1. **AutoML & Data Integrity**: Data scientists spend ~80% of their time prepping data. The "Smart Clean Engine" autonomously imputes NULLs (via algorithmic Medians and Modes) and enforces Variance Normalization, upholding strict enterprise data integrity prior to ingestion.
2. **Model Governance (Confusion Matrix & ML Simulator)**: Proper validation prohibits flat metric testing. The simulator strictly generates independent Train vs. Test bounds and Confusion Matrices to mathematically ensure zero algorithmic overfitting or dangerous False Positives, utilizing sensitive linear solvers to actively demonstrate precision degradation on "dirty" raw data.
3. **High Availability (HA) & Asynchronous Loads**: Following strict microservice scaling parameters, complex numerical workloads (like PCA rendering or Random Forest loops) are completely off-loaded to Celery Background Workers and Redis Queues, guaranteeing the UI never blocks or freezes under high enterprise load.
4. **Data Observability (Dashboards)**: Prevents structural "data drift." Providing immediate skewness plotting, bounding thresholds, and variance alerts ensures datasets meet exact diagnostic metrics before any downstream analysis occurs.
5. **Spatial Narrative (WebGL Topologies)**: Where standard Business Intelligence (BI) platforms (e.g., Tableau, PowerBI) rely on abstract 2D graphics, this engine pushes N-dimensional WebGL coordinate frustum mapping. This grants spatial cognition natively required for complex genome plotting, deep financial regression, and structural routing tasks.

## Technical Architecture & Flow

The system runs via a robust hybrid architecture:
1. **Frontend UI**: Built on React, TypeScript, and Vite. Utilizes TailwindCSS and Glassmorphism for a futuristic, immersive user interface. 
2. **3D Engine**: Uses `Three.js` via `React Three Fiber` and `Drei` to run optimized, high-performance WebGL renders directly in the browser.
3. **Backend API (Django)**: A Python Django server acts as the data ingestion pipeline, parsing uploads and returning structured, visualization-ready JSON.
4. **Asynchronous Background Processing (Celery & Redis)**: Celery reliably processes extremely large dataset uploads and AI cleaning operations in the background without locking the UI.
5. **State Management**: `Zustand` handles active user sessions, dataset streams, and 3D camera coordinates globally.

---

## Repository Structure & File Coordination

To understand how the platform breathes, here is the breakdown of the exact files and how they coordinate seamlessly to ingest, process, and render data.

### 1. Frontend (`/src`)
- **`src/components/views/*`**: Contains the main dashboard screens that users interact with.
  - `DataStudioView.tsx`: The primary ingestion point. Users drop files here.
  - `DataDistributionAnalysisView.tsx` & `DataQualityReportView.tsx`: Provide pre-render analytical summaries based on the backend's AI output.
  - `Editor3DView.tsx`: The wrapper for the 3D WebGL context.
  - `AssetLibraryView.tsx` & `CollaborateView.tsx`: Manage uploaded assets and real-time team interactions.
- **`src/components/charts/*`**: The customized 3D rendering components (`BarChart3D.tsx`, `ScatterChart.tsx`, `LineGraph3D.tsx`, `SurfacePlot.tsx`). They receive data and render it spatially.
- **`src/store/useAppStore.ts`**: The central nervous system (using Zustand). It holds the current dataset, layout states, and coordinates updates between the UI Views and the 3D Charts.
- **`src/components/Scene.tsx`**: The core React Three Fiber canvas where all the 3D chart components are mounted and animated.

### 2. Backend API (`/backend`)
- **`backend/core/settings.py` & `celery.py`**: Configuration for Django and the Celery worker queue.
- **`backend/api/views.py`**: The API endpoints receiving raw datasets from the React frontend.
- **`backend/api/models.py`**: The database schema defining how `Datasets` and analytical AI results are structured and stored.
- **`backend/api/tasks.py`**: Background asynchronous Celery workers. When large CSVs are uploaded, this file handles the AI cleaning, topological summarization, and heavy math without locking up the server.

### 3. Execution & Component Coordination Flow
The magic happens when these files work together in sequence:
1. **User Action**: The user drops a CSV into `DataStudioView.tsx`.
2. **API Request**: The React application calls the Backend API.
3. **Backend Intake**: Django's `api/views.py` receives the file. Instead of processing it instantly, it hands the workload off to `api/tasks.py`.
4. **Asynchronous Math**: Celery (using Redis as an inter-process broker) churns through the CSV, runs AI algorithms, and saves the cleaned JSON mapping to `api/models.py`.
5. **Frontend State Updates**: The frontend receives the cleaned dataset payload. `useAppStore.ts` consumes this new data and triggers a global re-render.
6. **Analytical Routing**: Data populates inside `DataQualityReportView.tsx` so the user can verify data variance.
7. **3D Rendering**: Finally, when the user opens `Editor3DView.tsx`, `Scene.tsx` mounts the scene. It reads the dataset from `useAppStore.ts` and passes it as rendering props to the customized 3D charts in `src/components/charts/`. The WebGL engine takes over, outputting the 3D visualization.

---

## Installation & Deployment (Docker)

The simplest way to run the entire stack (Frontend React, Backend Django, Celery Workers, and Redis) is via Docker Compose.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Dhruvil4625/AI-Powered-3D-Data-Visualization-Studio.git
   cd AI-Powered-3D-Data-Visualization-Studio
   ```

2. **Boot up the stack:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - **Frontend UI:** `http://localhost:5173`
   - **Backend API:** `http://localhost:8000`

---

## User Workflow (A Guide for New Users)

To understand how to utilize this platform day-to-day, follow this standard workflow:

### Step 1: System Login & Dashboard Review
- Start at the **Dashboard**. Review the health of any ongoing data pipelines and active instance nodes in the system summary. 
- You can either jump back into a "Recent Project" or click to start a **New Experiment**.

### Step 2: Data Ingestion
- Navigate to the **Data Studio**.
- Drag and drop a raw dataset (like `test.csv`) into the drop zone. The Celery Task Queue handles the parsing in the background safely.

### Step 3: Analytics & Smart Cleaning
- Review the **Data Quality Report** and **Data Distribution Analysis** tabs. The AI engine will flag extreme outliers or missing rows.
- Apply AI suggestions to auto-clean the data instead of manual spreadsheet coding.

### Step 4: Choose a Visualization Architecture
- Select your 3D view (Scatter, Bar, Line, or Surface).
- Click **"Run Pipeline"**.

### Step 5: The 3D Editor 
- Explore the data in 3D WebGL space. You can rotate, zoom, and inspect data points physically with your mouse.
- Use the **Asset Library** to bring in additional 3D models or textures.
- Use the **Collaborate** and **Messaging** views to share findings with your team in real-time.

---
_Built for the future of Data Analytics. Bringing the invisible to light._
