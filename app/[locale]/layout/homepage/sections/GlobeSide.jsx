"use client";
import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import Globe from "react-globe.gl";

const LOCATIONS = [
  { name: "Berlin", lat: 52.52, lng: 13.405, code: "de" },
  { name: "London", lat: 51.505, lng: -0.09, code: "gb" },
  { name: "Cairo", lat: 30.0444, lng: 31.2357, code: "eg" },
  { name: "Beijing", lat: 39.9042, lng: 116.4074, code: "cn" },
  { name: "Budapest", lat: 47.4979, lng: 19.0402, code: "hu" },
  { name: "Paris", lat: 48.8566, lng: 2.3522, code: "fr" },
  { name: "Sydney", lat: -33.8688, lng: 151.2093, code: "au" },
  { name: "Dubai", lat: 25.1972, lng: 55.2744, code: "ae" },
  { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, code: "br" },
  { name: "Rome", lat: 41.9028, lng: 12.4964, code: "it" },
];

// Create arcs between random pairs of cities
const ARCS = [
  { startLat: 52.52, startLng: 13.405, endLat: 51.505, endLng: -0.09 },
  { startLat: 48.8566, startLng: 2.3522, endLat: 41.9028, endLng: 12.4964 },
  { startLat: 30.0444, startLng: 31.2357, endLat: 25.1972, endLng: 55.2744 },
  { startLat: 39.9042, startLng: 116.4074, endLat: -33.8688, endLng: 151.2093 },
  { startLat: 47.4979, startLng: 19.0402, endLat: 52.52, endLng: 13.405 },
  { startLat: -22.9068, startLng: -43.1729, endLat: 48.8566, endLng: 2.3522 },
  { startLat: 51.505, startLng: -0.09, endLat: 30.0444, endLng: 31.2357 },
  { startLat: 25.1972, startLng: 55.2744, endLat: 39.9042, endLng: 116.4074 },
];

const GlobeSide = () => {
  const globeRef = useRef(null);

  // Inject pulse keyframes into document head once
  useEffect(() => {
    const styleId = "globe-pin-pulse";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes globe-pin-pulse {
        0%   { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
        70%  { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    globe.pointOfView({ lat: 20, lng: 20, altitude: 2.2 });

    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.enableZoom = false;
    }
  }, []);

  const htmlElement = (d) => {
    const wrapper = document.createElement("div");
    wrapper.style.cssText =
      "position:relative;text-align:center;cursor:pointer;width:32px;";

    // Pulsing ring
    const ring = document.createElement("div");
    ring.style.cssText = `
      position:absolute;
      top:50%;left:50%;
      width:32px;height:32px;
      border-radius:50%;
      border:2px solid rgba(0,229,204,0.8);
      animation:globe-pin-pulse 2s ease-out infinite;
      pointer-events:none;
    `;

    // Flag image
    const img = document.createElement("img");
    img.src = `https://flagcdn.com/w40/${d.code}.png`;
    img.alt = d.name;
    img.style.cssText =
      "width:32px;height:32px;border-radius:50%;border:2px solid rgba(0,229,204,0.5);object-fit:cover;display:block;";

    // City name
    const label = document.createElement("p");
    label.textContent = d.name;
    label.style.cssText =
      "color:rgba(255,255,255,0.85);font-size:9px;margin-top:4px;white-space:nowrap;font-family:sans-serif;";

    wrapper.appendChild(ring);
    wrapper.appendChild(img);
    wrapper.appendChild(label);
    return wrapper;
  };

  const pointsData = useMemo(() => LOCATIONS, []);
  const arcsData = useMemo(() => ARCS, []);

  return (
    <motion.div
      className="w-full h-full flex items-center justify-center overflow-hidden relative"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
    >
      {/* Radial glow behind globe */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-[60%] w-[60%] rounded-full bg-primary/20 blur-[80px]" />
      </div>

      <Globe
        ref={globeRef}
        width={670}
        height={670}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor="#00e5cc"
        atmosphereAltitude={0.15}
        // HTML location cards
        htmlElementsData={pointsData}
        htmlElement={htmlElement}
        htmlAltitude={0.02}
        // Animated arcs
        arcsData={arcsData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={() => ["#00e5cc", "#7c3aed"]}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcStroke={0.5}
        arcAltitudeAutoScale={0.3}
      />
    </motion.div>
  );
};

export default GlobeSide;
