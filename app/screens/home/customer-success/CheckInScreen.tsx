import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { WebView } from "react-native-webview";
const MapWebView: any = WebView;

import { useTheme } from "@/lib/appTheme";
import { Icon } from "@/lib/layout";
import { showToast } from "@/utils/ShowToast";
import { useGetLocations } from "../manager/Functions";
import {
  getCurrentGPSPosition,
  calculateDistanceInMeters,
  getRoadDistanceInMeters,
  formatDistance,
  formatDistanceDisplay,
  parseCoordinate,
  type GeocodedAddress
} from "@/utils/location";
import { getItem } from "@/utils/storage";
import { KEY } from "@/services/Constant";
import { useCreateJourney } from "./Function";

export interface LocationItem {
  id: number | string;
  locationName?: string;
  name?: string;
  locationType?: string;
  locationAddress?: string;
  city?: string;
  state?: string;
  latitude?: string | number;
  longitude?: string | number;
  radiusMeter?: number;
  distanceKm?: string | number;
}

// Safely parses latitude/longitude strings or numbers to float
function parseCoord(val?: string | number | null): number | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  const num = typeof val === "number" ? val : parseFloat(String(val).trim());
  return isNaN(num) ? undefined : num;
}

function formatCoordDisplay(val?: string | number | null, dir?: "N" | "S" | "E" | "W"): string {
  if (val === undefined || val === null || val === "") return "—";
  const str = String(val).trim();
  if (str.includes("°")) return str;
  const num = parseFloat(str);
  if (isNaN(num)) return str;
  return dir ? `${num.toFixed(4)}° ${dir}` : `${num.toFixed(4)}°`;
}

// Generates real Google Maps HTML for the WebView
function generateGoogleMapHtml(
  userLat: number,
  userLng: number,
  userName: string,
  userAccuracy: number,
  fromLat: number | undefined,
  fromLng: number | undefined,
  fromName: string,
  toLat: number | undefined,
  toLng: number | undefined,
  toName: string,
  isDarkTheme: boolean
): string {
  const safeUserName = (userName || "Your Location").replace(/['"\\]/g, " ");
  const safeFromName = (fromName || "Departure").replace(/['"\\]/g, " ");
  const safeToName = (toName || "Destination").replace(/['"\\]/g, " ");
  const hasFrom = fromLat !== undefined && fromLng !== undefined;
  const hasTo = toLat !== undefined && toLng !== undefined;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #e5e3df; overflow: hidden; }
    .pulse-container { position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
    .pulse-ring {
      position: absolute; width: 44px; height: 44px; border-radius: 50%;
      background: rgba(66, 133, 244, 0.4); animation: pulseAnim 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    }
    .user-dot {
      position: relative; width: 16px; height: 16px; border-radius: 50%;
      background: #1A73E8; border: 3px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    }
    .pin-box {
      display: flex; flex-direction: column; align-items: center;
    }
    .pin-badge {
      padding: 3px 8px; border-radius: 12px; font-weight: 700; font-size: 10px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3); white-space: nowrap; margin-top: 2px;
      border: 1px solid rgba(255,255,255,0.8);
    }
    .pin-badge-from { background: #0F9D58; color: #FFFFFF; }
    .pin-badge-to { background: #EA4335; color: #FFFFFF; }
    .pin-badge-user { background: #1A73E8; color: #FFFFFF; }
    @keyframes pulseAnim {
      0% { transform: scale(0.35); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var userPos = [${userLat}, ${userLng}];
    var hasFrom = ${hasFrom};
    var hasTo = ${hasTo};
    var fromPos = hasFrom ? [${fromLat ?? 0}, ${fromLng ?? 0}] : null;
    var toPos = hasTo ? [${toLat ?? 0}, ${toLng ?? 0}] : null;

    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView(userPos, 16);

    // Google Maps Standard Road Tiles (Street View & Landmarks)
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    // Accuracy Circle around Current Location
    L.circle(userPos, {
      radius: ${userAccuracy},
      color: '#1A73E8',
      fillColor: '#1A73E8',
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '4, 4'
    }).addTo(map);

    // Current Location Marker (Blue Pulsating Radar)
    var userIcon = L.divIcon({
      className: 'custom-user-pin',
      html: '<div class="pin-box">' +
            '<div class="pulse-container"><div class="pulse-ring"></div><div class="user-dot"></div></div>' +
            '<div class="pin-badge pin-badge-user">📍 Current Location</div>' +
            '</div>',
      iconSize: [120, 60],
      iconAnchor: [60, 22]
    });
    var userMarker = L.marker(userPos, { icon: userIcon }).addTo(map).bindPopup("<b>Your Current Location:</b><br/>${safeUserName}<br/>±${userAccuracy.toFixed(
    0
  )}m accuracy");

    var markers = [userMarker];
    var routePoints = [];

    if (hasFrom && fromPos) {
      var fromIcon = L.divIcon({
        className: 'custom-from-pin',
        html: '<div class="pin-box">' +
              '<div style="width:28px; height:28px; border-radius:50%; background:#0F9D58; border:2.5px solid #FFF; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.35);"><span style="color:#FFF; font-size:12px; font-weight:800;">A</span></div>' +
              '<div class="pin-badge pin-badge-from">${safeFromName}</div>' +
              '</div>',
        iconSize: [110, 56],
        iconAnchor: [55, 28]
      });
      var fromMarker = L.marker(fromPos, { icon: fromIcon }).addTo(map).bindPopup("<b>Departure:</b> ${safeFromName}");
      markers.push(fromMarker);
      routePoints.push(fromPos);
    }

    routePoints.push(userPos);

    if (hasTo && toPos) {
      var toIcon = L.divIcon({
        className: 'custom-to-pin',
        html: '<div class="pin-box">' +
              '<div style="width:28px; height:28px; border-radius:50%; background:#EA4335; border:2.5px solid #FFF; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.35);"><span style="color:#FFF; font-size:12px; font-weight:800;">B</span></div>' +
              '<div class="pin-badge pin-badge-to">${safeToName}</div>' +
              '</div>',
        iconSize: [110, 56],
        iconAnchor: [55, 28]
      });
      var toMarker = L.marker(toPos, { icon: toIcon }).addTo(map).bindPopup("<b>Destination:</b> ${safeToName}");
      markers.push(toMarker);
      routePoints.push(toPos);
    }

    if (routePoints.length > 1) {
      L.polyline(routePoints, {
        color: '#1A73E8',
        weight: 5,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round'
      }).addTo(map);
    }

    var group = new L.featureGroup(markers);

    window.focusRoute = function() {
      if (markers.length > 1) {
        map.flyToBounds(group.getBounds().pad(0.25), { animate: true, duration: 0.7 });
      } else {
        map.flyTo(userPos, 16, { animate: true, duration: 0.7 });
      }
    };
    window.focusFrom = function() {
      if (hasFrom && fromPos) {
        map.flyTo(fromPos, 17, { animate: true, duration: 0.7 });
      } else {
        map.flyTo(userPos, 17, { animate: true, duration: 0.7 });
      }
    };
    window.focusUser = function() {
      map.flyTo(userPos, 17, { animate: true, duration: 0.7 });
    };
    window.focusDest = function() {
      if (hasTo && toPos) {
        map.flyTo(toPos, 17, { animate: true, duration: 0.7 });
      } else {
        map.flyTo(userPos, 17, { animate: true, duration: 0.7 });
      }
    };
    window.zoomInMap = function() { map.zoomIn(); };
    window.zoomOutMap = function() { map.zoomOut(); };

    setTimeout(function() {
      if (markers.length > 1) {
        map.flyToBounds(group.getBounds().pad(0.2), { animate: false });
      } else {
        map.setView(userPos, 16);
      }
    }, 200);
  </script>
</body>
</html>
`;
}

export default function CheckInScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const isDark = theme.palette.mode === "dark";
  const webViewRef = useRef<any>(null);

  // Selection states
  const [fromLocationId, setFromLocationId] = useState<number | string>();
  const [toLocationId, setToLocationId] = useState<number | string>();

  // Modal selector state
  const [activePickerTarget, setActivePickerTarget] = useState<"FROM" | "TO" | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // GPS and Live Coordinates state (null initially until real GPS is captured)
  const [isCapturingGPS, setIsCapturingGPS] = useState<boolean>(false);
  const [gpsData, setGpsData] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
    detectedPlace: string;
    fullAddress?: string;
    city?: string;
    state?: string;
  } | null>(null);

  // Interactive Map Focus & Mode States
  const [mapFocus, setMapFocus] = useState<"route" | "me" | "departure" | "destination">("route");

  const handleZoomIn = () => {
    webViewRef.current?.injectJavaScript("if (window.zoomInMap) window.zoomInMap(); true;");
  };

  const handleZoomOut = () => {
    webViewRef.current?.injectJavaScript("if (window.zoomOutMap) window.zoomOutMap(); true;");
  };

  const handleFocusMode = (mode: "route" | "me" | "departure" | "destination") => {
    setMapFocus(mode);
    if (mode === "route") {
      webViewRef.current?.injectJavaScript("if (window.focusRoute) window.focusRoute(); true;");
    } else if (mode === "departure") {
      webViewRef.current?.injectJavaScript("if (window.focusFrom) window.focusFrom(); true;");
    } else if (mode === "me") {
      webViewRef.current?.injectJavaScript("if (window.focusUser) window.focusUser(); true;");
    } else if (mode === "destination") {
      webViewRef.current?.injectJavaScript("if (window.focusDest) window.focusDest(); true;");
    }
  };

  const handleRecenterMe = () => {
    handleFocusMode("me");
    if (!gpsData) {
      handleCaptureGPS();
    } else {
      showToast("Centered on your live GPS location", "info");
    }
  };

  const handleOpenInGoogleMaps = () => {
    const lat = gpsData?.latitude ?? parseCoord(selectedFromObj?.latitude) ?? 17.4432;
    const lng = gpsData?.longitude ?? parseCoord(selectedFromObj?.longitude) ?? 78.3842;
    const label = gpsData?.detectedPlace || "My Live Location";
    const url =
      Platform.select({
        ios: `maps:0,0?q=${encodeURIComponent(label)}@${lat},${lng}`,
        android: `geo:0,0?q=${lat},${lng}(${encodeURIComponent(label)})`
      }) || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    });
  };

  // API Call for locations
  const [getLocations, { data: locationsData }] = useGetLocations();
  const [createJourneyMutation, { isLoading: isCreateJourneyLoading }] = useCreateJourney();

  useEffect(() => {
    getLocations();
    handleCaptureGPS();
  }, []);

  const fromAvailableOptions = useMemo(() => {
    const list = Array.isArray(locationsData?.data)
      ? locationsData.data
      : (locationsData?.data?.items || []);
    return list.filter((loc: { id: number | string }) => loc.id !== toLocationId);
  }, [locationsData, toLocationId]);

  const toAvailableOptions = useMemo(() => {
    const list = Array.isArray(locationsData?.data)
      ? locationsData.data
      : (locationsData?.data?.items || []);
    return list.filter((loc: { id: number | string }) => loc.id !== fromLocationId);
  }, [locationsData, fromLocationId]);

  // Active list shown in modal
  const currentModalOptions = useMemo(() => {
    const baseList = activePickerTarget === "FROM" ? fromAvailableOptions : toAvailableOptions;
    if (!Array.isArray(baseList)) return [];

    return baseList.filter((loc: { locationType?: string; locationName?: string }) => {
      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = loc.locationName?.toLowerCase().includes(q) ?? false;
        const typeMatch = loc.locationType?.toLowerCase().includes(q) ?? false;
        return nameMatch || typeMatch;
      }
      return true;
    });
  }, [activePickerTarget, fromAvailableOptions, toAvailableOptions, searchQuery]);

  const selectedFromObj = useMemo(() => {
    if (!fromLocationId) return undefined;
    if (fromLocationId === "OTHER") {
      const placeName = gpsData?.detectedPlace ? `Other (${gpsData.detectedPlace})` : "Other Location (Current GPS)";
      return {
        id: "OTHER",
        locationName: placeName,
        name: placeName,
        locationType: "OTHER",
        locationAddress: gpsData?.fullAddress || "Live Current GPS Position",
        city: gpsData?.city || "",
        state: gpsData?.state || "",
        latitude: gpsData ? String(gpsData.latitude) : undefined,
        longitude: gpsData ? String(gpsData.longitude) : undefined,
        radiusMeter: 500
      };
    }
    const list = Array.isArray(locationsData?.data)
      ? locationsData.data
      : (locationsData?.data?.items || []);
    return list.find((l: { id: number | string }) => l.id === fromLocationId);
  }, [fromLocationId, locationsData, gpsData]);

  const selectedToObj = useMemo(() => {
    if (!toLocationId) return undefined;
    const list = Array.isArray(locationsData?.data)
      ? locationsData.data
      : (locationsData?.data?.items || []);
    return list.find((l: { id: number | string }) => l.id === toLocationId);
  }, [toLocationId, locationsData]);

  // Real GPS & Location Coordinates
  const userLat = gpsData?.latitude ?? parseCoord(selectedFromObj?.latitude) ?? 17.4432;
  const userLng = gpsData?.longitude ?? parseCoord(selectedFromObj?.longitude) ?? 78.3842;
  const userName = gpsData?.detectedPlace || (gpsData ? "Current Location" : "Locating...");
  const userAccuracy = gpsData?.accuracy || 15;

  const fromLat = parseCoord(selectedFromObj?.latitude);
  const fromLng = parseCoord(selectedFromObj?.longitude);
  const fromName = selectedFromObj?.locationName || selectedFromObj?.name || "Departure";

  const toLat = parseCoord(selectedToObj?.latitude);
  const toLng = parseCoord(selectedToObj?.longitude);
  const toName = selectedToObj?.locationName || selectedToObj?.name || "Destination";

  // Departure Geofence Radius Validation
  const fromRadiusMeter = selectedFromObj?.radiusMeter ? Number(selectedFromObj.radiusMeter) : 100;

  // Direct straight-line distance from user's live GPS to departure point
  const userToFromDirectMeters = useMemo(() => {
    if (fromLocationId === "OTHER") return 0;
    if (!gpsData || fromLat == null || fromLng == null) return null;
    return calculateDistanceInMeters(gpsData.latitude, gpsData.longitude, fromLat, fromLng);
  }, [fromLocationId, gpsData, fromLat, fromLng]);

  // Check if distance from user's live position to departure exceeds departure geofence radius
  const isOutOfRadius = useMemo(() => {
    if (fromLocationId === "OTHER") return false;
    if (userToFromDirectMeters === null || !fromLocationId) return false;
    return userToFromDirectMeters > fromRadiusMeter;
  }, [fromLocationId, userToFromDirectMeters, fromRadiusMeter]);

  // Road/Route-based Driving Distances in Meters (using OSRM Road Routing API)
  const [roadDistances, setRoadDistances] = useState<{
    fromTo: number | null;
    userToFrom: number | null;
    userToDest: number | null;
  }>({
    fromTo: null,
    userToFrom: null,
    userToDest: null
  });

  useEffect(() => {
    let isCancelled = false;

    const computeRealRouteDistances = async () => {
      // 1. Instant estimate using Haversine
      const initialFromTo = calculateDistanceInMeters(fromLat, fromLng, toLat, toLng);
      const initialUserFrom = gpsData
        ? calculateDistanceInMeters(gpsData.latitude, gpsData.longitude, fromLat, fromLng)
        : null;
      const initialUserDest = gpsData
        ? calculateDistanceInMeters(gpsData.latitude, gpsData.longitude, toLat, toLng)
        : null;

      setRoadDistances({
        fromTo: initialFromTo,
        userToFrom: initialUserFrom,
        userToDest: initialUserDest
      });

      if (!fromLat && !toLat) return;

      try {
        const [roadFromTo, roadUserFrom, roadUserDest] = await Promise.all([
          fromLat != null && toLat != null ? getRoadDistanceInMeters(fromLat, fromLng, toLat, toLng) : null,
          gpsData && fromLat != null
            ? getRoadDistanceInMeters(gpsData.latitude, gpsData.longitude, fromLat, fromLng)
            : null,
          gpsData && toLat != null ? getRoadDistanceInMeters(gpsData.latitude, gpsData.longitude, toLat, toLng) : null
        ]);

        if (!isCancelled) {
          setRoadDistances({
            fromTo: roadFromTo ?? initialFromTo,
            userToFrom: roadUserFrom ?? initialUserFrom,
            userToDest: roadUserDest ?? initialUserDest
          });
        }
      } catch (e) {
        console.warn("Error computing real road distance:", e);
      }
    };

    computeRealRouteDistances();

    return () => {
      isCancelled = true;
    };
  }, [fromLat, fromLng, toLat, toLng, gpsData?.latitude, gpsData?.longitude]);

  const mapHtml = useMemo(() => {
    return generateGoogleMapHtml(
      userLat,
      userLng,
      userName,
      userAccuracy,
      fromLat,
      fromLng,
      fromName,
      toLat,
      toLng,
      toName,
      isDark
    );
  }, [userLat, userLng, userName, userAccuracy, fromLat, fromLng, fromName, toLat, toLng, toName, isDark]);

  // Quick swap From <-> To
  const handleSwap = () => {
    if (fromLocationId === "OTHER") {
      showToast("Current location can only be set as departure point", "warning");
      return;
    }
    const prevFrom = fromLocationId;
    const prevTo = toLocationId;
    setFromLocationId(prevTo);
    setToLocationId(prevFrom);
  };

  // Real GPS Capture & Free Reverse Geocoding
  const handleCaptureGPS = async () => {
    setIsCapturingGPS(true);

    try {
      const result: GeocodedAddress = await getCurrentGPSPosition();
      const detected = result.addressDetails?.street || result.addressDetails?.city || "Current Location";
      const address =
        result.addressDetails?.fullAddress ||
        (result.addressDetails?.city ? `${detected}, ${result.addressDetails.city}` : detected);

      setGpsData({
        latitude: result.latitude,
        longitude: result.longitude,
        accuracy: result.accuracy,
        timestamp: result.timestamp,
        detectedPlace: detected,
        fullAddress: address,
        city: result.addressDetails?.city || "",
        state: result.addressDetails?.state || ""
      });
    } catch (err: any) {
      showToast(err.message || "Failed to capture GPS location", "error");
    } finally {
      setIsCapturingGPS(false);
    }
  };

  const handleSelectOtherLocation = async () => {
    setFromLocationId("OTHER");
    setActivePickerTarget(null);
    setSearchQuery("");
    if (!gpsData) {
      await handleCaptureGPS();
    }
    showToast("Departure set to your live current location", "success");
  };

  const handleSelectLocation = (loc: any) => {
    if (activePickerTarget === "FROM") {
      setFromLocationId(loc.id);
    } else if (activePickerTarget === "TO") {
      setToLocationId(loc.id);
    }
    setActivePickerTarget(null);
    setSearchQuery("");
  };

  const handleCheckIn = async () => {
    const user = await getItem(KEY.USER);
    if (!fromLocationId || !toLocationId) {
      showToast("Please select both departure and destination locations", "warning");
      return;
    }
    if (fromLocationId === toLocationId) {
      showToast("Departure and destination cannot be identical", "error");
      return;
    }

    if (fromLocationId === "OTHER" && !gpsData) {
      showToast("Capturing your live GPS position... Please wait", "warning");
      await handleCaptureGPS();
      return;
    }

    if (isOutOfRadius && userToFromDirectMeters !== null) {
      showToast(
        `Check-in disabled: You are ${formatDistance(userToFromDirectMeters)} away from ${
          selectedFromObj?.locationName || "Departure"
        }. Distance cannot exceed radius of ${formatDistance(fromRadiusMeter)}.`,
        "error"
      );
      return;
    }

    const finalFromToMeters = roadDistances.fromTo ?? calculateDistanceInMeters(fromLat, fromLng, toLat, toLng);

    const payload = {
      userId: user?.id,
      fromLocationId: fromLocationId === "OTHER" ? "OTHER" : selectedFromObj?.id,
      toLocationId: selectedToObj?.id,
      distance: finalFromToMeters?.toFixed(2) || 0,
      userCurrentLocation: {
        checkInCurrentLocation: {
          latitude: gpsData?.latitude,
          longitude: gpsData?.longitude,
          detectedPlace: gpsData?.detectedPlace,
          fullAddress: gpsData?.fullAddress
        },
        checkOutCurrentLocation: null
      }
    };
    createJourneyMutation(payload).then((res) => {
      showToast(res.data?.message || "", "success");
      navigation.goBack();
    });
  };

  const getLocationIcon = (type?: string): { name: string; iconType: "feather"; bg: string; color: string } => {
    switch (type?.toUpperCase()) {
      case "HOSPITAL":
        return { name: "plus-circle", iconType: "feather" as const, bg: "rgba(239, 68, 68, 0.12)", color: "#EF4444" };
      case "OFFICE":
        return { name: "briefcase", iconType: "feather" as const, bg: "rgba(59, 130, 246, 0.12)", color: "#3B82F6" };
      case "HOME":
        return { name: "home", iconType: "feather" as const, bg: "rgba(168, 85, 247, 0.12)", color: "#A855F7" };
      case "OTHER":
        return { name: "crosshair", iconType: "feather" as const, bg: "rgba(14, 165, 233, 0.12)", color: "#0284C7" };
      default:
        return { name: "map-pin", iconType: "feather" as const, bg: "rgba(16, 185, 129, 0.12)", color: "#10B981" };
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.palette.background.default }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        {/* Top App Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.palette.background.paper,
              borderBottomColor: theme.palette.divider
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.headerIconButton, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" type="feather" size={20} color={theme.palette.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: theme.palette.text.primary }]}>Trip Check-in</Text>
            <Text style={[styles.headerSubtitle, { color: theme.palette.text.secondary }]}>
              Departure ➔ Destination Route
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.headerIconButton, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
            onPress={handleCaptureGPS}
            activeOpacity={0.7}
          >
            <Icon name="crosshair" type="feather" size={18} color={theme.palette.primary.main} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
          {/* ========================================================= */}
          {/* SECTION 1: INTERACTIVE ROUTE SELECTION CARDS               */}
          {/* ========================================================= */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider
              }
            ]}
          >
            {/* Visual Connected From/To Container */}
            <View style={styles.routeSelectorWrapper}>
              {/* Left Route Connector */}
              <View style={styles.connectorCol}>
                <View style={[styles.fromDot, { borderColor: theme.palette.primary.main }]} />
                <View style={[styles.connectorLine, { borderColor: isDark ? "#334155" : "#CBD5E1" }]} />
                <View style={[styles.toDot, { backgroundColor: theme.palette.error.main }]} />
              </View>

              {/* Right Location Selection Boxes */}
              <View style={styles.selectorCol}>
                {/* FROM LOCATION CARD */}
                <TouchableOpacity
                  style={[
                    styles.locationCard,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: fromLocationId === "OTHER" ? "#0284C7" : theme.palette.divider
                    }
                  ]}
                  onPress={() => {
                    setActivePickerTarget("FROM");
                    setSearchQuery("");
                  }}
                  activeOpacity={0.75}
                >
                  <View style={styles.locationCardHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={[styles.fieldLabel, { color: theme.palette.primary.main }]}>FROM (DEPARTURE)</Text>
                      {fromLocationId === "OTHER" && (
                        <View style={[styles.otherLiveBadge, { backgroundColor: "rgba(14, 165, 233, 0.12)" }]}>
                          <Icon name="crosshair" type="feather" size={9} color="#0284C7" />
                          <Text style={[styles.otherLiveBadgeText, { color: "#0284C7" }]}>LIVE GPS</Text>
                        </View>
                      )}
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      {fromLocationId !== "OTHER" && (
                        <TouchableOpacity
                          style={[styles.quickUseCurrentBtn, { backgroundColor: isDark ? "#082F49" : "#E0F2FE" }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleSelectOtherLocation();
                          }}
                          activeOpacity={0.7}
                        >
                          <Icon name="crosshair" type="feather" size={10} color="#0284C7" />
                          <Text style={styles.quickUseCurrentText}>Use Live GPS</Text>
                        </TouchableOpacity>
                      )}

                      <View style={styles.tapChangeBadge}>
                        <Text style={[styles.tapChangeText, { color: theme.palette.text.secondary }]}>Change</Text>
                        <Icon name="chevron-down" type="feather" size={8} color={theme.palette.text.secondary} />
                      </View>
                    </View>
                  </View>

                  <View style={styles.locationCardBody}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.locNameText, { color: theme.palette.text.primary }]} numberOfLines={1}>
                        {selectedFromObj?.locationName || selectedFromObj?.name || "Select Departure Location"}
                      </Text>
                      {fromLocationId === "OTHER" && (
                        <Text style={[styles.locSubAddressText, { color: theme.palette.text.secondary }]} numberOfLines={1}>
                          {gpsData?.fullAddress || "Live coordinates captured as departure point"}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* SWAP ROUTE BUTTON */}
                <View style={styles.swapActionRow}>
                  <View style={[styles.swapDivider, { backgroundColor: theme.palette.divider }]} />
                  <TouchableOpacity
                    style={[
                      styles.swapButtonCircle,
                      {
                        backgroundColor: theme.palette.background.paper,
                        borderColor: theme.palette.divider
                      }
                    ]}
                    onPress={handleSwap}
                    activeOpacity={0.7}
                  >
                    <Icon name="repeat" type="feather" size={10} color={theme.palette.primary.main} />
                  </TouchableOpacity>
                  <View style={[styles.swapDivider, { backgroundColor: theme.palette.divider }]} />
                </View>

                {/* TO LOCATION CARD */}
                <TouchableOpacity
                  style={[
                    styles.locationCard,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: theme.palette.divider
                    }
                  ]}
                  onPress={() => {
                    setActivePickerTarget("TO");
                    setSearchQuery("");
                  }}
                  activeOpacity={0.75}
                >
                  <View style={styles.locationCardHeader}>
                    <Text style={[styles.fieldLabel, { color: theme.palette.error.main }]}>TO (DESTINATION)</Text>
                    <View style={styles.tapChangeBadge}>
                      <Text style={[styles.tapChangeText, { color: theme.palette.text.secondary }]}>Change</Text>
                      <Icon name="chevron-down" type="feather" size={8} color={theme.palette.text.secondary} />
                    </View>
                  </View>

                  <View style={styles.locationCardBody}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.locNameText, { color: theme.palette.text.primary }]} numberOfLines={1}>
                        {selectedToObj?.locationName || selectedToObj?.name || "Select Destination Location"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Distance Summary Metrics Breakdown (Road Route Driving Distance) */}
            {(roadDistances.fromTo != null || roadDistances.userToFrom != null || roadDistances.userToDest != null) && (
              <View
                style={[
                  styles.distanceMetricsRow,
                  {
                    borderTopColor: theme.palette.divider,
                    backgroundColor: isDark ? "#0B132B" : "#F1F5F9"
                  }
                ]}
              >
                {/* Metric 1: From -> To (Total Route) */}
                <View style={styles.metricItem}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Icon name="navigation" type="feather" size={11} color={theme.palette.primary.main} />
                    <Text style={[styles.metricLabel, { color: theme.palette.text.secondary }]}>Route</Text>
                  </View>
                  <Text style={[styles.metricValue, { color: theme.palette.text.primary }]}>
                    {formatDistanceDisplay(roadDistances.fromTo)}
                  </Text>
                </View>

                {/* Metric 2: Live GPS -> Departure */}
                <View
                  style={[
                    styles.metricItem,
                    { borderLeftWidth: 1, borderRightWidth: 1, borderColor: theme.palette.divider }
                  ]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Icon name="crosshair" type="feather" size={11} color={isOutOfRadius ? "#DC2626" : "#0F9D58"} />
                    <Text style={[styles.metricLabel, { color: theme.palette.text.secondary }]}>You ➔ Departure</Text>
                  </View>
                  <Text style={[styles.metricValue, { color: isOutOfRadius ? "#DC2626" : "#0F9D58" }]}>
                    {formatDistanceDisplay(roadDistances.userToFrom)}
                  </Text>
                  {/* {userToFromDirectMeters !== null && fromLocationId && (
                    <Text style={[styles.radiusStatusBadge, { color: isOutOfRadius ? "#DC2626" : "#16A34A" }]}>
                      {isOutOfRadius
                        ? `Exceeds ${formatDistance(fromRadiusMeter)}`
                        : `Within ${formatDistance(fromRadiusMeter)}`}
                    </Text>
                  )} */}
                </View>

                {/* Metric 3: Live GPS -> Destination */}
                <View style={styles.metricItem}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Icon name="flag" type="feather" size={11} color="#DC2626" />
                    <Text style={[styles.metricLabel, { color: theme.palette.text.secondary }]}>You ➔ Destination</Text>
                  </View>
                  <Text style={[styles.metricValue, { color: "#DC2626" }]}>
                    {formatDistanceDisplay(roadDistances.userToDest)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* ========================================================= */}
          {/* SECTION 2: REAL GOOGLE MAPS & LIVE GPS RADAR ROAD MAP     */}
          {/* ========================================================= */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider,
                overflow: "hidden",
                padding: 0
              }
            ]}
          >
            {/* Quick Map View Filter Preset Bar */}
            <View
              style={[
                styles.mapPresetBarWrapper,
                {
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  borderBottomColor: theme.palette.divider
                }
              ]}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                bounces={false}
                style={styles.mapPresetBarScroll}
                contentContainerStyle={styles.mapPresetBarContent}
              >
                {/* 1. Route / Overview */}
                <TouchableOpacity
                  style={[
                    styles.mapPresetPill,
                    {
                      backgroundColor:
                        mapFocus === "route" ? theme.palette.primary.main : isDark ? "#1E293B" : "#FFFFFF",
                      borderColor: mapFocus === "route" ? theme.palette.primary.main : theme.palette.divider
                    }
                  ]}
                  onPress={() => handleFocusMode("route")}
                  activeOpacity={0.75}
                >
                  <Icon
                    name="map"
                    type="feather"
                    size={11}
                    color={mapFocus === "route" ? "#FFFFFF" : theme.palette.text.secondary}
                  />
                  <Text
                    style={[
                      styles.mapPresetText,
                      {
                        color: mapFocus === "route" ? "#FFFFFF" : theme.palette.text.primary
                      }
                    ]}
                    numberOfLines={1}
                  >
                    Route
                  </Text>
                </TouchableOpacity>

                {/* 2. From Location (Departure) */}
                <TouchableOpacity
                  style={[
                    styles.mapPresetPill,
                    {
                      backgroundColor: mapFocus === "departure" ? "#0F9D58" : isDark ? "#1E293B" : "#FFFFFF",
                      borderColor: mapFocus === "departure" ? "#0F9D58" : theme.palette.divider
                    }
                  ]}
                  onPress={() => handleFocusMode("departure")}
                  activeOpacity={0.75}
                >
                  <Icon
                    name="navigation"
                    type="feather"
                    size={11}
                    color={mapFocus === "departure" ? "#FFFFFF" : "#16A34A"}
                  />
                  <Text
                    style={[
                      styles.mapPresetText,
                      {
                        color: mapFocus === "departure" ? "#FFFFFF" : theme.palette.text.primary
                      }
                    ]}
                    numberOfLines={1}
                  >
                    Departure
                  </Text>
                </TouchableOpacity>

                {/* 3. Current Location */}
                <TouchableOpacity
                  style={[
                    styles.mapPresetPill,
                    {
                      backgroundColor: mapFocus === "me" ? "#2563EB" : isDark ? "#1E293B" : "#FFFFFF",
                      borderColor: mapFocus === "me" ? "#2563EB" : theme.palette.divider
                    }
                  ]}
                  onPress={() => handleRecenterMe()}
                  activeOpacity={0.75}
                >
                  <Icon name="crosshair" type="feather" size={11} color={mapFocus === "me" ? "#FFFFFF" : "#3B82F6"} />
                  <Text
                    style={[
                      styles.mapPresetText,
                      {
                        color: mapFocus === "me" ? "#FFFFFF" : theme.palette.text.primary
                      }
                    ]}
                    numberOfLines={1}
                  >
                    Current
                  </Text>
                </TouchableOpacity>

                {/* 4. Destination */}
                <TouchableOpacity
                  style={[
                    styles.mapPresetPill,
                    {
                      backgroundColor: mapFocus === "destination" ? "#DC2626" : isDark ? "#1E293B" : "#FFFFFF",
                      borderColor: mapFocus === "destination" ? "#DC2626" : theme.palette.divider
                    }
                  ]}
                  onPress={() => handleFocusMode("destination")}
                  activeOpacity={0.75}
                >
                  <Icon
                    name="flag"
                    type="feather"
                    size={11}
                    color={mapFocus === "destination" ? "#FFFFFF" : "#EF4444"}
                  />
                  <Text
                    style={[
                      styles.mapPresetText,
                      {
                        color: mapFocus === "destination" ? "#FFFFFF" : theme.palette.text.primary
                      }
                    ]}
                    numberOfLines={1}
                  >
                    Destination
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Real Google Maps WebView Canvas */}
            <View style={[styles.mapCanvas, { backgroundColor: "#e5e3df", height: 300 }]}>
              <MapWebView
                ref={webViewRef}
                key={`google-map-${userLat}-${userLng}-${fromLat}-${fromLng}-${toLat}-${toLng}`}
                originWhitelist={["*"]}
                source={{ html: mapHtml }}
                style={{
                  width: "100%",
                  height: 300,
                  backgroundColor: "#e5e3df"
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                nestedScrollEnabled={true}
                scalesPageToFit={true}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={[StyleSheet.absoluteFill, styles.loadingMapOverlay, { backgroundColor: "#e5e3df" }]}>
                    <ActivityIndicator size="small" color={theme.palette.primary.main} />
                    <Text style={[styles.loadingMapText, { color: "#5f6368" }]}>Loading Google Maps...</Text>
                  </View>
                )}
              />

              {/* Floating Top Status Bar */}
              <View style={styles.mapTopFloatingRow}>
                <View
                  style={[
                    styles.liveGpsBadge,
                    {
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderColor: "#dadce0"
                    }
                  ]}
                >
                  <View
                    style={[
                      styles.livePulseDot,
                      {
                        backgroundColor: gpsData ? "#1A73E8" : isCapturingGPS ? "#F9AB00" : "#80868B"
                      }
                    ]}
                  />
                  <Text style={[styles.liveGpsBadgeText, { color: "#202124" }]}>
                    {gpsData ? "GOOGLE MAPS • LIVE GPS" : isCapturingGPS ? "ACQUIRING GPS..." : "GOOGLE MAPS READY"}
                  </Text>
                </View>

                {/* Open in Google Maps Quick Header Action */}
                <TouchableOpacity
                  style={[
                    styles.openInMapsChip,
                    {
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderColor: "#dadce0"
                    }
                  ]}
                  onPress={handleOpenInGoogleMaps}
                  activeOpacity={0.8}
                >
                  <Icon name="external-link" type="feather" size={11} color="#1A73E8" />
                  <Text style={[styles.openInMapsChipText, { color: "#1A73E8" }]}>Open App</Text>
                </TouchableOpacity>
              </View>

              {/* Floating Map Zoom & Centering Controls Column */}
              <View
                style={[
                  styles.mapControlsColumn,
                  {
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderColor: "#dadce0"
                  }
                ]}
              >
                {/* Zoom In Button */}
                <TouchableOpacity style={styles.mapControlButton} onPress={handleZoomIn} activeOpacity={0.7}>
                  <Icon name="plus" type="feather" size={17} color="#3c4043" />
                </TouchableOpacity>

                <View style={[styles.mapControlDivider, { backgroundColor: "#e8eaed" }]} />

                {/* Zoom Out Button */}
                <TouchableOpacity style={styles.mapControlButton} onPress={handleZoomOut} activeOpacity={0.7}>
                  <Icon name="minus" type="feather" size={17} color="#3c4043" />
                </TouchableOpacity>

                <View style={[styles.mapControlDivider, { backgroundColor: "#e8eaed" }]} />

                {/* Focus / Recenter on My Location */}
                <TouchableOpacity style={styles.mapControlButton} onPress={handleRecenterMe} activeOpacity={0.7}>
                  {isCapturingGPS ? (
                    <ActivityIndicator size="small" color="#1A73E8" />
                  ) : (
                    <Icon name="crosshair" type="feather" size={16} color={mapFocus === "me" ? "#1A73E8" : "#5f6368"} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Floating Bottom Live Coordinate Badge */}
              <View
                style={[
                  styles.mapZoomIndicator,
                  {
                    backgroundColor: "rgba(255, 255, 255, 0.92)",
                    borderColor: "#dadce0"
                  }
                ]}
              >
                <Icon name="navigation" type="feather" size={10} color="#1A73E8" />
                <Text style={[styles.mapZoomText, { color: "#202124" }]}>
                  {userLat.toFixed(4)}° N, {userLng.toFixed(4)}° E {gpsData ? `• ±${gpsData.accuracy.toFixed(0)}m` : ""}
                </Text>
              </View>
            </View>

            {/* Live Address & Current Location Details Card */}
            <View
              style={[
                styles.liveAddressCard,
                {
                  backgroundColor: theme.palette.background.paper,
                  borderTopColor: theme.palette.divider
                }
              ]}
            >
              <View style={styles.addressRowWrapper}>
                {/* Left Centered Location Icon */}
                <View style={styles.addressIconWrap}>
                  <Icon name="map-pin" type="feather" size={17} color={theme.palette.primary.main} />
                </View>

                {/* Center Content: Place Name & Full Address */}
                <View style={styles.addressContentCol}>
                  <View style={styles.addressHeaderRow}>
                    <Text style={[styles.addressPlaceTitle, { color: theme.palette.text.primary }]} numberOfLines={1}>
                      {gpsData?.detectedPlace ||
                        (isCapturingGPS ? "Acquiring GPS..." : "Tap Locate to detect location")}
                    </Text>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      {gpsData ? (
                        <View style={[styles.verifiedChip, { backgroundColor: "rgba(34, 197, 94, 0.12)" }]}>
                          <Icon name="check" type="feather" size={10} color="#16A34A" />
                          <Text style={styles.verifiedChipText}>Verified</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.verifiedChip, { backgroundColor: "rgba(59, 130, 246, 0.12)" }]}
                          onPress={handleCaptureGPS}
                          disabled={isCapturingGPS}
                        >
                          {isCapturingGPS ? (
                            <ActivityIndicator size="small" color={theme.palette.primary.main} />
                          ) : (
                            <>
                              <Icon name="refresh-cw" type="feather" size={10} color={theme.palette.primary.main} />
                              <Text style={[styles.verifiedChipText, { color: theme.palette.primary.main }]}>
                                Locate
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[styles.verifiedChip, { backgroundColor: "rgba(59, 130, 246, 0.12)" }]}
                        onPress={handleOpenInGoogleMaps}
                        activeOpacity={0.7}
                      >
                        <Icon name="map" type="feather" size={10} color={theme.palette.primary.main} />
                        <Text style={[styles.verifiedChipText, { color: theme.palette.primary.main }]}>Maps</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.fullAddressText, { color: theme.palette.text.secondary }]} numberOfLines={2}>
                    {gpsData?.fullAddress ||
                      (isCapturingGPS
                        ? "Locating device via GPS satellites..."
                        : "Live GPS address will appear here once acquired")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* ========================================================= */}
        {/* BOTTOM FIXED CTA BAR                                      */}
        {/* ========================================================= */}
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: theme.palette.background.paper,
              borderTopColor: theme.palette.divider
            }
          ]}
        >
          {isOutOfRadius && userToFromDirectMeters !== null && (
            <View style={styles.radiusWarningBanner}>
              <Icon name="alert-triangle" type="feather" size={13} color="#DC2626" />
              <Text style={styles.radiusWarningText}>
                You are {formatDistance(userToFromDirectMeters)} from departure (Allowed radius:
                {formatDistance(fromRadiusMeter)})
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: isOutOfRadius ? (isDark ? "#334155" : "#94A3B8") : theme.palette.primary.main,
                opacity: isCreateJourneyLoading ? 0.7 : 1
              }
            ]}
            onPress={handleCheckIn}
            disabled={isCreateJourneyLoading || isOutOfRadius}
            activeOpacity={0.85}
          >
            {isCreateJourneyLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Confirm Journey</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ========================================================= */}
        {/* INTERACTIVE LOCATION PICKER MODAL (WITH SEARCH & EXCLUSION) */}
        {/* ========================================================= */}
        <Modal
          visible={activePickerTarget !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setActivePickerTarget(null)}
        >
          <TouchableWithoutFeedback onPress={() => setActivePickerTarget(null)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.modalSheet,
                    {
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider
                    }
                  ]}
                >
                  {/* Modal Handle Bar */}
                  <View style={styles.sheetHandleWrap}>
                    <View style={[styles.sheetHandle, { backgroundColor: isDark ? "#475569" : "#CBD5E1" }]} />
                  </View>

                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={[styles.modalTitle, { color: theme.palette.text.primary }]}>
                        {activePickerTarget === "FROM" ? "Select Departure Location" : "Select Destination Location"}
                      </Text>
                      <Text style={[styles.modalSubtitle, { color: theme.palette.text.secondary }]}>
                        {activePickerTarget === "FROM"
                          ? `Excluding destination (${
                              selectedToObj?.locationName || selectedToObj?.name || "Destination"
                            })`
                          : `Excluding departure (${
                              selectedFromObj?.locationName || selectedFromObj?.name || "Departure"
                            })`}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.modalCloseBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
                      onPress={() => setActivePickerTarget(null)}
                    >
                      <Icon name="x" type="feather" size={18} color={theme.palette.text.primary} />
                    </TouchableOpacity>
                  </View>

                  {/* Search Bar */}
                  <View
                    style={[
                      styles.searchBar,
                      {
                        backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                        borderColor: theme.palette.divider
                      }
                    ]}
                  >
                    <Icon name="search" type="feather" size={16} color={theme.palette.text.secondary} />
                    <TextInput
                      style={[styles.searchInput, { color: theme.palette.text.primary }]}
                      placeholder="Search hospital name, area, office..."
                      placeholderTextColor={theme.palette.text.secondary}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      clearButtonMode="while-editing"
                      autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Icon name="x-circle" type="feather" size={16} color={theme.palette.text.secondary} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Locations List */}
                  <ScrollView style={styles.modalListScroll} showsVerticalScrollIndicator={false}>
                    {/* Dedicated OTHER LOCATION card when selecting departure */}
                    {activePickerTarget === "FROM" && (
                      <TouchableOpacity
                        style={[
                          styles.otherLocationOptionCard,
                          {
                            backgroundColor:
                              fromLocationId === "OTHER"
                                ? isDark
                                  ? "rgba(2, 132, 199, 0.18)"
                                  : "#E0F2FE"
                                : isDark
                                ? "#1E293B"
                                : "#F8FAFC",
                            borderColor: fromLocationId === "OTHER" ? "#0284C7" : theme.palette.divider
                          }
                        ]}
                        onPress={handleSelectOtherLocation}
                        activeOpacity={0.75}
                      >
                        <View style={[styles.listIconBox, { backgroundColor: "rgba(14, 165, 233, 0.16)" }]}>
                          <Icon name="crosshair" type="feather" size={18} color="#0284C7" />
                        </View>

                        <View style={styles.listItemDetails}>
                          <View style={styles.listItemHeaderRow}>
                            <Text
                              style={[
                                styles.listItemTitle,
                                {
                                  color: fromLocationId === "OTHER" ? "#0284C7" : theme.palette.text.primary,
                                  fontWeight: "700"
                                }
                              ]}
                              numberOfLines={1}
                            >
                              Other Location
                            </Text>
                            <View style={[styles.locTypeTag, { backgroundColor: "rgba(14, 165, 233, 0.15)" }]}>
                              <Text style={[styles.locTypeTagText, { color: "#0284C7", fontWeight: "700" }]}>
                                CURRENT GPS
                              </Text>
                            </View>
                          </View>

                          <Text
                            style={[styles.listItemSubtitle, { color: theme.palette.text.secondary }]}
                            numberOfLines={1}
                          >
                            {gpsData?.detectedPlace
                              ? `${gpsData.detectedPlace} • Current Live Position`
                              : isCapturingGPS
                              ? "Acquiring live GPS..."
                              : "Capture live GPS coordinates as departure point"}
                          </Text>

                          {gpsData && (
                            <View style={styles.listCoordsRow}>
                              <Icon name="navigation" type="feather" size={10} color="#0284C7" />
                              <Text style={[styles.listCoordsText, { color: theme.palette.text.secondary }]}>
                                Lat: {gpsData.latitude.toFixed(4)}° N • Lng: {gpsData.longitude.toFixed(4)}° E
                              </Text>
                            </View>
                          )}
                        </View>

                        {fromLocationId === "OTHER" ? (
                          <View style={[styles.selectedCircle, { backgroundColor: "#0284C7" }]}>
                            <Icon name="check" type="feather" size={12} color="#FFFFFF" />
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.unselectedRadioCircle,
                              { borderColor: isDark ? "#475569" : "#CBD5E1" }
                            ]}
                          />
                        )}
                      </TouchableOpacity>
                    )}

                    {currentModalOptions.length === 0 && activePickerTarget !== "FROM" ? (
                      <View style={styles.emptyState}>
                        <Icon name="map-pin" type="feather" size={32} color={theme.palette.text.secondary} />
                        <Text style={[styles.emptyStateText, { color: theme.palette.text.secondary }]}>
                          No locations match your search
                        </Text>
                      </View>
                    ) : (
                      currentModalOptions.map((loc: any) => {
                        const isSelected =
                          activePickerTarget === "FROM" ? loc.id === fromLocationId : loc.id === toLocationId;

                        const iconInfo = getLocationIcon(loc.locationType || loc.type);

                        return (
                          <TouchableOpacity
                            key={loc.id}
                            style={[
                              styles.locationListItem,
                              {
                                backgroundColor: isSelected ? (isDark ? "#1E293B" : "#EFF6FF") : "transparent",
                                borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider
                              }
                            ]}
                            onPress={() => handleSelectLocation(loc)}
                            activeOpacity={0.7}
                          >
                            {/* Type Icon */}
                            <View style={[styles.listIconBox, { backgroundColor: iconInfo.bg }]}>
                              <Icon name={iconInfo.name} type={iconInfo.iconType} size={18} color={iconInfo.color} />
                            </View>

                            {/* Location Details */}
                            <View style={styles.listItemDetails}>
                              <View style={styles.listItemHeaderRow}>
                                <Text
                                  style={[
                                    styles.listItemTitle,
                                    {
                                      color: isSelected ? theme.palette.primary.main : theme.palette.text.primary,
                                      fontWeight: isSelected ? "700" : "600"
                                    }
                                  ]}
                                  numberOfLines={1}
                                >
                                  {loc.locationName || loc.name}
                                </Text>

                                {loc.locationType && (
                                  <View
                                    style={[
                                      styles.locTypeTag,
                                      {
                                        backgroundColor: isDark ? "#334155" : "#E2E8F0"
                                      }
                                    ]}
                                  >
                                    <Text style={[styles.locTypeTagText, { color: theme.palette.text.secondary }]}>
                                      {loc.locationType}
                                    </Text>
                                  </View>
                                )}
                              </View>

                              <Text
                                style={[styles.listItemSubtitle, { color: theme.palette.text.secondary }]}
                                numberOfLines={1}
                              >
                                {loc.locationAddress || loc.city || "Hyderabad, Telangana"}
                              </Text>

                              {/* Latitude & Longitude Coordinates */}
                              <View style={styles.listCoordsRow}>
                                <Icon name="navigation" type="feather" size={10} color={theme.palette.primary.main} />
                                <Text style={[styles.listCoordsText, { color: theme.palette.text.secondary }]}>
                                  Lat: {formatCoordDisplay(loc.latitude, "N")} • Lng:{" "}
                                  {formatCoordDisplay(loc.longitude, "E")}
                                </Text>
                              </View>
                            </View>

                            {/* Selected Indicator */}
                            <View style={{ alignItems: "flex-end", gap: 4 }}>
                              {loc.distanceKm !== undefined && (
                                <Text style={[styles.listDistanceBadge, { color: theme.palette.text.secondary }]}>
                                  {loc.distanceKm} km
                                </Text>
                              )}
                              {isSelected && (
                                <View style={styles.selectedCircle}>
                                  <Icon name="check" type="feather" size={12} color="#FFFFFF" />
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  headerTitleContainer: {
    alignItems: "center"
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 96
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden"
  },
  routeSelectorWrapper: {
    flexDirection: "row",
    padding: 14,
    gap: 12
  },
  connectorCol: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    width: 16
  },
  fromDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    backgroundColor: "#FFFFFF"
  },
  connectorLine: {
    width: 2,
    flex: 1,
    borderStyle: "dashed",
    borderLeftWidth: 2,
    marginVertical: 4
  },
  toDot: {
    width: 12,
    height: 12,
    borderRadius: 3
  },
  selectorCol: {
    flex: 1
  },
  locationCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12
  },
  locationCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5
  },
  tapChangeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3
  },
  tapChangeText: {
    fontSize: 10,
    fontWeight: "600"
  },
  locationCardBody: {
    flexDirection: "row",
    alignItems: "center"
  },
  locNameText: {
    fontSize: 14,
    fontWeight: "700"
  },
  swapActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: -6,
    zIndex: 2
  },
  swapDivider: {
    flex: 1,
    height: 1
  },
  swapButtonCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  mapPresetBarWrapper: {
    borderBottomWidth: 1,
    width: "100%"
  },
  mapPresetBarScroll: {
    width: "100%"
  },
  mapPresetBarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: "100%",
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 5
  },
  mapPresetPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1
  },
  mapPresetText: {
    fontSize: 10.5,
    fontWeight: "700"
  },
  distanceMetricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginTop: 12
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 3
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase"
  },
  metricValue: {
    fontSize: 11.5,
    fontWeight: "800"
  },
  mapCanvas: {
    width: "100%",
    height: 300,
    position: "relative",
    overflow: "hidden"
  },
  loadingMapOverlay: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 10
  },
  loadingMapText: {
    fontSize: 12,
    fontWeight: "600"
  },
  mapTopFloatingRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 20
  },
  liveGpsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  liveGpsBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.4
  },
  openInMapsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3
  },
  openInMapsChipText: {
    fontSize: 10,
    fontWeight: "700"
  },
  mapControlsColumn: {
    position: "absolute",
    right: 10,
    top: 50,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    zIndex: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  mapControlButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center"
  },
  mapControlDivider: {
    height: 1,
    width: "100%"
  },
  mapZoomIndicator: {
    position: "absolute",
    left: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  mapZoomText: {
    fontSize: 9.5,
    fontWeight: "600"
  },
  liveAddressCard: {
    borderTopWidth: 1,
    padding: 12
  },
  addressRowWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  addressIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2
  },
  addressContentCol: {
    flex: 1
  },
  addressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3
  },
  addressPlaceTitle: {
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    marginRight: 6
  },
  verifiedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  verifiedChipText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#16A34A"
  },
  fullAddressText: {
    fontSize: 11,
    lineHeight: 15
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end"
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    maxHeight: "80%",
    paddingBottom: 24
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingVertical: 10
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700"
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0
  },
  modalListScroll: {
    paddingHorizontal: 20,
    maxHeight: 380
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    gap: 8
  },
  emptyStateText: {
    fontSize: 13,
    fontWeight: "500"
  },
  locationListItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12
  },
  listIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  listItemDetails: {
    flex: 1,
    gap: 2
  },
  listItemHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  listItemTitle: {
    fontSize: 14,
    flex: 1
  },
  locTypeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6
  },
  locTypeTagText: {
    fontSize: 9.5,
    fontWeight: "700"
  },
  listItemSubtitle: {
    fontSize: 11
  },
  listCoordsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2
  },
  listCoordsText: {
    fontSize: 10,
    fontWeight: "500"
  },
  listDistanceBadge: {
    fontSize: 11,
    fontWeight: "600"
  },
  selectedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center"
  },
  radiusWarningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8
  },
  radiusWarningText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#DC2626",
    flex: 1
  },
  radiusStatusBadge: {
    fontSize: 9,
    fontWeight: "700"
  },
  otherLiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  otherLiveBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4
  },
  quickUseCurrentBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  quickUseCurrentText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0284C7"
  },
  locSubAddressText: {
    fontSize: 11,
    marginTop: 2
  },
  otherLocationOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
    gap: 12
  },
  unselectedRadioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2
  }
});
