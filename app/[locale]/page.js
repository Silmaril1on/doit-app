"use client";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { useState } from "react";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function HomePage() {
  const [tooltip, setTooltip] = useState("");

  return (
    <div className="flex flex-col grow items-center justify-center bg-black min-h-screen p-8 gap-4">
      <div className="w-full max-w-5xl border border-teal-500/20 rounded-2xl bg-black/60 backdrop-blur-xl overflow-hidden">
        <div className="px-5 pt-4 pb-2 border-b border-teal-500/10 flex items-center justify-between">
          <div>
            <h1 className="text-cream text-xl font-bold">World Map</h1>
            {tooltip ? (
              <p className="secondary text-xs text-teal-400">{tooltip}</p>
            ) : (
              <p className="secondary text-xs text-chino/50">Hover a country</p>
            )}
          </div>
        </div>

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 130, center: [0, 20] }}
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setTooltip(geo.properties.name)}
                    onMouseLeave={() => setTooltip("")}
                    style={{
                      default: {
                        fill: "#0f2a2a",
                        stroke: "#14b8a6",
                        strokeWidth: 0.4,
                        outline: "none",
                      },
                      hover: {
                        fill: "#14b8a6",
                        stroke: "#5eead4",
                        strokeWidth: 0.6,
                        outline: "none",
                      },
                      pressed: { fill: "#0d9488", outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
}
