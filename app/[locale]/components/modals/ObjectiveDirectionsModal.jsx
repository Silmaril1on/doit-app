"use client";
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useLoadScript,
  GoogleMap,
  OverlayView,
  DirectionsRenderer,
} from "@react-google-maps/api";
import GlobalModal from "@/app/[locale]/components/modals/GlobalModal";
import {
  closeModal,
  selectModal,
} from "@/app/[locale]/lib/features/modalSlice";
import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import ToggleButton from "../buttons/ToggleButton";
import ActionButton from "../buttons/ActionButton";
import ImageTag from "../elements/ImageTag";
import { MdMyLocation } from "react-icons/md";

// ── CSS keyframe animations injected once ─────────────────────────────────────
const PIN_KEYFRAMES = `
  @keyframes user-pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
  @keyframes venue-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
  @keyframes user-ring-1  { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(1.7);opacity:0} }
  @keyframes user-ring-2  { 0%{transform:scale(1);opacity:.4} 100%{transform:scale(2.1);opacity:0} }
  @keyframes venue-ring-1 { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(1.7);opacity:0} }
  @keyframes venue-ring-2 { 0%{transform:scale(1);opacity:.4} 100%{transform:scale(2.0);opacity:0} }
  .user-pulse  { animation: user-pulse  2s ease-in-out infinite }
  .venue-pulse { animation: venue-pulse 2.5s ease-in-out infinite }
  .user-ring-1  { animation: user-ring-1  2s ease-out infinite }
  .user-ring-2  { animation: user-ring-2  2s ease-out infinite .5s }
  .venue-ring-1 { animation: venue-ring-1 2.5s ease-out infinite }
  .venue-ring-2 { animation: venue-ring-2 2.5s ease-out infinite .7s }
`;

const MODAL_TYPE = "objectiveDirections";
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const LIBRARIES = ["places"];
const PIN_STYLE_ID = "objective-directions-pin-keyframes";
const ROUTE_DEBOUNCE_MS = 300;

const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#c8a84b" }] },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#5e500c" }, { weight: 1.5 }],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#fcb913" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ccc3a6" }],
  },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
  { featureType: "transit.station", stylers: [{ visibility: "off" }] },
  {
    featureType: "transit",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#222c1f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b8f5a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#021d38" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2d2d2d" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#111111" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3c3000" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  { featureType: "poi.sports_complex", stylers: [{ visibility: "on" }] },
  {
    featureType: "poi.attraction",
    elementType: "labels.text",
    stylers: [{ visibility: "on" }],
  },
  { featureType: "poi.place_of_worship", stylers: [{ visibility: "on" }] },
];

// Fitted map options for the gaming style
const MAP_OPTIONS = {
  styles: MAP_STYLES,
  disableDefaultUI: true,
  gestureHandling: "greedy",
  keyboardShortcuts: false,
  clickableIcons: false,
};

// Pixel offset functions for OverlayView — centre the rendered pin div on the coordinate
const getVenuePinOffset = () => ({ x: -55, y: -55 }); // 110×110 pin
const getUserPinOffset = () => ({ x: -45, y: -45 }); // 90×90 pin

const toPlainLatLng = (value) => {
  if (!value) return null;
  if (typeof value.lat === "function" && typeof value.lng === "function") {
    return { lat: value.lat(), lng: value.lng() };
  }
  if (typeof value.lat === "number" && typeof value.lng === "number") {
    return { lat: value.lat, lng: value.lng };
  }
  return null;
};

const usePinKeyframes = () => {
  useEffect(() => {
    if (document.getElementById(PIN_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = PIN_STYLE_ID;
    style.textContent = PIN_KEYFRAMES;
    document.head.appendChild(style);
  }, []);
};

// ── MapPin ────────────────────────────────────────────────────────────────────
// isUser=true  → green rings, circular, shows avatar
// isUser=false → gold rings, shows subtask number + label
const MapPin = ({ isUser, index, name, imageUrl }) => {
  const size = isUser
    ? { outer: 90, ring: "w-12 h-12", img: "w-9 h-9" }
    : { outer: 110, ring: "w-14 h-14", img: "w-8 h-8" };
  const ringBorder = isUser
    ? {
        strong: "border-green-500/70",
        soft: "border-green-400/40",
        img: "border-green-500",
      }
    : {
        strong: "border-yellow-500/70",
        soft: "border-yellow-400/40",
        img: "border-yellow-500",
      };
  const glow = isUser
    ? "0 0 14px rgba(34,197,94,0.6)"
    : "0 0 16px rgba(200,168,75,0.65)";
  const fallbackText = isUser ? "text-green-400" : "text-yellow-500";
  const pulseCls = isUser ? "user-pulse" : "venue-pulse";
  const ring1Cls = isUser ? "user-ring-1" : "venue-ring-1";
  const ring2Cls = isUser ? "user-ring-2" : "venue-ring-2";
  const rounded = isUser ? "rounded-full" : "rounded-sm";
  const label = isUser ? (name ?? "You") : name;
  const fallback = isUser
    ? (name?.[0]?.toUpperCase() ?? "?")
    : String(index + 1);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size.outer,
        height: size.outer,
        pointerEvents: "none",
      }}
    >
      <div
        className={`${ring1Cls} absolute ${size.ring} rounded-full border-2 ${ringBorder.strong}`}
      />
      <div
        className={`${ring2Cls} absolute ${size.ring} rounded-full border ${ringBorder.soft}`}
      />
      <div
        className={`${pulseCls} relative z-10 flex flex-col items-center gap-1`}
      >
        <div
          className={`${size.img} ${rounded} overflow-hidden border-2 ${ringBorder.img} bg-black/60 backdrop-blur-xl flex items-center justify-center`}
          style={{ boxShadow: glow }}
        >
          {imageUrl ? (
            <ImageTag
              src={imageUrl}
              alt={label ?? ""}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <span className={`font-bold text-sm leading-none ${fallbackText}`}>
              {fallback}
            </span>
          )}
        </div>
        <span className="secondary text-[10px] font-semibold text-cream capitalize bg-black/80 px-1.5 py-0.5 rounded whitespace-nowrap max-w-22 truncate">
          {label}
        </span>
      </div>
    </div>
  );
};

const TRAVEL_MODES = [
  { value: "WALKING", label: "Walk" },
  { value: "DRIVING", label: "Drive" },
];

const GREEN_ROUTE_COLORS = ["#22c55e", "#8b5cf6", "#06b6d4"];

function legsStats(directions) {
  const legs = directions?.routes?.[0]?.legs ?? [];
  const distM = legs.reduce((a, l) => a + (l.distance?.value ?? 0), 0);
  const durS = legs.reduce((a, l) => a + (l.duration?.value ?? 0), 0);
  const dist = distM >= 1000 ? `${(distM / 1000).toFixed(1)} km` : `${distM} m`;
  const h = Math.floor(durS / 3600);
  const m = Math.floor((durS % 3600) / 60);
  const dur = h > 0 ? `${h}h ${m}m` : `${m} min`;
  return { dist, dur };
}

// Empty route state used for both initial value and clears
const EMPTY_ROUTE_STATE = {
  goldRoute: null,
  goldStats: null,
  greenRoutes: [], // [{ subtaskIdx, directions, stats }]
  routeError: null,
};

const useDirections = ({ locations }) => {
  const [travelMode, setTravelMode] = useState("WALKING");
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [selectedSubtasks, setSelectedSubtasks] = useState([]);
  const [userSelected, setUserSelected] = useState(false);
  const [routeState, setRouteState] = useState(EMPTY_ROUTE_STATE);

  const requestIdRef = useRef(0);
  const debounceRef = useRef(null);

  // Derive whether each route mode is active — used by both effect and display
  const hasGold = selectedSubtasks.length === 2 && !userSelected;
  const hasGreen =
    userSelected && !!userLocation && selectedSubtasks.length >= 1;

  // Derive the visible routes: return empty when no selection is active
  // (avoids calling setState synchronously inside an effect)
  const activeRoutes = useMemo(
    () => (hasGold || hasGreen ? routeState : EMPTY_ROUTE_STATE),
    [hasGold, hasGreen, routeState],
  );

  const computeRoute = useCallback(
    (origin, destination, tm) =>
      new Promise((resolve, reject) => {
        const ds = new window.google.maps.DirectionsService();
        ds.route(
          {
            origin: new window.google.maps.LatLng(origin.lat, origin.lng),
            destination: new window.google.maps.LatLng(
              destination.lat,
              destination.lng,
            ),
            waypoints: [],
            travelMode: window.google.maps.TravelMode[tm],
            optimizeWaypoints: false,
          },
          (result, status) => {
            if (status === "OK") resolve(result);
            else reject(new Error(status));
          },
        );
      }),
    [],
  );

  const handleGetLocation = useCallback(() => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by your browser.");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Permission denied. Enable location access."
            : "Could not get your location. Please allow location access.",
        );
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, []);

  const toggleSubtask = useCallback((idx) => {
    setSelectedSubtasks((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      if (prev.length >= 2) return [prev[1], idx];
      return [...prev, idx];
    });
  }, []);

  const toggleUser = useCallback(() => setUserSelected((v) => !v), []);

  const clearSelections = useCallback(() => {
    setSelectedSubtasks([]);
    setUserSelected(false);
  }, []);

  useEffect(() => {
    // Gold: 2 subtasks selected, user NOT involved
    const hasGoldNow = selectedSubtasks.length === 2 && !userSelected;
    // Green: user selected + at least 1 subtask
    const hasGreenNow =
      userSelected && !!userLocation && selectedSubtasks.length >= 1;

    if (!hasGoldNow && !hasGreenNow) {
      // Nothing selected — don't call setState here (React Compiler requires
      // no synchronous setState in effect bodies). Derived `activeRoutes` handles the clear.
      return;
    }

    requestIdRef.current += 1;
    const currentId = requestIdRef.current;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(() => {
      const isLatest = () => currentId === requestIdRef.current;

      const run = async () => {
        let newGoldRoute = null;
        let newGoldStats = null;
        const newGreenRoutes = [];
        let newRouteError = null;

        if (hasGoldNow) {
          try {
            const result = await computeRoute(
              locations[selectedSubtasks[0]],
              locations[selectedSubtasks[1]],
              travelMode,
            );
            if (!isLatest()) return;
            newGoldRoute = result;
            newGoldStats = legsStats(result);
          } catch {
            if (isLatest())
              newRouteError = "Could not calculate route between waypoints.";
          }
        }

        if (hasGreenNow) {
          for (const idx of selectedSubtasks) {
            try {
              const result = await computeRoute(
                userLocation,
                locations[idx],
                travelMode,
              );
              if (!isLatest()) return;
              newGreenRoutes.push({
                subtaskIdx: idx,
                directions: result,
                stats: legsStats(result),
              });
            } catch {
              // skip individual failures
            }
          }
          if (newGreenRoutes.length === 0 && isLatest()) {
            newRouteError = "Could not calculate route from your location.";
          }
        }

        if (isLatest()) {
          setRouteState({
            goldRoute: newGoldRoute,
            goldStats: newGoldStats,
            greenRoutes: newGreenRoutes,
            routeError: newRouteError,
          });
        }
      };

      run();
    }, ROUTE_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [
    selectedSubtasks,
    userSelected,
    userLocation,
    travelMode,
    locations,
    computeRoute,
  ]);

  return {
    travelMode,
    setTravelMode,
    userLocation,
    locationLoading,
    locationError,
    handleGetLocation,
    selectedSubtasks,
    userSelected,
    toggleSubtask,
    toggleUser,
    clearSelections,
    ...activeRoutes,
  };
};

// ── DirectionsMap ─────────────────────────────────────────────────────────────
const DirectionsMap = ({ locations, currentUser }) => {
  usePinKeyframes();
  const {
    travelMode,
    setTravelMode,
    userLocation,
    locationLoading,
    locationError,
    handleGetLocation,
    selectedSubtasks,
    userSelected,
    toggleSubtask,
    toggleUser,
    clearSelections,
    goldRoute,
    goldStats,
    greenRoutes,
    routeError,
  } = useDirections({ locations });

  const snappedLocations = useMemo(() => {
    const map = new Map();

    if (goldRoute && selectedSubtasks.length === 2) {
      const leg = goldRoute.routes?.[0]?.legs?.[0];
      const start = toPlainLatLng(leg?.start_location);
      const end = toPlainLatLng(leg?.end_location);
      if (start) map.set(selectedSubtasks[0], start);
      if (end) map.set(selectedSubtasks[1], end);
    }

    greenRoutes.forEach((gr) => {
      const leg = gr.directions?.routes?.[0]?.legs?.[0];
      const end = toPlainLatLng(leg?.end_location);
      if (end) map.set(gr.subtaskIdx, end);
    });

    return map;
  }, [goldRoute, greenRoutes, selectedSubtasks]);

  const snappedUserLocation = useMemo(() => {
    const leg = greenRoutes[0]?.directions?.routes?.[0]?.legs?.[0];
    return toPlainLatLng(leg?.start_location) ?? userLocation;
  }, [greenRoutes, userLocation]);

  const center = useMemo(
    () =>
      snappedUserLocation
        ? snappedUserLocation
        : locations.length > 0
          ? { lat: locations[0].lat, lng: locations[0].lng }
          : { lat: 48.8566, lng: 2.3522 },
    [locations, snappedUserLocation],
  );

  const goldOptions = useMemo(
    () => ({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#fcb913",
        strokeOpacity: 0.9,
        strokeWeight: 4,
      },
    }),
    [],
  );

  const anySelected =
    selectedSubtasks.length > 0 || (userSelected && !!userLocation);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <ToggleButton
          variant="layout"
          size="sm"
          options={TRAVEL_MODES}
          value={travelMode}
          onChange={setTravelMode}
        />
        <ActionButton
          color="orange"
          icon={<MdMyLocation size={14} />}
          text={
            locationLoading
              ? "Locating…"
              : userLocation
                ? "My Location ✓"
                : "My Location"
          }
          onClick={handleGetLocation}
          disabled={locationLoading}
        />
      </div>

      {locationError && (
        <p className="secondary text-xs text-red-400">{locationError}</p>
      )}

      {/* Map */}
      <div className="relative overflow-hidden w-full max-w-125 h-80 mx-auto border-2 border-primary/30 shadow-[0_0_30px_rgba(200,168,75,0.15)]">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={locations.length === 1 ? 14 : 12}
          options={MAP_OPTIONS}
        >
          {goldRoute && (
            <DirectionsRenderer directions={goldRoute} options={goldOptions} />
          )}

          {greenRoutes.map((gr, i) => (
            <DirectionsRenderer
              key={`green-route-${gr.subtaskIdx}`}
              directions={gr.directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor:
                    GREEN_ROUTE_COLORS[i % GREEN_ROUTE_COLORS.length],
                  strokeOpacity: 0.9,
                  strokeWeight: 4,
                },
              }}
            />
          ))}

          {/* Venue pins — getPixelPositionOffset centres the 110×110 pin on the coordinate */}
          {locations.map((loc, i) => (
            <OverlayView
              key={`pin-${i}`}
              position={
                snappedLocations.get(i) ?? { lat: loc.lat, lng: loc.lng }
              }
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              getPixelPositionOffset={getVenuePinOffset}
            >
              <MapPin
                isUser={false}
                index={i}
                name={loc.label}
                imageUrl={null}
              />
            </OverlayView>
          ))}

          {/* User pin — getPixelPositionOffset centres the 90×90 pin on the coordinate */}
          {snappedUserLocation && (
            <OverlayView
              position={snappedUserLocation}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              getPixelPositionOffset={getUserPinOffset}
            >
              <MapPin
                isUser
                index={-1}
                name={currentUser?.display_name ?? "You"}
                imageUrl={currentUser?.image_url ?? null}
              />
            </OverlayView>
          )}
        </GoogleMap>
      </div>

      {/* Route stats */}
      {(goldStats || greenRoutes.length > 0) && (
        <div className="flex flex-col gap-2">
          {goldStats && (
            <div className="flex items-center gap-4 px-4 py-2 bg-black/30 border border-yellow-500/20 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-yellow-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="secondary text-[9px] uppercase text-chino/40">
                  {locations[selectedSubtasks[0]]?.label} →{" "}
                  {locations[selectedSubtasks[1]]?.label}
                </p>
              </div>
              <div className="text-center">
                <p className="text-primary font-mono font-bold">
                  {goldStats.dist}
                </p>
              </div>
              <div className="w-px h-8 bg-primary/20" />
              <div className="text-center">
                <p className="text-primary font-mono font-bold">
                  {goldStats.dur}
                </p>
              </div>
            </div>
          )}

          {greenRoutes.map((gr, i) => (
            <div
              key={`stat-${gr.subtaskIdx}`}
              className="flex items-center gap-4 px-4 py-2 bg-green-900/20 border border-green-500/50 rounded-lg"
            >
              <div className="w-3 h-3 rounded-full shrink-0 bg-green-500" />
              <div className="flex-1 min-w-0">
                <p className=" text-[9px] text-chino truncate tracking-[0.5px]">
                  You → {locations[gr.subtaskIdx]?.label}
                </p>
              </div>
              <div className="text-center">
                <p className="font-mono font-bold text-green-500">
                  {gr.stats.dist}
                </p>
              </div>
              <div className="w-px h-8 bg-primary/20" />
              <div className="text-center">
                <p className="font-mono font-bold text-green-500">
                  {gr.stats.dur}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {routeError && (
        <p className="secondary text-xs text-red-400 text-center">
          {routeError}
        </p>
      )}

      {/* Waypoint selection list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className=" text-[10px] uppercase tracking-widest text-primary/60">
            Waypoints
            <span className="normal-case text-chino/60">
              {" "}
              · Select to calculate distance
            </span>
          </p>
          {anySelected && (
            <button
              type="button"
              onClick={clearSelections}
              className="secondary text-[10px] text-chino/40 hover:text-chino/70 transition-colors"
            >
              clear
            </button>
          )}
        </div>

        <ol className="space-y-2 pt-2">
          {userLocation && (
            <li
              onClick={toggleUser}
              className={`flex w-fit items-center gap-3 cursor-pointer rounded-lg px-2 py-1.5 transition-colors duration-150 ${
                userSelected
                  ? "bg-green-500/15 ring-1 ring-green-500/30"
                  : "hover:bg-white/5"
              }`}
            >
              <span className="w-6 h-6 rounded-full shrink-0 bg-green-500"></span>
              <span className=" text-sm text-cream/80 tracking-[0.5px]">
                {currentUser?.display_name ?? "My Location"}
              </span>
              {userSelected && (
                <span className="secondary text-[10px] text-green-400">✓</span>
              )}
            </li>
          )}

          {locations.map((loc, i) => {
            const isSelected = selectedSubtasks.includes(i);
            return (
              <li
                key={i}
                onClick={() => toggleSubtask(i)}
                className={`flex w-fit items-center gap-3 cursor-pointer rounded-lg px-2 py-1.5 transition-colors duration-150 ${
                  isSelected
                    ? "bg-primary/15 ring-1 ring-primary/30"
                    : "hover:bg-white/5"
                }`}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-black text-xs font-bold shrink-0 bg-yellow-400">
                  {i + 1}
                </span>
                <span className="text-sm text-cream/80 tracking-[0.5px] flex-1">
                  {loc.label}
                </span>
                {isSelected && (
                  <span className="secondary text-[10px] text-primary/70">
                    ✓
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        {!anySelected && (
          <p className="secondary text-[10px] text-chino/40 text-center pt-1">
            Enable <span className="text-green-400">My Location</span> + select
            stops to see individual distances from you, or select 2 stops for a{" "}
            <span className="text-yellow-400">gold</span> route between them.
          </p>
        )}
      </div>

      {locations.length === 1 && (
        <p className="secondary text-xs text-chino/40 text-center">
          Add more location subtasks to enable multi-point routing.
        </p>
      )}
    </div>
  );
};

// ── ObjectiveDirectionsModal ──────────────────────────────────────────────────
const ObjectiveDirectionsModal = () => {
  const dispatch = useDispatch();
  const { modalType, modalProps } = useSelector(selectModal);
  const currentUser = useSelector(selectCurrentUser);
  const isOpen = modalType === MODAL_TYPE;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const locations = useMemo(
    () =>
      (Array.isArray(modalProps.subtasks) ? modalProps.subtasks : []).filter(
        (st) =>
          typeof st === "object" &&
          typeof st.lat === "number" &&
          typeof st.lng === "number",
      ),
    [modalProps.subtasks],
  );

  const handleClose = () => dispatch(closeModal());

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Get Directions"
      maxWidth="max-w-lg"
      footerMode="close"
      isLoading={!isLoaded && !loadError}
      error={loadError ? "Failed to load Google Maps." : null}
      isEmpty={isLoaded && !loadError && locations.length === 0}
      emptyMessage="No location waypoints set on this objective's subtasks. Enable Location Mode when creating subtasks to add map coordinates."
    >
      {isLoaded && !loadError && locations.length > 0 && (
        <DirectionsMap locations={locations} currentUser={currentUser} />
      )}
    </GlobalModal>
  );
};

export default ObjectiveDirectionsModal;
