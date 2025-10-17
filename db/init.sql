-- Enable PostGIS extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS postgis_raster;

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'user', 'viewer');
CREATE TYPE data_source_type AS ENUM ('satellite', 'lidar', 'iot', 'vector');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Datasets table
CREATE TABLE datasets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    source_type data_source_type NOT NULL,
    metadata JSONB,
    project_id INTEGER REFERENCES projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial features table
CREATE TABLE spatial_features (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER REFERENCES datasets(id),
    geometry geometry(Geometry, 4326),
    properties JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI analysis results table
CREATE TABLE ai_analysis_results (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER REFERENCES datasets(id),
    model_name VARCHAR(255) NOT NULL,
    results JSONB,
    geometry geometry(Geometry, 4326),
    confidence FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Satellite imagery table
CREATE TABLE satellite_imagery (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER REFERENCES datasets(id),
    satellite VARCHAR(100) NOT NULL,  -- Sentinel-2, Landsat, etc.
    acquisition_date TIMESTAMP WITH TIME ZONE,
    cloud_coverage FLOAT,
    bounds geometry(Polygon, 4326),
    file_path VARCHAR(512),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Weather data table
CREATE TABLE weather_data (
    id SERIAL PRIMARY KEY,
    location geometry(Point, 4326),
    temperature FLOAT,
    humidity FLOAT,
    precipitation FLOAT,
    wind_speed FLOAT,
    conditions VARCHAR(100),
    recorded_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(50),  -- OpenWeatherMap, NOAA, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Change detection results
CREATE TABLE change_detection (
    id SERIAL PRIMARY KEY,
    before_image_id INTEGER REFERENCES satellite_imagery(id),
    after_image_id INTEGER REFERENCES satellite_imagery(id),
    change_type VARCHAR(100),  -- deforestation, urbanization, flood, etc.
    change_geometry geometry(Geometry, 4326),
    change_area FLOAT,  -- in square meters
    confidence FLOAT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Object detection results
CREATE TABLE detected_objects (
    id SERIAL PRIMARY KEY,
    image_id INTEGER REFERENCES satellite_imagery(id),
    object_class VARCHAR(100),  -- building, vehicle, tree, etc.
    bbox geometry(Polygon, 4326),
    centroid geometry(Point, 4326),
    confidence FLOAT,
    properties JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Land cover classification
CREATE TABLE land_cover (
    id SERIAL PRIMARY KEY,
    image_id INTEGER REFERENCES satellite_imagery(id),
    class_name VARCHAR(100),  -- water, vegetation, urban, bare_soil
    geometry geometry(MultiPolygon, 4326),
    area FLOAT,  -- hectares
    percentage FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analysis tasks queue
CREATE TABLE analysis_tasks (
    id SERIAL PRIMARY KEY,
    task_type VARCHAR(100) NOT NULL,  -- object_detection, segmentation, change_detection
    status VARCHAR(50) DEFAULT 'pending',  -- pending, processing, completed, failed
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User activity logs
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API keys for external services
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) UNIQUE NOT NULL,
    api_key VARCHAR(512) NOT NULL,
    rate_limit INTEGER,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial indexes
CREATE INDEX spatial_features_idx ON spatial_features USING GIST (geometry);
CREATE INDEX ai_results_idx ON ai_analysis_results USING GIST (geometry);
CREATE INDEX satellite_bounds_idx ON satellite_imagery USING GIST (bounds);
CREATE INDEX weather_location_idx ON weather_data USING GIST (location);
CREATE INDEX change_detection_idx ON change_detection USING GIST (change_geometry);
CREATE INDEX detected_objects_bbox_idx ON detected_objects USING GIST (bbox);
CREATE INDEX detected_objects_centroid_idx ON detected_objects USING GIST (centroid);
CREATE INDEX land_cover_idx ON land_cover USING GIST (geometry);

-- Create regular indexes for performance
CREATE INDEX datasets_project_id_idx ON datasets(project_id);
CREATE INDEX spatial_features_dataset_id_idx ON spatial_features(dataset_id);
CREATE INDEX ai_results_dataset_id_idx ON ai_analysis_results(dataset_id);
CREATE INDEX satellite_dataset_id_idx ON satellite_imagery(dataset_id);
CREATE INDEX weather_recorded_at_idx ON weather_data(recorded_at);
CREATE INDEX analysis_tasks_status_idx ON analysis_tasks(status);
CREATE INDEX activity_logs_user_id_idx ON activity_logs(user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at
    BEFORE UPDATE ON datasets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Spatial query functions
CREATE OR REPLACE FUNCTION get_features_in_bbox(
    bbox_geom geometry,
    dataset_filter INTEGER DEFAULT NULL
)
RETURNS TABLE (
    feature_id INTEGER,
    feature_geometry geometry,
    feature_properties JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sf.id,
        sf.geometry,
        sf.properties
    FROM spatial_features sf
    WHERE ST_Intersects(sf.geometry, bbox_geom)
    AND (dataset_filter IS NULL OR sf.dataset_id = dataset_filter);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate change statistics
CREATE OR REPLACE FUNCTION calculate_change_statistics(
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    change_type_filter VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    change_type VARCHAR,
    total_occurrences BIGINT,
    total_area FLOAT,
    avg_confidence FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cd.change_type,
        COUNT(*) as total_occurrences,
        SUM(cd.change_area) as total_area,
        AVG(cd.confidence) as avg_confidence
    FROM change_detection cd
    WHERE cd.created_at BETWEEN start_date AND end_date
    AND (change_type_filter IS NULL OR cd.change_type = change_type_filter)
    GROUP BY cd.change_type;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO users (email, password_hash, role) VALUES
('admin@geoplatform.com', '$2b$10$examplehash', 'admin'),
('user@geoplatform.com', '$2b$10$examplehash', 'user'),
('viewer@geoplatform.com', '$2b$10$examplehash', 'viewer');

INSERT INTO projects (name, description, owner_id) VALUES
('Urban Growth Analysis', 'Analyzing urban expansion patterns', 1),
('Deforestation Monitoring', 'Tracking forest cover changes', 1),
('Agricultural Assessment', 'Crop health and yield prediction', 2);
