# AI-Powered Geospatial Visualization Platform

A comprehensive, cross-platform geospatial data visualization and analysis system powered by AI/ML, integrating satellite imagery, LiDAR, IoT sensors, and GIS layers into a unified interactive interface.

## 🏗️ Architecture Overview

This platform consists of multiple microservices:

### 1. **geo-visualization-platform-frontend** (Client)

- **Location**: `/client`
- **Technologies**: React.js, Vite, Mapbox GL, Deck.gl, CesiumJS
- **Features**:
  - Interactive 2D/3D map visualization
  - Real-time data streaming
  - AI analysis result visualization
  - Multi-platform support (Web, Desktop via Electron, Mobile via Capacitor)

### 2. **geo-visualization-platform-backend** (Server)

- **Location**: `/server`
- **Technologies**: Node.js, Express, PostgreSQL + PostGIS
- **Features**:
  - RESTful API
  - Spatial data management
  - User authentication (JWT, OAuth 2.0)
  - Real-time WebSocket connections

### 3. **geo-ai-engine** (AI Service)

- **Location**: `/ai`
- **Technologies**: Python, FastAPI, PyTorch, TensorFlow, OpenCV
- **Features**:
  - Object detection (YOLOv5)
  - Semantic segmentation (U-Net, DeepLabV3)
  - Change detection (Siamese networks)
  - Time series prediction (LSTM)

### 4. **geo-data-pipeline** (Data Processing)

- **Location**: `/ai/scripts`
- **Technologies**: Python, GDAL, GeoPandas, Apache Kafka
- **Features**:
  - Data ingestion from multiple sources
  - Raster/vector data processing
  - External API integration (NASA, USGS, Sentinel Hub)

### 5. **geo-auth-service** (Authentication)

- **Location**: `/server/src/controllers/authController.js`
- **Technologies**: JWT, OAuth 2.0, bcrypt
- **Features**:
  - User registration/login
  - Role-based access control (RBAC)
  - Google OAuth integration

## 🌐 External APIs Integrated

| API                | Purpose                    | Implementation                           |
| ------------------ | -------------------------- | ---------------------------------------- |
| Mapbox API         | 2D/3D mapping              | `/client/src/components/MapView.jsx`     |
| CesiumJS API       | 3D globe visualization     | `/client/src/components/Globe3DView.jsx` |
| OpenWeatherMap API | Weather data overlays      | `/ai/scripts/data_pipeline.py`           |
| NASA EarthData API | Satellite imagery          | `/ai/scripts/data_pipeline.py`           |
| USGS API           | DEM and LiDAR data         | `/ai/scripts/data_pipeline.py`           |
| Sentinel Hub API   | High-res satellite imagery | `/ai/scripts/data_pipeline.py`           |

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+ with PostGIS extension

### 1. Environment Setup

Create `.env` files in each service directory:

#### Server `.env`:

```env
DATABASE_URL=postgres://postgres:postgres@db:5432/geospatial_db
JWT_SECRET=your-secret-key-change-in-production
GOOGLE_CLIENT_ID=your-google-oauth-client-id
AI_SERVICE_URL=http://ai-service:8000
```

#### Client `.env`:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AI_SERVICE_URL=http://localhost:8000
REACT_APP_MAPBOX_TOKEN=your-mapbox-token
REACT_APP_CESIUM_TOKEN=your-cesium-ion-token
```

#### AI Service `.env`:

```env
NASA_EARTHDATA_KEY=your-nasa-key
SENTINEL_HUB_KEY=your-sentinel-key
OPENWEATHER_KEY=your-openweather-key
USGS_KEY=your-usgs-key
```

### 2. Start with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8000
- **PostgreSQL**: localhost:5432

### 3. Manual Setup (Development)

#### Database Setup:

```bash
# Start PostgreSQL with PostGIS
docker run -d \
  --name geospatial_db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=geospatial_db \
  -p 5432:5432 \
  postgis/postgis:14-3.3

# Initialize database
psql -U postgres -h localhost -d geospatial_db -f db/init.sql
```

#### Backend Setup:

```bash
cd server
npm install
npm run dev
```

#### Frontend Setup:

```bash
cd client
npm install
npm start
```

#### AI Service Setup:

```bash
cd ai
pip install -r requirements_complete.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📊 Database Schema

The database uses PostgreSQL with PostGIS for spatial data support:

### Core Tables:

- `users` - User accounts and authentication
- `projects` - Project organization
- `datasets` - Dataset metadata
- `spatial_features` - Vector spatial features
- `satellite_imagery` - Satellite image metadata
- `detected_objects` - AI object detection results
- `change_detection` - Temporal change analysis
- `land_cover` - Land cover classification
- `weather_data` - Weather information
- `analysis_tasks` - Background processing queue

## 🤖 AI/ML Capabilities

### 1. Object Detection

**Endpoint**: `POST /analyze/object-detection`

Detects objects in satellite/aerial imagery:

- Buildings
- Vehicles
- Trees
- Water bodies
- Infrastructure

**Example**:

```bash
curl -X POST http://localhost:8000/analyze/object-detection \
  -F "file=@satellite_image.tif" \
  -F "confidence=0.5"
```

### 2. Semantic Segmentation

**Endpoint**: `POST /analyze/segmentation`

Land cover classification:

- Water
- Vegetation
- Urban areas
- Bare soil
- Clouds

### 3. Change Detection

**Endpoint**: `POST /analyze/change-detection`

Compares temporal images to detect:

- Deforestation
- Urban growth
- Flood extent
- Agricultural changes

### 4. Time Series Prediction

**Endpoint**: `POST /predict/timeseries`

Forecasts future values for:

- Vegetation indices (NDVI)
- Urban expansion
- Climate patterns

## 🔐 Authentication & Authorization

### JWT Authentication

```javascript
// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}

// Use token in subsequent requests
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Role-Based Access Control

- **Admin**: Full system access
- **User**: Create projects, run analysis
- **Viewer**: Read-only access

## 📡 API Documentation

### Backend API Endpoints

#### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

#### Datasets

- `GET /api/datasets` - List all datasets
- `GET /api/datasets/:id` - Get dataset details
- `POST /api/datasets` - Create dataset
- `PUT /api/datasets/:id` - Update dataset
- `DELETE /api/datasets/:id` - Delete dataset
- `GET /api/datasets/:id/features` - Get spatial features
- `POST /api/datasets/:id/upload` - Upload spatial data
- `POST /api/datasets/:id/analyze` - Trigger AI analysis
- `GET /api/datasets/:id/stats` - Get statistics

#### Projects

- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Analysis

- `GET /api/analysis/tasks/:id` - Get task status
- `GET /api/analysis/results/:id` - Get analysis results

## 🎨 Frontend Components

### MapView Component

**Location**: `/client/src/components/MapView.jsx`

Features:

- Multiple basemap styles (satellite, streets, terrain)
- Deck.gl layers for visualization
- Real-time data updates
- 3D view toggle
- Object detection overlays

### Globe3DView Component

**Location**: `/client/src/components/Globe3DView.jsx`

Features:

- CesiumJS-powered 3D globe
- Terrain visualization
- 3D building rendering
- Fly-to navigation
- Temporal data visualization

## 🔧 Configuration

### Mapbox Configuration

1. Sign up at https://account.mapbox.com/
2. Create an access token
3. Add to `.env`: `REACT_APP_MAPBOX_TOKEN=pk.your_token`

### Cesium Ion Configuration

1. Sign up at https://cesium.com/ion/
2. Get access token
3. Add to `.env`: `REACT_APP_CESIUM_TOKEN=your_token`

### External API Configuration

Add API keys to AI service `.env`:

```env
NASA_EARTHDATA_KEY=your_key
SENTINEL_HUB_KEY=your_key
OPENWEATHER_KEY=your_key
```

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# AI service tests
cd ai
pytest

# Frontend tests
cd client
npm test
```

## 📦 Deployment

### Kubernetes Deployment (Coming Soon)

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/

# Check status
kubectl get pods
```

### Cloud Deployment

The platform supports deployment on:

- AWS (ECS, EKS, RDS)
- Google Cloud Platform (GKE, Cloud SQL)
- Microsoft Azure (AKS, PostgreSQL)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

Developed by the Geospatial AI Team

## 📧 Support

For issues and questions:

- GitHub Issues: [Project Issues](https://github.com/your-org/project/issues)
- Email: support@geoplatform.com
- Documentation: https://docs.geoplatform.com

## 🗺️ Roadmap

- [x] Core platform architecture
- [x] AI/ML model integration
- [x] 2D/3D visualization
- [x] Authentication & authorization
- [x] External API integration
- [ ] Real-time collaboration
- [ ] Mobile app (Capacitor)
- [ ] Desktop app (Electron)
- [ ] Advanced analytics dashboard
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline
- [ ] Comprehensive testing suite

## 📚 Additional Resources

- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [CesiumJS Documentation](https://cesium.com/docs/)
- [Deck.gl Documentation](https://deck.gl/)
- [PostGIS Documentation](https://postgis.net/docs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PyTorch Documentation](https://pytorch.org/docs/)
