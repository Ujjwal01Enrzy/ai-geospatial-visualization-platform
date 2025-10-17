import React, { useState } from "react";
import {
  Layers,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Search,
  Settings,
} from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";

const LayerManager = ({
  layers = [],
  activeLayers = [],
  onToggleLayer,
  onOpacityChange,
  onReorderLayers,
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState(new Set(["default"]));
  const [collapsed, setCollapsed] = useState(false);

  const filteredLayers = layers.filter((layer) =>
    layer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedLayers = filteredLayers.reduce((groups, layer) => {
    const group = layer.group || "default";
    if (!groups[group]) groups[group] = [];
    groups[group].push(layer);
    return groups;
  }, {});

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const getLayerTypeBadge = (type) => {
    const badges = {
      raster: "badge-primary",
      vector: "badge-accent",
      pointcloud: "badge-warning",
    };
    return badges[type?.toLowerCase()] || "badge-primary";
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed left-16 top-1/2 -translate-y-1/2 z-panel btn-icon bg-white dark:bg-neutral-800 shadow-elevation-3"
        aria-label="Expand layer manager"
      >
        <Layers className="w-20 h-20" />
      </button>
    );
  }

  return (
    <div className={`panel w-280 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-8">
          <Layers className="w-20 h-20 text-primary-500" />
          <h2 className="text-h4 font-semibold">Layers</h2>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="btn-icon"
          aria-label="Collapse layer manager"
        >
          <ChevronRight className="w-16 h-16" />
        </button>
      </div>

      {/* Search */}
      <div className="px-16 py-12 border-b border-neutral-200 dark:border-neutral-700">
        <div className="relative">
          <Search className="absolute left-12 top-1/2 -translate-y-1/2 w-16 h-16 text-neutral-400" />
          <input
            type="text"
            placeholder="Search layers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-40"
          />
        </div>
      </div>

      {/* Layer Groups */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {Object.entries(groupedLayers).map(([groupName, groupLayers]) => (
          <div
            key={groupName}
            className="border-b border-neutral-200 dark:border-neutral-700"
          >
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(groupName)}
              className="w-full px-16 py-12 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <span className="text-body-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize">
                {groupName} ({groupLayers.length})
              </span>
              {expandedGroups.has(groupName) ? (
                <ChevronDown className="w-16 h-16 text-neutral-500" />
              ) : (
                <ChevronRight className="w-16 h-16 text-neutral-500" />
              )}
            </button>

            {/* Group Layers */}
            {expandedGroups.has(groupName) && (
              <div className="pb-8">
                {groupLayers.map((layer) => {
                  const isActive = activeLayers.includes(layer.id);
                  const opacity = layer.opacity || 100;

                  return (
                    <div
                      key={layer.id}
                      className={`px-16 py-12 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                        isActive ? "bg-primary-50 dark:bg-primary-900/20" : ""
                      }`}
                    >
                      {/* Layer Info Row */}
                      <div className="flex items-center gap-12 mb-8">
                        <button
                          className="cursor-move"
                          aria-label="Reorder layer"
                        >
                          <GripVertical className="w-16 h-16 text-neutral-400" />
                        </button>

                        <Switch.Root
                          checked={isActive}
                          onCheckedChange={() => onToggleLayer(layer.id)}
                          className={`w-40 h-20 rounded-full transition-colors ${
                            isActive
                              ? "bg-primary-500"
                              : "bg-neutral-300 dark:bg-neutral-600"
                          }`}
                          aria-label={`Toggle ${layer.name} layer`}
                        >
                          <Switch.Thumb className="block w-16 h-16 bg-white rounded-full transition-transform translate-x-2 data-[state=checked]:translate-x-[22px]" />
                        </Switch.Root>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-8 mb-4">
                            <span className="text-body-sm font-medium text-neutral-900 dark:text-neutral-50 text-truncate">
                              {layer.name}
                            </span>
                            <span
                              className={`badge ${getLayerTypeBadge(
                                layer.type
                              )}`}
                            >
                              {layer.type}
                            </span>
                          </div>
                          {layer.description && (
                            <p className="text-caption text-neutral-600 dark:text-neutral-400 text-truncate">
                              {layer.description}
                            </p>
                          )}
                        </div>

                        <button
                          className="btn-icon"
                          aria-label={`${layer.name} settings`}
                        >
                          <Settings className="w-16 h-16" />
                        </button>
                      </div>

                      {/* Opacity Slider */}
                      {isActive && (
                        <div className="ml-68 mt-8 animate-fade-in">
                          <div className="flex items-center gap-12">
                            <span className="text-caption text-neutral-600 dark:text-neutral-400 w-60">
                              Opacity
                            </span>
                            <Slider.Root
                              className="relative flex items-center select-none touch-none flex-1 h-20"
                              value={[opacity]}
                              onValueChange={(values) =>
                                onOpacityChange(layer.id, values[0])
                              }
                              max={100}
                              step={1}
                              aria-label="Layer opacity"
                            >
                              <Slider.Track className="bg-neutral-300 dark:bg-neutral-600 relative grow rounded-full h-4">
                                <Slider.Range className="absolute bg-primary-500 rounded-full h-full" />
                              </Slider.Track>
                              <Slider.Thumb className="block w-16 h-16 bg-white border-2 border-primary-500 rounded-full shadow-elevation-1 hover:shadow-elevation-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </Slider.Root>
                            <span className="text-caption text-neutral-600 dark:text-neutral-400 w-32 text-right">
                              {opacity}%
                            </span>
                          </div>

                          {/* Color Legend */}
                          {layer.legend && (
                            <div className="mt-12 p-8 bg-neutral-50 dark:bg-neutral-900 rounded">
                              <p className="text-caption font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                                Legend
                              </p>
                              <div className="space-y-4">
                                {layer.legend.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-8"
                                  >
                                    <div
                                      className="w-16 h-16 rounded"
                                      style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-caption text-neutral-600 dark:text-neutral-400">
                                      {item.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {filteredLayers.length === 0 && (
          <div className="p-24 text-center">
            <Layers className="w-48 h-48 mx-auto text-neutral-300 dark:text-neutral-600 mb-12" />
            <p className="text-body-sm text-neutral-600 dark:text-neutral-400">
              {searchTerm
                ? "No layers found matching your search"
                : "No layers available"}
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-16 py-12 border-t border-neutral-200 dark:border-neutral-700">
        <button className="btn-secondary w-full">Add Layer</button>
      </div>
    </div>
  );
};

export default LayerManager;
