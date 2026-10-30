import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { format, subDays, startOfMonth, endOfMonth, isValid, parseISO } from "date-fns";

import { useTheme } from "@/lib/appTheme";
import { Icon } from "@/lib/layout";

export interface CustomDateRangePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

export function CustomDateRangePickerModal({
  visible,
  onClose,
  onApply,
  initialStartDate = "",
  initialEndDate = ""
}: CustomDateRangePickerModalProps) {
  const { theme } = useTheme();
  const isDark = theme.palette.mode === "dark";

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [startDate, setStartDate] = useState<string>(initialStartDate || todayStr);
  const [endDate, setEndDate] = useState<string>(initialEndDate || todayStr);
  const [activeInput, setActiveInput] = useState<"START" | "END">("START");

  // Current viewed month for the calendar grid
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (initialStartDate && isValid(parseISO(initialStartDate))) {
      return parseISO(initialStartDate);
    }
    return new Date();
  });

  const handlePreset = (s: string, e: string) => {
    setStartDate(s);
    setEndDate(e);
  };

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Generate calendar days for viewDate month
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleDayPress = (dayNum: number) => {
    const dStr = format(new Date(year, month, dayNum), "yyyy-MM-dd");
    if (activeInput === "START") {
      setStartDate(dStr);
      if (endDate && dStr > endDate) {
        setEndDate(dStr);
      }
      setActiveInput("END");
    } else {
      if (startDate && dStr < startDate) {
        setStartDate(dStr);
        setEndDate(dStr);
      } else {
        setEndDate(dStr);
      }
    }
  };

  const handleApply = () => {
    onApply(startDate, endDate);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider
                }
              ]}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: isDark ? "#1E293B" : "rgba(59, 130, 246, 0.12)" }
                    ]}
                  >
                    <Icon name="calendar" type="feather" size={16} color={theme.palette.primary.main} />
                  </View>
                  <Text style={[styles.modalTitle, { color: theme.palette.text.primary }]}>
                    Select Custom Date Range
                  </Text>
                </View>

                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Icon name="x" type="feather" size={18} color={theme.palette.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Presets Row */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetsRow}
              >
                {[
                  { label: "Today", s: todayStr, e: todayStr },
                  {
                    label: "Yesterday",
                    s: format(subDays(new Date(), 1), "yyyy-MM-dd"),
                    e: format(subDays(new Date(), 1), "yyyy-MM-dd")
                  },
                  {
                    label: "Last 7 Days",
                    s: format(subDays(new Date(), 6), "yyyy-MM-dd"),
                    e: todayStr
                  },
                  {
                    label: "Last 30 Days",
                    s: format(subDays(new Date(), 29), "yyyy-MM-dd"),
                    e: todayStr
                  },
                  {
                    label: "This Month",
                    s: format(startOfMonth(new Date()), "yyyy-MM-dd"),
                    e: format(endOfMonth(new Date()), "yyyy-MM-dd")
                  }
                ].map((p) => {
                  const isSelected = startDate === p.s && endDate === p.e;
                  return (
                    <TouchableOpacity
                      key={p.label}
                      style={[
                        styles.presetChip,
                        isSelected && {
                          backgroundColor: theme.palette.primary.main,
                          borderColor: theme.palette.primary.main
                        }
                      ]}
                      onPress={() => handlePreset(p.s, p.e)}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          {
                            color: isSelected ? "#FFFFFF" : theme.palette.text.secondary
                          }
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Start & End Date Inputs */}
              <View style={styles.inputsRow}>
                <TouchableOpacity
                  style={[
                    styles.dateInputBox,
                    activeInput === "START" && {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: isDark ? "#1E293B" : "rgba(59, 130, 246, 0.05)"
                    }
                  ]}
                  onPress={() => setActiveInput("START")}
                >
                  <Text style={[styles.inputLabel, { color: theme.palette.text.secondary }]}>
                    Start Date
                  </Text>
                  <TextInput
                    style={[styles.dateTextInput, { color: theme.palette.text.primary }]}
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.palette.text.secondary}
                  />
                </TouchableOpacity>

                <View style={styles.inputArrow}>
                  <Icon name="arrow-right" type="feather" size={14} color={theme.palette.text.secondary} />
                </View>

                <TouchableOpacity
                  style={[
                    styles.dateInputBox,
                    activeInput === "END" && {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: isDark ? "#1E293B" : "rgba(59, 130, 246, 0.05)"
                    }
                  ]}
                  onPress={() => setActiveInput("END")}
                >
                  <Text style={[styles.inputLabel, { color: theme.palette.text.secondary }]}>
                    End Date
                  </Text>
                  <TextInput
                    style={[styles.dateTextInput, { color: theme.palette.text.primary }]}
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.palette.text.secondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Mini Interactive Month Calendar Grid */}
              <View
                style={[
                  styles.calendarContainer,
                  {
                    backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                    borderColor: theme.palette.divider
                  }
                ]}
              >
                {/* Month Navigation */}
                <View style={styles.monthNavRow}>
                  <TouchableOpacity onPress={handlePrevMonth} style={styles.navArrow}>
                    <Icon name="chevron-left" type="feather" size={16} color={theme.palette.text.primary} />
                  </TouchableOpacity>

                  <Text style={[styles.monthNavTitle, { color: theme.palette.text.primary }]}>
                    {format(viewDate, "MMMM yyyy")}
                  </Text>

                  <TouchableOpacity onPress={handleNextMonth} style={styles.navArrow}>
                    <Icon name="chevron-right" type="feather" size={16} color={theme.palette.text.primary} />
                  </TouchableOpacity>
                </View>

                {/* Day Headers: Sun, Mon, Tue... */}
                <View style={styles.daysHeaderRow}>
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <Text
                      key={i}
                      style={[styles.dayHeaderCell, { color: theme.palette.text.secondary }]}
                    >
                      {d}
                    </Text>
                  ))}
                </View>

                {/* Days Grid */}
                <View style={styles.daysGrid}>
                  {/* Empty cells before month start */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.dayCell} />
                  ))}

                  {/* Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dStr = format(new Date(year, month, dayNum), "yyyy-MM-dd");
                    const isStart = startDate === dStr;
                    const isEnd = endDate === dStr;
                    const inRange = startDate && endDate && dStr >= startDate && dStr <= endDate;
                    const isToday = dStr === todayStr;

                    return (
                      <TouchableOpacity
                        key={`day-${dayNum}`}
                        style={[
                          styles.dayCell,
                          inRange && {
                            backgroundColor: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)"
                          },
                          (isStart || isEnd) && {
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: 16
                          }
                        ]}
                        onPress={() => handleDayPress(dayNum)}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            { color: theme.palette.text.primary },
                            (isStart || isEnd) && { color: "#FFFFFF", fontWeight: "700" },
                            isToday && !isStart && !isEnd && { color: theme.palette.primary.main, fontWeight: "700" }
                          ]}
                        >
                          {dayNum}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.secondaryBtn, { borderColor: theme.palette.divider }]}
                  onPress={onClose}
                >
                  <Text style={[styles.secondaryBtnText, { color: theme.palette.text.secondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: theme.palette.primary.main }]}
                  onPress={handleApply}
                >
                  <Icon name="check" type="feather" size={15} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Apply Filter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    gap: 14,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  modalTitle: {
    fontSize: 14.5,
    fontWeight: "700"
  },
  presetsRow: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 2
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.2)"
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: "600"
  },
  inputsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  dateInputBox: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 2
  },
  dateTextInput: {
    fontSize: 12,
    paddingVertical: 0,
    fontWeight: "600"
  },
  inputArrow: {
    alignItems: "center",
    justifyContent: "center"
  },
  calendarContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 8
  },
  monthNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  navArrow: {
    padding: 4
  },
  monthNavTitle: {
    fontSize: 13,
    fontWeight: "700"
  },
  daysHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  dayHeaderCell: {
    width: 32,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700"
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  dayCell: {
    width: "14.28%",
    height: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  dayText: {
    fontSize: 12,
    fontWeight: "500"
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2
  },
  secondaryBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    borderRadius: 10,
    borderWidth: 1
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "600"
  },
  primaryBtn: {
    flex: 1.3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    borderRadius: 10,
    gap: 6
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700"
  }
});
