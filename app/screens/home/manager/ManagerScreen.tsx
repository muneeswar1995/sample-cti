import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { format } from "date-fns";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
import { useTheme } from "@/lib/appTheme";
import { Icon } from "@/lib/layout";
import { getStyles } from "./ManagerScreen.styles";
import {
  useGetDashboardStats,
  useGetLocations,
  useGetTasks,
  useGetUsers,
  usePostAssignTask,
  usePostCloseTask,
  usePostLocation,
  useGetUserJourneys
} from "./Functions";
import { DropdownComponent } from "@/components/DropdownComponent";
import { JourneysListSection } from "@/components/JourneysListSection";
import { TasksListSection } from "@/components/TasksListSection";
import { LocationsListSection } from "@/components/LocationsListSection";
import { showToast } from "@/utils/ShowToast";
import { getCurrentGPSPosition } from "@/utils/location";
import { isTripToday } from "@/utils/Time";

export type ManagerView = "dashboard" | "tasks" | "journeys" | "locations";

export default function ManagerScreen({ activeTab }: { activeTab?: string }) {
  const { theme } = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 375;
  const isTablet = width >= 768;
  const styles = useMemo(
    () => getStyles(theme, { width, height, isSmallDevice, isTablet }),
    [theme, width, height, isSmallDevice, isTablet]
  );

  // Screen View State: Dashboard vs Detailed Sub-Screens
  const [currentView, setCurrentView] = useState<ManagerView>("dashboard");

  // Selected Team Member
  const [activeMember, setActiveMember] = useState<any>(null);

  // Horizontal Member Slider ref
  const scrollRef = useRef<FlatList>(null);
  const scrollLeft = () => scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
  const scrollRight = () => scrollRef.current?.scrollToEnd({ animated: true });

  // Counts state for selected agent
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

  // API Hooks
  const [getUsers, { data: usersData, isLoading: isUsersLoading }] = useGetUsers();
  const [getDashboardStats] = useGetDashboardStats();
  const [getLocations, { data: locationsData }] = useGetLocations();
  const [postLocation] = usePostLocation();
  const [postAssignTask] = usePostAssignTask();
  const [getAllJourneys, { data: allJourneysData }] = useGetUserJourneys();
  const [getMemberJourneys, { data: memberJourneysData, isLoading: isMemberJourneysLoading }] = useGetUserJourneys();

  // Modals state
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0);
  const [journeysRefreshKey, setJourneysRefreshKey] = useState(0);
  const [locationsRefreshKey, setLocationsRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskLocationId, setNewTaskLocationId] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [priority, setPriority] = useState<string>("NORMAL");

  const [isAddLocationModalVisible, setIsAddLocationModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any | null>(null);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationType, setNewLocationType] = useState<string>("HOSPITAL");
  const [newLocationLatitude, setNewLocationLatitude] = useState<string>("");
  const [newLocationLongitude, setNewLocationLongitude] = useState<string>("");
  const [newLocationRadius, setNewLocationRadius] = useState("150");
  const [newLocationDistance, setNewLocationDistance] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);

  // Handle hardware back press on Android to return to dashboard
  useEffect(() => {
    const onBackPress = () => {
      if (currentView !== "dashboard") {
        setCurrentView("dashboard");
        return true;
      }
      return false;
    };

    const backHandlerSubscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => backHandlerSubscription.remove();
  }, [currentView]);

  const getUsersRef = useRef(getUsers);
  getUsersRef.current = getUsers;
  const getLocationsRef = useRef(getLocations);
  getLocationsRef.current = getLocations;
  const getDashboardStatsRef = useRef(getDashboardStats);
  getDashboardStatsRef.current = getDashboardStats;
  const getAllJourneysRef = useRef(getAllJourneys);
  getAllJourneysRef.current = getAllJourneys;
  const getMemberJourneysRef = useRef(getMemberJourneys);
  getMemberJourneysRef.current = getMemberJourneys;

  // Normalized Team Members array
  const teamMembers: any[] = useMemo(() => {
    if (Array.isArray(usersData)) return usersData;
    if (Array.isArray(usersData?.data)) return usersData.data;
    if (Array.isArray(usersData?.data?.items)) return usersData.data.items;
    return [];
  }, [usersData]);

  // Normalized All Journeys list across all members
  const allJourneys: any[] = useMemo(() => {
    if (Array.isArray(allJourneysData)) return allJourneysData;
    if (Array.isArray(allJourneysData?.data)) return allJourneysData.data;
    if (Array.isArray(allJourneysData?.data?.items)) return allJourneysData.data.items;
    return [];
  }, [allJourneysData]);

  // Map of userId -> array of journeys
  const userJourneysMap = useMemo(() => {
    const map: Record<string | number, any[]> = {};
    for (const j of allJourneys) {
      const uId = j.user_id ?? j.userId;
      if (uId != null) {
        if (!map[uId]) map[uId] = [];
        map[uId].push(j);
      }
    }
    return map;
  }, [allJourneys]);

  // Initial load & focus effect
  useEffect(() => {
    getUsers({ is_all_users: true });
    getLocations({ size: 100 });
    getAllJourneys({ size: 100 });
  }, []);

  useFocusEffect(
    useCallback(() => {
      getUsersRef.current({ is_all_users: true });
      getLocationsRef.current({ size: 100 });
      getAllJourneysRef.current({ size: 100 });
    }, [])
  );

  // Set default active member when users load
  const firstUserId = teamMembers[0]?.id;
  useEffect(() => {
    if (firstUserId && !activeMember) {
      setActiveMember(firstUserId);
    }
  }, [firstUserId, activeMember]);

  // Load KPI counts for the selected agent via Dashboard Stats API
  const loadAgentMetrics = useCallback((memberId: any) => {
    if (!memberId) return;

    setIsTasksLoading(true);
    setIsJourneysLoading(true);

    const todayDate = format(new Date(), "yyyy-MM-dd");

    // Fetch member's journeys for today
    getMemberJourneysRef.current({ user_id: memberId, date: todayDate, size: 100 });

    getDashboardStatsRef
      .current({ user_id: memberId, trip_date: todayDate })
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
        console.warn("Failed to load agent dashboard metrics:", err);
        setTaskCounts({ todo: 0, inProgress: 0, completed: 0, total: 0 });
        setJourneyCounts({ todo: 0, inProgress: 0, completed: 0, cancelled: 0, total: 0, totalDistance: "0 km" });
      })
      .finally(() => {
        setIsTasksLoading(false);
        setIsJourneysLoading(false);
      });
  }, []);

  useEffect(() => {
    if (activeMember) {
      loadAgentMetrics(activeMember);
    }
  }, [activeMember, loadAgentMetrics]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        getUsersRef.current({ is_all_users: true }),
        getLocationsRef.current(),
        getAllJourneysRef.current({ size: 100 }),
        activeMember
          ? getMemberJourneysRef.current({ user_id: activeMember, date: todayStr, size: 100 })
          : Promise.resolve(),
        activeMember ? loadAgentMetrics(activeMember) : Promise.resolve()
      ]);
    } catch (e) {
      // ignore
    } finally {
      setTasksRefreshKey((k) => k + 1);
      setJourneysRefreshKey((k) => k + 1);
      setLocationsRefreshKey((k) => k + 1);
      setIsRefreshing(false);
    }
  }, [activeMember, loadAgentMetrics]);

  // Selected agent helper
  const selectedUser = teamMembers.find((u: any) => u.id === activeMember) || teamMembers[0];

  const getMemberName = () => {
    if (selectedUser) {
      const first = selectedUser.firstName || selectedUser.first_name || "";
      const last = selectedUser.lastName || selectedUser.last_name || "";
      const full = selectedUser.name || `${first} ${last}`.trim();
      if (full) {
        return full
          .split(" ")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      }
    }
    return "Team Member";
  };

  const getMemberRole = () => {
    if (!selectedUser) return "CS Specialist";
    const rawRole =
      selectedUser.role?.roleName ||
      selectedUser.role?.role_name ||
      (typeof selectedUser.role === "string" ? selectedUser.role : null) ||
      selectedUser.userType;
    if (!rawRole) return "Customer Success Specialist";
    return String(rawRole).replace(/_/g, " ");
  };

  // Helper to extract location name from journey
  const getJourneyLocationName = (journey: any) => {
    if (!journey) return "";
    return (
      journey.to_location?.location_name ||
      journey.toLocation?.locationName ||
      journey.to_location?.name ||
      journey.toLocation?.name ||
      journey.toLocationName ||
      journey.user_current_location?.checkInCurrentLocation?.detectedPlace ||
      journey.user_current_location?.check_in_current_location?.detectedPlace ||
      ""
    );
  };

  // Determine user status based on journeys (default: "Offline")
  const getMemberJourneyStatus = useCallback(
    (user: any): { statusText: string; isOnline: boolean } => {
      if (!user) return { statusText: "Offline", isOnline: false };

      // 1. Direct journey on user if already provided
      const directTrip =
        user.active_journey ||
        user.activeJourney ||
        user.activeTrip ||
        user.current_journey ||
        user.journey ||
        user.trip;

      const uId = user.id;
      const userTrips = (uId != null ? userJourneysMap[uId] : null) || [];

      // 2. Check in-progress journey
      const inProgressTrip =
        (directTrip && (directTrip.status === "IN_PROGRESS" || directTrip.status === "STARTED") ? directTrip : null) ||
        userTrips.find((j: any) => j.status === "IN_PROGRESS" || j.status === "STARTED");

      if (inProgressTrip) {
        const toLoc = getJourneyLocationName(inProgressTrip);
        const fromLoc =
          inProgressTrip.from_location?.location_name ||
          inProgressTrip.fromLocation?.locationName ||
          inProgressTrip.from_location?.name;

        const locName = toLoc || fromLoc;
        if (locName) {
          return { statusText: `En Route: ${locName}`, isOnline: true };
        }
        return { statusText: "On Journey", isOnline: true };
      }

      // 3. Check today's latest completed journey
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const completedToday = userTrips.find((j: any) => {
        if (j.status !== "COMPLETED") return false;
        const tripDate = j.end_time || j.endTime || j.created_at || j.createdAt || j.start_time || j.startTime;
        if (!tripDate) return false;
        try {
          return format(new Date(tripDate), "yyyy-MM-dd") === todayStr;
        } catch {
          return false;
        }
      });

      if (completedToday) {
        const dest = getJourneyLocationName(completedToday);
        const locType = (
          completedToday.to_location?.location_type ||
          completedToday.toLocation?.locationType ||
          ""
        ).toUpperCase();

        if (dest && locType !== "HOME" && !dest.toLowerCase().includes("home")) {
          const prefix = dest.toLowerCase().includes("office") ? "In" : "At";
          return { statusText: `${prefix} ${dest}`, isOnline: true };
        }
      }

      // 4. Fallback checkin if present, otherwise Default: Offline
      if (user.checkin?.location) {
        return { statusText: `At ${user.checkin.location}`, isOnline: true };
      }

      return { statusText: "Offline", isOnline: false };
    },
    [userJourneysMap]
  );

  // Today's Date Strings
  const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const todayFormatted = useMemo(() => format(new Date(), "dd MMM yyyy"), []);

  // Today's journeys and active trip for the selected member
  const rawMemberJourneysList = useMemo(() => {
    const list: any[] = [];
    if (Array.isArray(memberJourneysData)) list.push(...memberJourneysData);
    else if (Array.isArray(memberJourneysData?.data)) list.push(...memberJourneysData.data);
    else if (Array.isArray(memberJourneysData?.data?.items)) list.push(...memberJourneysData.data.items);

    if (activeMember && userJourneysMap[activeMember]) {
      for (const j of userJourneysMap[activeMember]) {
        if (!list.some((item: any) => item.id === j.id)) {
          list.push(j);
        }
      }
    }
    return list;
  }, [memberJourneysData, activeMember, userJourneysMap]);

  // Strictly today's journeys
  const memberTodayJourneys = useMemo(() => {
    return rawMemberJourneysList.filter((j: any) => isTripToday(j, todayStr));
  }, [rawMemberJourneysList, todayStr]);

  const todayJourneyStats = useMemo(() => {
    const inProg = memberTodayJourneys.filter((j: any) =>
      ["STARTED", "IN_PROGRESS"].includes((j.status || "").toUpperCase())
    ).length;
    const comp = memberTodayJourneys.filter((j: any) => (j.status || "").toUpperCase() === "COMPLETED").length;
    const canc = memberTodayJourneys.filter((j: any) => (j.status || "").toUpperCase() === "CANCELLED").length;
    const tot = inProg + comp + canc;

    return {
      inProgress: inProg,
      completed: comp,
      cancelled: canc,
      total: tot
    };
  }, [memberTodayJourneys]);

  const memberActiveTrip = useMemo(() => {
    return rawMemberJourneysList.find((j: any) => ["STARTED", "IN_PROGRESS"].includes((j.status || "").toUpperCase()));
  }, [rawMemberJourneysList]);

  const memberLatestCompletedTrip = useMemo(() => {
    return memberTodayJourneys.find((j: any) => (j.status || "").toUpperCase() === "COMPLETED");
  }, [memberTodayJourneys]);

  const activeMemberJourneyStatus = useMemo(() => {
    return getMemberJourneyStatus(selectedUser);
  }, [getMemberJourneyStatus, selectedUser]);

  const taskCompletionRate = useMemo(() => {
    return taskCounts.total > 0 ? Math.round((taskCounts.completed / taskCounts.total) * 100) : 0;
  }, [taskCounts]);

  const journeysCompletionRate = useMemo(() => {
    return todayJourneyStats.total > 0 ? Math.round((todayJourneyStats.completed / todayJourneyStats.total) * 100) : 0;
  }, [todayJourneyStats]);

  // Locations breakdown
  const rawLocations = Array.isArray(locationsData?.data) ? locationsData.data : locationsData?.data?.items || [];
  const totalLocations = rawLocations.length;
  const hospitalLocations = rawLocations.filter((l: any) => (l.locationType || "").toUpperCase() === "HOSPITAL").length;
  const officeLocations = rawLocations.filter(
    (l: any) => (l.locationType || "").toUpperCase() === "OFFICE" || (l.locationType || "").toUpperCase() === "HOME"
  ).length;

  const siteLocations = rawLocations.map((loc: any) => ({
    label: loc.locationName,
    value: String(loc.id)
  }));

  const memberOptions = useMemo(() => {
    return teamMembers.map((m: any) => {
      const first = m.firstName || m.first_name || "";
      const last = m.lastName || m.last_name || "";
      const name = m.name || `${first} ${last}`.trim() || `User #${m.id}`;
      return {
        label: name,
        value: String(m.id)
      };
    });
  }, [teamMembers]);

  const handleOpenAssignModal = () => {
    setAssigneeId(String(activeMember || teamMembers[0]?.id || ""));
    setIsAssignModalVisible(true);
  };

  const handleOpenAddModal = () => {
    setEditingLocation(null);
    setNewLocationName("");
    setNewLocationType("HOSPITAL");
    setNewLocationLatitude("");
    setNewLocationLongitude("");
    setNewLocationRadius("150");
    setNewLocationDistance("");
    setIsAddLocationModalVisible(true);
  };

  const handleOpenEditModal = (loc: any) => {
    setEditingLocation(loc);
    setNewLocationName(loc.locationName || "");
    const rawType = (loc.locationType || "HOSPITAL").toUpperCase();
    setNewLocationType(rawType);
    setNewLocationLatitude(loc.latitude ? String(loc.latitude) : "");
    setNewLocationLongitude(loc.longitude ? String(loc.longitude) : "");
    setNewLocationRadius(String(loc.radiusMeter ?? "150"));
    setNewLocationDistance(loc.distanceKm != null ? String(loc.distanceKm) : "");
    setIsAddLocationModalVisible(true);
  };

  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const pos = await getCurrentGPSPosition();
      setNewLocationLatitude(String(pos.latitude));
      setNewLocationLongitude(String(pos.longitude));
      showToast("Live GPS coordinates captured!", "success");
    } catch (err: any) {
      showToast(err?.message || "Could not fetch GPS coordinates", "error");
    } finally {
      setIsGettingLocation(false);
    }
  };

  // ==========================================
  // Render: Detailed Sub-Screen (Tasks)
  // ==========================================
  if (currentView === "tasks") {
    return (
      <View style={styles.container}>
        <View style={styles.detailTopBar}>
          <TouchableOpacity
            style={styles.detailBackBtn}
            onPress={() => setCurrentView("dashboard")}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" type="feather" size={22} color={theme.palette.primary.main} />
            {/* <Text style={styles.detailBackBtnText}>Dashboard</Text> */}
          </TouchableOpacity>

          <View style={styles.detailTopTitleContainer}>
            <Text style={styles.detailTopTitle} numberOfLines={1}>
              {getMemberName()}'s Tasks
            </Text>
            <Text style={styles.detailTopSubtitle}>Assigned tasks & status breakdown</Text>
          </View>

          <TouchableOpacity style={styles.detailActionBtn} onPress={handleOpenAssignModal} activeOpacity={0.7}>
            <Icon name="plus" type="feather" size={14} color="#FFFFFF" />
            <Text style={styles.detailActionBtnText}>Assign</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.palette.primary.main]}
              tintColor={theme.palette.primary.main}
            />
          }
        >
          <TasksListSection
            key={`${tasksRefreshKey}-${selectedTaskStatus}`}
            userId={activeMember}
            title={`${getMemberName()}'s Tasks`}
            initialStatus={selectedTaskStatus}
            onAssignPress={handleOpenAssignModal}
            canChangeStatus={true}
            onTaskUpdated={() => loadAgentMetrics(activeMember)}
          />
        </ScrollView>

        {/* Assign Modal rendered if opened from inside tasks view */}
        {renderAssignModal()}
      </View>
    );
  }

  // ==========================================
  // Render: Detailed Sub-Screen (Journeys)
  // ==========================================
  if (currentView === "journeys") {
    return (
      <View style={styles.container}>
        <View style={styles.detailTopBar}>
          <TouchableOpacity
            style={styles.detailBackBtn}
            onPress={() => setCurrentView("dashboard")}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" type="feather" size={22} color={theme.palette.primary.main} />
            {/* <Text style={styles.detailBackBtnText}>Dashboard</Text> */}
          </TouchableOpacity>

          <View style={styles.detailTopTitleContainer}>
            <Text style={styles.detailTopTitle} numberOfLines={1}>
              {getMemberName()}'s Journeys
            </Text>
            <Text style={styles.detailTopSubtitle}>Recorded trips & transit logs</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.palette.primary.main]}
              tintColor={theme.palette.primary.main}
            />
          }
        >
          <JourneysListSection
            key={`${journeysRefreshKey}-${selectedJourneyStatus}-${selectedJourneyDateFilter}`}
            userId={activeMember}
            title={`${getMemberName()}'s Journeys`}
            initialStatus={selectedJourneyStatus}
            initialDateFilter={selectedJourneyDateFilter}
          />
        </ScrollView>
      </View>
    );
  }

  // ==========================================
  // Render: Detailed Sub-Screen (Locations)
  // ==========================================
  if (currentView === "locations") {
    return (
      <View style={styles.container}>
        <View style={styles.detailTopBar}>
          <TouchableOpacity
            style={styles.detailBackBtn}
            onPress={() => setCurrentView("dashboard")}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" type="feather" size={22} color={theme.palette.primary.main} />
            {/* <Text style={styles.detailBackBtnText}>Dashboard</Text> */}
          </TouchableOpacity>

          <View style={styles.detailTopTitleContainer}>
            <Text style={styles.detailTopTitle} numberOfLines={1}>
              Locations Directory
            </Text>
            <Text style={styles.detailTopSubtitle}>Registered hospitals & office sites</Text>
          </View>

          <TouchableOpacity style={styles.detailActionBtn} onPress={handleOpenAddModal} activeOpacity={0.7}>
            <Icon name="plus" type="feather" size={14} color="#FFFFFF" />
            <Text style={styles.detailActionBtnText}>Add Site</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.palette.primary.main]}
              tintColor={theme.palette.primary.main}
            />
          }
        >
          <LocationsListSection
            key={locationsRefreshKey}
            onAddPress={handleOpenAddModal}
            onEditPress={handleOpenEditModal}
          />
        </ScrollView>

        {/* Add / Edit Location Modal rendered if opened from inside locations view */}
        {renderAddLocationModal()}
      </View>
    );
  }

  // ==========================================
  // Render: Main Dashboard View
  // ==========================================
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.palette.primary.main]}
            tintColor={theme.palette.primary.main}
          />
        }
      >
        {/* Team Selector Slider */}
        <View style={{ width: "100%", marginVertical: 4 }}>
          <View style={styles.teamSelectorWrapper}>
            <TouchableOpacity onPress={scrollLeft} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="chevron-left" type="feather" size={20} color={theme.palette.text.secondary} />
            </TouchableOpacity>

            {isUsersLoading && teamMembers.length === 0 ? (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 12 }}>
                <ActivityIndicator size="small" color={theme.palette.primary.main} />
              </View>
            ) : teamMembers.length === 0 ? (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 12 }}>
                <Text style={{ color: theme.palette.text.secondary, fontSize: 13 }}>No team members found</Text>
              </View>
            ) : (
              <FlatList
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flex: 1, marginHorizontal: 8 }}
                contentContainerStyle={{ alignItems: "center" }}
                data={teamMembers}
                keyExtractor={(user: any, index: number) => (user.id ? String(user.id) : String(index))}
                renderItem={({ item: user }) => {
                  const isSelected = activeMember === user.id;
                  const fName = user.firstName || user.first_name || "";
                  const lName = user.lastName || user.last_name || "";
                  const displayName = user.name || `${fName} ${lName}`.trim() || `User #${user.id}`;
                  const initials =
                    ((fName.charAt(0) || "") + (lName.charAt(0) || "")).toUpperCase() ||
                    displayName.charAt(0).toUpperCase() ||
                    "U";
                  const memberStatusInfo = getMemberJourneyStatus(user);

                  return (
                    <TouchableOpacity
                      style={[styles.teamMemberCard, isSelected && styles.teamMemberCardActive]}
                      onPress={() => setActiveMember(user.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.memberAvatar, isSelected && styles.memberAvatarActive]}>
                        <Text style={[styles.memberAvatarText, isSelected && styles.memberAvatarTextActive]}>
                          {initials}
                        </Text>
                      </View>
                      <View style={{ flexShrink: 1 }}>
                        <Text style={styles.memberName} numberOfLines={1}>
                          {displayName}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <View
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: memberStatusInfo.isOnline
                                ? isDark
                                  ? "#4ADE80"
                                  : "#16A34A"
                                : isDark
                                ? "#64748B"
                                : "#94A3B8"
                            }}
                          />
                          <Text
                            style={[
                              styles.memberStatus,
                              isSelected && styles.memberStatusActive,
                              memberStatusInfo.isOnline && !isSelected && { color: isDark ? "#4ADE80" : "#16A34A" }
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {memberStatusInfo.statusText}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            <TouchableOpacity onPress={scrollRight} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="chevron-right" type="feather" size={20} color={theme.palette.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Enterprise Executive Context Ribbon */}
        <View style={styles.enterpriseRibbon}>
          <View style={styles.enterpriseRibbonLeft}>
            <View style={styles.enterpriseAvatar}>
              <Text style={styles.enterpriseAvatarText}>
                {(
                  (selectedUser?.firstName?.charAt(0) || selectedUser?.first_name?.charAt(0) || "") +
                  (selectedUser?.lastName?.charAt(0) || selectedUser?.last_name?.charAt(0) || "")
                ).toUpperCase() || "TM"}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.enterpriseMemberName} numberOfLines={1}>
                {getMemberName()}
              </Text>
              <View style={styles.enterpriseMemberRoleRow}>
                <View
                  style={[
                    styles.enterpriseStatusDot,
                    {
                      backgroundColor: activeMemberJourneyStatus.isOnline
                        ? isDark
                          ? "#4ADE80"
                          : "#16A34A"
                        : isDark
                        ? "#64748B"
                        : "#94A3B8"
                    }
                  ]}
                />
                <Text
                  style={[
                    styles.enterpriseStatusText,
                    {
                      color: activeMemberJourneyStatus.isOnline
                        ? isDark
                          ? "#4ADE80"
                          : "#16A34A"
                        : theme.palette.text.secondary
                    }
                  ]}
                  numberOfLines={1}
                >
                  {activeMemberJourneyStatus.statusText}
                </Text>
              </View>
            </View>
          </View>

          {/* <View style={styles.enterpriseRibbonRight}>
            <View style={styles.teamCountBadge}>
              <Icon name="users" type="feather" size={12} color={isDark ? "#93C5FD" : "#2563EB"} />
              <Text style={[styles.teamCountBadgeText, { color: isDark ? "#93C5FD" : "#2563EB" }]}>
                {teamMembers.length} Agents
              </Text>
            </View>
          </View> */}
        </View>

        {/* ========================================== */}
        {/* DASHBOARD KPI CARDS CONTAINER (RESPONSIVE) */}
        {/* ========================================== */}
        <View style={isTablet ? styles.kpiCardsRowTablet : undefined}>
          {/* DASHBOARD CARD 1: TASKS OVERVIEW */}
          <TouchableOpacity style={styles.kpiCard} onPress={() => setCurrentView("tasks")} activeOpacity={0.85}>
            {/* Card Header */}
            <View style={styles.kpiCardHeader}>
              <View style={styles.kpiCardHeaderLeft}>
                <View
                  style={[
                    styles.kpiIconContainer,
                    { backgroundColor: isDark ? "rgba(245, 158, 11, 0.18)" : "rgba(245, 158, 11, 0.12)" }
                  ]}
                >
                  <Icon name="check-square" type="feather" size={20} color="#D97706" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.kpiCardTitle} numberOfLines={1}>
                    Tasks Overview
                  </Text>
                  <Text style={styles.kpiCardSubtitle} numberOfLines={1}>
                    Assigned to {getMemberName()}
                  </Text>
                </View>
              </View>

              <View style={styles.kpiCardHeaderRight}>
                <TouchableOpacity style={styles.kpiQuickActionBtn} onPress={handleOpenAssignModal} activeOpacity={0.7}>
                  <Icon name="plus" type="feather" size={15} color="#FFFFFF" />
                  <Text style={styles.kpiQuickActionText}>Assign</Text>
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
              <View style={styles.kpiStatsGrid}>
                {/* Pending / To-Do */}
                <TouchableOpacity
                  style={[
                    styles.kpiStatBox,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#FFFBEB",
                      borderColor: isDark ? "#78350F" : "#FDE68A"
                    }
                  ]}
                  onPress={() => {
                    setSelectedTaskStatus("TO_DO");
                    setCurrentView("tasks");
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.kpiStatNumber, { color: isDark ? "#FCD34D" : "#D97706" }]}>
                    {taskCounts.todo}
                  </Text>
                  <View style={styles.kpiStatLabelRow}>
                    <View style={[styles.kpiStatDot, { backgroundColor: "#D97706" }]} />
                    <Text
                      style={[styles.kpiStatLabel, { color: isDark ? "#CBD5E1" : "#92400E" }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      To Do
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* In Progress */}
                <TouchableOpacity
                  style={[
                    styles.kpiStatBox,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#EFF6FF",
                      borderColor: isDark ? "#1E40AF" : "#BFDBFE"
                    }
                  ]}
                  onPress={() => {
                    setSelectedTaskStatus("IN_PROGRESS");
                    setCurrentView("tasks");
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.kpiStatNumber, { color: isDark ? "#60A5FA" : "#2563EB" }]}>
                    {taskCounts.inProgress}
                  </Text>
                  <View style={styles.kpiStatLabelRow}>
                    <View style={[styles.kpiStatDot, { backgroundColor: "#2563EB" }]} />
                    <Text
                      style={[styles.kpiStatLabel, { color: isDark ? "#CBD5E1" : "#1E40AF" }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      In Progress
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Completed / Done */}
                <TouchableOpacity
                  style={[
                    styles.kpiStatBox,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F0FDF4",
                      borderColor: isDark ? "#065F46" : "#BBF7D0"
                    }
                  ]}
                  onPress={() => {
                    setSelectedTaskStatus("CLOSED");
                    setCurrentView("tasks");
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.kpiStatNumber, { color: isDark ? "#4ADE80" : "#16A34A" }]}>
                    {taskCounts.completed}
                  </Text>
                  <View style={styles.kpiStatLabelRow}>
                    <View style={[styles.kpiStatDot, { backgroundColor: "#16A34A" }]} />
                    <Text
                      style={[styles.kpiStatLabel, { color: isDark ? "#CBD5E1" : "#166534" }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      Done
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>

          {/* DASHBOARD CARD 2: JOURNEYS OVERVIEW */}
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => {
              setSelectedJourneyDateFilter("TODAY");
              setSelectedJourneyStatus("ALL");
              setCurrentView("journeys");
            }}
            activeOpacity={0.85}
          >
            {/* Card Header */}
            <View style={styles.kpiCardHeader}>
              <View style={styles.kpiCardHeaderLeft}>
                <View
                  style={[
                    styles.kpiIconContainer,
                    { backgroundColor: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.12)" }
                  ]}
                >
                  <Icon name="navigation" type="feather" size={20} color={theme.palette.primary.main} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={styles.kpiCardTitle} numberOfLines={1}>
                      Today's Journeys
                    </Text>
                    <View style={styles.kpiDateBadge}>
                      <Icon name="calendar" type="feather" size={10} color={isDark ? "#93C5FD" : "#2563EB"} />
                      <Text style={styles.kpiDateBadgeText}>{todayFormatted}</Text>
                    </View>
                  </View>
                  <Text style={styles.kpiCardSubtitle} numberOfLines={1}>
                    {getMemberName()}'s daily transit & hospital visits
                  </Text>
                </View>
              </View>

              <View style={styles.kpiCardHeaderRight}>
                <View
                  style={[
                    styles.kpiTotalBadge,
                    {
                      backgroundColor: isDark ? "rgba(59, 130, 246, 0.25)" : "#DBEAFE"
                    }
                  ]}
                >
                  <Text style={[styles.kpiTotalBadgeText, { color: isDark ? "#93C5FD" : "#1D4ED8" }]}>
                    {todayJourneyStats.total} Today
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
                    backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF"
                  }
                ]}
              >
                <Text style={[styles.progressVelocityBadgeText, { color: isDark ? "#93C5FD" : "#2563EB" }]}>
                  {todayJourneyStats.total > 0 ? `${journeysCompletionRate}% Visits Done` : "0% Visits Done"}
                </Text>
              </View>
            </View>
            <View style={styles.kpiProgressTrack}>
              <View style={[styles.kpiProgressFillDone, { flex: Math.max(todayJourneyStats.completed, 0.0001) }]} />
              <View
                style={[styles.kpiProgressFillInProgress, { flex: Math.max(todayJourneyStats.inProgress, 0.0001) }]}
              />
              <View
                style={[
                  { backgroundColor: isDark ? "#7F1D1D" : "#FCA5A5", height: "100%" },
                  { flex: Math.max(todayJourneyStats.cancelled, 0.0001) }
                ]}
              />
            </View>

            {/* Counts Grid (3 equal boxes matching Tasks Grid: In Progress, Completed, Cancelled) */}
            {isJourneysLoading || isMemberJourneysLoading ? (
              <View style={{ paddingVertical: 18, alignItems: "center" }}>
                <ActivityIndicator size="small" color={theme.palette.primary.main} />
              </View>
            ) : (
              <View style={styles.kpiStatsGrid}>
                {/* In Progress */}
                <TouchableOpacity
                  style={[
                    styles.kpiStatBox,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#EFF6FF",
                      borderColor: isDark ? "#1E40AF" : "#BFDBFE"
                    }
                  ]}
                  onPress={() => {
                    setSelectedJourneyStatus("IN_PROGRESS");
                    setSelectedJourneyDateFilter("TODAY");
                    setCurrentView("journeys");
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.kpiStatNumber, { color: isDark ? "#60A5FA" : "#2563EB" }]}>
                    {todayJourneyStats.inProgress}
                  </Text>
                  <View style={styles.kpiStatLabelRow}>
                    <View style={[styles.kpiStatDot, { backgroundColor: "#2563EB" }]} />
                    <Text
                      style={[styles.kpiStatLabel, { color: isDark ? "#CBD5E1" : "#1E40AF" }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      In Progress
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Completed */}
                <TouchableOpacity
                  style={[
                    styles.kpiStatBox,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F0FDF4",
                      borderColor: isDark ? "#065F46" : "#BBF7D0"
                    }
                  ]}
                  onPress={() => {
                    setSelectedJourneyStatus("COMPLETED");
                    setSelectedJourneyDateFilter("TODAY");
                    setCurrentView("journeys");
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.kpiStatNumber, { color: isDark ? "#4ADE80" : "#16A34A" }]}>
                    {todayJourneyStats.completed}
                  </Text>
                  <View style={styles.kpiStatLabelRow}>
                    <View style={[styles.kpiStatDot, { backgroundColor: "#16A34A" }]} />
                    <Text
                      style={[styles.kpiStatLabel, { color: isDark ? "#CBD5E1" : "#166534" }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      Completed
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Cancelled */}
                <TouchableOpacity
                  style={[
                    styles.kpiStatBox,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#FEF2F2",
                      borderColor: isDark ? "#7F1D1D" : "#FECACA"
                    }
                  ]}
                  onPress={() => {
                    setSelectedJourneyStatus("CANCELLED");
                    setSelectedJourneyDateFilter("TODAY");
                    setCurrentView("journeys");
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.kpiStatNumber, { color: isDark ? "#F87171" : "#DC2626" }]}>
                    {todayJourneyStats.cancelled}
                  </Text>
                  <View style={styles.kpiStatLabelRow}>
                    <View style={[styles.kpiStatDot, { backgroundColor: "#DC2626" }]} />
                    <Text style={[styles.kpiStatLabel, { color: isDark ? "#CBD5E1" : "#991B1B" }]}>Cancelled</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Live Trip Spotlight Card if in transit, or latest completed trip today */}
            {memberActiveTrip ? (
              <View
                style={[
                  styles.kpiSpotlightCard,
                  {
                    backgroundColor: isDark ? "rgba(37, 99, 235, 0.15)" : "#EFF6FF",
                    borderColor: isDark ? "#1E40AF" : "#BFDBFE"
                  }
                ]}
              >
                <View style={styles.kpiSpotlightLeft}>
                  <View style={[styles.kpiSpotlightDot, { backgroundColor: "#2563EB" }]} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.kpiSpotlightTag, { color: isDark ? "#93C5FD" : "#1D4ED8" }]}>
                      LIVE TRIP IN PROGRESS
                    </Text>
                    <Text
                      style={[styles.kpiSpotlightTitle, { color: isDark ? "#F8FAFC" : "#0F172A" }]}
                      numberOfLines={1}
                    >
                      {memberActiveTrip.from_location?.location_name ||
                        memberActiveTrip.fromLocation?.locationName ||
                        "Departure"}{" "}
                      ➔{" "}
                      {memberActiveTrip.to_location?.location_name ||
                        memberActiveTrip.toLocation?.locationName ||
                        "Destination"}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" type="feather" size={16} color={theme.palette.text.secondary} />
              </View>
            ) : memberLatestCompletedTrip ? (
              <View
                style={[
                  styles.kpiSpotlightCard,
                  {
                    backgroundColor: isDark ? "rgba(22, 163, 74, 0.12)" : "#F0FDF4",
                    borderColor: isDark ? "#14532D" : "#BBF7D0"
                  }
                ]}
              >
                <View style={styles.kpiSpotlightLeft}>
                  <View style={[styles.kpiSpotlightDot, { backgroundColor: "#16A34A" }]} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.kpiSpotlightTag, { color: isDark ? "#86EFAC" : "#15803D" }]}>
                      LATEST VISIT COMPLETED TODAY
                    </Text>
                    <Text
                      style={[styles.kpiSpotlightTitle, { color: isDark ? "#F8FAFC" : "#0F172A" }]}
                      numberOfLines={1}
                    >
                      Arrived at{" "}
                      {memberLatestCompletedTrip.to_location?.location_name ||
                        memberLatestCompletedTrip.toLocation?.locationName ||
                        "Hospital"}
                    </Text>
                  </View>
                </View>
                <Icon name="check" type="feather" size={16} color="#16A34A" />
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        {/* ========================================== */}
        {/* DASHBOARD CARD 3: LOCATIONS DIRECTORY      */}
        {/* ========================================== */}
        {/* <TouchableOpacity style={styles.kpiCard} onPress={() => setCurrentView("locations")} activeOpacity={0.85}>
         
          <View style={styles.kpiCardHeader}>
            <View style={styles.kpiCardHeaderLeft}>
              <View
                style={[
                  styles.kpiIconContainer,
                  { backgroundColor: isDark ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.12)" }
                ]}
              >
                <Icon name="map-pin" type="feather" size={20} color={theme.palette.error.main} />
              </View>
              <View>
                <Text style={styles.kpiCardTitle}>Locations Directory</Text>
                <Text style={styles.kpiCardSubtitle}>Hospitals, offices & registered sites</Text>
              </View>
            </View>

            <View style={styles.kpiCardHeaderRight}>
              <View style={[styles.kpiTotalBadge, { backgroundColor: isDark ? "rgba(239, 68, 68, 0.25)" : "#FEE2E2" }]}>
                <Text style={[styles.kpiTotalBadgeText, { color: isDark ? "#FCA5A5" : "#B91C1C" }]}>
                  {totalLocations} Sites
                </Text>
              </View>
              <Icon name="chevron-right" type="feather" size={18} color={theme.palette.text.secondary} />
            </View>
          </View>

        
          <View style={styles.kpiStatsGrid}>
           
            <View
              style={[
                styles.kpiStatBox,
                {
                  backgroundColor: isDark ? "#1E293B" : "#EEF2FF",
                  borderColor: isDark ? "#3730A3" : "#C7D2FE"
                }
              ]}
            >
              <Text style={[styles.kpiStatNumber, { color: isDark ? "#818CF8" : "#4338CA" }]}>{totalLocations}</Text>
              <View style={styles.kpiStatLabelRow}>
                <View style={[styles.kpiStatDot, { backgroundColor: "#4338CA" }]} />
                <Text style={[styles.kpiStatLabel, { color: isDark ? "#CBD5E1" : "#3730A3" }]}>Total Sites</Text>
              </View>
            </View>

           
            <View
              style={[
                styles.kpiStatBox,
                {
                  backgroundColor: isDark ? "#1E293B" : "#FFF1F2",
                  borderColor: isDark ? "#9F1239" : "#FECDD3"
                }
              ]}
            >
              <Text style={[styles.kpiStatNumber, { color: isDark ? "#FB7185" : "#E11D48" }]}>{hospitalLocations}</Text>
              <View style={styles.kpiStatLabelRow}>
                <View style={[styles.kpiStatDot, { backgroundColor: "#E11D48" }]} />
                <Text style={[styles.kpiStatLabel, { color: isDark ? "#CBD5E1" : "#9F1239" }]}>Hospitals</Text>
              </View>
            </View>

           
            <View
              style={[
                styles.kpiStatBox,
                {
                  backgroundColor: isDark ? "#1E293B" : "#F0FDFA",
                  borderColor: isDark ? "#115E59" : "#CCFBF1"
                }
              ]}
            >
              <Text style={[styles.kpiStatNumber, { color: isDark ? "#2DD4BF" : "#0D9488" }]}>{officeLocations}</Text>
              <View style={styles.kpiStatLabelRow}>
                <View style={[styles.kpiStatDot, { backgroundColor: "#0D9488" }]} />
                <Text style={[styles.kpiStatLabel, { color: isDark ? "#CBD5E1" : "#115E59" }]}>Offices / Home</Text>
              </View>
            </View>
          </View>

         
          <View style={styles.kpiCardFooter}>
            <TouchableOpacity style={styles.kpiQuickActionBtn} onPress={handleOpenAddModal} activeOpacity={0.7}>
              <Icon name="plus" type="feather" size={13} color="#FFFFFF" />
              <Text style={styles.kpiQuickActionText}>Add Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.kpiViewDetailsBtn}
              onPress={() => setCurrentView("locations")}
              activeOpacity={0.7}
            >
              <Text style={styles.kpiViewDetailsText}>View Locations Table</Text>
              <Icon name="arrow-right" type="feather" size={14} color={theme.palette.primary.main} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity> */}
      </ScrollView>

      {/* Assign Task Modal */}
      {renderAssignModal()}

      {/* Add / Edit Location Modal */}
      {renderAddLocationModal()}
    </View>
  );

  // ==========================================
  // Helper: Assign Task Modal
  // ==========================================
  function renderAssignModal() {
    return (
      <Modal visible={isAssignModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Assign task</Text>
            <Text style={styles.modalSubtitle}>Assign a task with a location from the directory</Text>

            <Text style={styles.inputLabel}>Assign to Employee *</Text>
            <DropdownComponent
              data={memberOptions}
              value={assigneeId}
              onChange={(item) => setAssigneeId(item.value)}
              placeholder="Select employee"
            />

            <Text style={styles.inputLabel}>Ticket title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Endoscopy walkthrough"
              placeholderTextColor={theme.palette.text.secondary}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />

            <Text style={styles.inputLabel}>Location / Site *</Text>
            <DropdownComponent
              data={siteLocations || []}
              value={newTaskLocationId}
              onChange={(item) => setNewTaskLocationId(item.value)}
              placeholder="Select a location"
            />

            <Text style={styles.inputLabel}>Priority</Text>
            <DropdownComponent
              data={[
                { label: "Normal", value: "NORMAL" },
                { label: "High", value: "HIGH" },
                { label: "Low", value: "LOW" }
              ]}
              value={priority}
              onChange={(item) => setPriority(item.value)}
            />

            <Text style={styles.inputLabel}>Note / Description</Text>
            <TextInput
              style={[styles.textInput, { height: 60, textAlignVertical: "top" }]}
              placeholder="Additional details or instructions..."
              placeholderTextColor={theme.palette.text.secondary}
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setIsAssignModalVisible(false);
                  setNewTaskDescription("");
                }}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAssignBtn}
                onPress={() => {
                  if (!newTaskTitle.trim()) {
                    showToast("Please enter a ticket title", "warning");
                    return;
                  }
                  if (!newTaskLocationId) {
                    showToast("Please select a location from the dropdown", "warning");
                    return;
                  }
                  const targetEmployeeId = Number(assigneeId || activeMember);
                  if (!targetEmployeeId) {
                    showToast("Please select an employee", "warning");
                    return;
                  }

                  postAssignTask({
                    title: newTaskTitle.trim(),
                    description: newTaskDescription.trim() || undefined,
                    assignedTo: targetEmployeeId,
                    locationId: Number(newTaskLocationId),
                    location_id: Number(newTaskLocationId),
                    priority: priority
                  })
                    .then(() => {
                      showToast("Task assigned successfully!", "success");
                      loadAgentMetrics(targetEmployeeId);
                      setTasksRefreshKey((prev) => prev + 1);
                      setNewTaskTitle("");
                      setNewTaskDescription("");
                      setNewTaskLocationId("");
                      setPriority("NORMAL");
                      setIsAssignModalVisible(false);
                    })
                    .catch((err: any) => {
                      console.log("assign task error", err);
                      showToast(err?.message || "Failed to assign task", "error");
                    });
                }}
              >
                <Text style={styles.modalAssignBtnText}>Assign & notify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // ==========================================
  // Helper: Add / Edit Location Modal
  // ==========================================
  function renderAddLocationModal() {
    return (
      <Modal visible={isAddLocationModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{editingLocation ? "Edit location" : "Add location"}</Text>
            <Text style={styles.modalSubtitle}>
              {editingLocation ? "Update location details" : "Added once — instantly available to all employees"}
            </Text>

            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Yashoda Somajiguda"
              placeholderTextColor={theme.palette.text.secondary}
              value={newLocationName}
              onChangeText={setNewLocationName}
            />

            <Text style={styles.inputLabel}>Type</Text>
            <DropdownComponent
              data={[
                { label: "Hospital", value: "HOSPITAL" },
                { label: "Home", value: "HOME" },
                { label: "Office", value: "OFFICE" }
              ]}
              value={newLocationType}
              onChange={(item) => setNewLocationType(item.value)}
            />

            {/* Latitude and Longitude with auto GPS */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <Text style={styles.inputLabel}>Coordinates (Latitude & Longitude) *</Text>
              <TouchableOpacity
                onPress={handleUseCurrentLocation}
                disabled={isGettingLocation}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  backgroundColor: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(37, 99, 235, 0.1)"
                }}
              >
                {isGettingLocation ? (
                  <ActivityIndicator size="small" color={theme.palette.primary.main} />
                ) : (
                  <>
                    <Icon name="crosshair" type="feather" size={11} color={theme.palette.primary.main} />
                    <Text style={{ fontSize: 11, fontWeight: "700", color: theme.palette.primary.main }}>
                      Use Current GPS
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Latitude (e.g. 17.4435)"
                  placeholderTextColor={theme.palette.text.secondary}
                  value={newLocationLatitude}
                  onChangeText={setNewLocationLatitude}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Longitude (e.g. 78.3845)"
                  placeholderTextColor={theme.palette.text.secondary}
                  value={newLocationLongitude}
                  onChangeText={setNewLocationLongitude}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Geofence radius (m)</Text>
            <TextInput
              style={styles.textInput}
              value={newLocationRadius}
              onChangeText={setNewLocationRadius}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Km to office (optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 12"
              placeholderTextColor={theme.palette.text.secondary}
              value={newLocationDistance}
              onChangeText={setNewLocationDistance}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setEditingLocation(null);
                  setIsAddLocationModalVisible(false);
                }}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAssignBtn}
                onPress={() => {
                  if (!newLocationName.trim()) {
                    showToast("Please enter location name", "warning");
                    return;
                  }
                  if (!newLocationLatitude.trim() || !newLocationLongitude.trim()) {
                    showToast("Please enter latitude and longitude", "warning");
                    return;
                  }
                  const latNum = parseFloat(newLocationLatitude.trim());
                  const lngNum = parseFloat(newLocationLongitude.trim());
                  if (isNaN(latNum) || latNum < -90 || latNum > 90) {
                    showToast("Latitude must be between -90 and 90", "warning");
                    return;
                  }
                  if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
                    showToast("Longitude must be between -180 and 180", "warning");
                    return;
                  }

                  postLocation({
                    ...(editingLocation?.id ? { id: editingLocation.id } : {}),
                    locationName: newLocationName.trim(),
                    radiusMeter: Number(newLocationRadius) || 150,
                    locationType: newLocationType,
                    latitude: newLocationLatitude.trim(),
                    longitude: newLocationLongitude.trim(),
                    distanceKm: newLocationDistance ? Number(newLocationDistance) : undefined,
                    isActive: true
                  })
                    .then(() => {
                      getLocations({ size: 100 });
                      setLocationsRefreshKey((k) => k + 1);
                      showToast(
                        editingLocation ? "Location updated successfully!" : "Location saved successfully!",
                        "success"
                      );
                    })
                    .catch((err: any) => {
                      showToast(err?.message || "Failed to save location", "error");
                    });

                  setNewLocationName("");
                  setNewLocationType("HOSPITAL");
                  setNewLocationLatitude("");
                  setNewLocationLongitude("");
                  setNewLocationRadius("150");
                  setNewLocationDistance("");
                  setEditingLocation(null);
                  setIsAddLocationModalVisible(false);
                }}
              >
                <Text style={styles.modalAssignBtnText}>{editingLocation ? "Update location" : "Save location"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}
