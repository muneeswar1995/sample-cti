import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/lib/appTheme';
import { Icon } from '@/lib/layout';

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  listContent: {
    padding: 16,
    paddingBottom: 100 // Avoid cutoff by bottom tab bar
  },
  logItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4
  },
  logTextContainer: {
    flex: 1,
    paddingRight: 12
  },
  logTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logTime: {
    fontSize: 12,
    marginLeft: 4
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18
  }
});

interface LogItem {
  id: string;
  title: string;
  timestamp: string;
  status: string;
}

interface LogsScreenProps {
  logs: LogItem[];
}

export default function LogsScreen({ logs }: LogsScreenProps) {
  const { theme } = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const themedContainerStyle = {
    backgroundColor: theme.palette.background.default
  };

  const themedItemStyle = {
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.divider,
    borderWidth: isDark ? 1 : 0,
    shadowColor: theme.palette.common.black
  };

  const primaryTextStyle = {
    color: theme.palette.text.primary
  };

  const secondaryTextStyle = {
    color: theme.palette.text.secondary
  };

  const renderItem = ({ item }: { item: LogItem }) => {
    const isError = item.status === 'Error';

    // Choose status badge color options based on theme error/success states
    const badgeBg = isError ? theme.palette.error.light : theme.palette.success.light;
    const badgeText = isError ? theme.palette.error.main : theme.palette.success.main;
    const badgeIcon = isError ? 'alert-triangle' : 'check-circle';

    return (
      <View style={[styles.logItem, themedItemStyle]}>
        <View style={styles.logTextContainer}>
          <Text style={[styles.logTitle, primaryTextStyle]}>{item.title}</Text>
          <View style={styles.timeRow}>
            <Icon name="clock" type="feather" size={12} color={theme.palette.text.secondary} />
            <Text style={[styles.logTime, secondaryTextStyle]}>{item.timestamp}</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
          <Icon name={badgeIcon} type="feather" size={11} color={badgeText} style={{ marginRight: 4 }} />
          <Text style={[styles.statusText, { color: badgeText }]}>
            {item.status}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, themedContainerStyle]}>
      {logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="inbox" type="feather" size={48} color={theme.palette.text.disabled} />
          <Text style={[styles.emptyTitle, primaryTextStyle]}>No System Logs</Text>
          <Text style={[styles.emptyText, secondaryTextStyle]}>
            Use the top right actions to generate or mock new log events.
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          bounces={true}
        />
      )}
    </View>
  );
}
