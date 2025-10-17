/**
 * Datasets Controller
 * Handles: Dataset CRUD, Spatial queries, Data upload/download
 */

const { Pool } = require("pg");
const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/geospatial_db",
});

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Get all datasets
 */
const getAllDatasets = async (req, res) => {
  try {
    const { project_id, source_type, limit = 50, offset = 0 } = req.query;

    let query = "SELECT * FROM datasets WHERE 1=1";
    const params = [];

    if (project_id) {
      params.push(project_id);
      query += ` AND project_id = $${params.length}`;
    }

    if (source_type) {
      params.push(source_type);
      query += ` AND source_type = $${params.length}`;
    }

    params.push(limit, offset);
    query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${
      params.length
    }`;

    const result = await pool.query(query, params);

    res.json({
      datasets: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Get datasets error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get dataset by ID
 */
const getDatasetById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM datasets WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Dataset not found" });
    }

    res.json({ dataset: result.rows[0] });
  } catch (error) {
    console.error("Get dataset error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Create new dataset
 */
const createDataset = async (req, res) => {
  try {
    const { name, description, source_type, metadata, project_id } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!name || !source_type) {
      return res
        .status(400)
        .json({ error: "Name and source_type are required" });
    }

    const result = await pool.query(
      "INSERT INTO datasets (name, description, source_type, metadata, project_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        name,
        description,
        source_type,
        JSON.stringify(metadata || {}),
        project_id,
      ]
    );

    res.status(201).json({
      message: "Dataset created successfully",
      dataset: result.rows[0],
    });
  } catch (error) {
    console.error("Create dataset error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update dataset
 */
const updateDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, metadata } = req.body;

    const result = await pool.query(
      "UPDATE datasets SET name = COALESCE($1, name), description = COALESCE($2, description), metadata = COALESCE($3, metadata), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *",
      [name, description, metadata ? JSON.stringify(metadata) : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Dataset not found" });
    }

    res.json({
      message: "Dataset updated successfully",
      dataset: result.rows[0],
    });
  } catch (error) {
    console.error("Update dataset error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete dataset
 */
const deleteDataset = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM datasets WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Dataset not found" });
    }

    res.json({ message: "Dataset deleted successfully" });
  } catch (error) {
    console.error("Delete dataset error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Upload spatial data to dataset
 */
const uploadSpatialData = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // TODO: Process uploaded file (GeoJSON, Shapefile, etc.)
    // For now, just store file path

    const filePath = file.path;

    res.json({
      message: "File uploaded successfully",
      file: {
        filename: file.filename,
        path: filePath,
        size: file.size,
      },
    });
  } catch (error) {
    console.error("Upload spatial data error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get features within bounding box
 */
const getFeaturesInBbox = async (req, res) => {
  try {
    const { id } = req.params;
    const { minLon, minLat, maxLon, maxLat } = req.query;

    if (!minLon || !minLat || !maxLon || !maxLat) {
      return res
        .status(400)
        .json({ error: "Bounding box coordinates required" });
    }

    const result = await pool.query(
      `SELECT 
                id,
                ST_AsGeoJSON(geometry) as geometry,
                properties
            FROM spatial_features
            WHERE dataset_id = $1
            AND ST_Intersects(
                geometry,
                ST_MakeEnvelope($2, $3, $4, $5, 4326)
            )`,
      [id, minLon, minLat, maxLon, maxLat]
    );

    const features = result.rows.map((row) => ({
      type: "Feature",
      id: row.id,
      geometry: JSON.parse(row.geometry),
      properties: row.properties,
    }));

    res.json({
      type: "FeatureCollection",
      features,
    });
  } catch (error) {
    console.error("Get features in bbox error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Trigger AI analysis on dataset
 */
const triggerAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const { analysis_type, model_name, parameters } = req.body;

    // Validate analysis type
    const validTypes = ["object_detection", "segmentation", "change_detection"];
    if (!validTypes.includes(analysis_type)) {
      return res.status(400).json({ error: "Invalid analysis type" });
    }

    // Create analysis task
    const taskResult = await pool.query(
      "INSERT INTO analysis_tasks (task_type, status, input_data) VALUES ($1, $2, $3) RETURNING *",
      [
        analysis_type,
        "pending",
        JSON.stringify({ dataset_id: id, model_name, parameters }),
      ]
    );

    const task = taskResult.rows[0];

    // Call AI service (asynchronously)
    // In production, use a message queue like RabbitMQ or Kafka
    processAnalysisTask(task.id, id, analysis_type, model_name, parameters);

    res.json({
      message: "Analysis task created",
      task_id: task.id,
      status: "pending",
    });
  } catch (error) {
    console.error("Trigger analysis error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Process analysis task (background)
 */
const processAnalysisTask = async (
  taskId,
  datasetId,
  analysisType,
  modelName,
  parameters
) => {
  try {
    // Update task status to processing
    await pool.query(
      "UPDATE analysis_tasks SET status = $1, started_at = CURRENT_TIMESTAMP WHERE id = $2",
      ["processing", taskId]
    );

    // Get dataset files
    // In production, retrieve actual file paths from dataset
    const filePath = "/tmp/sample_image.tif";

    // Call AI service
    let response;
    if (analysisType === "object_detection") {
      const formData = new FormData();
      const fileBuffer = await fs.readFile(filePath);
      formData.append("file", fileBuffer, "image.tif");

      response = await axios.post(
        `${AI_SERVICE_URL}/analyze/object-detection`,
        formData,
        { headers: formData.getHeaders() }
      );
    }
    // Add other analysis types...

    // Store results
    await pool.query(
      "UPDATE analysis_tasks SET status = $1, output_data = $2, completed_at = CURRENT_TIMESTAMP WHERE id = $3",
      ["completed", JSON.stringify(response.data), taskId]
    );
  } catch (error) {
    console.error("Process analysis task error:", error);

    // Update task with error
    await pool.query(
      "UPDATE analysis_tasks SET status = $1, error_message = $2, completed_at = CURRENT_TIMESTAMP WHERE id = $3",
      ["failed", error.message, taskId]
    );
  }
};

/**
 * Get analysis task status
 */
const getAnalysisStatus = async (req, res) => {
  try {
    const { task_id } = req.params;

    const result = await pool.query(
      "SELECT * FROM analysis_tasks WHERE id = $1",
      [task_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ task: result.rows[0] });
  } catch (error) {
    console.error("Get analysis status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get dataset statistics
 */
const getDatasetStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    const featureCountResult = await pool.query(
      "SELECT COUNT(*) as count FROM spatial_features WHERE dataset_id = $1",
      [id]
    );

    const analysisCountResult = await pool.query(
      "SELECT COUNT(*) as count FROM ai_analysis_results WHERE dataset_id = $1",
      [id]
    );

    res.json({
      feature_count: parseInt(featureCountResult.rows[0].count),
      analysis_count: parseInt(analysisCountResult.rows[0].count),
    });
  } catch (error) {
    console.error("Get dataset statistics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllDatasets,
  getDatasetById,
  createDataset,
  updateDataset,
  deleteDataset,
  uploadSpatialData,
  getFeaturesInBbox,
  triggerAnalysis,
  getAnalysisStatus,
  getDatasetStatistics,
};
