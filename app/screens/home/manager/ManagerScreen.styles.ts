import { Dimensions, Platform, StyleSheet } from 'react-native';
import type { Theme } from '@/lib/appTheme';

export interface ResponsiveDimensions {
  width?: number;
  height?: number;
  isSmallDevice?: boolean;
  isTablet?: boolean;
}

export const getStyles = (theme: Theme, responsive?: ResponsiveDimensions) => {
  const isDark = theme.palette.mode === 'dark';
  const windowWidth = responsive?.width ?? Dimensions.get('window').width;
  const isSmall = responsive?.isSmallDevice ?? (windowWidth < 375);
  const isTablet = responsive?.isTablet ?? (windowWidth >= 768);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0B1120' : '#F8FAFC',
    },
    scrollContent: {
      padding: isSmall ? 12 : isTablet ? 24 : 16,
      gap: isSmall ? 12 : 16,
      paddingBottom: isTablet ? 80 : 60,
      maxWidth: isTablet ? 1120 : '100%',
      width: '100%',
      alignSelf: 'center',
    },

    // ==========================================
    // ENTERPRISE EXECUTIVE CONTEXT RIBBON
    // ==========================================
    enterpriseRibbon: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: 18,
      padding: isSmall ? 12 : 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      ...Platform.select({
        ios: { shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
        android: { elevation: 2 },
      }),
    },
    enterpriseRibbonLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isSmall ? 10 : 12,
      flex: 1,
      minWidth: 0,
    },
    enterpriseAvatar: {
      width: isSmall ? 40 : 44,
      height: isSmall ? 40 : 44,
      borderRadius: isSmall ? 20 : 22,
      backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: theme.palette.primary.main,
      flexShrink: 0,
    },
    enterpriseAvatarText: {
      fontSize: isSmall ? 15 : 16,
      fontWeight: '800',
      color: theme.palette.primary.main,
    },
    enterpriseMemberName: {
      fontSize: isSmall ? 14 : 15.5,
      fontWeight: '800',
      color: isDark ? '#F8FAFC' : '#0F172A',
      letterSpacing: -0.3,
    },
    enterpriseMemberRoleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
    },
    enterpriseStatusDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
    },
    enterpriseStatusText: {
      fontSize: isSmall ? 11 : 12,
      fontWeight: '600',
    },
    enterpriseRibbonRight: {
      alignItems: 'flex-end',
      flexShrink: 0,
    },
    teamCountBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 20,
      backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
    },
    teamCountBadgeText: {
      fontSize: isSmall ? 10.5 : 11.5,
      fontWeight: '700',
      color: isDark ? '#94A3B8' : '#64748B',
    },

    // ==========================================
    // TEAM SELECTOR CAROUSEL
    // ==========================================
    teamSelectorWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: isSmall ? 2 : 4,
    },
    teamMemberCard: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      borderRadius: 16,
      padding: isSmall ? 9 : 11,
      flexDirection: 'row',
      alignItems: 'center',
      gap: isSmall ? 8 : 10,
      marginRight: isSmall ? 8 : 10,
      minWidth: isSmall ? 145 : isTablet ? 185 : 165,
      ...Platform.select({
        ios: { shadowColor: '#64748B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8 },
        android: { elevation: 2 },
      }),
    },
    teamMemberCardActive: {
      borderColor: theme.palette.primary.main,
      borderWidth: 1.8,
      backgroundColor: isDark ? 'rgba(37, 99, 235, 0.12)' : '#F0F9FF',
    },
    memberAvatar: {
      width: isSmall ? 32 : 36,
      height: isSmall ? 32 : 36,
      borderRadius: isSmall ? 16 : 18,
      backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    memberAvatarActive: {
      backgroundColor: theme.palette.primary.main,
    },
    memberAvatarText: {
      fontSize: isSmall ? 12 : 13.5,
      fontWeight: '700',
      color: theme.palette.text.secondary,
    },
    memberAvatarTextActive: {
      color: '#FFFFFF',
    },
    memberName: {
      fontSize: isSmall ? 13 : 14,
      fontWeight: '700',
      color: isDark ? '#F8FAFC' : '#0F172A',
      marginBottom: 2,
    },
    memberStatus: {
      fontSize: isSmall ? 10.5 : 11,
      fontWeight: '600',
      color: theme.palette.text.secondary,
    },
    memberStatusActive: {
      color: theme.palette.primary.main,
    },

    // ==========================================
    // ENTERPRISE DASHBOARD KPI CARDS
    // ==========================================
    kpiCardsRowTablet: {
      flexDirection: 'row',
      gap: 16,
      alignItems: 'stretch',
    },
    kpiCard: {
      flex: isTablet ? 1 : undefined,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: isSmall ? 18 : 22,
      padding: isSmall ? 14 : 18,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      ...Platform.select({
        ios: { shadowColor: '#475569', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16 },
        android: { elevation: 3 },
      }),
    },
    kpiCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: isSmall ? 12 : 14,
      gap: 8,
    },
    kpiCardHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isSmall ? 9 : 12,
      flex: 1,
      minWidth: 0,
    },
    kpiIconContainer: {
      width: isSmall ? 38 : 42,
      height: isSmall ? 38 : 42,
      borderRadius: isSmall ? 11 : 13,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    kpiCardTitle: {
      fontSize: isSmall ? 14.5 : 16,
      fontWeight: '800',
      color: isDark ? '#F8FAFC' : '#0F172A',
      letterSpacing: -0.3,
    },
    kpiCardSubtitle: {
      fontSize: isSmall ? 11 : 12,
      color: theme.palette.text.secondary,
      marginTop: 2,
      fontWeight: '500',
    },
    kpiCardHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isSmall ? 5 : 8,
      flexShrink: 0,
    },
    kpiQuickActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: isSmall ? 9 : 12,
      paddingVertical: isSmall ? 6 : 7,
      borderRadius: 10,
      backgroundColor: theme.palette.primary.main,
    },
    kpiQuickActionText: {
      fontSize: isSmall ? 12 : 12.5,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    kpiTotalBadge: {
      paddingHorizontal: isSmall ? 7 : 9,
      paddingVertical: isSmall ? 3.5 : 4.5,
      borderRadius: 12,
    },
    kpiTotalBadgeText: {
      fontSize: isSmall ? 10.5 : 11.5,
      fontWeight: '800',
    },
    kpiDateBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
    },
    kpiDateBadgeText: {
      fontSize: isSmall ? 10 : 11,
      fontWeight: '700',
      color: isDark ? '#93C5FD' : '#2563EB',
    },

    // ==========================================
    // PROGRESS VELOCITY TRACK
    // ==========================================
    progressVelocityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    progressVelocityLabel: {
      fontSize: isSmall ? 10.5 : 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      color: theme.palette.text.secondary,
    },
    progressVelocityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
    },
    progressVelocityBadgeText: {
      fontSize: isSmall ? 10.5 : 11,
      fontWeight: '800',
      color: isDark ? '#6EE7B7' : '#059669',
    },
    kpiProgressTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? '#0F172A' : '#E2E8F0',
      flexDirection: 'row',
      overflow: 'hidden',
      marginBottom: isSmall ? 12 : 14,
    },
    kpiProgressFillDone: {
      backgroundColor: '#10B981',
      height: '100%',
    },
    kpiProgressFillInProgress: {
      backgroundColor: '#3B82F6',
      height: '100%',
    },
    kpiProgressFillTodo: {
      backgroundColor: '#F59E0B',
      height: '100%',
    },

    // ==========================================
    // ENTERPRISE STAT TILES (3-COLUMN SEGMENTS)
    // ==========================================
    kpiStatsGrid: {
      flexDirection: 'row',
      gap: isSmall ? 6 : 8,
      marginBottom: isSmall ? 8 : 12,
    },
    kpiStatBox: {
      flex: 1,
      paddingVertical: isSmall ? 11 : 13,
      paddingHorizontal: isSmall ? 4 : 8,
      borderRadius: 14,
      borderWidth: 1.2,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: isSmall ? 66 : 74,
    },
    kpiStatNumber: {
      fontSize: isSmall ? 22 : 25,
      fontWeight: '800',
      marginBottom: 3,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    kpiStatLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isSmall ? 3 : 5,
    },
    kpiStatDot: {
      width: isSmall ? 6 : 7,
      height: isSmall ? 6 : 7,
      borderRadius: 3.5,
    },
    kpiStatLabel: {
      fontSize: isSmall ? 11 : 12,
      fontWeight: '700',
      textAlign: 'center',
    },

    // ==========================================
    // ENTERPRISE SPOTLIGHT DISPATCH RADAR
    // ==========================================
    kpiSpotlightCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: isSmall ? 11 : 13,
      paddingVertical: isSmall ? 9 : 11,
      borderRadius: 14,
      borderWidth: 1.2,
      marginTop: 6,
      gap: 8,
    },
    kpiSpotlightLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      flex: 1,
      minWidth: 0,
    },
    kpiSpotlightDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      flexShrink: 0,
    },
    kpiSpotlightTag: {
      fontSize: isSmall ? 9.5 : 10.5,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    kpiSpotlightTitle: {
      fontSize: isSmall ? 12.5 : 13.5,
      fontWeight: '700',
      marginTop: 2,
    },

    // ==========================================
    // SUBSCREEN TOP BAR
    // ==========================================
    detailTopBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: isSmall ? 12 : isTablet ? 24 : 16,
      paddingVertical: 12,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#334155' : '#E2E8F0',
      maxWidth: isTablet ? 1120 : '100%',
      width: '100%',
      alignSelf: 'center',
    },
    detailBackBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: isSmall ? 8 : 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
    },
    detailBackBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.palette.text.primary,
    },
    detailTopTitleContainer: {
      flex: 1,
      marginHorizontal: 10,
      minWidth: 0,
    },
    detailTopTitle: {
      fontSize: isSmall ? 14 : 15.5,
      fontWeight: '800',
      color: isDark ? '#F8FAFC' : '#0F172A',
    },
    detailTopSubtitle: {
      fontSize: isSmall ? 10.5 : 11,
      color: theme.palette.text.secondary,
    },
    detailActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: isSmall ? 9 : 12,
      paddingVertical: 7,
      borderRadius: 8,
      backgroundColor: theme.palette.primary.main,
    },
    detailActionBtnText: {
      fontSize: isSmall ? 11.5 : 12.5,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // ==========================================
    // ENTERPRISE MODALS
    // ==========================================
    modalOverlay: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(11, 17, 32, 0.85)' : 'rgba(15, 23, 42, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isSmall ? 16 : 24,
    },
    modalContainer: {
      width: '100%',
      maxWidth: 480,
      alignSelf: 'center',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: 22,
      padding: isSmall ? 18 : 22,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.25, shadowRadius: 36 },
        android: { elevation: 12 },
      }),
    },
    modalTitle: {
      fontSize: isSmall ? 18 : 20,
      fontWeight: '800',
      color: isDark ? '#F8FAFC' : '#0F172A',
      marginBottom: 4,
      letterSpacing: -0.4,
    },
    modalSubtitle: {
      fontSize: isSmall ? 12.5 : 13.5,
      fontWeight: '500',
      color: theme.palette.text.secondary,
      marginBottom: isSmall ? 16 : 22,
    },
    inputLabel: {
      fontSize: 12.5,
      fontWeight: '700',
      color: isDark ? '#CBD5E1' : '#475569',
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    textInput: {
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#CBD5E1',
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: isSmall ? 11 : 13,
      fontSize: 14.5,
      color: isDark ? '#F8FAFC' : '#0F172A',
      marginBottom: isSmall ? 14 : 18,
    },
    dropdownButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#CBD5E1',
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: isSmall ? 11 : 13,
      marginBottom: isSmall ? 14 : 18,
    },
    dropdownButtonText: {
      fontSize: 14.5,
      color: isDark ? '#F8FAFC' : '#0F172A',
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: isSmall ? 10 : 14,
      marginTop: 10,
    },
    modalCancelBtn: {
      paddingHorizontal: isSmall ? 16 : 20,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: isDark ? '#334155' : '#F1F5F9',
    },
    modalCancelBtnText: {
      fontSize: 13.5,
      fontWeight: '700',
      color: isDark ? '#F8FAFC' : '#475569',
    },
    modalAssignBtn: {
      paddingHorizontal: isSmall ? 18 : 22,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: theme.palette.primary.main,
      ...Platform.select({
        ios: { shadowColor: theme.palette.primary.main, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
        android: { elevation: 4 },
      }),
    },
    modalAssignBtnText: {
      fontSize: 13.5,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // Legacy style keys preserved for sub-components
    header: { display: 'none' },
    headerContent: {},
    userInfoContainer: {},
    avatar: {},
    avatarText: {},
    userName: {},
    userRole: {},
    headerRight: {},
    dateText: {},
    logoutText: {},
    card: {},
    notificationHeader: {},
    notificationTitle: {},
    notificationRow: {},
    notificationTextContainer: {},
    notificationText: {},
    notificationTime: {},
    verifiedBox: {},
    verifiedText: {},
    statsRow: {},
    statBox: {},
    statLabel: {},
    statValue: {},
    statDesc: {},
    taskTitleClosed: {},
    taskComment: {},
    reopenBtn: {},
    reopenBtnText: {},
    sectionTitleRow: {},
    sectionTitle: {},
    sectionSubtitle: {},
    tripRow: {},
    tripRoute: {},
    tripTag: {},
    tripTagText: {},
    tripTime: {},
    tripTimeGray: {},
    actionButton: {},
    actionButtonText: {},
    taskSectionLabel: {},
    taskItem: {},
    taskTitle: {},
    taskIconBtn: {},
    emptyTaskText: {},
    locationsTitleRow: {},
    locationsTitle: {},
    locationsDesc: {},
    locationItemRow: {},
    locationNameContainer: {},
    locationName: {},
    locationTag: {},
    locationTagText: {},
    locationDistance: {},
    selectedAgentBanner: {},
    selectedAgentLeft: {},
    selectedAgentAvatar: {},
    selectedAgentAvatarText: {},
    selectedAgentName: {},
    selectedAgentSubtitle: {},
    statusBadgePill: {},
    statusBadgePillDot: {},
    statusBadgePillText: {},
    kpiStatsGrid4: {},
    kpiStatBoxCompact: {},
    kpiStatNumberCompact: {},
    kpiStatLabelRowCompact: {},
    kpiStatLabelCompact: {},
    kpiCardFooter: {},
    kpiViewDetailsBtn: {},
    kpiViewDetailsText: {},
  });
};
