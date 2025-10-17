/**
 * MapView Component
 * Integrates: Mapbox GL, Deck.gl for 2D/3D geospatial visualization
 */

import React, { useState, useEffect, useRef } from "react";
import MapGL, {
  Source,
  Layer,
  NavigationControl,
  ScaleControl,
} from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, ScatterplotLayer, HexagonLayer } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || "";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const MapView = ({ projectId, datasetId, analysisResults }) => {
  const [viewState, setViewState] = useState({
    longitude: -98.5795,
    latitude: 39.8283,
    zoom: 4,
    pitch: 0,
    bearing: 0,
  });

  const [features, setFeatures] = useState([]);
  const [layers, setLayers] = useState([]);
  const [basemap, setBasemap] = useState(
    "mapbox://styles/mapbox/satellite-streets-v12"
  );
  const [showDetections, setShowDetections] = useState(true);
  const [show3D, setShow3D] = useState(false);

  const mapRef = useRef();

  // Load spatial features
  useEffect(() => {
    if (datasetId) {
      loadFeatures(datasetId);
    }
  }, [datasetId]);

  // Update layers when data changes
  useEffect(() => {
    updateLayers();
  }, [features, analysisResults, showDetections, show3D]);

  /**
   * Load spatial features from API
   */
  const loadFeatures = async (datasetId) => {
    try {
      const bounds = mapRef.current?.getBounds();

      let url = `${API_URL}/api/datasets/${datasetId}/features`;

      if (bounds) {
        const { _sw, _ne } = bounds;
        url += `?minLon=${_sw.lng}&minLat=${_sw.lat}&maxLon=${_ne.lng}&maxLat=${_ne.lat}`;
      }

      const response = await axios.get(url);
      setFeatures(response.data.features);
    } catch (error) {
      console.error("Error loading features:", error);
    }
  };

  /**
   * Update Deck.gl layers
   */
  const updateLayers = () => {
    const newLayers = [];

    // GeoJSON features layer
    if (features.length > 0) {
      newLayers.push(
        new GeoJsonLayer({
          id: "geojson-layer",
          data: {
            type: "FeatureCollection",
            features,
          },
          filled: true,
          stroked: true,
          getFillColor: [200, 200, 200, 100],
          getLineColor: [0, 0, 0, 255],
          getLineWidth: 2,
          pickable: true,
          onHover: (info) => {
            if (info.object) {
              console.log("Feature:", info.object);
            }
          },
        })
      );
    }

    // Object detection results layer
    if (showDetections && analysisResults?.detections) {
      newLayers.push(
        new ScatterplotLayer({
          id: "detections-layer",
          data: analysisResults.detections,
          getPosition: (d) => [d.centroid.lng, d.centroid.lat],
          getRadius: 50,
          getFillColor: (d) => {
            const colors = {
              building: [255, 140, 0, 200],
              vehicle: [255, 0, 0, 200],
              tree: [0, 255, 0, 200],
              water: [0, 100, 255, 200],
            };
            return colors[d.class] || [255, 255, 255, 200];
          },
          pickable: true,
          onHover: (info) => {
            if (info.object) {
              // Show tooltip
              console.log("Detection:", info.object);
            }
          },
        })
      );
    }

    // Heatmap layer for density visualization
    if (analysisResults?.heatmapData) {
      newLayers.push(
        new HeatmapLayer({
          id: "heatmap-layer",
          data: analysisResults.heatmapData,
          getPosition: (d) => [d.lng, d.lat],
          getWeight: (d) => d.weight,
          radiusPixels: 60,
          intensity: 1,
          threshold: 0.05,
        })
      );
    }

    // 3D hexagon layer for aggregation
    if (show3D && features.length > 0) {
      newLayers.push(
        new HexagonLayer({
          id: "hexagon-layer",
          data: features.map((f) => ({
            position: f.geometry.coordinates,
          })),
          getPosition: (d) => d.position,
          radius: 1000,
          elevationScale: 50,
          extruded: true,
          pickable: true,
        })
      );
    }

    setLayers(newLayers);
  };

  /**
   * Handle view state change
   */
  const handleViewStateChange = ({ viewState }) => {
    setViewState(viewState);
  };

  /**
   * Change basemap style
   */
  const changeBasemap = (style) => {
    const styles = {
      satellite: "mapbox://styles/mapbox/satellite-streets-v12",
      streets: "mapbox://styles/mapbox/streets-v12",
      dark: "mapbox://styles/mapbox/dark-v11",
      light: "mapbox://styles/mapbox/light-v11",
      terrain: "mapbox://styles/mapbox/outdoors-v12",
    };
    setBasemap(styles[style] || styles.satellite);
  };

  /**
   * Toggle 3D view
   */
  const toggle3D = () => {
    setShow3D(!show3D);
    if (!show3D) {
      setViewState({ ...viewState, pitch: 60, bearing: -20 });
    } else {
      setViewState({ ...viewState, pitch: 0, bearing: 0 });
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={handleViewStateChange}
        controller={true}
        layers={layers}
      >
        <MapGL
          ref={mapRef}
          {...viewState}
          mapStyle={basemap}
          mapboxAccessToken={MAPBOX_TOKEN}
          onMove={(evt) => setViewState(evt.viewState)}
        >
          <NavigationControl position="top-right" />
          <ScaleControl position="bottom-right" />
        </MapGL>
      </DeckGL>

      {/* Map Controls */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "white",
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          zIndex: 1,
        }}
      >
        <h3 style={{ margin: "0 0 10px 0" }}>Map Controls</h3>

        <div style={{ marginBottom: "10px" }}>
          <label>Basemap:</label>
          <select
            onChange={(e) => changeBasemap(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px" }}
          >
            <option value="satellite">Satellite</option>
            <option value="streets">Streets</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            <input
              type="checkbox"
              checked={showDetections}
              onChange={(e) => setShowDetections(e.target.checked)}
            />
            Show Detections
          </label>
        </div>

        <div>
          <button
            onClick={toggle3D}
            style={{
              padding: "8px 16px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {show3D ? "Switch to 2D" : "Switch to 3D"}
          </button>
        </div>

        <div style={{ marginTop: "15px" }}>
          <button
            onClick={() => loadFeatures(datasetId)}
            style={{
              padding: "8px 16px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reload Data
          </button>
        </div>
      </div>

      {/* Legend */}
      {showDetections && analysisResults?.detections && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 20,
            background: "white",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            zIndex: 1,
          }}
        >
          <h4 style={{ margin: "0 0 10px 0" }}>Legend</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  background: "rgb(255, 140, 0)",
                  marginRight: 10,
                }}
              ></div>
              <span>Building</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  background: "rgb(255, 0, 0)",
                  marginRight: 10,
                }}
              ></div>
              <span>Vehicle</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  background: "rgb(0, 255, 0)",
                  marginRight: 10,
                }}
              ></div>
              <span>Tree</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  background: "rgb(0, 100, 255)",
                  marginRight: 10,
                }}
              ></div>
              <span>Water</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
