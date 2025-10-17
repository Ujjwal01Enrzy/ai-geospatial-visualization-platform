/**
 * Globe3DView Component
 * 3D Globe visualization using CesiumJS and Resium
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Viewer,
  Entity,
  EntityDescription,
  CameraFlyTo,
  GeoJsonDataSource,
  ImageryLayer,
  Cesium3DTileset,
} from "resium";
import {
  Cartesian3,
  Color,
  Ion,
  IonResource,
  createWorldTerrain,
  HeightReference,
  VerticalOrigin,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

// Set Cesium Ion access token
Ion.defaultAccessToken = process.env.REACT_APP_CESIUM_TOKEN || "";

const Globe3DView = ({ datasetId, analysisResults, satelliteImagery }) => {
  const viewerRef = useRef();
  const [terrainProvider, setTerrainProvider] = useState(null);
  const [cameraPosition, setCameraPosition] = useState({
    destination: Cartesian3.fromDegrees(-75.0, 40.0, 10000000),
    orientation: {
      heading: 0,
      pitch: -90,
      roll: 0,
    },
  });
  const [show3DTerrain, setShow3DTerrain] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);
  const [geoJsonData, setGeoJsonData] = useState(null);

  useEffect(() => {
    // Load terrain provider
    const terrain = createWorldTerrain({
      requestWaterMask: true,
      requestVertexNormals: true,
    });
    setTerrainProvider(terrain);
  }, []);

  useEffect(() => {
    if (analysisResults?.detections) {
      // Convert detections to GeoJSON
      const features = analysisResults.detections.map((detection) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [detection.centroid.lng, detection.centroid.lat],
        },
        properties: {
          name: detection.class,
          confidence: detection.confidence,
          description: `${detection.class} (${(
            detection.confidence * 100
          ).toFixed(1)}%)`,
        },
      }));

      setGeoJsonData({
        type: "FeatureCollection",
        features,
      });
    }
  }, [analysisResults]);

  /**
   * Fly to location
   */
  const flyTo = (lon, lat, altitude = 1000) => {
    if (viewerRef.current?.cesiumElement) {
      viewerRef.current.cesiumElement.camera.flyTo({
        destination: Cartesian3.fromDegrees(lon, lat, altitude),
        duration: 2,
      });
    }
  };

  /**
   * Toggle 3D terrain
   */
  const toggle3DTerrain = () => {
    if (viewerRef.current?.cesiumElement) {
      if (show3DTerrain) {
        viewerRef.current.cesiumElement.terrainProvider = null;
      } else {
        viewerRef.current.cesiumElement.terrainProvider = terrainProvider;
      }
      setShow3DTerrain(!show3DTerrain);
    }
  };

  /**
   * Get marker color based on detection class
   */
  const getMarkerColor = (className) => {
    const colors = {
      building: Color.ORANGE,
      vehicle: Color.RED,
      tree: Color.GREEN,
      water: Color.BLUE,
    };
    return colors[className] || Color.WHITE;
  };

  /**
   * Render detection entities
   */
  const renderDetections = () => {
    if (!analysisResults?.detections) return null;

    return analysisResults.detections.map((detection, index) => {
      const position = Cartesian3.fromDegrees(
        detection.centroid.lng,
        detection.centroid.lat,
        0
      );

      return (
        <Entity
          key={`detection-${index}`}
          position={position}
          point={{
            pixelSize: 10,
            color: getMarkerColor(detection.class),
            outlineColor: Color.BLACK,
            outlineWidth: 2,
            heightReference: HeightReference.CLAMP_TO_GROUND,
          }}
          label={{
            text: detection.class,
            font: "14px sans-serif",
            fillColor: Color.WHITE,
            outlineColor: Color.BLACK,
            outlineWidth: 2,
            style: 0,
            verticalOrigin: VerticalOrigin.BOTTOM,
            pixelOffset: new Cartesian2(0, -15),
            heightReference: HeightReference.CLAMP_TO_GROUND,
          }}
          description={`
                        <div>
                            <h3>${detection.class}</h3>
                            <p>Confidence: ${(
                              detection.confidence * 100
                            ).toFixed(1)}%</p>
                            <p>Location: ${detection.centroid.lat.toFixed(
                              4
                            )}, ${detection.centroid.lng.toFixed(4)}</p>
                        </div>
                    `}
        />
      );
    });
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <Viewer
        ref={viewerRef}
        full
        terrainProvider={show3DTerrain ? terrainProvider : undefined}
        timeline={false}
        animation={false}
        baseLayerPicker={true}
        geocoder={true}
        homeButton={true}
        sceneModePicker={true}
        navigationHelpButton={true}
        fullscreenButton={true}
      >
        {/* Satellite Imagery Layer */}
        {satelliteImagery && (
          <ImageryLayer
            imageryProvider={new IonResource(satelliteImagery.ionAssetId)}
            alpha={0.8}
          />
        )}

        {/* GeoJSON Data */}
        {geoJsonData && (
          <GeoJsonDataSource
            data={geoJsonData}
            markerColor={Color.YELLOW}
            clampToGround={true}
          />
        )}

        {/* Detection Entities */}
        {renderDetections()}

        {/* 3D Buildings Tileset */}
        {showBuildings && (
          <Cesium3DTileset
            url={IonResource.fromAssetId(96188)} // Cesium OSM Buildings
            show={showBuildings}
          />
        )}

        {/* Camera Controls */}
        <CameraFlyTo
          destination={cameraPosition.destination}
          orientation={cameraPosition.orientation}
          duration={0}
          once
        />
      </Viewer>

      {/* Controls Panel */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
          zIndex: 1,
          minWidth: "250px",
        }}
      >
        <h3 style={{ margin: "0 0 15px 0", color: "white" }}>
          3D Globe Controls
        </h3>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={show3DTerrain}
              onChange={toggle3DTerrain}
              style={{ marginRight: "10px" }}
            />
            <span>3D Terrain</span>
          </label>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={showBuildings}
              onChange={(e) => setShowBuildings(e.target.checked)}
              style={{ marginRight: "10px" }}
            />
            <span>Show Buildings</span>
          </label>
        </div>

        <div style={{ marginTop: "20px" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "white" }}>
            Quick Navigation
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={() => flyTo(-74.006, 40.7128, 5000)}
              style={{
                padding: "8px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              New York
            </button>
            <button
              onClick={() => flyTo(-118.2437, 34.0522, 5000)}
              style={{
                padding: "8px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Los Angeles
            </button>
            <button
              onClick={() => flyTo(139.6917, 35.6895, 5000)}
              style={{
                padding: "8px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Tokyo
            </button>
          </div>
        </div>

        {analysisResults?.detections && (
          <div style={{ marginTop: "20px" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "white" }}>
              Detections: {analysisResults.detections.length}
            </h4>
            <div style={{ fontSize: "12px", color: "#aaa" }}>
              View details by clicking on markers
            </div>
          </div>
        )}
      </div>

      {/* Statistics Panel */}
      {analysisResults && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            zIndex: 1,
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "white" }}>
            Analysis Statistics
          </h4>
          <div style={{ fontSize: "14px" }}>
            {analysisResults.detections && (
              <div>Total Objects: {analysisResults.detections.length}</div>
            )}
            {analysisResults.processing_time && (
              <div>
                Processing Time: {analysisResults.processing_time.toFixed(2)}s
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Globe3DView;
