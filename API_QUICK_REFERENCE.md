# API Quick Reference Guide

## 🚀 Getting Started

### Base URLs

```
Backend API:  http://localhost:5000
AI Service:   http://localhost:8000
Frontend:     http://localhost:3000
```

## 🔐 Authentication

### Register New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "role": "user"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Use Token in Requests

```bash
curl http://localhost:5000/api/datasets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 Datasets API

### Create Dataset

```bash
curl -X POST http://localhost:5000/api/datasets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "San Francisco Imagery",
    "description": "Satellite imagery of San Francisco Bay Area",
    "source_type": "satellite",
    "metadata": {
      "resolution": "10m",
      "bands": ["RGB", "NIR"]
    },
    "project_id": 1
  }'
```

### Get All Datasets

```bash
curl http://localhost:5000/api/datasets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Upload Spatial Data

```bash
curl -X POST http://localhost:5000/api/datasets/1/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/satellite_image.tif"
```

### Get Features in Bounding Box

```bash
curl "http://localhost:5000/api/datasets/1/features?minLon=-122.5&minLat=37.7&maxLon=-122.3&maxLat=37.8" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": 1,
      "geometry": {
        "type": "Point",
        "coordinates": [-122.4, 37.75]
      },
      "properties": {
        "name": "Building A",
        "height": 50
      }
    }
  ]
}
```

## 🤖 AI Analysis API

### Trigger Object Detection

```bash
curl -X POST http://localhost:5000/api/datasets/1/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "analysis_type": "object_detection",
    "model_name": "yolov5",
    "parameters": {
      "confidence": 0.5
    }
  }'
```

**Response:**

```json
{
  "message": "Analysis task created",
  "task_id": "123",
  "status": "pending"
}
```

### Check Analysis Status

```bash
curl http://localhost:5000/api/analysis/tasks/123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "task": {
    "id": 123,
    "task_type": "object_detection",
    "status": "completed",
    "output_data": {
      "detections": [
        {
          "class": "building",
          "confidence": 0.95,
          "bbox": [100, 100, 200, 200]
        }
      ]
    },
    "processing_time": 5.2
  }
}
```

## 🔬 Direct AI Service Calls

### Object Detection

```bash
curl -X POST http://localhost:8000/analyze/object-detection \
  -F "file=@satellite_image.jpg" \
  -F "confidence=0.5"
```

**Response:**

```json
{
  "task_id": "od_1234567890",
  "status": "completed",
  "results": {
    "detections": [
      {
        "class_name": "building",
        "confidence": 0.95,
        "bbox": [100, 100, 200, 200]
      },
      {
        "class_name": "vehicle",
        "confidence": 0.88,
        "bbox": [150, 250, 170, 270]
      }
    ],
    "total_objects": 2
  },
  "processing_time": 2.5
}
```

### Land Cover Segmentation

```bash
curl -X POST http://localhost:8000/analyze/segmentation \
  -F "file=@satellite_image.tif"
```

**Response:**

```json
{
  "task_id": "seg_1234567890",
  "status": "completed",
  "results": {
    "mask_url": "/tmp/mask.png",
    "classes": ["water", "vegetation", "urban", "bare_soil"],
    "pixel_counts": {
      "water": 12500,
      "vegetation": 45000,
      "urban": 30000,
      "bare_soil": 12500
    },
    "area_hectares": 100.0
  },
  "processing_time": 3.8
}
```

### Change Detection

```bash
curl -X POST http://localhost:8000/analyze/change-detection \
  -F "file1=@before_image.tif" \
  -F "file2=@after_image.tif"
```

**Response:**

```json
{
  "task_id": "cd_1234567890",
  "status": "completed",
  "results": {
    "changed_regions": [
      {
        "bbox": [100, 100, 50, 50],
        "area": 2500.0
      }
    ],
    "total_changed_area_pixels": 2500.0,
    "change_percentage": 2.5
  },
  "processing_time": 4.2
}
```

### List Available Models

```bash
curl http://localhost:8000/models
```

**Response:**

```json
{
  "object_detection": ["yolov5s", "yolov5m", "yolov5l"],
  "segmentation": ["unet", "deeplabv3", "fcn"],
  "classification": ["resnet50", "efficientnet"]
}
```

### Health Check

```bash
curl http://localhost:8000/health
```

**Response:**

```json
{
  "status": "healthy",
  "gpu_available": true,
  "models_loaded": ["yolov5"]
}
```

## 🗺️ Projects API

### Create Project

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Urban Growth Study",
    "description": "Analyzing urban expansion in major cities"
  }'
```

### List Projects

```bash
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Project

```bash
curl -X PUT http://localhost:5000/api/projects/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project Name",
    "description": "New description"
  }'
```

### Delete Project

```bash
curl -X DELETE http://localhost:5000/api/projects/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🌤️ External API Examples

### Get Weather Data

```bash
# Via backend proxy
curl "http://localhost:5000/api/weather?lat=37.7749&lon=-122.4194" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Direct OpenWeatherMap API
curl "https://api.openweathermap.org/data/2.5/weather?lat=37.7749&lon=-122.4194&appid=YOUR_API_KEY&units=metric"
```

## 📝 Response Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created                              |
| 400  | Bad Request (invalid input)          |
| 401  | Unauthorized (missing/invalid token) |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found                            |
| 409  | Conflict (duplicate resource)        |
| 500  | Internal Server Error                |

## 🔐 Role-Based Access

| Role       | Permissions                            |
| ---------- | -------------------------------------- |
| **admin**  | Full access to all resources           |
| **user**   | Create/edit own projects, run analysis |
| **viewer** | Read-only access                       |

### Example: Admin-only Endpoint

```bash
# Requires admin role
curl -X DELETE http://localhost:5000/api/datasets/1 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 🌍 Frontend API Client Usage (JavaScript)

```javascript
import { authAPI, datasetsAPI, aiAPI } from "./services/api";

// Login
const { token, user } = await authAPI.login("user@example.com", "password");

// Create dataset
const dataset = await datasetsAPI.create({
  name: "My Dataset",
  source_type: "satellite",
});

// Trigger AI analysis
const task = await datasetsAPI.triggerAnalysis(
  dataset.id,
  "object_detection",
  "yolov5",
  { confidence: 0.5 }
);

// Direct AI service call
const result = await aiAPI.detectObjects(fileObject, 0.5, (progress) =>
  console.log(`Upload: ${progress}%`)
);

// Get weather
const weather = await externalAPI.getWeather(37.7749, -122.4194);
```

## 🧪 Testing with Postman

### Import Collection

1. Create new collection in Postman
2. Add environment variables:
   - `BASE_URL`: http://localhost:5000
   - `AI_URL`: http://localhost:8000
   - `TOKEN`: (set after login)

### Test Sequence

1. **Register** → Save token
2. **Create Project** → Save project_id
3. **Create Dataset** → Save dataset_id
4. **Upload Data** → Use dataset_id
5. **Trigger Analysis** → Save task_id
6. **Check Status** → Poll until complete

## 📊 Database Direct Queries (PostgreSQL)

```sql
-- Get all users
SELECT * FROM users;

-- Get datasets with feature count
SELECT
  d.*,
  COUNT(sf.id) as feature_count
FROM datasets d
LEFT JOIN spatial_features sf ON sf.dataset_id = d.id
GROUP BY d.id;

-- Get detections in bounding box
SELECT
  id,
  object_class,
  confidence,
  ST_AsGeoJSON(bbox) as bbox_geojson
FROM detected_objects
WHERE ST_Intersects(
  bbox,
  ST_MakeEnvelope(-122.5, 37.7, -122.3, 37.8, 4326)
);

-- Calculate change statistics
SELECT
  change_type,
  COUNT(*) as occurrences,
  SUM(change_area) as total_area,
  AVG(confidence) as avg_confidence
FROM change_detection
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY change_type;
```

## 🔧 Common Issues & Solutions

### Issue: 401 Unauthorized

**Solution**: Check if token is valid and included in Authorization header

### Issue: CORS Error

**Solution**: Ensure frontend URL is in CORS whitelist

### Issue: File Upload Fails

**Solution**: Check Content-Type is multipart/form-data and file size limits

### Issue: AI Service Timeout

**Solution**: Increase timeout for large images or use background processing

## 📚 Additional Resources

- Full Documentation: `/COMPREHENSIVE_README.md`
- Database Schema: `/db/init.sql`
- API Implementation: `/server/src/controllers/`
- AI Models: `/ai/models/ai_models.py`
- Frontend Examples: `/client/src/components/`
