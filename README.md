# AI-Powered 3D Data Visualization Studio

![Home Page](./src/assets/screen.png)

## Overview
The **AI-Powered 3D Data Visualization Studio** is a cutting-edge platform designed to transform complex, multi-dimensional datasets into immersive, interactive 3D landscapes. By harnessing the power of Artificial Intelligence and advanced rendering technologies, this system allows users to _"Visualize the Invisible"_—revealing hidden patterns, anomalies, and correlations in data that traditional 2D graphs cannot capture.

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
A unified interface to monitor active data pipelines, review computational health metrics (compute load, memory usage), and manage "Active Nodes" (e.g., NODE-992-AX) in real-time. Features Quick Start Templates to instantly deploy pre-configured visualization architectures.

### 2. The Data Studio & Ingestion Engine
- **Drag & Drop Engine**: Upload raw `.CSV` or `.JSON` datasets securely.
- **AI Smart Clean Engine**: Topologically analyzes uploaded schemas in real-time. It provides automated suggestions such as interpolating missing null values and Z-Score signal scaling.
- **Data Quality Report & Distribution Analysis**: Get detailed views of your dataset's variance, completeness, and skewness prior to 3D rendering.

### 3. Comprehensive 3D Chart Libraries
Interact with your data using immersive web-based 3D graphics:
- **Scatter Charts**: High-density 3D cluster mapping for multivariate datasets and outlier detection.
- **Bar Charts 3D**: Compare categorical magnitudes across a 3-dimensional plane.
- **Line Graphs 3D**: Track temporal changes or continuous variables in physical space.
- **Surface Plots**: Render complex mathematical surfaces to analyze topological terrains and regressions.

### 4. Collaboration & Asset Management
- **Project Workspaces**: Seamless real-time collaboration with role-based access control (Owner, Editor, Viewer).
- **Asset Library Browser**: Drag, drop, upload, and organize reference files, textures, and 3D architectural assets securely.
- **Messaging Views**: Sync internal team communications, pipeline status, and discuss data anomalies natively in the app.

## Technical Architecture & Flow

The system runs via a robust hybrid architecture:
1. **Frontend UI**: Built on React, TypeScript, and Vite. Utilizes TailwindCSS and Glassmorphism for a futuristic, immersive user interface. 
2. **3D Engine**: Uses `Three.js` via `React Three Fiber` and `Drei` to run optimized, high-performance WebGL renders directly in the browser.
3. **Backend API (Django)**: A Python Django server acts as the data ingestion pipeline, parsing uploads and returning structured, visualization-ready JSON.
4. **Asynchronous Background Processing (Celery & Redis)**: Celery reliably processes extremely large dataset uploads and AI cleaning operations in the background without locking the UI.
5. **State Management**: `Zustand` handles active user sessions, dataset streams, and 3D camera coordinates globally.

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
