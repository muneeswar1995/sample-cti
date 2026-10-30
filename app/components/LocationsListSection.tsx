import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { useTheme } from "@/lib/appTheme";
import { Icon } from "@/lib/layout";
import { formatDistance } from "@/utils/location";
import { useGetLocations } from "@/screens/home/manager/Functions";

export interface LocationsListSectionProps {
  title?: string;
  onAddPress?: () => void;
  onEditPress?: (loc: any) => void;
  showAddButton?: boolean;
}

export function LocationsListSection({
  title = "Locations Directory",
  onAddPress,
  onEditPress,
  showAddButton = true
}: LocationsListSectionProps) {
  const { theme } = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [getLocations, { data: locationsData, isLoading }] = useGetLocations();
  const [typeFilter, setTypeFilter] = useState<"ALL" | "HOSPITAL" | "OFFICE" | "HOME">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const loadLocations = useCallback(
    (p = page, tFilter = typeFilter, sQuery = searchQuery, size = pageSize) => {
      const params: any = {
        page: p,
        size
      };
      if (tFilter !== "ALL") {
        params.type = tFilter;
      }
      if (sQuery.trim()) {
        params.search = sQuery.trim();
      }
      getLocations(params);
    },
    [page, typeFilter, searchQuery, pageSize]
  );

  useFocusEffect(
    useCallback(() => {
      loadLocations(page, typeFilter, searchQuery, pageSize);
    }, [page, typeFilter, searchQuery, pageSize, loadLocations])
  );

  const handleTypeFilter = (val: "ALL" | "HOSPITAL" | "OFFICE" | "HOME") => {
    setTypeFilter(val);
    setPage(1);
    loadLocations(1, val, searchQuery, pageSize);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setPage(1);
    loadLocations(1, typeFilter, text, pageSize);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadLocations(newPage, typeFilter, searchQuery, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
    loadLocations(1, typeFilter, searchQuery, newSize);
  };

  const locationItems = Array.isArray(locationsData?.data) ? locationsData.data : locationsData?.data?.items || [];
  const totalCount = locationsData?.data?.total ?? locationItems.length;
  const totalPages = locationsData?.data?.totalPages ?? 1;

  const getTypeBadgeStyle = (type: string) => {
    switch (type?.toUpperCase()) {
      case "HOSPITAL":
        return { bg: "rgba(6, 182, 212, 0.12)", color: "#0891B2" };
      case "OFFICE":
        return { bg: "rgba(147, 51, 234, 0.12)", color: "#9333EA" };
      case "HOME":
        return { bg: "rgba(34, 197, 94, 0.12)", color: "#16A34A" };
      default:
        return { bg: "rgba(100, 116, 139, 0.12)", color: "#64748B" };
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
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionHeaderIcon, { backgroundColor: isDark ? "#1E293B" : "rgba(239, 68, 68, 0.12)" }]}>
            <Icon name="map-pin" type="feather" size={16} color={theme.palette.error.main} />
          </View>
          <Text style={[styles.sectionHeading, { color: theme.palette.text.primary }]}>{title}</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {/* {showAddButton && onAddPress && (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.palette.primary.main }]}
              onPress={onAddPress}
            >
              <Text style={styles.addButtonText}>+ Add Location</Text>
            </TouchableOpacity>
          )} */}

          <View style={[styles.countBadge, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}>
            <Text style={[styles.countBadgeText, { color: theme.palette.text.secondary }]}>
              {totalCount} {totalCount === 1 ? "Location" : "Locations"}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter & Search Bar */}
      <View style={styles.filterSection}>
        {/* Search Input */}
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
            placeholder="Search locations..."
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

        {/* Location Type Filter Row */}
        {/* <View style={styles.filterRow}>
          <Text style={[styles.filterGroupLabel, { color: theme.palette.text.secondary }]}>Type:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {[
              { label: "All Types", value: "ALL" },
              { label: "Hospitals", value: "HOSPITAL" },
              { label: "Offices", value: "OFFICE" },
              { label: "Home", value: "HOME" }
            ].map((chip) => {
              const isActive = typeFilter === chip.value;
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
                  onPress={() => handleTypeFilter(chip.value as any)}
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

      {/* Location List Items */}
      {isLoading ? (
        <View style={styles.listLoadingBox}>
          <ActivityIndicator color={theme.palette.primary.main} size="small" />
          <Text style={[styles.listLoadingText, { color: theme.palette.text.secondary }]}>Loading locations...</Text>
        </View>
      ) : locationItems.length === 0 ? (
        <View style={styles.emptyListBox}>
          <Icon name="map-pin" type="feather" size={28} color={theme.palette.text.secondary} />
          <Text style={[styles.emptyListTitle, { color: theme.palette.text.primary }]}>No Locations Found</Text>
          <Text style={[styles.emptyListDesc, { color: theme.palette.text.secondary }]}>
            {searchQuery ? `No locations match "${searchQuery}".` : "No locations registered under this filter."}
          </Text>
        </View>
      ) : (
        <View style={styles.itemsContainer}>
          {locationItems.map((loc: any) => {
            const badgeStyle = getTypeBadgeStyle(loc.locationType);
            const radiusDisplay = loc.radiusMeter ? formatDistance(loc.radiusMeter) : "100 m";

            return (
              <View
                key={loc.id}
                style={[
                  styles.locationItemCard,
                  {
                    backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                    borderColor: theme.palette.divider
                  }
                ]}
              >
                {/* Top Row: Type Badge, Active Status & Edit CTA */}
                <View style={styles.itemTopRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View style={[styles.typeBadge, { backgroundColor: badgeStyle.bg }]}>
                      <Text style={[styles.typeBadgeText, { color: badgeStyle.color }]}>
                        {loc.locationType || "LOCATION"}
                      </Text>
                    </View>

                    {loc.isActive !== false && (
                      <View style={styles.activeDotBadge}>
                        <View style={styles.activeDot} />
                        <Text style={styles.activeDotText}>Active</Text>
                      </View>
                    )}
                  </View>

                  {onEditPress && (
                    <TouchableOpacity
                      style={[styles.editButton, { borderColor: theme.palette.divider }]}
                      onPress={() => onEditPress(loc)}
                      activeOpacity={0.7}
                    >
                      <Icon name="edit-2" type="feather" size={12} color={theme.palette.text.secondary} />
                      <Text style={[styles.editButtonText, { color: theme.palette.text.secondary }]}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Location Name */}
                <Text style={[styles.locationNameText, { color: theme.palette.text.primary }]}>{loc.locationName}</Text>

                {/* Details Row: Geofence radius, Distance to office, coordinates */}
                <View style={styles.detailsRow}>
                  {/* Geofence Radius */}
                  <View style={styles.detailPill}>
                    <Icon name="disc" type="feather" size={11} color={theme.palette.text.secondary} />
                    <Text style={[styles.detailPillText, { color: theme.palette.text.secondary }]}>
                      Radius: {radiusDisplay}
                    </Text>
                  </View>

                  {/* Distance Km */}
                  {loc.distanceKm != null && Number(loc.distanceKm) > 0 && (
                    <View style={styles.detailPill}>
                      <Icon name="navigation" type="feather" size={11} color={theme.palette.text.secondary} />
                      <Text style={[styles.detailPillText, { color: theme.palette.text.secondary }]}>
                        {loc.distanceKm} km to office
                      </Text>
                    </View>
                  )}

                  {/* Coordinates if available */}
                  {loc.latitude && loc.longitude && (
                    <View style={styles.detailPill}>
                      <Icon name="crosshair" type="feather" size={11} color={theme.palette.text.secondary} />
                      <Text style={[styles.detailPillText, { color: theme.palette.text.secondary }]} numberOfLines={1}>
                        {String(loc.latitude).slice(0, 7)}, {String(loc.longitude).slice(0, 7)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Bottom Pagination Bar: Rows Per Page (Left), Page X of Y (Center), Prev/Next (Right) */}
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
    textAlign: "center",
    maxWidth: 240
  },
  itemsContainer: {
    gap: 10
  },
  locationItemCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 6
  },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "800"
  },
  activeDotBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A"
  },
  activeDotText: {
    fontSize: 10.5,
    color: "#16A34A",
    fontWeight: "600"
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  editButtonText: {
    fontSize: 11,
    fontWeight: "600"
  },
  locationNameText: {
    fontSize: 13.5,
    fontWeight: "700"
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap"
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
  }
});
