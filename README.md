# AI-Powered 3D Data Visualization Studio

![Home Page](./src/assets/hero.png)

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
- **Collaborate in Real-Time**: Deploy and share interactive 3D spaces instead of presenting static, flat PDFs.
- **Monitor System Health**: Track live computational feeds, memory usage, and node health dynamically from a centralized dashboard.

## Core Features
### 1. The Dashboard (Command Center)
A unified interface to monitor active data pipelines, review computational health metrics (compute load, memory usage), and manage "Active Nodes" (e.g., NODE-992-AX) in real-time. Features Quick Start Templates to instantly deploy pre-configured visualization architectures.

### 2. The Data Studio (Ingestion Node)
- **Drag & Drop Engine**: Upload raw `.CSV` or `.JSON` datasets securely.
- **AI Smart Clean Engine**: Topologically analyzes uploaded schemas in real-time. It provides automated suggestions such as:
  - Interpolating missing null values.
  - Z-Score signal scaling to normalize outliers.
  - Auto-mapping geographic coordinates (`Geo_Coord`) to spatial projections.
- **Real-time Data Matrix**: Instantly preview how the system parses your data stream with topological summaries.

### 3. Rapid 3D Templates
- **Statistical (Scatter Plots)**: High-density 3D cluster mapping for multivariate datasets and outlier detection.
- **Relational (Network Graphs)**: Visualize complex interdependencies and neural node architectures in physical space.
- **Geospatial (Geographic Maps)**: Project global data layers onto interactive 3D globes with terrain extrusion.

### 4. Collaboration & Asset Management
- **Project Workspaces & Collaborate**: Seamless real-time collaboration with role-based access control (Owner, Editor, Viewer), threaded node discussions, and live performance monitoring.
- **Templates & Library Browser**: Access, save, and reuse 3D visualization architectures and shared material assets within the UI.
- **Project Settings & Messaging**: Manage system-wide preferences, API connections, and sync internal team communications on data pipeline status.

## How It Works (Technical Architecture)
1. **Frontend UI**: Built on React, TypeScript, and Vite. Utilizes TailwindCSS and Glassmorphism for a futuristic, immersive user interface. 
2. **3D Engine**: Uses `Three.js` via `React Three Fiber` and `Drei` to run optimized, high-performance WebGL renders directly in the browser.
3. **Backend API**: A Python Django offline-capable server acts as the data ingestion pipeline. It parses uploaded datasets, executes cleaning algorithms, and returns structured, visualization-ready JSON outputs back to the React client.
4. **State Management**: `Zustand` keeps track of active user sessions, dataset streams, and 3D camera coordinates globally.

---

## User Workflow (A Guide for New Users, HR, & Team Members)

To understand how to utilize this platform day-to-day, follow this standard workflow:

### Step 1: System Login & Dashboard Review
- Start at the **Dashboard**. Review the health of any ongoing data pipelines and active instance nodes in the system summary. 
- From here, you can either jump back into a "Recent Project" (e.g., *Neural Stream V2*, *Quantum Bit Map*) or click to start a **New Experiment**.

### Step 2: Data Ingestion (The Data Studio)
- Navigate to the **Data Studio** via the sidebar or hero button.
- Drag and drop a raw dataset (like a CSV file of sales data, analytics, or server logs) into the drop zone.
- *Wait for the Neural Parse:* The Django backend instantly processes the file and streams it back to the interface safely.

### Step 3: AI Smart Cleaning
- Once uploaded, direct your attention to the **Smart Clean** sidebar on the right.
- The AI will automatically flag issues (like missing rows or extreme outliers). 
- Click **"Apply Fix"** or **"Optimize"** to let the AI normalize the dataset automatically. This skips hours of manual Excel/Python data wrangling.

### Step 4: Choose a Visualization Architecture
- Now that your data is clean, select an ingestion preset depending on your goal:
  - Select **Statistical** if looking for general groupings and anomalies.
  - Select **Geospatial** if the data contains map coordinates.
  - Select **Relational** if the data represents networks, ties, or nodes.
- Click **"Run Pipeline"**.

### Step 5: The 3D Editor 
- Explore the data in 3D WebGL space. You can rotate, zoom, and inspect data points physically with your mouse.
- Once configured, you can save the view, tune the 3D materials, and share the insights dynamically with your department natively from the app.

---
_Built for the future of Data Analytics. Bringing the invisible to light._
