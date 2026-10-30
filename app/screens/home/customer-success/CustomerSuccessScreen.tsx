import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { format } from "date-fns";

import { useTheme } from "@/lib/appTheme";
import { Icon } from "@/lib/layout";
import { showToast } from "@/utils/ShowToast";
import {
  useGetDashboardStats,
  useGetInProgressJourney,
  useGetLocations,
  useGetTasks,
  useGetUserJourneys,
  usePostAssignTask,
  useUpdateJourney
} from "./Function";
import { getItem } from "@/utils/storage";
import { KEY } from "@/services/Constant";
import { formatTime, isTripToday } from "@/utils/Time";
import {
  calculateDistanceInMeters,
  formatDistance,
  GeocodedAddress,
  getCurrentGPSPosition,
  parseCoordinate
} from "@/utils/location";
import { JourneysListSection } from "@/components/JourneysListSection";
import { TasksListSection } from "@/components/TasksListSection";
import { DropdownComponent } from "@/components/DropdownComponent";
import { TabKey } from "@/components/BottomNavigation";
import { getStyles } from "./CustomerSuccessScreen.styles";

interface CustomerSuccessScreenProps {
  activeTab?: TabKey | string;
  onTabChange?: (tab: TabKey) => void;
}

export default function CustomerSuccessScreen({ activeTab = "team", onTabChange }: CustomerSuccessScreenProps) {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 375;
  const isTablet = width >= 768;
  const styles = useMemo(
    () => getStyles(theme, { width, height, isSmallDevice, isTablet }),
    [theme, width, height, isSmallDevice, isTablet]
  );

  // Current logged in user info
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");

  // Active in-progress journey
  const [fetchInprogressJourneyDetails, { data: journeyData, isLoading: isJourneyLoading }] = useGetInProgressJourney();
  const [updateJourneyMutation, { isLoading: isUpdatingJourney }] = useUpdateJourney();

  // Metrics state
  const [getDashboardStats] = useGetDashboardStats();
  const [getLocations, { data: locationsData }] = useGetLocations();
  const [postAssignTask] = usePostAssignTask();
  const [getUserJourneys, { data: userJourneysData, isLoading: isJourneysListLoading }] = useGetUserJourneys();

  const getDashboardStatsRef = useRef(getDashboardStats);
  getDashboardStatsRef.current = getDashboardStats;
  const getUserJourneysRef = useRef(getUserJourneys);
  getUserJourneysRef.current = getUserJourneys;

  const [taskCounts, setTaskCounts] = useState({
    todo: 0,
    inProgress: 0,
    completed: 0,
    total: 0
  });
  const [isTasksLoading, setIsTasksLoading] = useState(false);

  const [journeyCounts, setJourneyCounts] = useState({
    todo: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
    totalDistance: "0 km"
  });
  const [isJourneysLoading, setIsJourneysLoading] = useState(false);

  const [selectedTaskStatus, setSelectedTaskStatus] = useState<string>("TO_DO");
  const [selectedJourneyStatus, setSelectedJourneyStatus] = useState<string>("IN_PROGRESS");
  const [selectedJourneyDateFilter, setSelectedJourneyDateFilter] = useState<"TODAY" | "ALL" | "CUSTOM">("TODAY");

  // Today's formatted date string
  const todayFormatted = useMemo(() => format(new Date(), "dd MMM yyyy"), []);

  // Live GPS state
  const [isCapturingGPS, setIsCapturingGPS] = useState<boolean>(false);
  const [gpsData, setGpsData] = useState<GeocodedAddress | null>(null);

  // Cancellation Modal State
  const [cancelModalVisible, setCancelModalVisible] = useState<boolean>(false);
  const [cancelRemark, setCancelRemark] = useState<string>("");

  // Self-Assign / Add Task Modal State
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState<boolean>(false);
  const [tasksRefreshKey, setTasksRefreshKey] = useState<number>(0);
  const [journeysRefreshKey, setJourneysRefreshKey] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskDesc, setNewTaskDesc] = useState<string>("");
  const [newTaskLocationId, setNewTaskLocationId] = useState<string>("");
  const [newTaskPriority, setNewTaskPriority] = useState<string>("NORMAL");
  const [isCreatingTask, setIsCreatingTask] = useState<boolean>(false);

  // Fetch logged in user and locations on mount
  useEffect(() => {
    getItem(KEY.USER).then((user: any) => {
      if (user?.id) {
        setCurrentUserId(user.id);
        const name = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Associate";
        setUserName(name);
      }
    });
    getLocations({ size: 100 });
  }, []);

  // Load today's journeys list specifically for today's date
  const loadTodayJourneys = useCallback((userId: number) => {
    if (!userId) return;
    const todayDate = format(new Date(), "yyyy-MM-dd");
    getUserJourneysRef.current({ user_id: userId, date: todayDate, size: 100 });
  }, []);

  // Fetch KPI counts for the current user via Dashboard Stats API
  const loadUserMetrics = useCallback((userId: number) => {
    if (!userId) return;

    setIsTasksLoading(true);
    setIsJourneysLoading(true);

    const todayDate = format(new Date(), "yyyy-MM-dd");
    loadTodayJourneys(userId);

    getDashboardStatsRef
      .current({ user_id: userId, trip_date: todayDate })
      .then((res: any) => {
        const stats = res?.data?.data || res?.data;
        if (stats) {
          const t = stats.tasks || {};
          const j = stats.journeys || {};
          setTaskCounts({
            todo: Number(t.todo ?? 0),
            inProgress: Number(t.inProgress ?? 0),
            completed: Number(t.completed ?? t.done ?? 0),
            total: Number(t.total ?? 0)
          });
          setJourneyCounts({
            todo: Number(j.todo ?? 0),
            inProgress: Number(j.inProgress ?? 0),
            completed: Number(j.completed ?? 0),
            cancelled: Number(j.cancelled ?? 0),
            total: Number(j.total ?? 0),
            totalDistance: j.formattedDistance || (j.totalDistanceKm ? `${j.totalDistanceKm} km` : "0 km")
          });
        }
      })
      .catch((err: any) => {
        console.warn("Failed to load dashboard metrics:", err);
        setTaskCounts({ todo: 0, inProgress: 0, completed: 0, total: 0 });
        setJourneyCounts({ todo: 0, inProgress: 0, completed: 0, cancelled: 0, total: 0, totalDistance: "0 km" });
      })
      .finally(() => {
        setIsTasksLoading(false);
        setIsJourneysLoading(false);
      });
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadUserMetrics(currentUserId);
      loadTodayJourneys(currentUserId);
    }
  }, [currentUserId, loadUserMetrics, loadTodayJourneys]);

  const handleRefreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        getLocations(),
        currentUserId ? loadUserMetrics(currentUserId) : Promise.resolve(),
        currentUserId ? loadTodayJourneys(currentUserId) : Promise.resolve(),
        currentUserId ? fetchInprogressJourneyDetails(null, {}, String(currentUserId)) : Promise.resolve()
      ]);
    } catch (e) {
      // ignore
    } finally {
      setTasksRefreshKey((k) => k + 1);
      setJourneysRefreshKey((k) => k + 1);
      setIsRefreshing(false);
    }
  }, [currentUserId, loadUserMetrics, loadTodayJourneys, getLocations, fetchInprogressJourneyDetails]);

  const fetchActiveJourney = async () => {
    try {
      const user = await getItem(KEY.USER);
      if (user?.id) {
        setCurrentUserId(user.id);
        fetchInprogressJourneyDetails(null, {}, user.id);
      }
    } catch (e) {
      console.warn("Failed to fetch active journey:", e);
    }
  };

  // Re-fetch active journey & capture GPS on focus
  useFocusEffect(
    useCallback(() => {
      fetchActiveJourney();
      handleCaptureGPS();
      if (currentUserId) {
        loadUserMetrics(currentUserId);
        loadTodayJourneys(currentUserId);
      }
    }, [currentUserId, loadUserMetrics, loadTodayJourneys])
  );

  // Capture Live GPS Position
  const handleCaptureGPS = async () => {
    setIsCapturingGPS(true);
    try {
      const result: GeocodedAddress = await getCurrentGPSPosition();
      setGpsData(result);
    } catch (err: any) {
      console.warn("GPS capture warning:", err?.message || err);
    } finally {
      setIsCapturingGPS(false);
    }
  };

  // Active Journey Data
  const activeTrip = journeyData?.data;
  const toLat = parseCoordinate(activeTrip?.toLocation?.latitude);
  const toLng = parseCoordinate(activeTrip?.toLocation?.longitude);
  const toRadiusMeter = activeTrip?.toLocation?.radiusMeter ? Number(activeTrip.toLocation.radiusMeter) : 100;
  const toLocationName = activeTrip?.toLocation?.locationName || "Destination";
  const fromLocationName = activeTrip?.fromLocation?.locationName || "Departure";

  // Strict today's journey counts calculation
  const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const rawUserJourneys = useMemo(() => {
    if (Array.isArray(userJourneysData)) return userJourneysData;
    if (Array.isArray(userJourneysData?.data)) return userJourneysData.data;
    if (Array.isArray(userJourneysData?.data?.items)) return userJourneysData.data.items;
    return [];
  }, [userJourneysData]);

  // Strictly filter only trips that occurred today
  const todayUserJourneys = useMemo(() => {
    return rawUserJourneys.filter((j: any) => isTripToday(j, todayStr));
  }, [rawUserJourneys, todayStr]);

  const todayJourneyCounts = useMemo(() => {
    let inProgress = todayUserJourneys.filter((j: any) =>
      ["STARTED", "IN_PROGRESS"].includes((j.status || "").toUpperCase())
    ).length;

    // If activeTrip from in-progress endpoint is active right now and not already in todayUserJourneys
    if (activeTrip?.id && !todayUserJourneys.some((j: any) => j.id === activeTrip.id)) {
      inProgress += 1;
    }

    const completed = todayUserJourneys.filter((j: any) => (j.status || "").toUpperCase() === "COMPLETED").length;

    const cancelled = todayUserJourneys.filter((j: any) => (j.status || "").toUpperCase() === "CANCELLED").length;

    const total = inProgress + completed + cancelled;

    return {
      inProgress,
      completed,
      cancelled,
      total
    };
  }, [todayUserJourneys, activeTrip]);

  const taskCompletionRate = useMemo(() => {
    return taskCounts.total > 0 ? Math.round((taskCounts.completed / taskCounts.total) * 100) : 0;
  }, [taskCounts]);

  const journeysCompletionRate = useMemo(() => {
    return todayJourneyCounts.total > 0
      ? Math.round((todayJourneyCounts.completed / todayJourneyCounts.total) * 100)
      : 0;
  }, [todayJourneyCounts]);

  // Direct distance from live GPS to Destination in meters
  const userToDestDirectMeters = useMemo(() => {
    if (!gpsData || toLat == null || toLng == null) return null;
    return calculateDistanceInMeters(gpsData.latitude, gpsData.longitude, toLat, toLng);
  }, [gpsData, toLat, toLng]);

  // Geofence check: user must be within toRadiusMeter to check out
  const isOutOfDestRadius = useMemo(() => {
    if (userToDestDirectMeters === null) return true;
    return userToDestDirectMeters > toRadiusMeter;
  }, [userToDestDirectMeters, toRadiusMeter]);

  const handleNavigateToCheckIn = () => {
    navigation.navigate("CheckIn");
  };

  // Complete Journey (Check Out)
  const handleCheckOut = async () => {
    if (!activeTrip?.id) return;

    if (isOutOfDestRadius && userToDestDirectMeters !== null) {
      showToast(
        `Cannot complete journey: You are ${formatDistance(
          userToDestDirectMeters
        )} away from ${toLocationName}. Distance must be within ${formatDistance(toRadiusMeter)}.`,
        "error"
      );
      return;
    }

    const payload = {
      status: "COMPLETED",
      userCurrentLocation: {
        checkInCurrentLocation: activeTrip?.userCurrentLocation?.checkInCurrentLocation || null,
        checkOutCurrentLocation: {
          latitude: gpsData?.latitude,
          longitude: gpsData?.longitude,
          detectedPlace: gpsData?.addressDetails?.street || gpsData?.addressDetails?.city || "Destination",
          fullAddress: gpsData?.addressDetails?.fullAddress || ""
        }
      }
    };

    updateJourneyMutation(payload, {}, activeTrip.id)
      .then((res: any) => {
        showToast(res?.data?.message || "Journey completed successfully!", "success");
        fetchActiveJourney();
        if (currentUserId) loadUserMetrics(currentUserId);
      })
      .catch((err: any) => {
        showToast(err?.message || "Failed to complete journey", "error");
      });
  };

  // Cancel Journey with Remarks
  const handleConfirmCancel = async () => {
    if (!activeTrip?.id) return;
    if (!cancelRemark.trim()) {
      showToast("Please enter a reason for cancelling the journey", "warning");
      return;
    }

    const payload = {
      status: "CANCELLED",
      remarks: cancelRemark.trim(),
      userCurrentLocation: {
        checkInCurrentLocation: activeTrip?.userCurrentLocation?.checkInCurrentLocation || null,
        checkOutCurrentLocation: {
          latitude: gpsData?.latitude,
          longitude: gpsData?.longitude,
          detectedPlace: gpsData?.addressDetails?.street || gpsData?.addressDetails?.city || "Destination",
          fullAddress: gpsData?.addressDetails?.fullAddress || ""
        }
      }
    };

    updateJourneyMutation(payload, {}, activeTrip.id)
      .then((res: any) => {
        showToast(res?.data?.message || "Journey cancelled", "success");
        setCancelModalVisible(false);
        setCancelRemark("");
        fetchActiveJourney();
        if (currentUserId) loadUserMetrics(currentUserId);
      })
      .catch((err: any) => {
        showToast(err?.message || "Failed to cancel journey", "error");
      });
  };

  // Locations dropdown formatting
  const rawLocations = Array.isArray(locationsData?.data) ? locationsData.data : locationsData?.data?.items || [];
  const siteLocations = rawLocations.map((loc: any) => ({
    label: loc.locationName,
    value: String(loc.id)
  }));

  // Create Task (Self-Assign)
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      showToast("Please enter a title", "warning");
      return;
    }
    if (!newTaskLocationId) {
      showToast("Please select a location for this task", "warning");
      return;
    }
    if (!currentUserId) {
      showToast("User session not loaded", "error");
      return;
    }

    setIsCreatingTask(true);
    postAssignTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || undefined,
      locationId: Number(newTaskLocationId),
      location_id: Number(newTaskLocationId),
      assignedTo: currentUserId,
      priority: newTaskPriority
    })
      .then(() => {
        showToast("Task created successfully!", "success");
        setNewTaskTitle("");
        setNewTaskDesc("");
        setNewTaskLocationId("");
        setNewTaskPriority("NORMAL");
        setIsAddTaskModalVisible(false);
        setTasksRefreshKey((prev) => prev + 1);
        loadUserMetrics(currentUserId);
      })
      .catch((err: any) => {
        showToast(err?.message || "Failed to create task", "error");
      })
      .finally(() => {
        setIsCreatingTask(false);
      });
  };

  // =========================================================================
  // VIEW 1: MY TASKS TAB VIEW
  // =========================================================================
  if (activeTab === "tasks") {
    return (
      <View style={[styles.container, { backgroundColor: theme.palette.background.default }]}>
        {/* Top Header */}
        <View
          style={[
            styles.subScreenHeader,
            { backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }
          ]}
        >
          <View>
            <Text style={[styles.subScreenTitle, { color: theme.palette.text.primary }]}>My Tasks</Text>
            <Text style={[styles.subScreenSubtitle, { color: theme.palette.text.secondary }]}>
              Tasks assigned to or created by you
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.createTaskHeaderBtn, { backgroundColor: theme.palette.primary.main }]}
            onPress={() => setIsAddTaskModalVisible(true)}
            activeOpacity={0.8}
          >
            <Icon name="plus" type="feather" size={15} color="#FFFFFF" />
            <Text style={styles.createTaskHeaderBtnText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefreshAll}
              colors={[theme.palette.primary.main]}
              tintColor={theme.palette.primary.main}
            />
          }
        >
          <TasksListSection
            key={`${tasksRefreshKey}-${selectedTaskStatus}`}
            userId={currentUserId}
            title="My Assigned Tasks"
            initialStatus={selectedTaskStatus}
            onAssignPress={() => setIsAddTaskModalVisible(true)}
            canChangeStatus={true}
            onTaskUpdated={() => {
              if (currentUserId) loadUserMetrics(currentUserId);
            }}
          />
        </ScrollView>

        {renderAddTaskModal()}
      </View>
    );
  }

  // =========================================================================
  // VIEW 2: MY TRIPS / JOURNEYS TAB VIEW
  // =========================================================================
  if (activeTab === "myTrips") {
    return (
      <View style={[styles.container, { backgroundColor: theme.palette.background.default }]}>
        {/* Top Header */}
        <View
          style={[
            styles.subScreenHeader,
            { backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }
          ]}
        >
          <View>
            <Text style={[styles.subScreenTitle, { color: theme.palette.text.primary }]}>My Journeys</Text>
            <Text style={[styles.subScreenSubtitle, { color: theme.palette.text.secondary }]}>
              All field trips, routes & commute records
            </Text>
          </View>

          {!activeTrip && (
            <TouchableOpacity
              style={[styles.createTaskHeaderBtn, { backgroundColor: theme.palette.primary.main }]}
              onPress={handleNavigateToCheckIn}
              activeOpacity={0.8}
            >
              <Icon name="play" type="feather" size={14} color="#FFFFFF" />
              <Text style={styles.createTaskHeaderBtnText}>New Trip</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefreshAll}
              colors={[theme.palette.primary.main]}
              tintColor={theme.palette.primary.main}
            />
          }
        >
          {/* Active Trip Banner if currently travelling */}
          {activeTrip && <View style={{ marginBottom: 4 }}>{renderActiveTripCard()}</View>}
          <JourneysListSection
            key={`${journeysRefreshKey}-${selectedJourneyStatus}-${selectedJourneyDateFilter}`}
            userId={currentUserId}
            title="My Trip History"
            initialStatus={selectedJourneyStatus}
            initialDateFilter={selectedJourneyDateFilter}
          />
        </ScrollView>
      </View>
    );
  }

  // =========================================================================
  // VIEW 3: MAIN DASHBOARD VIEW (activeTab === 'team' or Home)
  // =========================================================================
  return (
    <View style={[styles.container, { backgroundColor: theme.palette.background.default }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefreshAll}
            colors={[theme.palette.primary.main]}
            tintColor={theme.palette.primary.main}
          />
        }
      >
        {/* Enterprise Welcome Context Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeBannerLeft}>
            <View style={styles.welcomeAvatarCircle}>
              <Text style={styles.welcomeAvatarText}>
                {userName.charAt(0).toUpperCase() || "C"}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.welcomeGreeting} numberOfLines={1}>
                Hello, {userName || "Associate"} 👋
              </Text>
              <View style={styles.welcomeSubtextRow}>
                <Text style={styles.welcomeSubtext} numberOfLines={1}>
                  Field Operations Specialist • Assigned Area
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.welcomeBannerRight}>
            <View style={styles.onDutyBadge}>
              <View style={styles.onDutyDot} />
              <Text style={styles.onDutyText}>On Duty</Text>
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* SECTION 1: START JOURNEY / ACTIVE TRIP HERO CARD          */}
        {/* ========================================================= */}
        {isJourneyLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={theme.palette.primary.main} size="large" />
            <Text style={styles.loadingText}>
              Verifying field journey status...
            </Text>
          </View>
        ) : activeTrip ? (
          renderActiveTripCard()
        ) : (
          <View style={styles.statusCard}>
            {/* Enterprise Dispatch Console Top Bar */}
            <View style={styles.dispatchConsoleTop}>
              <View style={styles.dispatchTag}>
                <Icon name="activity" type="feather" size={11} color={isDark ? "#93C5FD" : "#2563EB"} />
                <Text style={styles.dispatchTagText}>FIELD DISPATCH CONSOLE</Text>
              </View>
              <View style={styles.gpsStatusPill}>
                <View style={styles.gpsStatusDot} />
                <Text style={styles.gpsStatusText}>GPS Active</Text>
              </View>
            </View>

            <View style={styles.heroContent}>
              <View style={styles.heroIconCircle}>
                <Icon name="navigation" type="feather" size={24} color={theme.palette.primary.main} />
              </View>
              <Text style={styles.heroTitle}>Ready for your Field Visit?</Text>
              <Text style={styles.heroSubtitle}>
                Select departure and destination hospital to initiate GPS tracking, mileage logging, and geofence attendance.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleNavigateToCheckIn}
              activeOpacity={0.85}
            >
              <Icon name="send" type="feather" size={16} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Start Field Journey</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================= */}
        {/* DASHBOARD KPI CARDS CONTAINER (RESPONSIVE)                */}
        {/* ========================================================= */}
        <View style={isTablet ? styles.kpiCardsRowTablet : undefined}>
          {/* SECTION 2: TODAY'S TASKS OVERVIEW CARD (DASHBOARD KPI) */}
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => onTabChange?.("tasks")}
            activeOpacity={0.85}
          >
            {/* Card Header */}
            <View style={styles.kpiCardHeader}>
              <View style={styles.kpiCardHeaderLeft}>
                <View
                  style={[
                    styles.kpiIconBox,
                    { backgroundColor: isDark ? "rgba(245, 158, 11, 0.18)" : "rgba(245, 158, 11, 0.12)" }
                  ]}
                >
                  <Icon name="check-square" type="feather" size={20} color="#D97706" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.kpiCardTitle} numberOfLines={1}>My Assigned Tasks</Text>
                  <Text style={styles.kpiCardSubtitle} numberOfLines={1}>
                    Daily tickets & visit schedule
                  </Text>
                </View>
              </View>

              <View style={styles.kpiCardHeaderRight}>
                <TouchableOpacity
                  style={styles.kpiAddBtn}
                  onPress={() => setIsAddTaskModalVisible(true)}
                  activeOpacity={0.75}
                >
                  <Icon name="plus" type="feather" size={15} color="#FFFFFF" />
                  <Text style={styles.kpiAddBtnText}>Task</Text>
                </TouchableOpacity>
                <Icon name="chevron-right" type="feather" size={20} color={theme.palette.text.secondary} />
              </View>
            </View>

            {/* Task Velocity Progress Bar */}
            <View style={styles.progressVelocityRow}>
              <Text style={styles.progressVelocityLabel}>Completion Velocity</Text>
              <View style={styles.progressVelocityBadge}>
                <Text style={styles.progressVelocityBadgeText}>
                  {taskCounts.total > 0 ? `${taskCompletionRate}% Done` : "0% Done"}
                </Text>
              </View>
            </View>
            <View style={styles.kpiProgressTrack}>
              <View style={[styles.kpiProgressFillDone, { flex: Math.max(taskCounts.completed, 0.0001) }]} />
              <View style={[styles.kpiProgressFillInProgress, { flex: Math.max(taskCounts.inProgress, 0.0001) }]} />
              <View style={[styles.kpiProgressFillTodo, { flex: Math.max(taskCounts.todo, 0.0001) }]} />
            </View>

            {/* Counts Grid */}
            {isTasksLoading ? (
              <View style={{ paddingVertical: 18, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#D97706" />
              </View>
            ) : (
              <View style={styles.kpiStatsRow}>
                {/* Pending / To-Do */}
                <TouchableOpacity
                  style={[
                    styles.kpiStatPill,
                    {
                      backgroundColor: isDark ? "rgba(245, 158, 11, 0.08)" : "#FFFBEB",
                      borderColor: isDark ? "rgba(245, 158, 11, 0.3)" : "#FDE68A"
                    }
                  ]}
                  onPress={() => {
                    setSelectedTaskStatus("TO_DO");
                    onTabChange?.("tasks");
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.kpiStatVal, { color: isDark ? "#FCD34D" : "#D97706" }]}>{taskCounts.todo}</Text>
                  <View style={styles.kpiStatDotLabel}>
                    <View style={[styles.kpiDot, { backgroundColor: "#D97706" }]} />
                    <Text style={[styles.kpiStatLabel, { color: isDark ? "#FCD34D" : "#92400E" }]} numberOfLines={1} ellipsizeMode="tail">To Do</Text>
                  </View>
                </TouchableOpacity>

                {/* In Progress */}
                <TouchableOpacity
                  style={[
                    styles.kpiStatPill,
                    {
                      backgroundColor: isDark ? "rgba(59, 130, 246, 0.08)" : "#EFF6FF",
                      borderColor: isDark ? "rgba(59, 130, 246, 0.3)" : "#BFDBFE"
                    }
                  ]}
                  onPress={() => {
                    setSelectedTaskStatus("IN_PROGRESS");
                    onTabChange?.("tasks");
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.kpiStatVal, { color: isDark ? "#60A5FA" : "#2563EB" }]}>
                    {taskCounts.inProgress}
                  </Text>
                  <View style={styles.kpiStatDotLabel}>
                    <View style={[styles.kpiDot, { backgroundColor: "#2563EB" }]} />
                    <Text style={[styles.kpiStatLabel, { color: isDark ? "#93C5FD" : "#1E40AF" }]} numberOfLines={1} ellipsizeMode="tail">In Progress</Text>
                  </View>
                </TouchableOpacity>

                {/* Completed */}
                <TouchableOpacity
                  style={[
                    styles.kpiStatPill,
                    {
                      backgroundColor: isDark ? "rgba(16, 185, 129, 0.08)" : "#F0FDF4",
                      borderColor: isDark ? "rgba(16, 185, 129, 0.3)" : "#BBF7D0"
                    }
                  ]}
                  onPress={() => {
                    setSelectedTaskStatus("CLOSED");
                    onTabChange?.("tasks");
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.kpiStatVal, { color: isDark ? "#4ADE80" : "#16A34A" }]}>
                    {taskCounts.completed}
                  </Text>
                  <View style={styles.kpiStatDotLabel}>
                    <View style={[styles.kpiDot, { backgroundColor: "#16A34A" }]} />
                    <Text style={[styles.kpiStatLabel, { color: isDark ? "#86EFAC" : "#166534" }]} numberOfLines={1} ellipsizeMode="tail">Done</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>

          {/* SECTION 3: TODAY'S JOURNEYS OVERVIEW */}
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => {
              setSelectedJourneyDateFilter("TODAY");
              setSelectedJourneyStatus("ALL");
              onTabChange?.("myTrips");
            }}
            activeOpacity={0.85}
          >
            {/* Card Header */}
            <View style={styles.kpiCardHeader}>
              <View style={styles.kpiCardHeaderLeft}>
                <View
                  style={[
                    styles.kpiIconBox,
                    { backgroundColor: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.12)" }
                  ]}
                >
                  <Icon name="navigation" type="feather" size={20} color={theme.palette.primary.main} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={styles.kpiCardTitle} numberOfLines={1}>Today's Journeys</Text>
                    <View style={styles.kpiDateBadge}>
                      <Icon name="calendar" type="feather" size={10} color={isDark ? "#93C5FD" : "#2563EB"} />
                      <Text style={styles.kpiDateBadgeText}>
                        {todayFormatted}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.kpiCardSubtitle} numberOfLines={1}>
                    Hospital visits & travel log
                  </Text>
                </View>
              </View>

              <View style={styles.kpiCardHeaderRight}>
                <View style={styles.kpiBadge}>
                  <Text style={styles.kpiBadgeText}>
                    {todayJourneyCounts.total} Today
                  </Text>
                </View>
                <Icon name="chevron-right" type="feather" size={20} color={theme.palette.text.secondary} />
              </View>
            </View>

            {/* Daily Visit Progress Bar */}
            <View style={styles.progressVelocityRow}>
              <Text style={styles.progressVelocityLabel}>Daily Visit Progress</Text>
              <View
                style={[
                  styles.progressVelocityBadge,
                  {
                    backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF",
                  }
                ]}
              >
                <Text
                  style={[
                    styles.progressVelocityBadgeText,
                    { color: isDark ? "#93C5FD" : "#2563EB" }
                  ]}
                >
                  {todayJourneyCounts.total > 0
                    ? `${journeysCompletionRate}% Visits Done`
                    : "0% Visits Done"}
                </Text>
              </View>
            </View>
            <View style={styles.kpiProgressTrack}>
              <View style={[styles.kpiProgressFillDone, { flex: Math.max(todayJourneyCounts.completed, 0.0001) }]} />
              <View style={[styles.kpiProgressFillInProgress, { flex: Math.max(todayJourneyCounts.inProgress, 0.0001) }]} />
              <View
                style={[
                  { backgroundColor: isDark ? "#7F1D1D" : "#FCA5A5", height: "100%" },
                  { flex: Math.max(todayJourneyCounts.cancelled, 0.0001) }
                ]}
              />
            </View>

            {/* Counts Grid (3 equal pills: In Progress, Completed, Cancelled) */}
            {isJourneysLoading || isJourneysListLoading ? (
              <View style={{ paddingVertical: 18, alignItems: "center" }}>
                <ActivityIndicator size="small" color={theme.palette.primary.main} />
              </View>
            ) : (
              <View style={styles.kpiStatsRow}>
                {/* In Progress */}
                <TouchableOpacity
                  style={[
                    styles.kpiStatPill,
                    {
                      backgroundColor: isDark ? "rgba(59, 130, 246, 0.08)" : "#EFF6FF",
                      borderColor: isDark ? "rgba(59, 130, 246, 0.3)" : "#BFDBFE"
                    }
                  ]}
                  onPress={() => {
                    setSelectedJourneyStatus("IN_PROGRESS");
                    setSelectedJourneyDateFilter("TODAY");
                    onTabChange?.("myTrips");
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.kpiStatVal, { color: isDark ? "#60A5FA" : "#2563EB" }]}>
                    {todayJourneyCounts.inProgress}
                  </Text>
                  <View style={styles.kpiStatDotLabel}>
                    <View style={[styles.kpiDot, { backgroundColor: "#2563EB" }]} />
                    <Text style={[styles.kpiStatLabel, { color: isDark ? "#93C5FD" : "#1E40AF" }]} numberOfLines={1} ellipsizeMode="tail">In Progress</Text>
                  </View>
                </TouchableOpacity>

                {/* Completed */}
                <TouchableOpacity
                  style={[
                    styles.kpiStatPill,
                    {
                      backgroundColor: isDark ? "rgba(16, 185, 129, 0.08)" : "#F0FDF4",
                      borderColor: isDark ? "rgba(16, 185, 129, 0.3)" : "#BBF7D0"
                    }
                  ]}
                  onPress={() => {
                    setSelectedJourneyStatus("COMPLETED");
                    setSelectedJourneyDateFilter("TODAY");
                    onTabChange?.("myTrips");
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.kpiStatVal, { color: isDark ? "#4ADE80" : "#16A34A" }]}>
                    {todayJourneyCounts.completed}
                  </Text>
                  <View style={styles.kpiStatDotLabel}>
                    <View style={[styles.kpiDot, { backgroundColor: "#16A34A" }]} />
                    <Text style={[styles.kpiStatLabel, { color: isDark ? "#86EFAC" : "#166534" }]} numberOfLines={1} ellipsizeMode="tail">Completed</Text>
                  </View>
                </TouchableOpacity>

                {/* Cancelled */}
                <TouchableOpacity
                  style={[
                    styles.kpiStatPill,
                    {
                      backgroundColor: isDark ? "rgba(239, 68, 68, 0.08)" : "#FEF2F2",
                      borderColor: isDark ? "rgba(239, 68, 68, 0.3)" : "#FECACA"
                    }
                  ]}
                  onPress={() => {
                    setSelectedJourneyStatus("CANCELLED");
                    setSelectedJourneyDateFilter("TODAY");
                    onTabChange?.("myTrips");
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.kpiStatVal, { color: isDark ? "#F87171" : "#DC2626" }]}>
                    {todayJourneyCounts.cancelled}
                  </Text>
                  <View style={styles.kpiStatDotLabel}>
                    <View style={[styles.kpiDot, { backgroundColor: "#DC2626" }]} />
                    <Text style={[styles.kpiStatLabel, { color: isDark ? "#FCA5A5" : "#991B1B" }]} numberOfLines={1} ellipsizeMode="tail">Cancelled</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Guidelines Info Card */}
        {/* <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
              borderWidth: 1
            }
          ]}
        >
          <View style={styles.infoCardHeader}>
            <Icon name="info" type="feather" size={16} color={theme.palette.primary.main} />
            <Text style={[styles.infoCardTitle, { color: theme.palette.text.primary }]}>
              Field Operations Guidelines
            </Text>
          </View>
          <Text style={[styles.infoCardDesc, { color: theme.palette.text.secondary }]}>
            • Check in before departing to client or hospital locations.{"\n"}• Destination geofence is validated
            automatically for checkout.{"\n"}• Update task status as you complete visits or create your own tasks.
          </Text>
        </View> */}
      </ScrollView>

      {/* ========================================================= */}
      {/* CANCEL JOURNEY REMARKS MODAL                              */}
      {/* ========================================================= */}
      {renderCancelModal()}

      {/* ========================================================= */}
      {/* ADD TASK (SELF-ASSIGN) MODAL                             */}
      {/* ========================================================= */}
      {renderAddTaskModal()}
    </View>
  );

  // ==========================================
  // Helper: Active Trip Card
  // ==========================================
  function renderActiveTripCard() {
    return (
      <View
        style={[
          styles.activeTripCard,
          {
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.palette.primary.main
          }
        ]}
      >
        {/* Header Badge */}
        <View style={styles.cardHeader}>
          <View style={[styles.activeStatusBadge, { backgroundColor: "rgba(34, 197, 94, 0.12)" }]}>
            <View style={styles.pulsingDot} />
            <Text style={styles.activeStatusText}>JOURNEY IN PROGRESS</Text>
          </View>

          {activeTrip?.startTime && (
            <Text style={[styles.startTimeText, { color: theme.palette.text.secondary }]}>
              Started: {formatTime(activeTrip.startTime)}
            </Text>
          )}
        </View>

        {/* Route Details (Responsive) */}
        <View style={styles.routeContainer}>
          <View style={[styles.routeRowResponsive, isSmallDevice && styles.routeRowResponsiveSmall]}>
            {/* Departure */}
            <View style={styles.routeLocationBox}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <View style={[styles.dotFrom, { borderColor: theme.palette.primary.main }]} />
                <Text style={[styles.locationLabel, { color: theme.palette.text.secondary }]}>FROM (DEPARTURE)</Text>
              </View>
              <Text style={[styles.locationValue, { color: theme.palette.text.primary }]} numberOfLines={2}>
                {fromLocationName}
              </Text>
            </View>

            {/* Route indicator */}
            <View style={[styles.routeArrowBox, isSmallDevice && styles.routeArrowBoxSmall]}>
              <Icon
                name={isSmallDevice ? "arrow-down" : "arrow-right"}
                type="feather"
                size={isSmallDevice ? 14 : 16}
                color={theme.palette.primary.main}
              />
            </View>

            {/* Destination */}
            <View style={styles.routeLocationBox}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <View style={[styles.dotTo, { backgroundColor: theme.palette.success.main }]} />
                <Text style={[styles.locationLabel, { color: theme.palette.text.secondary }]}>TO (DESTINATION)</Text>
              </View>
              <Text style={[styles.locationValue, { color: theme.palette.text.primary }]} numberOfLines={2}>
                {toLocationName}
              </Text>
            </View>
          </View>
        </View>

        {/* Destination Geofence Warning */}
        {isOutOfDestRadius && (
          <View style={styles.geofenceWarningBanner}>
            <Icon name="alert-triangle" type="feather" size={14} color="#DC2626" />
            <Text style={styles.geofenceWarningText}>
              {userToDestDirectMeters !== null
                ? `You are ${formatDistance(userToDestDirectMeters)} from destination (Must be within ${formatDistance(
                    toRadiusMeter
                  )})`
                : "Locating live GPS to verify destination radius..."}
            </Text>
          </View>
        )}

        {/* Action Buttons: Cancel & Complete */}
        <View style={styles.actionButtonsRow}>
          {/* Cancel Button */}
          <TouchableOpacity
            style={[
              styles.cancelTripButton,
              {
                borderColor: theme.palette.error.main,
                backgroundColor: isDark ? "rgba(239, 68, 68, 0.08)" : "#FEF2F2"
              }
            ]}
            onPress={() => setCancelModalVisible(true)}
            disabled={isUpdatingJourney}
            activeOpacity={0.8}
          >
            <Icon name="x-circle" type="feather" size={16} color={theme.palette.error.main} />
            <Text style={[styles.cancelTripButtonText, { color: theme.palette.error.main }]}>Cancel Journey</Text>
          </TouchableOpacity>

          {/* Complete Journey CTA */}
          <TouchableOpacity
            style={[
              styles.completeTripButton,
              {
                backgroundColor: isOutOfDestRadius ? (isDark ? "#334155" : "#94A3B8") : theme.palette.success.main,
                opacity: isUpdatingJourney || isCapturingGPS ? 0.7 : 1
              }
            ]}
            onPress={handleCheckOut}
            disabled={isUpdatingJourney || isOutOfDestRadius || isCapturingGPS}
            activeOpacity={0.85}
          >
            {isUpdatingJourney || isCapturingGPS ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : isOutOfDestRadius ? (
              <>
                <Icon name="slash" type="feather" size={16} color="#FFFFFF" />
                <Text style={styles.completeTripButtonText}>Complete Journey</Text>
              </>
            ) : (
              <>
                <Icon name="check-circle" type="feather" size={16} color="#FFFFFF" />
                <Text style={styles.completeTripButtonText}>Complete Journey</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Dashboard Modals */}
        {renderCancelModal()}
        {renderAddTaskModal()}
      </View>
    );
  }

  // ==========================================
  // Helper: Cancel Journey Modal
  // ==========================================
  function renderCancelModal() {
    return (
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            setCancelModalVisible(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.keyboardAvoidingContainer}
            >
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View
                  style={[
                    styles.modalContent,
                    {
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider
                    }
                  ]}
                >
                  <View style={styles.modalHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={styles.modalAlertIcon}>
                        <Icon name="alert-circle" type="feather" size={18} color="#DC2626" />
                      </View>
                      <Text style={[styles.modalTitle, { color: theme.palette.text.primary }]}>Cancel Journey?</Text>
                    </View>
                    <TouchableOpacity onPress={() => setCancelModalVisible(false)}>
                      <Icon name="x" type="feather" size={20} color={theme.palette.text.secondary} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.modalSubtitle, { color: theme.palette.text.secondary }]}>
                    Please provide a clear reason for cancellation. This will be logged for reporting.
                  </Text>

                  <TextInput
                    style={[
                      styles.remarkInput,
                      {
                        backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                        borderColor: theme.palette.divider,
                        color: theme.palette.text.primary
                      }
                    ]}
                    placeholder="e.g. Hospital visit postponed, incorrect site selected..."
                    placeholderTextColor={theme.palette.text.secondary}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={cancelRemark}
                    onChangeText={setCancelRemark}
                  />

                  <View style={styles.modalActionsRow}>
                    <TouchableOpacity
                      style={[styles.modalSecondaryBtn, { borderColor: theme.palette.divider }]}
                      onPress={() => setCancelModalVisible(false)}
                      disabled={isUpdatingJourney}
                    >
                      <Text style={[styles.modalSecondaryBtnText, { color: theme.palette.text.secondary }]}>
                        Keep Journey
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.modalDangerBtn,
                        {
                          backgroundColor: !cancelRemark.trim() ? (isDark ? "#334155" : "#94A3B8") : "#DC2626",
                          opacity: isUpdatingJourney ? 0.7 : 1
                        }
                      ]}
                      onPress={handleConfirmCancel}
                      disabled={!cancelRemark.trim() || isUpdatingJourney}
                    >
                      {isUpdatingJourney ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Icon name="x-circle" type="feather" size={16} color="#FFFFFF" />
                          <Text style={styles.modalDangerBtnText}>Confirm Cancel</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  // ==========================================
  // Helper: Add Task (Self-Assign) Modal
  // ==========================================
  function renderAddTaskModal() {
    return (
      <Modal visible={isAddTaskModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.addTaskModalCard,
              { backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.palette.text.primary }]}>Create New Task</Text>
                <Text style={[styles.modalSubtitle, { color: theme.palette.text.secondary }]}>
                  Add a task for yourself to complete
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsAddTaskModalVisible(false)}>
                <Icon name="x" type="feather" size={20} color={theme.palette.text.secondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.palette.text.primary }]}>Title *</Text>
            <TextInput
              style={[
                styles.modalTextInput,
                {
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary
                }
              ]}
              placeholder="e.g. Vitals kiosk check · Apollo Hospital"
              placeholderTextColor={theme.palette.text.secondary}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />

            <Text style={[styles.inputLabel, { color: theme.palette.text.primary }]}>Description</Text>
            <TextInput
              style={[
                styles.modalTextInput,
                {
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  height: 60
                }
              ]}
              placeholder="Additional details about the task..."
              placeholderTextColor={theme.palette.text.secondary}
              value={newTaskDesc}
              onChangeText={setNewTaskDesc}
              multiline
            />

            <Text style={[styles.inputLabel, { color: theme.palette.text.primary }]}>Location</Text>
            <DropdownComponent
              data={siteLocations || []}
              value={newTaskLocationId}
              onChange={(item) => setNewTaskLocationId(item.value)}
              placeholder="Select location"
            />

            <Text style={[styles.inputLabel, { color: theme.palette.text.primary }]}>Priority</Text>
            <DropdownComponent
              data={[
                { label: "Normal", value: "NORMAL" },
                { label: "High", value: "HIGH" },
                { label: "Low", value: "LOW" }
              ]}
              value={newTaskPriority}
              onChange={(item) => setNewTaskPriority(item.value)}
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={[styles.modalSecondaryBtn, { borderColor: theme.palette.divider }]}
                onPress={() => setIsAddTaskModalVisible(false)}
                disabled={isCreatingTask}
              >
                <Text style={[styles.modalSecondaryBtnText, { color: theme.palette.text.secondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: theme.palette.primary.main }]}
                onPress={handleCreateTask}
                disabled={isCreatingTask || !newTaskTitle.trim()}
              >
                {isCreatingTask ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Icon name="check" type="feather" size={16} color="#FFFFFF" />
                    <Text style={styles.modalPrimaryBtnText}>Create Task</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

