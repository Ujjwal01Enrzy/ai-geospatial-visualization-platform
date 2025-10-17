# System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATIONS                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Web Browser │  │   Electron   │  │ iOS/Android  │  │   Desktop    │       │
│  │   (React)    │  │   Desktop    │  │  (Capacitor) │  │     App      │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                  │                 │                │
│         └─────────────────┴──────────────────┴─────────────────┘                │
│                                    │                                             │
└────────────────────────────────────┼─────────────────────────────────────────────┘
                                     │
                         HTTP/WebSocket Connections
                                     │
┌────────────────────────────────────┼─────────────────────────────────────────────┐
│                    FRONTEND LAYER (React + Vite)                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  Components:                                                              │   │
│  │  • MapView.jsx (Mapbox GL + Deck.gl) - 2D/3D Maps                       │   │
│  │  • Globe3DView.jsx (CesiumJS + Resium) - 3D Globe                       │   │
│  │  • Dashboard, Login, ProjectList, AnalysisView                           │   │
│  │                                                                            │   │
│  │  Services:                                                                │   │
│  │  • api.js - REST API client (axios)                                      │   │
│  │  • websocket.js - Real-time data streaming                               │   │
│  │                                                                            │   │
│  │  State Management: Redux Toolkit                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                             │
└────────────────────────────────────┼─────────────────────────────────────────────┘
                                     │
                          RESTful API + WebSocket
                                     │
┌────────────────────────────────────┼─────────────────────────────────────────────┐
│                    BACKEND LAYER (Node.js + Express)                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  Routes:                                                                  │   │
│  │  • /api/auth       → authController.js                                   │   │
│  │  • /api/projects   → projectsController.js                               │   │
│  │  • /api/datasets   → datasetsController.js                               │   │
│  │  • /api/analysis   → analysisController.js                               │   │
│  │                                                                            │   │
│  │  Controllers:                                                             │   │
│  │  • Authentication (JWT, OAuth 2.0, RBAC)                                 │   │
│  │  • Dataset Management (CRUD, Spatial Queries)                            │   │
│  │  • AI Analysis Coordination                                              │   │
│  │                                                                            │   │
│  │  Middleware:                                                              │   │
│  │  • authenticateToken() - JWT verification                                │   │
│  │  • requireRole() - RBAC enforcement                                      │   │
│  │  • CORS, Helmet (security)                                               │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                        │                              │                          │
└────────────────────────┼──────────────────────────────┼──────────────────────────┘
                         │                              │
                   Database Queries            HTTP Requests
                         │                              │
         ┌───────────────┴───────────────┐             │
         │                               │             │
┌────────▼──────────┐        ┌──────────▼────────┐    │
│   PostgreSQL      │        │    AI SERVICE     │    │
│   + PostGIS       │        │  (Python FastAPI) │    │
│                   │        │                   │    │
│  Tables:          │        │  Models:          │    │
│  • users          │        │  • YOLOv5         │    │
│  • projects       │        │  • U-Net          │    │
│  • datasets       │        │  • DeepLabV3      │    │
│  • spatial_       │        │  • Siamese Net    │    │
│    features       │        │  • LSTM           │    │
│  • satellite_     │        │                   │    │
│    imagery        │        │  Libraries:       │    │
│  • detected_      │        │  • PyTorch        │    │
│    objects        │        │  • TensorFlow     │    │
│  • change_        │        │  • OpenCV         │    │
│    detection      │        │  • Rasterio       │    │
│  • land_cover     │        │                   │    │
│  • weather_data   │        │  Endpoints:       │    │
│  • analysis_tasks │        │  • /analyze/      │    │
│                   │        │    object-        │    │
│  Spatial Indexes: │        │    detection      │    │
│  • GIST indexes   │        │  • /analyze/      │    │
│  • Functions      │        │    segmentation   │    │
│  • Triggers       │        │  • /analyze/      │    │
│                   │        │    change-        │    │
└───────────────────┘        │    detection      │    │
                             └───────────────────┘    │
                                       │              │
                                       │              │
┌──────────────────────────────────────┼──────────────┼──────────────────────────┐
│                    DATA PIPELINE (Python Scripts)                               │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │  data_pipeline.py:                                                      │    │
│  │  • GeoDataPipeline - GDAL, GeoPandas processing                        │    │
│  │  • ExternalAPIIntegrator - Fetch external data                         │    │
│  │                                                                          │    │
│  │  Capabilities:                                                          │    │
│  │  • Vector data ingestion (Shapefile, GeoJSON)                          │    │
│  │  • Raster processing (GeoTIFF, JPEG2000)                               │    │
│  │  • Coordinate reprojection                                              │    │
│  │  • NDVI calculation                                                     │    │
│  │  • Spatial joins, buffer analysis                                       │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┬────────────────────────────────────────────┘
                                     │
                              External APIs
                                     │
┌────────────────────────────────────┼─────────────────────────────────────────────┐
│                           EXTERNAL APIS                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  • NASA EarthData API      → Satellite imagery                          │   │
│  │  • Sentinel Hub API        → High-res satellite data                    │   │
│  │  • USGS Earth Explorer     → DEM, LiDAR, terrain data                   │   │
│  │  • OpenWeatherMap API      → Real-time weather                          │   │
│  │  • Google Earth Engine     → Remote sensing analytics                   │   │
│  │  • Mapbox API              → Basemap tiles, geocoding                   │   │
│  │  • CesiumJS Ion            → 3D terrain, building tiles                 │   │
│  │  • OpenStreetMap API       → Geographic data                            │   │
│  │  • GeoServer REST API      → Publish layers from PostGIS                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT INFRASTRUCTURE                                  │
│                                                                                   │
│  Docker Compose (Development):                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                        │
│  │ Frontend │  │ Backend  │  │AI Service│  │PostgreSQL│                        │
│  │  :3000   │  │  :5000   │  │  :8000   │  │  :5432   │                        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                        │
│                                                                                   │
│  Kubernetes (Production):                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  Namespace: geospatial-platform                                     │        │
│  │                                                                       │        │
│  │  • Frontend Deployment (3 replicas) + LoadBalancer                  │        │
│  │  • Backend Deployment (3 replicas, HPA 2-10) + LoadBalancer         │        │
│  │  • AI Service Deployment (2 replicas, GPU) + Internal Service       │        │
│  │  • PostgreSQL StatefulSet + PersistentVolume (50Gi)                 │        │
│  │                                                                       │        │
│  │  • Secrets: postgres-secret, app-secrets, api-keys                  │        │
│  │  • ConfigMaps: postgres-init, app-config                            │        │
│  │  • Ingress: HTTPS/TLS termination                                   │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                   │
│  Cloud Platforms:                                                                │
│  • AWS (ECS, EKS, RDS)                                                           │
│  • Google Cloud Platform (GKE, Cloud SQL)                                        │
│  • Microsoft Azure (AKS, PostgreSQL)                                             │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                            │
│                                                                                   │
│  1. User uploads satellite image → Frontend                                      │
│  2. Frontend sends to Backend API → /api/datasets/:id/upload                     │
│  3. Backend stores file and creates analysis task → Database                     │
│  4. Backend calls AI Service → /analyze/object-detection                         │
│  5. AI Service processes image with YOLOv5                                       │
│  6. AI Service returns detection results → Backend                               │
│  7. Backend stores results in database → detected_objects table                  │
│  8. Backend notifies Frontend via WebSocket                                      │
│  9. Frontend fetches results → /api/analysis/tasks/:id                           │
│ 10. Frontend visualizes on map (Mapbox/Deck.gl) or globe (CesiumJS)             │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY ARCHITECTURE                                     │
│                                                                                   │
│  Authentication:                                                                  │
│  • JWT tokens (HS256) - 24h expiry                                               │
│  • Google OAuth 2.0 integration                                                  │
│  • bcrypt password hashing (10 rounds)                                           │
│                                                                                   │
│  Authorization:                                                                   │
│  • Role-Based Access Control (Admin, User, Viewer)                               │
│  • Middleware: authenticateToken(), requireRole()                                │
│  • Activity logging for audit trails                                             │
│                                                                                   │
│  Network Security:                                                                │
│  • HTTPS/TLS for all connections                                                 │
│  • CORS restrictions                                                              │
│  • Helmet.js security headers                                                    │
│  • Rate limiting on API endpoints                                                │
│                                                                                   │
│  Data Security:                                                                   │
│  • Encrypted secrets in Kubernetes                                               │
│  • PostgreSQL SSL connections                                                    │
│  • Environment variables for sensitive config                                    │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Opens app
     ▼
┌──────────────┐
│   React UI   │ ← Mapbox, Deck.gl, CesiumJS
└────┬─────────┘
     │ 2. Login request
     ▼
┌──────────────────┐
│  Express Server  │
└────┬─────────────┘
     │ 3. Verify credentials
     ▼
┌──────────────────┐
│   PostgreSQL     │
└────┬─────────────┘
     │ 4. Return JWT token
     ▼
┌──────────────┐
│   React UI   │
└────┬─────────┘
     │ 5. Upload image + token
     ▼
┌──────────────────┐
│  Express Server  │
└────┬─────────────┘
     │ 6. Validate token & store file
     ▼
┌──────────────────┐
│   PostgreSQL     │
└────┬─────────────┘
     │ 7. Create analysis task
     ▼
┌──────────────────┐
│  Express Server  │
└────┬─────────────┘
     │ 8. Send image to AI
     ▼
┌──────────────────┐
│  FastAPI (AI)    │
└────┬─────────────┘
     │ 9. Process with PyTorch
     ▼
┌──────────────────┐
│  YOLOv5 Model    │
└────┬─────────────┘
     │ 10. Return detections
     ▼
┌──────────────────┐
│  FastAPI (AI)    │
└────┬─────────────┘
     │ 11. Send results
     ▼
┌──────────────────┐
│  Express Server  │
└────┬─────────────┘
     │ 12. Store in DB
     ▼
┌──────────────────┐
│   PostgreSQL     │
└────┬─────────────┘
     │ 13. Notify via WebSocket
     ▼
┌──────────────┐
│   React UI   │ ← Display on map!
└──────────────┘
```

## Technology Stack Summary

| Layer        | Technologies                                     |
| ------------ | ------------------------------------------------ |
| **Frontend** | React, Vite, Mapbox GL, Deck.gl, CesiumJS, Redux |
| **Backend**  | Node.js, Express, Socket.io, JWT                 |
| **AI/ML**    | Python, FastAPI, PyTorch, TensorFlow, OpenCV     |
| **Data**     | GDAL, GeoPandas, Rasterio, Shapely               |
| **Database** | PostgreSQL, PostGIS                              |
| **DevOps**   | Docker, Kubernetes, Nginx                        |
| **Cloud**    | AWS, GCP, Azure                                  |
| **APIs**     | NASA, USGS, Sentinel Hub, OpenWeatherMap, Mapbox |
