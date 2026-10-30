import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { format } from "date-fns";

import { useTheme } from "@/lib/appTheme";
import { Icon } from "@/lib/layout";
import { formatDistance } from "@/utils/location";
import { formatDate, formatTime } from "@/utils/Time";
import { useGetUserJourneys } from "@/screens/home/customer-success/Function";
import { CustomDateRangePickerModal } from "./CustomDateRangePickerModal";

export interface JourneysListSectionProps {
  userId?: number | null;
  title?: string;
  onAddPress?: () => void;
  showAddButton?: boolean;
  initialStatus?: string;
  initialDateFilter?: "TODAY" | "ALL" | "CUSTOM";
}

export function JourneysListSection({
  userId,
  title = "Journeys Directory",
  onAddPress,
  showAddButton = false,
  initialStatus = "IN_PROGRESS",
  initialDateFilter = "ALL"
}: JourneysListSectionProps) {
  const { theme } = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [getUserJourneys, { data: journeysData, isLoading }] = useGetUserJourneys();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<"TODAY" | "ALL" | "CUSTOM">(initialDateFilter);
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>(initialStatus || "IN_PROGRESS");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  useEffect(() => {
    if (initialStatus) {
      setStatusFilter(initialStatus);
      setPage(1);
    }
  }, [initialStatus]);

  useEffect(() => {
    if (initialDateFilter) {
      setDateFilter(initialDateFilter);
      setPage(1);
    }
  }, [initialDateFilter]);

  const loadJourneys = useCallback(
    (
      p = page,
      dFilter = dateFilter,
      sFilter = statusFilter,
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
      getUserJourneys(params);
    },
    [userId, page, dateFilter, statusFilter, customStartDate, customEndDate, pageSize, searchQuery]
  );

  useFocusEffect(
    useCallback(() => {
      loadJourneys(page, dateFilter, statusFilter, customStartDate, customEndDate, pageSize, searchQuery);
    }, [page, dateFilter, statusFilter, customStartDate, customEndDate, pageSize, searchQuery, loadJourneys])
  );

  useEffect(() => {
    loadJourneys(page, dateFilter, statusFilter, customStartDate, customEndDate, pageSize, searchQuery);
  }, [userId]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setPage(1);
    loadJourneys(1, dateFilter, statusFilter, customStartDate, customEndDate, pageSize, text);
  };

  const handleDateFilter = (val: "TODAY" | "ALL" | "CUSTOM") => {
    if (val === "CUSTOM") {
      setIsDatePickerVisible(true);
      return;
    }
    setDateFilter(val);
    setPage(1);
    loadJourneys(1, val, statusFilter, "", "", pageSize, searchQuery);
  };

  const handleApplyCustomDate = (s: string, e: string) => {
    setDateFilter("CUSTOM");
    setCustomStartDate(s);
    setCustomEndDate(e);
    setPage(1);
    loadJourneys(1, "CUSTOM", statusFilter, s, e, pageSize, searchQuery);
  };

  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
    setPage(1);
    loadJourneys(1, dateFilter, val, customStartDate, customEndDate, pageSize, searchQuery);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadJourneys(newPage, dateFilter, statusFilter, customStartDate, customEndDate, pageSize, searchQuery);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
    loadJourneys(1, dateFilter, statusFilter, customStartDate, customEndDate, newSize, searchQuery);
  };

  const journeyItems = Array.isArray(journeysData?.data) ? journeysData.data : journeysData?.data?.items || [];
  const totalCount = journeysData?.data?.total ?? journeyItems.length;
  const totalPages = journeysData?.data?.totalPages ?? 1;

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return { bg: "rgba(34, 197, 94, 0.12)", color: "#16A34A", label: "Completed" };
      case "IN_PROGRESS":
        return { bg: "rgba(59, 130, 246, 0.12)", color: "#2563EB", label: "In Progress" };
      case "CANCELLED":
        return { bg: "rgba(239, 68, 68, 0.12)", color: "#DC2626", label: "Cancelled" };
      default:
        return { bg: "rgba(100, 116, 139, 0.12)", color: "#64748B", label: status || "Unknown" };
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
      {/* <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderLeft}>
          <View
            style={[styles.sectionHeaderIcon, { backgroundColor: isDark ? "#1E293B" : "rgba(59, 130, 246, 0.12)" }]}
          >
            <Icon name="navigation" type="feather" size={16} color={theme.palette.primary.main} />
          </View>
          <Text style={[styles.sectionHeading, { color: theme.palette.text.primary }]}>{title}</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {showAddButton && onAddPress && (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.palette.primary.main }]}
              onPress={onAddPress}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          )}

          <View style={[styles.countBadge, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}>
            <Text style={[styles.countBadgeText, { color: theme.palette.text.secondary }]}>
              {totalCount} {totalCount === 1 ? "Trip" : "Trips"}
            </Text>
          </View>
        </View>
      </View> */}

      {/* Filters Section */}
      <View style={styles.filterSection}>
        {/* Status Chips Row at top: In Progress, Completed, Cancelled, All */}
        <View style={styles.primaryStatusChipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.primaryStatusChipsRow}
          >
            {[
              {
                label: "In Progress",
                value: "IN_PROGRESS",
                icon: "activity",
                activeColor: "#2563EB",
                activeBg: isDark ? "rgba(37, 99, 235, 0.22)" : "rgba(59, 130, 246, 0.15)",
                activeBorder: "#3B82F6"
              },
              {
                label: "Completed",
                value: "COMPLETED",
                icon: "check-circle",
                activeColor: "#16A34A",
                activeBg: isDark ? "rgba(22, 163, 74, 0.22)" : "rgba(34, 197, 94, 0.15)",
                activeBorder: "#22C55E"
              },
              {
                label: "Cancelled",
                value: "CANCELLED",
                icon: "x-circle",
                activeColor: "#DC2626",
                activeBg: isDark ? "rgba(220, 38, 38, 0.22)" : "rgba(239, 68, 68, 0.15)",
                activeBorder: "#EF4444"
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
            placeholder="Search departure, destination, or remarks..."
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
              { label: "Completed", value: "COMPLETED" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "Cancelled", value: "CANCELLED" }
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
      </View>

      {/* Journeys List Items */}
      {isLoading ? (
        <View style={styles.listLoadingBox}>
          <ActivityIndicator color={theme.palette.primary.main} size="small" />
          <Text style={[styles.listLoadingText, { color: theme.palette.text.secondary }]}>Loading journeys...</Text>
        </View>
      ) : journeyItems.length === 0 ? (
        <View style={styles.emptyListBox}>
          <Icon name="navigation" type="feather" size={28} color={theme.palette.text.secondary} />
          <Text style={[styles.emptyListTitle, { color: theme.palette.text.primary }]}>No Journeys Found</Text>
          <Text style={[styles.emptyListDesc, { color: theme.palette.text.secondary }]}>
            {searchQuery ? `No journeys match "${searchQuery}".` : "No trips recorded for the selected filter."}
          </Text>
        </View>
      ) : (
        <View style={styles.itemsContainer}>
          {journeyItems.map((journey: any) => {
            const statusStyle = getStatusBadgeStyle(journey.status);
            const distDisplay = journey.distance != null ? formatDistance(journey.distance) : "0 m";
            const fromName = journey.from_location?.location_name || journey.fromLocation?.locationName || "Departure";
            const toName = journey.to_location?.location_name || journey.toLocation?.locationName || "Destination";
            const startTimeStr = journey.start_time || journey.startTime;
            const endTimeStr = journey.end_time || journey.endTime;
            const dateStr = startTimeStr || journey.created_at || journey.createdAt || endTimeStr;

            return (
              <View
                key={journey.id}
                style={[
                  styles.journeyItemCard,
                  {
                    backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                    borderColor: theme.palette.divider
                  }
                ]}
              >
                {/* Header: Route and Status Badge */}
                <View style={styles.itemTopRow}>
                  <View style={styles.routeHeader}>
                    <Text style={[styles.routeFromText, { color: theme.palette.text.primary }]} numberOfLines={1}>
                      {fromName}
                    </Text>
                    <Icon name="arrow-right" type="feather" size={13} color={theme.palette.primary.main} />
                    <Text style={[styles.routeToText, { color: theme.palette.text.primary }]} numberOfLines={1}>
                      {toName}
                    </Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
                  </View>
                </View>

                {/* Details Row: Date, Time, Distance */}
                <View style={styles.detailsRow}>
                  {dateStr && (
                    <View style={styles.detailPill}>
                      <Icon name="calendar" type="feather" size={11} color={theme.palette.text.secondary} />
                      <Text style={[styles.detailPillText, { color: theme.palette.text.secondary }]}>
                        {formatDate(dateStr, "dd MMM yyyy")}
                      </Text>
                    </View>
                  )}

                  {startTimeStr && (
                    <View style={styles.detailPill}>
                      <Icon name="clock" type="feather" size={11} color={theme.palette.text.secondary} />
                      <Text style={[styles.detailPillText, { color: theme.palette.text.secondary }]}>
                        {formatTime(startTimeStr, "hh:mm a")}
                        {endTimeStr ? ` - ${formatTime(endTimeStr, "hh:mm a")}` : ""}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailPill}>
                    <Icon name="map-pin" type="feather" size={11} color={theme.palette.text.secondary} />
                    <Text style={[styles.detailPillText, { color: theme.palette.text.secondary }]}>{distDisplay}</Text>
                  </View>
                </View>

                {/* Cancel Remarks if cancelled */}
                {journey.status === "CANCELLED" && journey.remarks && (
                  <View
                    style={[
                      styles.cancelRemarksBox,
                      { backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2" }
                    ]}
                  >
                    <Icon name="alert-circle" type="feather" size={12} color="#DC2626" />
                    <Text style={styles.cancelRemarksText} numberOfLines={2}>
                      {journey.remarks}
                    </Text>
                  </View>
                )}
              </View>
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
    minWidth: 42
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
  journeyItemCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 8
  },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1
  },
  routeFromText: {
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1
  },
  routeToText: {
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: "800"
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    rowGap: 6
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
  cancelRemarksBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  cancelRemarksText: {
    fontSize: 11,
    color: "#DC2626",
    flex: 1
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
  }
});
