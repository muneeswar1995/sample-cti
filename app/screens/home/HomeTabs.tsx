import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useAuth } from "@/context";
import { useTheme } from "@/lib/appTheme";
import { isManagerRole } from "@/utils/roles";

import AppHeader from "@/components/AppHeader";
import BottomNavigation, { type TabKey } from "@/components/BottomNavigation";

import ManagerScreen from "./manager/ManagerScreen";
import LocationScreen from "./manager/LocationScreen";
import UsersScreen from "./manager/UsersScreen";
import ProfileScreen from "./manager/ProfileScreen";
import CustomerSuccessScreen from "./customer-success/CustomerSuccessScreen";

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1
  }
});

function AuthorizedTabContent({
  activeTab,
  isManager,
  onTabChange
}: {
  activeTab: TabKey;
  isManager: boolean;
  onTabChange: (tab: TabKey) => void;
}) {
  if (isManager) {
    switch (activeTab) {
      case "users":
        return <UsersScreen />;
      case "location":
        return <LocationScreen />;
      case "profile":
        return <ProfileScreen />;
      case "team":
      default:
        return <ManagerScreen activeTab={activeTab} />;
    }
  }
  switch (activeTab) {
    case "profile":
      return <ProfileScreen />;
    case "tasks":
      return <CustomerSuccessScreen activeTab="tasks" onTabChange={onTabChange} />;
    case "myTrips":
      return <CustomerSuccessScreen activeTab="myTrips" onTabChange={onTabChange} />;
    case "team":
    default:
      return <CustomerSuccessScreen activeTab="team" onTabChange={onTabChange} />;
  }
}

export default function HomeTabsScreen() {
  const { theme } = useTheme();
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("team");

  const isManager = useMemo(() => isManagerRole(role), [role]);

  const currentTab = useMemo(() => {
    if (!isManager && (activeTab === "users" || activeTab === "location")) {
      return "team";
    }
    if (isManager && (activeTab === "myTrips" || activeTab === "tasks")) {
      return "team";
    }
    return activeTab;
  }, [activeTab, isManager]);

  return (
    <View style={[styles.container, { backgroundColor: theme.palette.background.default }]}>
      <AppHeader />
      <View style={styles.content}>
        <AuthorizedTabContent activeTab={currentTab} isManager={isManager} onTabChange={setActiveTab} />
      </View>
      <BottomNavigation activeTab={currentTab} onTabChange={setActiveTab} />
    </View>
  );
}
