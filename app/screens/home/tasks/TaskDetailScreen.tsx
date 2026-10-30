import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useTheme } from "@/lib/appTheme";
import { Icon } from "@/lib/layout";
import { formatDate, formatTime } from "@/utils/Time";
import { showToast } from "@/utils/ShowToast";
import { useChangeTaskStatus, useGetTaskById } from "@/screens/home/customer-success/Function";

export default function TaskDetailScreen() {
  const { theme } = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  // Params from navigation
  const initialTask = route.params?.task || {};
  const taskId: number = route.params?.taskId || initialTask.id;

  // Local task state initialized with passed task param for instant transition
  const [task, setTask] = useState<any>(initialTask);

  // API hooks
  const [getTaskById, { isLoading: isFetchingTask }] = useGetTaskById();
  const [changeTaskStatusMutation] = useChangeTaskStatus();

  // Status Change Modal State
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [targetStatus, setTargetStatus] = useState<"TO_DO" | "IN_PROGRESS" | "CLOSED">("IN_PROGRESS");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  // Add Comment / Remark Modal State
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch latest task details & history from backend
  const fetchTaskDetails = useCallback(async () => {
    if (!taskId) return;
    try {
      const res: any = await getTaskById(null, {}, String(taskId));
      const fetched = res?.data?.data || res?.data;
      if (fetched) {
        setTask(fetched);
      }
    } catch (err: any) {
      console.warn("Failed to fetch fresh task details:", err?.message || err);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  // Status Styles
  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CLOSED":
        return { label: "Completed", bg: "#DCFCE7", color: "#16A34A", border: "#86EFAC", icon: "check-circle" };
      case "IN_PROGRESS":
        return { label: "In Progress", bg: "#DBEAFE", color: "#2563EB", border: "#93C5FD", icon: "activity" };
      case "CANCELLED":
        return { label: "Cancelled", bg: "#FEE2E2", color: "#DC2626", border: "#FCA5A5", icon: "x-circle" };
      case "RE_OPEN":
        return { label: "Re-Opened", bg: "#F3E8FF", color: "#9333EA", border: "#D8B4FE", icon: "refresh-cw" };
      case "TO_DO":
      default:
        return { label: "Pending", bg: "#FEF3C7", color: "#D97706", border: "#FCD34D", icon: "clock" };
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
        return { bg: "rgba(239, 68, 68, 0.12)", color: "#EF4444", border: "rgba(239, 68, 68, 0.3)" };
      case "LOW":
        return { bg: "rgba(100, 116, 139, 0.12)", color: "#64748B", border: "rgba(100, 116, 139, 0.3)" };
      case "NORMAL":
      default:
        return { bg: "rgba(59, 130, 246, 0.12)", color: "#3B82F6", border: "rgba(59, 130, 246, 0.3)" };
    }
  };

  const statusStyle = getStatusStyle(task.status);
  const priorityStyle = getPriorityStyle(task.priority);

  // Build tree history nodes in chronological order
  const treeNodes = useMemo(() => {
    const nodes: any[] = [];

    // Root Creation Event
    nodes.push({
      id: "root-creation",
      type: "CREATION",
      title: "Task Created",
      user: task.assignedUser || task.assigned_user || "Manager",
      role: "Creation",
      date: task.createdAt || task.created_at,
      remarks: task.description || "Task assigned for field execution.",
      isRoot: true
    });

    if (Array.isArray(task.history)) {
      // Sort oldest to newest for hierarchical tree flow
      const sorted = [...task.history].sort((a: any, b: any) => {
        const da = new Date(a.createdAt || a.created_at || 0).getTime();
        const db = new Date(b.createdAt || b.created_at || 0).getTime();
        return da - db;
      });

      sorted.forEach((h: any, idx: number) => {
        const oldSt = h.oldStatus || h.old_status;
        const newSt = h.newStatus || h.new_status;
        const remarks = h.remarks || h.comment || h.description;
        const userName = h.updatedUserName || h.updated_user_name || "Team Member";
        const date = h.createdAt || h.created_at;
        const isStatusChange = Boolean(oldSt && newSt && oldSt !== newSt);

        nodes.push({
          id: h.id || `node-${idx}`,
          type: isStatusChange ? "STATUS_CHANGE" : "REMARK",
          oldStatus: oldSt,
          newStatus: newSt,
          remarks: remarks,
          user: userName,
          date: date,
          isRoot: false
        });
      });
    }

    return nodes;
  }, [task]);

  // Submit Status Change
  const handleSubmitStatusChange = async () => {
    if (!statusRemarks.trim()) {
      showToast("Remarks / reason is mandatory when changing task status", "warning");
      return;
    }

    setIsSubmittingStatus(true);
    try {
      const res: any = await changeTaskStatusMutation({
        task_id: task.id,
        task_status: targetStatus,
        status: targetStatus,
        comment: statusRemarks.trim(),
        remarks: statusRemarks.trim()
      });

      if (res?.status === 200 || res?.data) {
        showToast(`Task status updated to ${targetStatus.replace("_", " ")}`, "success");
        setIsStatusModalVisible(false);
        setStatusRemarks("");
        await fetchTaskDetails();
      } else {
        showToast(res?.message || "Failed to update status", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Error updating task status", "error");
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  // Submit Remark / Comment
  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      showToast("Please enter a remark or comment", "warning");
      return;
    }

    setIsSubmittingComment(true);
    try {
      const res: any = await changeTaskStatusMutation({
        task_id: task.id,
        task_status: task.status || "TO_DO",
        status: task.status || "TO_DO",
        comment: commentText.trim(),
        remarks: commentText.trim()
      });

      if (res?.status === 200 || res?.data) {
        showToast("Remark added successfully!", "success");
        setIsCommentModalVisible(false);
        setCommentText("");
        await fetchTaskDetails();
      } else {
        showToast(res?.message || "Failed to add remark", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Error adding remark", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const s = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: isDark ? "#0B1120" : "#F8FAFC"
        },
        header: {
          paddingHorizontal: 16,
          paddingTop: Math.max(insets.top, Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0) + 8,
          paddingBottom: 14,
          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#334155" : "#E2E8F0",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between"
        },
        headerLeft: {
          flexDirection: "row",
          alignItems: "center",
          gap: 12
        },
        backBtn: {
          padding: 6,
          borderRadius: 8,
          backgroundColor: isDark ? "#0F172A" : "#F1F5F9"
        },
        headerTitle: {
          fontSize: 17,
          fontWeight: "700",
          color: theme.palette.text.primary
        },
        scrollContent: {
          padding: 16,
          paddingBottom: 80,
          gap: 16
        },

        // Hero Card
        heroCard: {
          borderRadius: 16,
          padding: 18,
          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
          borderWidth: 1,
          borderColor: isDark ? "#334155" : "#E2E8F0",
          gap: 14
        },
        heroTopRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between"
        },
        badgeRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8
        },
        statusBadge: {
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          paddingHorizontal: 9,
          paddingVertical: 3.5,
          borderRadius: 8,
          borderWidth: 1
        },
        statusBadgeText: {
          fontSize: 11,
          fontWeight: "700"
        },
        priorityBadge: {
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 6,
          borderWidth: 1
        },
        priorityBadgeText: {
          fontSize: 10.5,
          fontWeight: "800"
        },
        taskTitle: {
          fontSize: 18,
          fontWeight: "700",
          color: theme.palette.text.primary,
          lineHeight: 24
        },
        taskDescription: {
          fontSize: 13.5,
          color: theme.palette.text.secondary,
          lineHeight: 20
        },
        metaGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#334155" : "#F1F5F9"
        },
        metaItem: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          minWidth: 140
        },
        metaText: {
          fontSize: 12,
          color: theme.palette.text.secondary
        },

        // Action Buttons Row
        actionButtonsRow: {
          flexDirection: "row",
          gap: 10,
          marginTop: 4
        },
        actionBtnPrimary: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          paddingVertical: 11,
          borderRadius: 10,
          backgroundColor: theme.palette.primary.main
        },
        actionBtnPrimaryText: {
          color: "#FFFFFF",
          fontSize: 13,
          fontWeight: "700"
        },
        actionBtnSecondary: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          paddingVertical: 11,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: isDark ? "#334155" : "#CBD5E1",
          backgroundColor: isDark ? "#0F172A" : "#F8FAFC"
        },
        actionBtnSecondaryText: {
          fontSize: 13,
          fontWeight: "600",
          color: theme.palette.text.primary
        },

        // Tree Section
        treeSectionCard: {
          borderRadius: 16,
          padding: 18,
          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
          borderWidth: 1,
          borderColor: isDark ? "#334155" : "#E2E8F0"
        },
        treeHeaderRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#334155" : "#F1F5F9"
        },
        treeTitleRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8
        },
        treeTitle: {
          fontSize: 15,
          fontWeight: "700",
          color: theme.palette.text.primary
        },
        treeCountBadge: {
          backgroundColor: isDark ? "#334155" : "#EFF6FF",
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 10
        },
        treeCountText: {
          fontSize: 11,
          fontWeight: "700",
          color: theme.palette.primary.main
        },

        // Tree Node Row
        treeNodeRow: {
          flexDirection: "row",
          position: "relative"
        },
        // Left Column: Trunk line & Node Icon
        treeLeftCol: {
          width: 32,
          alignItems: "center"
        },
        treeVerticalTrunk: {
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 2,
          backgroundColor: isDark ? "#334155" : "#CBD5E1",
          left: 15
        },
        treeTrunkTopHalf: {
          position: "absolute",
          top: 0,
          height: 16,
          width: 2,
          backgroundColor: isDark ? "#334155" : "#CBD5E1",
          left: 15
        },
        treeTrunkBottomHalf: {
          position: "absolute",
          top: 16,
          bottom: 0,
          width: 2,
          backgroundColor: isDark ? "#334155" : "#CBD5E1",
          left: 15
        },
        treeNodeIconBox: {
          width: 26,
          height: 26,
          borderRadius: 13,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          zIndex: 2,
          marginTop: 4
        },
        // Right Column: Branch & Speech bubble / Card
        treeRightCol: {
          flex: 1,
          paddingLeft: 12,
          paddingBottom: 18
        },
        treeCardBubble: {
          borderRadius: 12,
          padding: 12,
          borderWidth: 1,
          gap: 6
        },
        bubbleHeaderRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 6
        },
        bubbleAuthorRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6
        },
        bubbleAuthorAvatar: {
          width: 22,
          height: 22,
          borderRadius: 11,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.palette.primary.main
        },
        bubbleAuthorInitials: {
          color: "#FFFFFF",
          fontSize: 10,
          fontWeight: "700"
        },
        bubbleAuthorName: {
          fontSize: 12.5,
          fontWeight: "700",
          color: theme.palette.text.primary
        },
        bubbleTimestamp: {
          fontSize: 10.5,
          color: theme.palette.text.secondary
        },
        bubbleTransitionPill: {
          alignSelf: "flex-start",
          paddingHorizontal: 7,
          paddingVertical: 2,
          borderRadius: 6,
          flexDirection: "row",
          alignItems: "center",
          gap: 4
        },
        bubbleTransitionText: {
          fontSize: 10.5,
          fontWeight: "700"
        },
        bubbleRemarkText: {
          fontSize: 12.5,
          lineHeight: 18,
          fontStyle: "italic",
          color: isDark ? "#E2E8F0" : "#1E293B"
        },

        // Modal Styles
        overlay: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          justifyContent: "flex-end"
        },
        modalCard: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
          maxHeight: "85%",
          gap: 14
        },
        modalHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center"
        },
        modalTitle: {
          fontSize: 17,
          fontWeight: "700",
          color: theme.palette.text.primary
        },
        modalLabel: {
          fontSize: 12,
          fontWeight: "600",
          color: theme.palette.text.secondary
        },
        statusOptionsRow: {
          flexDirection: "row",
          gap: 8
        },
        statusOptionPill: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          paddingVertical: 10,
          borderRadius: 10,
          borderWidth: 1
        },
        statusOptionText: {
          fontSize: 12,
          fontWeight: "700"
        },
        modalInput: {
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          fontSize: 13.5,
          minHeight: 80,
          textAlignVertical: "top"
        },
        modalBtnRow: {
          flexDirection: "row",
          gap: 10,
          marginTop: 6
        },
        modalCancelBtn: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: isDark ? "#334155" : "#CBD5E1"
        },
        modalCancelText: {
          fontSize: 13,
          fontWeight: "600",
          color: theme.palette.text.secondary
        },
        modalSaveBtn: {
          flex: 1.5,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 12,
          borderRadius: 10,
          backgroundColor: theme.palette.primary.main
        },
        modalSaveText: {
          fontSize: 13.5,
          fontWeight: "700",
          color: "#FFFFFF"
        }
      }),
    [isDark, theme, insets]
  );

  return (
    <View style={s.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#1E293B" : "#FFFFFF"}
      />
      {/* Top Navigation Bar */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Icon name="arrow-left" type="feather" size={18} color={theme.palette.text.primary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Task Details</Text>
        </View>

        <View style={[s.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          <Icon name={statusStyle.icon} type="feather" size={11} color={statusStyle.color} />
          <Text style={[s.statusBadgeText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(isFetchingTask)}
            onRefresh={fetchTaskDetails}
            colors={[theme.palette.primary.main]}
            tintColor={theme.palette.primary.main}
          />
        }
      >
        {/* Task Overview Hero Card */}
        <View style={s.heroCard}>
          <View style={s.heroTopRow}>
            <View style={s.badgeRow}>
              <View style={[s.priorityBadge, { backgroundColor: priorityStyle.bg, borderColor: priorityStyle.border }]}>
                <Text style={[s.priorityBadgeText, { color: priorityStyle.color }]}>{task.priority || "NORMAL"}</Text>
              </View>
              <Text style={{ fontSize: 11, color: theme.palette.text.secondary }}>#{task.id}</Text>
            </View>

            <TouchableOpacity
              onPress={fetchTaskDetails}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={isFetchingTask}
            >
              <Icon name="rotate-cw" type="feather" size={14} color={theme.palette.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Title & Description */}
          <Text style={s.taskTitle}>{task.title || "Untitled Task"}</Text>
          {task.description ? <Text style={s.taskDescription}>{task.description}</Text> : null}

          {/* Meta Details Grid */}
          <View style={s.metaGrid}>
            <View style={s.metaItem}>
              <Icon name="user" type="feather" size={13} color={theme.palette.primary.main} />
              <Text style={s.metaText}>
                Assigned: <Text style={{ fontWeight: "700" }}>{task.assignedUser || task.assigned_user || "Team Associate"}</Text>
              </Text>
            </View>

            <View style={s.metaItem}>
              <Icon name="map-pin" type="feather" size={13} color="#EF4444" />
              <Text style={s.metaText} numberOfLines={1}>
                {task.locationName || task.location_name || "On-site Visit"}
              </Text>
            </View>

            {(task.dueDate || task.due_date) && (
              <View style={s.metaItem}>
                <Icon name="calendar" type="feather" size={13} color="#D97706" />
                <Text style={s.metaText}>Due: {formatDate(task.dueDate || task.due_date, "dd MMM yyyy")}</Text>
              </View>
            )}

            {(task.createdAt || task.created_at) && (
              <View style={s.metaItem}>
                <Icon name="clock" type="feather" size={13} color="#64748B" />
                <Text style={s.metaText}>Created: {formatDate(task.createdAt || task.created_at, "dd MMM yyyy, hh:mm a")}</Text>
              </View>
            )}
          </View>

          {/* Quick Action Buttons */}
          <View style={s.actionButtonsRow}>
            <TouchableOpacity
              style={s.actionBtnPrimary}
              onPress={() => {
                const next = task.status === "TO_DO" ? "IN_PROGRESS" : task.status === "IN_PROGRESS" ? "CLOSED" : "TO_DO";
                setTargetStatus(next);
                setStatusRemarks("");
                setIsStatusModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Icon name="refresh-cw" type="feather" size={14} color="#FFFFFF" />
              <Text style={s.actionBtnPrimaryText}>Change Status</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.actionBtnSecondary}
              onPress={() => {
                setCommentText("");
                setIsCommentModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Icon name="message-square" type="feather" size={14} color={theme.palette.text.primary} />
              <Text style={s.actionBtnSecondaryText}>Add Remark</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ======================================================== */}
        {/* Linked Comments & Task History Tree Structure */}
        {/* ======================================================== */}
        <View style={s.treeSectionCard}>
          <View style={s.treeHeaderRow}>
            <View style={s.treeTitleRow}>
              <Icon name="git-branch" type="feather" size={16} color={theme.palette.primary.main} />
              <Text style={s.treeTitle}>Activity & Remarks Tree</Text>
            </View>
            <View style={s.treeCountBadge}>
              <Text style={s.treeCountText}>{treeNodes.length} events</Text>
            </View>
          </View>

          {/* Tree Nodes Flow */}
          <View>
            {treeNodes.map((node: any, idx: number) => {
              const isFirst = idx === 0;
              const isLast = idx === treeNodes.length - 1;
              const isCreation = node.type === "CREATION";
              const isStatusChange = node.type === "STATUS_CHANGE";

              // Node Icon & Theme
              let nodeBg = isDark ? "#0F172A" : "#EFF6FF";
              let nodeBorder = theme.palette.primary.main;
              let nodeIcon = "flag";
              let nodeIconColor = theme.palette.primary.main;

              if (isStatusChange) {
                const st = getStatusStyle(node.newStatus);
                nodeBg = isDark ? "#1E293B" : st.bg;
                nodeBorder = st.color;
                nodeIcon = st.icon;
                nodeIconColor = st.color;
              } else if (!isCreation) {
                nodeBg = isDark ? "#1E293B" : "#F1F5F9";
                nodeBorder = "#8B5CF6";
                nodeIcon = "message-circle";
                nodeIconColor = "#8B5CF6";
              }

              return (
                <View key={node.id || idx} style={s.treeNodeRow}>
                  {/* Left Trunk & Node Indicator */}
                  <View style={s.treeLeftCol}>
                    {/* Trunk vertical line */}
                    {!isFirst && <View style={s.treeTrunkTopHalf} />}
                    {!isLast && <View style={s.treeTrunkBottomHalf} />}

                    {/* Circular Node Icon */}
                    <View
                      style={[
                        s.treeNodeIconBox,
                        {
                          backgroundColor: nodeBg,
                          borderColor: nodeBorder
                        }
                      ]}
                    >
                      <Icon name={nodeIcon} type="feather" size={11} color={nodeIconColor} />
                    </View>
                  </View>

                  {/* Right Branch Card Content */}
                  <View style={s.treeRightCol}>
                    <View
                      style={[
                        s.treeCardBubble,
                        {
                          backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                          borderColor: isDark ? "#334155" : "#E2E8F0"
                        }
                      ]}
                    >
                      {/* Node Header Row */}
                      <View style={s.bubbleHeaderRow}>
                        <View style={s.bubbleAuthorRow}>
                          <View style={s.bubbleAuthorAvatar}>
                            <Text style={s.bubbleAuthorInitials}>
                              {String(node.user || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </Text>
                          </View>
                          <Text style={s.bubbleAuthorName}>{node.user || "Team Member"}</Text>
                        </View>

                        <Text style={s.bubbleTimestamp}>
                          {node.date ? formatDate(node.date, "dd MMM, hh:mm a") : "Just now"}
                        </Text>
                      </View>

                      {/* Transition / Status Tag or Remark Badge */}
                      {isStatusChange ? (
                        <View
                          style={[
                            s.bubbleTransitionPill,
                            {
                              backgroundColor: getStatusStyle(node.newStatus).bg
                            }
                          ]}
                        >
                          <Text
                            style={[
                              s.bubbleTransitionText,
                              {
                                color: getStatusStyle(node.newStatus).color
                              }
                            ]}
                          >
                            {(node.oldStatus || "START").replace("_", " ")} ➔{" "}
                            {(node.newStatus || "").replace("_", " ")}
                          </Text>
                        </View>
                      ) : isCreation ? (
                        <View
                          style={[
                            s.bubbleTransitionPill,
                            {
                              backgroundColor: isDark ? "#1E3A5F" : "#DBEAFE"
                            }
                          ]}
                        >
                          <Text
                            style={[
                              s.bubbleTransitionText,
                              {
                                color: theme.palette.primary.main
                              }
                            ]}
                          >
                            🚀 Task Created
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={[
                            s.bubbleTransitionPill,
                            {
                              backgroundColor: isDark ? "#2E1065" : "#EDE9FE"
                            }
                          ]}
                        >
                          <Text
                            style={[
                              s.bubbleTransitionText,
                              {
                                color: "#8B5CF6"
                              }
                            ]}
                          >
                            💬 Task Remark
                          </Text>
                        </View>
                      )}

                      {/* Remarks Body */}
                      {node.remarks ? (
                        <Text style={s.bubbleRemarkText}>"{node.remarks}"</Text>
                      ) : isStatusChange ? (
                        <Text style={[s.bubbleRemarkText, { color: theme.palette.text.secondary, fontStyle: "normal" }]}>
                          Status updated to {(node.newStatus || "").replace("_", " ")}.
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* Change Status Modal */}
      {/* ======================================================== */}
      <Modal visible={isStatusModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.overlay}>
          <View style={[s.modalCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Update Task Status</Text>
              <TouchableOpacity onPress={() => setIsStatusModalVisible(false)}>
                <Icon name="x" type="feather" size={20} color={theme.palette.text.secondary} />
              </TouchableOpacity>
            </View>

            <Text style={s.modalLabel}>Select New Status *</Text>
            <View style={s.statusOptionsRow}>
              {[
                { key: "TO_DO", label: "Pending", color: "#D97706", bg: isDark ? "#2D1D05" : "#FEF3C7" },
                { key: "IN_PROGRESS", label: "In Progress", color: "#2563EB", bg: isDark ? "#08214D" : "#DBEAFE" },
                { key: "CLOSED", label: "Completed", color: "#16A34A", bg: isDark ? "#072B18" : "#DCFCE7" }
              ].map((opt) => {
                const selected = targetStatus === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      s.statusOptionPill,
                      {
                        backgroundColor: selected ? opt.bg : isDark ? "#0F172A" : "#F8FAFC",
                        borderColor: selected ? opt.color : isDark ? "#334155" : "#E2E8F0"
                      }
                    ]}
                    onPress={() => setTargetStatus(opt.key as any)}
                  >
                    <Text style={[s.statusOptionText, { color: selected ? opt.color : theme.palette.text.secondary }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={s.modalLabel}>Remarks / Reason for change *</Text>
            <TextInput
              style={[
                s.modalInput,
                {
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  borderColor: !statusRemarks.trim() ? (isDark ? "#78350F" : "#FDE68A") : isDark ? "#334155" : "#E2E8F0",
                  color: theme.palette.text.primary
                }
              ]}
              placeholder="e.g. Work started on site, hospital staff verified access..."
              placeholderTextColor={theme.palette.text.secondary}
              multiline
              numberOfLines={3}
              value={statusRemarks}
              onChangeText={setStatusRemarks}
            />

            <View style={s.modalBtnRow}>
              <TouchableOpacity
                style={s.modalCancelBtn}
                onPress={() => setIsStatusModalVisible(false)}
                disabled={isSubmittingStatus}
              >
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.modalSaveBtn, { opacity: !statusRemarks.trim() || isSubmittingStatus ? 0.6 : 1 }]}
                onPress={handleSubmitStatusChange}
                disabled={!statusRemarks.trim() || isSubmittingStatus}
              >
                {isSubmittingStatus ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={s.modalSaveText}>Update Status</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ======================================================== */}
      {/* Add Remark Modal */}
      {/* ======================================================== */}
      <Modal visible={isCommentModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.overlay}>
          <View style={[s.modalCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add Task Remark</Text>
              <TouchableOpacity onPress={() => setIsCommentModalVisible(false)}>
                <Icon name="x" type="feather" size={20} color={theme.palette.text.secondary} />
              </TouchableOpacity>
            </View>

            <Text style={s.modalLabel}>Remark / Observation *</Text>
            <TextInput
              style={[
                s.modalInput,
                {
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  borderColor: !commentText.trim() ? isDark ? "#334155" : "#E2E8F0" : theme.palette.primary.main,
                  color: theme.palette.text.primary
                }
              ]}
              placeholder="Enter notes, findings or client feedback..."
              placeholderTextColor={theme.palette.text.secondary}
              multiline
              numberOfLines={4}
              value={commentText}
              onChangeText={setCommentText}
            />

            <View style={s.modalBtnRow}>
              <TouchableOpacity
                style={s.modalCancelBtn}
                onPress={() => setIsCommentModalVisible(false)}
                disabled={isSubmittingComment}
              >
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.modalSaveBtn, { opacity: !commentText.trim() || isSubmittingComment ? 0.6 : 1 }]}
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={s.modalSaveText}>Add Remark</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
