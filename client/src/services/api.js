/**
 * API Service for communicating with backend
 */

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const AI_URL = process.env.REACT_APP_AI_SERVICE_URL || "http://localhost:8000";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const aiClient = axios.create({
  baseURL: AI_URL,
  timeout: 120000, // AI operations may take longer
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ==================== Authentication API ====================

export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post("/api/auth/login", {
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  register: async (email, password, role = "user") => {
    const response = await apiClient.post("/api/auth/register", {
      email,
      password,
      role,
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  googleLogin: async (idToken) => {
    const response = await apiClient.post("/api/auth/google", { idToken });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getProfile: async () => {
    const response = await apiClient.get("/api/auth/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put("/api/auth/profile", data);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.post("/api/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// ==================== Projects API ====================

export const projectsAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get("/api/projects", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/projects/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post("/api/projects", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/api/projects/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/projects/${id}`);
    return response.data;
  },
};

// ==================== Datasets API ====================

export const datasetsAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get("/api/datasets", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/datasets/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post("/api/datasets", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/api/datasets/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/datasets/${id}`);
    return response.data;
  },

  getFeatures: async (id, bbox = null) => {
    const params = bbox
      ? {
          minLon: bbox[0],
          minLat: bbox[1],
          maxLon: bbox[2],
          maxLat: bbox[3],
        }
      : {};
    const response = await apiClient.get(`/api/datasets/${id}/features`, {
      params,
    });
    return response.data;
  },

  uploadData: async (id, file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
      `/api/datasets/${id}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );
    return response.data;
  },

  triggerAnalysis: async (id, analysisType, modelName, parameters = {}) => {
    const response = await apiClient.post(`/api/datasets/${id}/analyze`, {
      analysis_type: analysisType,
      model_name: modelName,
      parameters,
    });
    return response.data;
  },

  getStatistics: async (id) => {
    const response = await apiClient.get(`/api/datasets/${id}/stats`);
    return response.data;
  },
};

// ==================== Analysis API ====================

export const analysisAPI = {
  getTaskStatus: async (taskId) => {
    const response = await apiClient.get(`/api/analysis/tasks/${taskId}`);
    return response.data;
  },

  getResults: async (resultId) => {
    const response = await apiClient.get(`/api/analysis/results/${resultId}`);
    return response.data;
  },
};

// ==================== AI Service API ====================

export const aiAPI = {
  detectObjects: async (file, confidence = 0.5, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("confidence", confidence);

    const response = await aiClient.post(
      "/analyze/object-detection",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );
    return response.data;
  },

  segmentImage: async (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await aiClient.post("/analyze/segmentation", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  detectChanges: async (beforeImage, afterImage, onProgress) => {
    const formData = new FormData();
    formData.append("file1", beforeImage);
    formData.append("file2", afterImage);

    const response = await aiClient.post(
      "/analyze/change-detection",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );
    return response.data;
  },

  getModels: async () => {
    const response = await aiClient.get("/models");
    return response.data;
  },

  healthCheck: async () => {
    const response = await aiClient.get("/health");
    return response.data;
  },
};

// ==================== External APIs Integration ====================

export const externalAPI = {
  // OpenWeatherMap
  getWeather: async (lat, lon) => {
    const apiKey = process.env.REACT_APP_OPENWEATHER_KEY;
    if (!apiKey) {
      console.warn("OpenWeatherMap API key not configured");
      return null;
    }

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            lat,
            lon,
            appid: apiKey,
            units: "metric",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return null;
    }
  },

  // Geocoding
  geocode: async (address) => {
    const response = await apiClient.get("/api/geocode", {
      params: { address },
    });
    return response.data;
  },

  reverseGeocode: async (lat, lon) => {
    const response = await apiClient.get("/api/reverse-geocode", {
      params: { lat, lon },
    });
    return response.data;
  },
};

// ==================== WebSocket Connection ====================

export const createSocketConnection = () => {
  const socket = io(API_URL, {
    auth: {
      token: localStorage.getItem("token"),
    },
  });

  return socket;
};

export default {
  authAPI,
  projectsAPI,
  datasetsAPI,
  analysisAPI,
  aiAPI,
  externalAPI,
  createSocketConnection,
};
