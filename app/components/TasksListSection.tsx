import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { format } from "date-fns";

import { useTheme } from "@/lib/appTheme";
import { Icon } from "@/lib/layout";
import { formatDate, formatTime } from "@/utils/Time";
import { showToast } from "@/utils/ShowToast";
import { useChangeTaskStatus, useGetTasks } from "@/screens/home/customer-success/Function";
import { CustomDateRangePickerModal } from "./CustomDateRangePickerModal";

export interface TasksListSectionProps {
  userId?: number | null;
  title?: string;
  onAssignPress?: () => void;
  canChangeStatus?: boolean;
  onTaskUpdated?: () => void;
  initialStatus?: string;
}

export function TasksListSection({
  userId,
  title = "Assigned Tasks",
  onAssignPress,
  canChangeStatus = true,
  onTaskUpdated,
  initialStatus = "TO_DO"
}: TasksListSectionProps) {
  const { theme } = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigation = useNavigation<any>();

  const [getTasks, { data: tasksData, isLoading }] = useGetTasks();
  const [changeTaskStatusMutation, { isLoading: isUpdatingStatus }] = useChangeTaskStatus();

  // Status Change with Mandatory Remarks Modal State
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [selectedTaskForStatus, setSelectedTaskForStatus] = useState<any | null>(null);
  const [targetStatus, setTargetStatus] = useState<"TO_DO" | "IN_PROGRESS" | "CLOSED">("IN_PROGRESS");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  // Add Comment / Remark Modal State
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [selectedTaskForComment, setSelectedTaskForComment] = useState<any | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<"TODAY" | "ALL" | "CUSTOM">("ALL");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>(initialStatus || "TO_DO");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  useEffect(() => {
    if (initialStatus) {
      setStatusFilter(initialStatus);
      setPage(1);
    }
  }, [initialStatus]);

  const loadTasks = useCallback(
    (
      p = page,
      dFilter = dateFilter,
      sFilter = statusFilter,
      pFilter = priorityFilter,
      sDate = customStartDate,
      eDate = customEndDate,
      size = pageSize,
      sQuery = searchQuery
    ) => {
      const params: any = {
        page: p,
        size
      };
      if (userId) {
        params.user_id = userId;
      }
      if (sFilter !== "ALL") {
        params.status = sFilter;
      }
      if (pFilter !== "ALL") {
        params.priority = pFilter;
      }
      if (sQuery.trim()) {
        params.search = sQuery.trim();
      }
      if (dFilter === "TODAY") {
        params.date = format(new Date(), "yyyy-MM-dd");
      } else if (dFilter === "CUSTOM") {
        if (sDate && eDate && sDate === eDate) {
          params.date = sDate;
        } else {
          if (sDate) params.start_date = sDate;
          if (eDate) params.end_date = eDate;
        }
      }
      getTasks(params);
    },
    [userId, page, dateFilter, statusFilter, priorityFilter, customStartDate, customEndDate, pageSize, searchQuery]
  );

  useFocusEffect(
    useCallback(() => {
      loadTasks(page, dateFilter, statusFilter, priorityFilter, customStartDate, customEndDate, pageSize, searchQuery);
    }, [
      page,
      dateFilter,
      statusFilter,
      priorityFilter,
      customStartDate,
      customEndDate,
      pageSize,
      searchQuery,
      loadTasks
    ])
  );

  useEffect(() => {
    loadTasks(page, dateFilter, statusFilter, priorityFilter, customStartDate, customEndDate, pageSize, searchQuery);
  }, [userId]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setPage(1);
    loadTasks(1, dateFilter, statusFilter, priorityFilter, customStartDate, customEndDate, pageSize, text);
  };

  const handleDateFilter = (val: "TODAY" | "ALL" | "CUSTOM") => {
    if (val === "CUSTOM") {
      setIsDatePickerVisible(true);
      return;
    }
    setDateFilter(val);
    setPage(1);
    loadTasks(1, val, statusFilter, priorityFilter, "", "", pageSize, searchQuery);
  };

  const handleApplyCustomDate = (s: string, e: string) => {
    setDateFilter("CUSTOM");
    setCustomStartDate(s);
    setCustomEndDate(e);
    setPage(1);
    loadTasks(1, "CUSTOM", statusFilter, priorityFilter, s, e, pageSize, searchQuery);
  };

  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
    setPage(1);
    loadTasks(1, dateFilter, val, priorityFilter, customStartDate, customEndDate, pageSize, searchQuery);
  };

  const handlePriorityFilter = (val: string) => {
    setPriorityFilter(val);
    setPage(1);
    loadTasks(1, dateFilter, statusFilter, val, customStartDate, customEndDate, pageSize, searchQuery);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadTasks(newPage, dateFilter, statusFilter, priorityFilter, customStartDate, customEndDate, pageSize, searchQuery);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
    loadTasks(1, dateFilter, statusFilter, priorityFilter, customStartDate, customEndDate, newSize, searchQuery);
  };

  // Status Modal Handlers
  const handleOpenStatusModal = (task: any) => {
    if (!canChangeStatus) return;
    setSelectedTaskForStatus(task);
    const next = task.status === "TO_DO" ? "IN_PROGRESS" : task.status === "IN_PROGRESS" ? "CLOSED" : "TO_DO";
    setTargetStatus(next);
    setStatusRemarks("");
    setIsStatusModalVisible(true);
  };

  const handleSubmitStatusChange = async () => {
    if (!selectedTaskForStatus) return;
    if (!statusRemarks.trim()) {
      showToast("Remarks / reason is mandatory when changing task status", "warning");
      return;
    }

    setIsSubmittingStatus(true);
    try {
      const res: any = await changeTaskStatusMutation({
        task_id: selectedTaskForStatus.id,
        task_status: targetStatus,
        status: targetStatus,
        comment: statusRemarks.trim(),
        remarks: statusRemarks.trim()
      });
      if (res?.status === 200 || res?.data) {
        showToast(`Task status updated to ${targetStatus.replace("_", " ")}`, "success");
        setIsStatusModalVisible(false);
        setSelectedTaskForStatus(null);
        setStatusRemarks("");
        loadTasks(
          page,
          dateFilter,
          statusFilter,
          priorityFilter,
          customStartDate,
          customEndDate,
          pageSize,
          searchQuery
        );
        onTaskUpdated?.();
      } else {
        showToast(res?.message || "Failed to update task status", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Error updating task status", "error");
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  // Comment Modal Handlers
  const handleOpenCommentModal = (task: any) => {
    setSelectedTaskForComment(task);
    setCommentText("");
    setIsCommentModalVisible(true);
  };

  const handleSubmitComment = async () => {
    if (!selectedTaskForComment) return;
    if (!commentText.trim()) {
      showToast("Please enter a remark or comment", "warning");
      return;
    }

    setIsSubmittingComment(true);
    try {
      const res: any = await changeTaskStatusMutation({
        task_id: selectedTaskForComment.id,
        task_status: selectedTaskForComment.status || "TO_DO",
        status: selectedTaskForComment.status || "TO_DO",
        comment: commentText.trim(),
        remarks: commentText.trim()
      });
      if (res?.status === 200 || res?.data) {
        showToast("Remark added successfully!", "success");
        setIsCommentModalVisible(false);
        setSelectedTaskForComment(null);
        setCommentText("");
        loadTasks(
          page,
          dateFilter,
          statusFilter,
          priorityFilter,
          customStartDate,
          customEndDate,
          pageSize,
          searchQuery
        );
        onTaskUpdated?.();
      } else {
        showToast(res?.message || "Failed to add remark", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Error adding remark", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const taskItems = Array.isArray(tasksData?.data) ? tasksData.data : tasksData?.data?.items || [];
  const totalCount = tasksData?.data?.total ?? taskItems.length;
  const totalPages = tasksData?.data?.totalPages ?? 1;

  const getPriorityStyle = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
        return { bg: "rgba(239, 68, 68, 0.12)", color: "#DC2626" };
      case "NORMAL":
        return { bg: "rgba(59, 130, 246, 0.12)", color: "#2563EB" };
      case "LOW":
        return { bg: "rgba(100, 116, 139, 0.12)", color: "#64748B" };
      default:
        return { bg: "rgba(100, 116, 139, 0.12)", color: "#64748B" };
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CLOSED":
        return { bg: "rgba(34, 197, 94, 0.12)", color: "#16A34A", label: "Closed" };
      case "IN_PROGRESS":
        return { bg: "rgba(234, 179, 8, 0.12)", color: "#D97706", label: "In Progress" };
      case "TO_DO":
      default:
        return { bg: "rgba(100, 116, 139, 0.12)", color: "#64748B", label: "To Do" };
    }
  };

  return (
    <View
      style={[
        styles.listSectionCard,
        {
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider
        }
      ]}
    >
      {/* Section Header */}
      {/* <View style={styles.sectionHeaderRow}> */}
      {/* <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionHeaderIcon, { backgroundColor: isDark ? "#1E293B" : "rgba(217, 119, 6, 0.12)" }]}>
            <Icon name="check-square" type="feather" size={16} color="#D97706" />
          </View>
          <Text style={[styles.sectionHeading, { color: theme.palette.text.primary }]}>{title}</Text>
        </View> */}

      {/* <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {onAssignPress && (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.palette.primary.main }]}
              onPress={onAssignPress}
            >
              <Text style={styles.addButtonText}>+ Assign</Text>
            </TouchableOpacity>
          )}

          <View style={[styles.countBadge, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}>
            <Text style={[styles.countBadgeText, { color: theme.palette.text.secondary }]}>
              {totalCount} {totalCount === 1 ? "Task" : "Tasks"}
            </Text>
          </View>
        </View> */}
      {/* </View> */}

      {/* Filters Section */}
      <View style={styles.filterSection}>
        {/* Status Chips Row at top: To Do, In Progress, Done, All */}
        <View style={styles.primaryStatusChipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.primaryStatusChipsRow}
          >
            {[
              {
                label: "To Do",
                value: "TO_DO",
                icon: "clock",
                activeColor: "#D97706",
                activeBg: isDark ? "rgba(217, 119, 6, 0.22)" : "rgba(245, 158, 11, 0.15)",
                activeBorder: "#F59E0B"
              },
              {
                label: "In Progress",
                value: "IN_PROGRESS",
                icon: "activity",
                activeColor: "#2563EB",
                activeBg: isDark ? "rgba(37, 99, 235, 0.22)" : "rgba(59, 130, 246, 0.15)",
                activeBorder: "#3B82F6"
              },
              {
                label: "Done",
                value: "CLOSED",
                icon: "check-circle",
                activeColor: "#16A34A",
                activeBg: isDark ? "rgba(22, 163, 74, 0.22)" : "rgba(34, 197, 94, 0.15)",
                activeBorder: "#22C55E"
              },
              {
                label: "All",
                value: "ALL",
                icon: "grid",
                activeColor: theme.palette.primary.main,
                activeBg: isDark ? "rgba(99, 102, 241, 0.22)" : "rgba(99, 102, 241, 0.15)",
                activeBorder: theme.palette.primary.main
              }
            ].map((chip) => {
              const isActive = statusFilter === chip.value;
              return (
                <TouchableOpacity
                  key={chip.value}
                  style={[
                    styles.primaryStatusChip,
                    {
                      backgroundColor: isActive ? chip.activeBg : isDark ? "#1E293B" : "#F1F5F9",
                      borderColor: isActive ? chip.activeBorder : isDark ? "#334155" : "#E2E8F0"
                    }
                  ]}
                  onPress={() => handleStatusFilter(chip.value)}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={chip.icon}
                    type="feather"
                    size={13}
                    color={isActive ? chip.activeColor : theme.palette.text.secondary}
                  />
                  <Text
                    style={[
                      styles.primaryStatusChipText,
                      {
                        color: isActive ? chip.activeColor : theme.palette.text.secondary,
                        fontWeight: isActive ? "700" : "600"
                      }
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
              borderColor: theme.palette.divider
            }
          ]}
        >
          <Icon name="search" type="feather" size={14} color={theme.palette.text.secondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.palette.text.primary }]}
            placeholder="Search task title, description, or site..."
            placeholderTextColor={theme.palette.text.secondary}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange("")}>
              <Icon name="x" type="feather" size={14} color={theme.palette.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Date Filter Row */}
        <View style={styles.filterRow}>
          <Text style={[styles.filterGroupLabel, { color: theme.palette.text.secondary }]}>Date:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {[
              { label: "All Dates", value: "ALL" },
              { label: "Today", value: "TODAY" },
              {
                label:
                  dateFilter === "CUSTOM" && customStartDate
                    ? customStartDate === customEndDate
                      ? `📅 ${customStartDate}`
                      : `📅 ${customStartDate} → ${customEndDate}`
                    : "Custom Range...",
                value: "CUSTOM"
              }
            ].map((chip) => {
              const isActive = dateFilter === chip.value;
              return (
                <TouchableOpacity
                  key={chip.value}
                  style={[
                    styles.filterChip,
                    isActive && {
                      backgroundColor: isDark ? "#1E293B" : "#E2E8F0",
                      borderColor: theme.palette.primary.main
                    }
                  ]}
                  onPress={() => handleDateFilter(chip.value as any)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: isActive ? theme.palette.primary.main : theme.palette.text.secondary }
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Status Filter Row */}
        {/* <View style={styles.filterRow}>
          <Text style={[styles.filterGroupLabel, { color: theme.palette.text.secondary }]}>Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {[
              { label: "All Status", value: "ALL" },
              { label: "To Do", value: "TO_DO" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "Closed", value: "CLOSED" }
            ].map((chip) => {
              const isActive = statusFilter === chip.value;
              return (
                <TouchableOpacity
                  key={chip.value}
                  style={[
                    styles.filterChip,
                    isActive && {
                      backgroundColor: isDark ? "#1E293B" : "#E2E8F0",
                      borderColor: theme.palette.primary.main
                    }
                  ]}
                  onPress={() => handleStatusFilter(chip.value)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: isActive ? theme.palette.primary.main : theme.palette.text.secondary }
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View> */}

        {/* Priority Filter Row */}
        {/* <View style={styles.filterRow}>
          <Text style={[styles.filterGroupLabel, { color: theme.palette.text.secondary }]}>Priority:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {[
              { label: "All Priority", value: "ALL" },
              { label: "High", value: "HIGH" },
              { label: "Normal", value: "NORMAL" },
              { label: "Low", value: "LOW" }
            ].map((chip) => {
              const isActive = priorityFilter === chip.value;
              return (
                <TouchableOpacity
                  key={chip.value}
                  style={[
                    styles.filterChip,
                    isActive && {
                      backgroundColor: isDark ? "#1E293B" : "#E2E8F0",
                      borderColor: theme.palette.primary.main
                    }
                  ]}
                  onPress={() => handlePriorityFilter(chip.value)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: isActive ? theme.palette.primary.main : theme.palette.text.secondary }
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View> */}
      </View>

      {/* Task List Items */}
      {isLoading ? (
        <View style={styles.listLoadingBox}>
          <ActivityIndicator color={theme.palette.primary.main} size="small" />
          <Text style={[styles.listLoadingText, { color: theme.palette.text.secondary }]}>Loading tasks...</Text>
        </View>
      ) : taskItems.length === 0 ? (
        <View style={styles.emptyListBox}>
          <Icon name="check-square" type="feather" size={28} color={theme.palette.text.secondary} />
          <Text style={[styles.emptyListTitle, { color: theme.palette.text.primary }]}>No Tasks Found</Text>
          <Text style={[styles.emptyListDesc, { color: theme.palette.text.secondary }]}>
            {searchQuery ? `No tasks match "${searchQuery}".` : "No assigned tasks for the selected filters."}
          </Text>
        </View>
      ) : (
        <View style={styles.itemsContainer}>
          {taskItems.map((task: any) => {
            const priorityStyle = getPriorityStyle(task.priority);
            const statusStyle = getStatusStyle(task.status);
            const locationName = task.location_name || task.locationName || "Site Visit";

            return (
              <TouchableOpacity
                key={task.id}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("TaskDetail", { task, taskId: task.id })}
                style={[
                  styles.taskItemCard,
                  {
                    backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                    borderColor: theme.palette.divider
                  }
                ]}
              >
                {/* Header: Priority Badge, Status Badge & Title */}
                <View style={styles.itemTopRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                      <Text style={[styles.priorityBadgeText, { color: priorityStyle.color }]}>
                        {task.priority || "NORMAL"}
                      </Text>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
                    </View>
                  </View>

                  {/* Card Actions: Remark & Status Change */}
                  <View style={styles.cardActionsRow}>
                    {/* Add Comment / Remark Action */}
                    <TouchableOpacity
                      style={[
                        styles.taskActionBtn,
                        {
                          borderColor: isDark ? "#334155" : "#E2E8F0",
                          backgroundColor: isDark ? "#1E293B" : "#F1F5F9"
                        }
                      ]}
                      onPress={() => handleOpenCommentModal(task)}
                      activeOpacity={0.7}
                    >
                      <Icon name="message-square" type="feather" size={11} color={theme.palette.text.secondary} />
                      <Text style={[styles.taskActionBtnText, { color: theme.palette.text.secondary }]}>Remark</Text>
                    </TouchableOpacity>

                    {/* Change Status Action (Mandatory Remarks) */}
                    {canChangeStatus && (
                      <TouchableOpacity
                        style={[
                          styles.taskActionBtn,
                          task.status === "CLOSED"
                            ? { borderColor: "#16A34A", backgroundColor: "rgba(34, 197, 94, 0.08)" }
                            : {
                                borderColor: theme.palette.primary.main,
                                backgroundColor: isDark ? "#1E293B" : "#EFF6FF"
                              }
                        ]}
                        onPress={() => handleOpenStatusModal(task)}
                        disabled={isUpdatingStatus}
                        activeOpacity={0.7}
                      >
                        <Icon
                          name={task.status === "CLOSED" ? "check-circle" : "refresh-cw"}
                          type="feather"
                          size={11}
                          color={task.status === "CLOSED" ? "#16A34A" : theme.palette.primary.main}
                        />
                        <Text
                          style={[
                            styles.taskActionBtnText,
                            {
                              color: task.status === "CLOSED" ? "#16A34A" : theme.palette.primary.main
                            }
                          ]}
                        >
                          Status
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Task Title */}
                <Text style={[styles.taskTitleText, { color: theme.palette.text.primary }]}>{task.title}</Text>

                {/* Task Description if available */}
                {task.description ? (
                  <Text style={[styles.taskDescText, { color: theme.palette.text.secondary }]}>{task.description}</Text>
                ) : null}

                {/* Details Row: Location Name, Due Date / Created Date */}
                <View style={styles.detailsRow}>
                  <View style={styles.detailPill}>
                    <Icon name="map-pin" type="feather" size={11} color={theme.palette.text.secondary} />
                    <Text style={[styles.detailPillText, { color: theme.palette.text.secondary }]}>{locationName}</Text>
                  </View>

                  {task.due_date && (
                    <View style={styles.detailPill}>
                      <Icon name="calendar" type="feather" size={11} color={theme.palette.text.secondary} />
                      <Text style={[styles.detailPillText, { color: theme.palette.text.secondary }]}>
                        Due: {formatDate(task.due_date, "dd MMM yyyy")}
                      </Text>
                    </View>
                  )}

                  {task.created_at && !task.due_date && (
                    <View style={styles.detailPill}>
                      <Icon name="clock" type="feather" size={11} color={theme.palette.text.secondary} />
                      <Text style={[styles.detailPillText, { color: theme.palette.text.secondary }]}>
                        {formatDate(task.created_at, "dd MMM")} · {formatTime(task.created_at, "hh:mm a")}
                      </Text>
                    </View>
                  )}

                  <View style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 3 }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: theme.palette.primary.main }}>Details</Text>
                    <Icon name="chevron-right" type="feather" size={13} color={theme.palette.primary.main} />
                  </View>
                </View>

                {/* Task History & Remarks Section */}
                {Array.isArray(task.history) && task.history.length > 0 && (
                  <View
                    style={[
                      styles.historyBox,
                      {
                        backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                        borderColor: isDark ? "#1E293B" : "#E2E8F0"
                      }
                    ]}
                  >
                    <View style={styles.historyHeaderRow}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                        <Icon name="clock" type="feather" size={11} color={theme.palette.primary.main} />
                        <Text style={[styles.historyHeading, { color: theme.palette.text.primary }]}>
                          Task History ({task.history.length})
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setExpandedTaskId((prev) => (prev === task.id ? null : task.id))}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={[styles.historyToggleText, { color: theme.palette.primary.main }]}>
                          {expandedTaskId === task.id ? "Hide" : "View"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Latest Remark Snippet */}
                    {(() => {
                      const latestRemarkItem = task.history.find((h: any) => Boolean(h.remarks && h.remarks.trim()));
                      if (expandedTaskId !== task.id && latestRemarkItem) {
                        const author = latestRemarkItem.updatedUserName || latestRemarkItem.updated_user_name;
                        return (
                          <Text
                            style={[styles.latestRemarkSnippet, { color: theme.palette.text.secondary }]}
                            numberOfLines={2}
                          >
                            💬 "{latestRemarkItem.remarks}"{author ? ` — ${author}` : ""}
                          </Text>
                        );
                      }
                      return null;
                    })()}

                    {/* Expanded History Timeline */}
                    {expandedTaskId === task.id && (
                      <View style={styles.historyTimeline}>
                        {task.history.map((h: any, hIdx: number) => {
                          const oldSt = h.oldStatus || h.old_status || "START";
                          const newSt = h.newStatus || h.new_status || "";
                          const remarks = h.remarks || h.comment || h.description;
                          const updatedBy = h.updatedUserName || h.updated_user_name;
                          const createdDate = h.createdAt || h.created_at;

                          return (
                            <View key={h.id || hIdx} style={styles.historyTimelineItem}>
                              <View style={styles.historyTimelineDot} />
                              <View style={{ flex: 1 }}>
                                <View style={styles.historyItemTop}>
                                  <Text style={[styles.historyStatusTransition, { color: theme.palette.text.primary }]}>
                                    {oldSt.replace("_", " ")} → {newSt.replace("_", " ")}
                                  </Text>
                                  {createdDate ? (
                                    <Text style={[styles.historyItemDate, { color: theme.palette.text.secondary }]}>
                                      {formatDate(createdDate, "dd MMM, hh:mm a")}
                                    </Text>
                                  ) : null}
                                </View>
                                {remarks ? (
                                  <Text style={[styles.historyRemarkBody, { color: isDark ? "#CBD5E1" : "#334155" }]}>
                                    "{remarks}"
                                  </Text>
                                ) : null}
                                {updatedBy ? (
                                  <Text style={[styles.historyUpdatedBy, { color: theme.palette.text.secondary }]}>
                                    By: {updatedBy}
                                  </Text>
                                ) : null}
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Bottom Pagination Bar */}
      <View style={styles.paginationRow}>
        {/* Rows Per Page */}
        <View style={styles.rowsPerPageBox}>
          <Text style={[styles.rowsLabel, { color: theme.palette.text.secondary }]}>Rows:</Text>
          {[5, 10, 25, 50].map((sz) => {
            const isCurrent = pageSize === sz;
            return (
              <TouchableOpacity
                key={sz}
                style={[
                  styles.sizePill,
                  isCurrent && {
                    backgroundColor: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main
                  }
                ]}
                onPress={() => handlePageSizeChange(sz)}
              >
                <Text style={[styles.sizePillText, { color: isCurrent ? "#FFFFFF" : theme.palette.text.secondary }]}>
                  {sz}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Page Indicator */}
        <Text style={[styles.pageIndicatorText, { color: theme.palette.text.primary }]}>
          Page {page} of {totalPages}
        </Text>

        {/* Prev & Next Controls */}
        <View style={styles.navControls}>
          <TouchableOpacity
            style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled, { borderColor: theme.palette.divider }]}
            onPress={() => handlePageChange(page - 1)}
            disabled={page <= 1 || isLoading}
          >
            <Icon name="chevron-left" type="feather" size={14} color={theme.palette.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pageBtn,
              page >= totalPages && styles.pageBtnDisabled,
              { borderColor: theme.palette.divider }
            ]}
            onPress={() => handlePageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
          >
            <Icon name="chevron-right" type="feather" size={14} color={theme.palette.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Date Range Picker Modal */}
      <CustomDateRangePickerModal
        visible={isDatePickerVisible}
        onClose={() => setIsDatePickerVisible(false)}
        onApply={handleApplyCustomDate}
        initialStartDate={customStartDate}
        initialEndDate={customEndDate}
      />

      {/* ========================================================================= */}
      {/* MODAL 1: STATUS UPDATE MODAL (MANDATORY REMARKS)                          */}
      {/* ========================================================================= */}
      <Modal visible={isStatusModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardContainer}
          >
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }
              ]}
            >
              {/* Header */}
              <View style={styles.modalHeaderRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.modalTitleText, { color: theme.palette.text.primary }]}>Update Task Status</Text>
                  <Text style={[styles.modalSubtitleText, { color: theme.palette.text.secondary }]} numberOfLines={1}>
                    {selectedTaskForStatus?.title || "Task"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setIsStatusModalVisible(false);
                    setSelectedTaskForStatus(null);
                    setStatusRemarks("");
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="x" type="feather" size={20} color={theme.palette.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Status Picker Pills */}
              <Text style={[styles.inputFieldLabel, { color: theme.palette.text.primary }]}>Select New Status *</Text>
              <View style={styles.statusOptionsRow}>
                {[
                  {
                    key: "TO_DO",
                    label: "Pending",
                    icon: "clock",
                    activeColor: "#D97706",
                    activeBg: isDark ? "#2D1D05" : "#FEF3C7"
                  },
                  {
                    key: "IN_PROGRESS",
                    label: "In Progress",
                    icon: "activity",
                    activeColor: "#2563EB",
                    activeBg: isDark ? "#08214D" : "#DBEAFE"
                  },
                  {
                    key: "CLOSED",
                    label: "Completed",
                    icon: "check-circle",
                    activeColor: "#16A34A",
                    activeBg: isDark ? "#072B18" : "#DCFCE7"
                  }
                ].map((opt) => {
                  const isSelected = targetStatus === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.statusOptionPill,
                        {
                          backgroundColor: isSelected ? opt.activeBg : isDark ? "#0F172A" : "#F8FAFC",
                          borderColor: isSelected ? opt.activeColor : theme.palette.divider,
                          borderWidth: isSelected ? 1.5 : 1
                        }
                      ]}
                      onPress={() => setTargetStatus(opt.key as any)}
                    >
                      <Icon
                        name={opt.icon}
                        type="feather"
                        size={12}
                        color={isSelected ? opt.activeColor : theme.palette.text.secondary}
                      />
                      <Text
                        style={[
                          styles.statusOptionPillText,
                          {
                            color: isSelected ? opt.activeColor : theme.palette.text.secondary,
                            fontWeight: isSelected ? "700" : "500"
                          }
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Remarks Input (MANDATORY) */}
              <View style={{ marginTop: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6
                  }}
                >
                  <Text style={[styles.inputFieldLabel, { color: theme.palette.text.primary, marginBottom: 0 }]}>
                    Remarks / Reason <Text style={{ color: "#DC2626" }}>*</Text>
                  </Text>
                  <Text
                    style={{
                      fontSize: 10.5,
                      color: statusRemarks.trim() ? "#16A34A" : "#DC2626",
                      fontWeight: "700"
                    }}
                  >
                    {statusRemarks.trim() ? "Provided" : "Required"}
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.modalTextarea,
                    {
                      backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                      borderColor: !statusRemarks.trim() ? (isDark ? "#78350F" : "#FDE68A") : theme.palette.divider,
                      color: theme.palette.text.primary
                    }
                  ]}
                  placeholder="Mandatory: e.g. Customer approved vital logs, scheduled calibration..."
                  placeholderTextColor={theme.palette.text.secondary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={statusRemarks}
                  onChangeText={setStatusRemarks}
                />
              </View>

              {/* Modal Actions */}
              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={[styles.modalSecBtn, { borderColor: theme.palette.divider }]}
                  onPress={() => {
                    setIsStatusModalVisible(false);
                    setSelectedTaskForStatus(null);
                    setStatusRemarks("");
                  }}
                  disabled={isSubmittingStatus}
                >
                  <Text style={[styles.modalSecBtnText, { color: theme.palette.text.secondary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalPriBtn,
                    {
                      backgroundColor: !statusRemarks.trim()
                        ? isDark
                          ? "#334155"
                          : "#94A3B8"
                        : theme.palette.primary.main,
                      opacity: isSubmittingStatus ? 0.7 : 1
                    }
                  ]}
                  onPress={handleSubmitStatusChange}
                  disabled={!statusRemarks.trim() || isSubmittingStatus}
                >
                  {isSubmittingStatus ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Icon name="check" type="feather" size={14} color="#FFFFFF" />
                      <Text style={styles.modalPriBtnText}>Update Status</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: ADD COMMENT / REMARK ONLY MODAL                                  */}
      {/* ========================================================================= */}
      <Modal visible={isCommentModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardContainer}
          >
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }
              ]}
            >
              {/* Header */}
              <View style={styles.modalHeaderRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.modalTitleText, { color: theme.palette.text.primary }]}>Add Task Remark</Text>
                  <Text style={[styles.modalSubtitleText, { color: theme.palette.text.secondary }]} numberOfLines={1}>
                    {selectedTaskForComment?.title || "Task"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setIsCommentModalVisible(false);
                    setSelectedTaskForComment(null);
                    setCommentText("");
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="x" type="feather" size={20} color={theme.palette.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Current Status Pill */}
              <View style={styles.commentStatusInfoRow}>
                <Text style={{ fontSize: 12, color: theme.palette.text.secondary }}>Status:</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        selectedTaskForComment?.status === "CLOSED"
                          ? "#DCFCE7"
                          : selectedTaskForComment?.status === "IN_PROGRESS"
                          ? "#DBEAFE"
                          : "#FEF3C7"
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color:
                          selectedTaskForComment?.status === "CLOSED"
                            ? "#16A34A"
                            : selectedTaskForComment?.status === "IN_PROGRESS"
                            ? "#2563EB"
                            : "#D97706"
                      }
                    ]}
                  >
                    {(selectedTaskForComment?.status || "TO_DO").replace("_", " ")}
                  </Text>
                </View>
              </View>

              {/* Comment Textarea */}
              <View style={{ marginTop: 10 }}>
                <Text style={[styles.inputFieldLabel, { color: theme.palette.text.primary }]}>
                  Your Remark / Note <Text style={{ color: "#DC2626" }}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.modalTextarea,
                    {
                      backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                      borderColor: !commentText.trim() ? theme.palette.divider : theme.palette.primary.main,
                      color: theme.palette.text.primary
                    }
                  ]}
                  placeholder="Enter notes, observations or ticket updates..."
                  placeholderTextColor={theme.palette.text.secondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={commentText}
                  onChangeText={setCommentText}
                />
              </View>

              {/* Modal Actions */}
              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={[styles.modalSecBtn, { borderColor: theme.palette.divider }]}
                  onPress={() => {
                    setIsCommentModalVisible(false);
                    setSelectedTaskForComment(null);
                    setCommentText("");
                  }}
                  disabled={isSubmittingComment}
                >
                  <Text style={[styles.modalSecBtnText, { color: theme.palette.text.secondary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalPriBtn,
                    {
                      backgroundColor: !commentText.trim()
                        ? isDark
                          ? "#334155"
                          : "#94A3B8"
                        : theme.palette.primary.main,
                      opacity: isSubmittingComment ? 0.7 : 1
                    }
                  ]}
                  onPress={handleSubmitComment}
                  disabled={!commentText.trim() || isSubmittingComment}
                >
                  {isSubmittingComment ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Icon name="message-square" type="feather" size={14} color="#FFFFFF" />
                      <Text style={styles.modalPriBtnText}>Post Remark</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  listSectionCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 14
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  sectionHeaderIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700"
  },
  addButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "700"
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "700"
  },
  filterSection: {
    gap: 8
  },
  primaryStatusChipsContainer: {
    marginBottom: 2
  },
  primaryStatusChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 2
  },
  primaryStatusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5
  },
  primaryStatusChipText: {
    fontSize: 12.5
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    paddingVertical: 0
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  filterGroupLabel: {
    fontSize: 11,
    fontWeight: "700",
    minWidth: 46
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 2
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.2)"
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "600"
  },
  listLoadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8
  },
  listLoadingText: {
    fontSize: 12
  },
  emptyListBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 6
  },
  emptyListTitle: {
    fontSize: 14,
    fontWeight: "700"
  },
  emptyListDesc: {
    fontSize: 12,
    textAlign: "center"
  },
  itemsContainer: {
    gap: 10
  },
  taskItemCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 6
  },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  priorityBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: "800"
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800"
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  taskActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1
  },
  taskActionBtnText: {
    fontSize: 11,
    fontWeight: "700"
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  keyboardContainer: {
    width: "100%",
    maxWidth: 420
  },
  modalCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 6 }
    })
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: "700"
  },
  modalSubtitleText: {
    fontSize: 12,
    marginTop: 2
  },
  inputFieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6
  },
  statusOptionsRow: {
    flexDirection: "row",
    gap: 6
  },
  statusOptionPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10
  },
  statusOptionPillText: {
    fontSize: 11
  },
  modalTextarea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    minHeight: 75,
    fontSize: 13
  },
  commentStatusInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 2
  },
  modalActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6
  },
  modalSecBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  modalSecBtnText: {
    fontSize: 13,
    fontWeight: "600"
  },
  modalPriBtn: {
    flex: 1.4,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  modalPriBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700"
  },
  taskTitleText: {
    fontSize: 13.5,
    fontWeight: "700"
  },
  taskDescText: {
    fontSize: 12,
    lineHeight: 16
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  detailPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  detailPillText: {
    fontSize: 11.5,
    fontWeight: "500"
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(100, 116, 139, 0.12)"
  },
  rowsPerPageBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  rowsLabel: {
    fontSize: 11,
    fontWeight: "600"
  },
  sizePill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.2)"
  },
  sizePillText: {
    fontSize: 10.5,
    fontWeight: "700"
  },
  pageIndicatorText: {
    fontSize: 11.5,
    fontWeight: "700"
  },
  navControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  pageBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  pageBtnDisabled: {
    opacity: 0.3
  },
  historyBox: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    gap: 4
  },
  historyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  historyHeading: {
    fontSize: 11,
    fontWeight: "700"
  },
  historyToggleText: {
    fontSize: 11,
    fontWeight: "700"
  },
  latestRemarkSnippet: {
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 2
  },
  historyTimeline: {
    marginTop: 6,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(100, 116, 139, 0.15)",
    paddingTop: 6
  },
  historyTimelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6
  },
  historyTimelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B82F6",
    marginTop: 4
  },
  historyItemTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  historyStatusTransition: {
    fontSize: 10.5,
    fontWeight: "700"
  },
  historyItemDate: {
    fontSize: 9.5
  },
  historyRemarkBody: {
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 2
  },
  historyUpdatedBy: {
    fontSize: 9.5,
    marginTop: 1
  }
});
