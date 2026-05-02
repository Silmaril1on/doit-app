"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
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
const GOOGLE_MAPS_API_KEY = "AIzaSyBYo36Sb6U2GXV0zcxS4CTooFrdVlr3f4Q";
const LIBRARIES = ["places"];

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
};

// ── MapPin ────────────────────────────────────────────────────────────────────
// isUser=true  → green rings, circular, shows avatar
// isUser=false → gold rings, shows subtask number + label
const MapPin = ({ isUser, index, name, imageUrl }) => {
  const size = isUser
    ? { outer: 90, ring: "w-12 h-12", img: "w-9 h-9" }
    : { outer: 110, ring: "w-14 h-14", img: "w-10 h-10" };
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
  const rounded = isUser ? "rounded-full" : "rounded-md";
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
        transform: "translate(-50%, -100%)",
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
          className={`${size.img} ${rounded} overflow-hidden border-2 ${ringBorder.img} bg-black/60 flex items-center justify-center`}
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
        <span className="secondary text-[9px] font-semibold text-white bg-black/80 px-1.5 py-0.5 rounded whitespace-nowrap max-w-[90px] truncate">
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

// ── Directions helper ─────────────────────────────────────────────────────────
function computeRoute({ origin, destination, waypoints, travelMode }) {
  return new Promise((resolve, reject) => {
    const ds = new window.google.maps.DirectionsService();
    ds.route(
      {
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(
          destination.lat,
          destination.lng,
        ),
        waypoints: (waypoints ?? []).map((w) => ({
          location: new window.google.maps.LatLng(w.lat, w.lng),
          stopover: true,
        })),
        travelMode: window.google.maps.TravelMode[travelMode],
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === "OK") resolve(result);
        else reject(new Error(status));
      },
    );
  });
}

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

// ── DirectionsMap ─────────────────────────────────────────────────────────────
const DirectionsMap = ({ locations, currentUser }) => {
  const [travelMode, setTravelMode] = useState("WALKING");
  const [userLocation, setUserLocation] = useState(null); // { lat, lng }
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Selected subtask indices (max 2) and whether user pin is included
  const [selectedSubtasks, setSelectedSubtasks] = useState([]);
  const [userSelected, setUserSelected] = useState(false);

  // Computed routes
  const [goldRoute, setGoldRoute] = useState(null);
  const [greenRoute, setGreenRoute] = useState(null);
  const [goldStats, setGoldStats] = useState(null);
  const [greenStats, setGreenStats] = useState(null);
  const [routeError, setRouteError] = useState(null);

  const center = useMemo(
    () =>
      userLocation
        ? userLocation
        : locations.length > 0
          ? { lat: locations[0].lat, lng: locations[0].lng }
          : { lat: 48.8566, lng: 2.3522 },
    [locations, userLocation],
  );

  // ── Get user location ────────────────────────────────────────────────────
  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationLoading(false);
      },
      () => {
        setLocationError(
          "Could not get your location. Please allow location access.",
        );
        setLocationLoading(false);
      },
      { timeout: 10000 },
    );
  }, []);

  // ── Toggle selection ─────────────────────────────────────────────────────
  const toggleSubtask = useCallback((idx) => {
    setSelectedSubtasks((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      if (prev.length >= 2) return [prev[1], idx];
      return [...prev, idx];
    });
  }, []);

  const toggleUser = useCallback(() => {
    setUserSelected((v) => !v);
  }, []);

  // ── Compute routes on selection change ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setGoldRoute(null);
      setGreenRoute(null);
      setGoldStats(null);
      setGreenStats(null);
      setRouteError(null);

      if (selectedSubtasks.length === 2) {
        const [a, b] = selectedSubtasks;
        try {
          const result = await computeRoute({
            origin: locations[a],
            destination: locations[b],
            waypoints: [],
            travelMode,
          });
          if (!cancelled) {
            setGoldRoute(result);
            setGoldStats(legsStats(result));
          }
        } catch {
          if (!cancelled)
            setRouteError("Could not calculate route between waypoints.");
        }
      }

      if (userSelected && userLocation && selectedSubtasks.length >= 1) {
        const subtaskPoints = selectedSubtasks.map((i) => locations[i]);
        const destination = subtaskPoints[subtaskPoints.length - 1];
        const waypoints = subtaskPoints.slice(0, -1);
        try {
          const result = await computeRoute({
            origin: userLocation,
            destination,
            waypoints,
            travelMode,
          });
          if (!cancelled) {
            setGreenRoute(result);
            setGreenStats(legsStats(result));
          }
        } catch {
          if (!cancelled)
            setRouteError("Could not calculate route from your location.");
        }
      }
    };

    if (selectedSubtasks.length >= 1 || (userSelected && userLocation)) {
      run();
    }

    return () => {
      cancelled = true;
    };
  }, [selectedSubtasks, userSelected, userLocation, travelMode, locations]);

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

  const greenOptions = useMemo(
    () => ({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#22c55e",
        strokeOpacity: 0.9,
        strokeWeight: 4,
      },
    }),
    [],
  );

  const anySelected =
    selectedSubtasks.length > 0 || (userSelected && !!userLocation);

  return (
    <>
      <style>{PIN_KEYFRAMES}</style>
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
              <DirectionsRenderer
                directions={goldRoute}
                options={goldOptions}
              />
            )}
            {greenRoute && (
              <DirectionsRenderer
                directions={greenRoute}
                options={greenOptions}
              />
            )}

            {locations.map((loc, i) => (
              <OverlayView
                key={`pin-${i}`}
                position={{ lat: loc.lat, lng: loc.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <MapPin
                  isUser={false}
                  index={i}
                  name={loc.label}
                  imageUrl={null}
                />
              </OverlayView>
            ))}

            {userLocation && (
              <OverlayView
                position={userLocation}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
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
        {(goldStats || greenStats) && (
          <div className="flex items-stretch justify-center gap-6 flex-wrap">
            {goldStats && (
              <div className="flex items-center gap-4 px-4 py-2 bg-black/30 border border-yellow-500/20 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-yellow-400 shrink-0" />
                <div className="text-center">
                  <p className="text-yellow-400 font-mono font-bold">
                    {goldStats.dist}
                  </p>
                  <p className="secondary text-[9px] uppercase text-chino/40">
                    waypoints
                  </p>
                </div>
                <div className="w-px h-8 bg-primary/20" />
                <div className="text-center">
                  <p className="text-yellow-400 font-mono font-bold">
                    {goldStats.dur}
                  </p>
                  <p className="secondary text-[9px] uppercase text-chino/40">
                    est. time
                  </p>
                </div>
              </div>
            )}
            {greenStats && (
              <div className="flex items-center gap-4 px-4 py-2 bg-black/30 border border-green-500/20 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-green-400 shrink-0" />
                <div className="text-center">
                  <p className="text-green-400 font-mono font-bold">
                    {greenStats.dist}
                  </p>
                  <p className="secondary text-[9px] uppercase text-chino/40">
                    from you
                  </p>
                </div>
                <div className="w-px h-8 bg-primary/20" />
                <div className="text-center">
                  <p className="text-green-400 font-mono font-bold">
                    {greenStats.dur}
                  </p>
                  <p className="secondary text-[9px] uppercase text-chino/40">
                    est. time
                  </p>
                </div>
              </div>
            )}
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
            <p className="secondary text-[10px] uppercase tracking-widest text-primary/60">
              Waypoints
              <span className="normal-case text-chino/40">
                {" "}
                · Select to calculate distance
              </span>
            </p>
            {anySelected && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSubtasks([]);
                  setUserSelected(false);
                }}
                className="secondary text-[10px] text-chino/40 hover:text-chino/70 transition-colors"
              >
                clear
              </button>
            )}
          </div>

          <ol className="space-y-1.5">
            {userLocation && (
              <li
                onClick={toggleUser}
                className={`flex w-fit items-center gap-3 cursor-pointer rounded-lg px-2 py-1.5 transition-colors duration-150 ${
                  userSelected
                    ? "bg-green-500/15 ring-1 ring-green-500/30"
                    : "hover:bg-white/5"
                }`}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-green-500 text-black">
                  ◎
                </span>
                <span className="secondary text-sm text-cream/80 flex-1">
                  {currentUser?.display_name ?? "My Location"}
                </span>
                {userSelected && (
                  <span className="secondary text-[10px] text-green-400">
                    ✓
                  </span>
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
                  <span className="secondary text-sm text-cream/80 capitalize flex-1">
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
              Select 2 waypoints for a{" "}
              <span className="text-yellow-400">gold</span> route, or your
              location + a waypoint for a{" "}
              <span className="text-green-400">green</span> route.
            </p>
          )}
          {selectedSubtasks.length === 1 && !userSelected && (
            <p className="secondary text-[10px] text-chino/40 text-center pt-1">
              Select one more waypoint to see the route.
            </p>
          )}
        </div>

        {locations.length === 1 && (
          <p className="secondary text-xs text-chino/40 text-center">
            Add more location subtasks to enable multi-point routing.
          </p>
        )}
      </div>
    </>
  );
};

// ── ObjectiveDirectionsModal ──────────────────────────────────────────────────
const ObjectiveDirectionsModal = () => {
  const dispatch = useDispatch();
  const { modalType, modalProps } = useSelector(selectModal);
  const currentUser = useSelector(selectCurrentUser);
  const isOpen = modalType === MODAL_TYPE;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
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
