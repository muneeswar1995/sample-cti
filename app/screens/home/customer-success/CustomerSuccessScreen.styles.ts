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
      paddingBottom: isTablet ? 60 : 40,
      gap: isSmall ? 12 : 16,
      maxWidth: isTablet ? 1120 : '100%',
      width: '100%',
      alignSelf: 'center',
    },

    // ==========================================
    // ENTERPRISE WELCOME CONTEXT BANNER
    // ==========================================
    welcomeBanner: {
      borderRadius: isSmall ? 16 : 18,
      padding: isSmall ? 12 : 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      ...Platform.select({
        ios: { shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
        android: { elevation: 2 },
      }),
    },
    welcomeBannerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isSmall ? 10 : 12,
      flex: 1,
      minWidth: 0,
    },
    welcomeAvatarCircle: {
      width: isSmall ? 40 : 46,
      height: isSmall ? 40 : 46,
      borderRadius: isSmall ? 20 : 23,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.8,
      borderColor: theme.palette.primary.main,
      backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
      flexShrink: 0,
    },
    welcomeAvatarText: {
      fontSize: isSmall ? 16 : 18,
      fontWeight: '800',
      color: theme.palette.primary.main,
    },
    welcomeGreeting: {
      fontSize: isSmall ? 15 : 16.5,
      fontWeight: '800',
      color: isDark ? '#F8FAFC' : '#0F172A',
      letterSpacing: -0.3,
    },
    welcomeSubtextRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
    },
    welcomeSubtext: {
      fontSize: isSmall ? 11 : 12,
      color: theme.palette.text.secondary,
      fontWeight: '500',
    },
    welcomeBannerRight: {
      alignItems: 'flex-end',
      flexShrink: 0,
    },
    onDutyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#BBF7D0',
    },
    onDutyDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: '#16A34A',
    },
    onDutyText: {
      fontSize: isSmall ? 10.5 : 11.5,
      fontWeight: '700',
      color: isDark ? '#4ADE80' : '#15803D',
    },

    // ==========================================
    // HERO: ENTERPRISE FIELD DISPATCH CONSOLE
    // ==========================================
    statusCard: {
      borderRadius: isSmall ? 18 : 22,
      padding: isSmall ? 16 : 20,
      borderWidth: 1.2,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      gap: isSmall ? 12 : 16,
      ...Platform.select({
        ios: { shadowColor: '#475569', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16 },
        android: { elevation: 3 },
      }),
    },
    dispatchConsoleTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    dispatchTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 3.5,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
    },
    dispatchTagText: {
      fontSize: isSmall ? 10 : 11,
      fontWeight: '800',
      color: isDark ? '#93C5FD' : '#2563EB',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    gpsStatusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3.5,
      borderRadius: 8,
      backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
    },
    gpsStatusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#10B981',
    },
    gpsStatusText: {
      fontSize: isSmall ? 10 : 11,
      fontWeight: '600',
      color: isDark ? '#94A3B8' : '#64748B',
    },
    heroContent: {
      alignItems: 'center',
      textAlign: 'center',
      gap: 6,
      paddingVertical: isSmall ? 6 : 8,
      maxWidth: isTablet ? 640 : '100%',
      alignSelf: 'center',
    },
    heroIconCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
      marginBottom: 4,
    },
    heroTitle: {
      fontSize: isSmall ? 16 : 18,
      fontWeight: '800',
      color: isDark ? '#F8FAFC' : '#0F172A',
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    heroSubtitle: {
      fontSize: isSmall ? 12 : 13,
      color: theme.palette.text.secondary,
      textAlign: 'center',
      lineHeight: 18,
      paddingHorizontal: isSmall ? 4 : 12,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: isSmall ? 46 : 50,
      borderRadius: 14,
      gap: 8,
      marginTop: 4,
      maxWidth: isTablet ? 340 : '100%',
      width: '100%',
      alignSelf: 'center',
      backgroundColor: theme.palette.primary.main,
      ...Platform.select({
        ios: { shadowColor: theme.palette.primary.main, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
        android: { elevation: 4 },
      }),
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: isSmall ? 14 : 15,
      fontWeight: '800',
      letterSpacing: 0.2,
    },

    // ==========================================
    // HERO: LIVE MISSION CONTROL COCKPIT (ACTIVE TRIP)
    // ==========================================
    activeTripCard: {
      borderRadius: isSmall ? 18 : 22,
      padding: isSmall ? 14 : 18,
      borderWidth: 1.8,
      borderColor: theme.palette.primary.main,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      gap: isSmall ? 12 : 14,
      ...Platform.select({
        ios: { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16 },
        android: { elevation: 4 },
      }),
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    activeStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: isSmall ? 8 : 10,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#BBF7D0',
    },
    pulsingDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: '#16A34A',
    },
    activeStatusText: {
      fontSize: isSmall ? 10 : 11,
      fontWeight: '800',
      color: isDark ? '#4ADE80' : '#15803D',
      letterSpacing: 0.6,
    },
    startTimeText: {
      fontSize: isSmall ? 11 : 12,
      fontWeight: '600',
      color: theme.palette.text.secondary,
    },
    routeContainer: {
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
      borderRadius: 14,
      padding: isSmall ? 10 : 12,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
    },
    routeRowResponsive: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    routeRowResponsiveSmall: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 8,
    },
    routeLocationBox: {
      flex: 1,
      minWidth: 0,
    },
    routeArrowBox: {
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    routeArrowBoxSmall: {
      alignSelf: 'center',
      paddingVertical: 2,
    },
    dotFrom: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: theme.palette.primary.main,
      backgroundColor: '#FFFFFF',
    },
    dotTo: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#10B981',
    },
    locationLabel: {
      fontSize: 9.5,
      fontWeight: '800',
      letterSpacing: 0.6,
      marginBottom: 2,
      textTransform: 'uppercase',
    },
    locationValue: {
      fontSize: isSmall ? 13 : 14,
      fontWeight: '700',
    },
    geofenceWarningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
      borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FECACA',
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
    },
    geofenceWarningText: {
      fontSize: isSmall ? 10.5 : 11,
      fontWeight: '600',
      color: '#DC2626',
      flex: 1,
    },
    actionButtonsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isSmall ? 8 : 10,
    },
    cancelTripButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: isSmall ? 44 : 48,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.palette.error.main,
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : '#FEF2F2',
      gap: 6,
    },
    cancelTripButtonText: {
      fontSize: isSmall ? 12.5 : 13.5,
      fontWeight: '700',
      color: theme.palette.error.main,
    },
    completeTripButton: {
      flex: 1.3,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: isSmall ? 44 : 48,
      borderRadius: 12,
      gap: 6,
      backgroundColor: '#10B981',
      ...Platform.select({
        ios: { shadowColor: '#10B981', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 8 },
        android: { elevation: 3 },
      }),
    },
    completeTripButtonText: {
      color: '#FFFFFF',
      fontSize: isSmall ? 12.5 : 13.5,
      fontWeight: '800',
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
    kpiIconBox: {
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
    kpiAddBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: isSmall ? 9 : 12,
      paddingVertical: isSmall ? 6 : 7,
      borderRadius: 10,
      backgroundColor: theme.palette.primary.main,
    },
    kpiAddBtnText: {
      fontSize: isSmall ? 12 : 12.5,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    kpiBadge: {
      paddingHorizontal: isSmall ? 7 : 9,
      paddingVertical: isSmall ? 3.5 : 4.5,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE',
    },
    kpiBadgeText: {
      fontSize: isSmall ? 10.5 : 11.5,
      fontWeight: '800',
      color: isDark ? '#93C5FD' : '#1D4ED8',
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
    kpiStatsRow: {
      flexDirection: 'row',
      gap: isSmall ? 6 : 8,
      marginBottom: isSmall ? 8 : 12,
    },
    kpiStatPill: {
      flex: 1,
      paddingVertical: isSmall ? 11 : 13,
      paddingHorizontal: isSmall ? 4 : 8,
      borderRadius: 14,
      borderWidth: 1.2,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: isSmall ? 66 : 74,
    },
    kpiStatVal: {
      fontSize: isSmall ? 22 : 25,
      fontWeight: '800',
      marginBottom: 3,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    kpiStatDotLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isSmall ? 3 : 5,
    },
    kpiDot: {
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
    // SUBSCREEN HEADER
    // ==========================================
    subScreenHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: isSmall ? 12 : isTablet ? 24 : 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#334155' : '#E2E8F0',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      maxWidth: isTablet ? 1120 : '100%',
      width: '100%',
      alignSelf: 'center',
    },
    subScreenTitle: {
      fontSize: isSmall ? 15.5 : 17,
      fontWeight: '800',
      color: isDark ? '#F8FAFC' : '#0F172A',
    },
    subScreenSubtitle: {
      fontSize: isSmall ? 11 : 12,
      marginTop: 2,
      color: theme.palette.text.secondary,
    },
    createTaskHeaderBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: isSmall ? 10 : 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: theme.palette.primary.main,
    },
    createTaskHeaderBtnText: {
      color: '#FFFFFF',
      fontSize: isSmall ? 11.5 : 12.5,
      fontWeight: '700',
    },

    // ==========================================
    // ENTERPRISE MODALS
    // ==========================================
    modalOverlay: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(11, 17, 32, 0.85)' : 'rgba(15, 23, 42, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: isSmall ? 16 : 20,
    },
    keyboardAvoidingContainer: {
      width: '100%',
      maxWidth: 480,
      alignSelf: 'center',
      justifyContent: 'center',
    },
    modalContent: {
      borderRadius: 22,
      padding: isSmall ? 18 : 22,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      gap: 12,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.25,
      shadowRadius: 36,
    },
    addTaskModalCard: {
      width: '100%',
      maxWidth: 480,
      alignSelf: 'center',
      borderRadius: 22,
      padding: isSmall ? 18 : 22,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      gap: 10,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.25,
      shadowRadius: 36,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    modalAlertIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalTitle: {
      fontSize: isSmall ? 16 : 18,
      fontWeight: '800',
      color: isDark ? '#F8FAFC' : '#0F172A',
      letterSpacing: -0.3,
    },
    modalSubtitle: {
      fontSize: isSmall ? 11.5 : 12.5,
      marginTop: 2,
      color: theme.palette.text.secondary,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '700',
      marginTop: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      color: isDark ? '#CBD5E1' : '#475569',
    },
    remarkInput: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#CBD5E1',
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
      color: isDark ? '#F8FAFC' : '#0F172A',
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 13,
      height: 80,
    },
    modalTextInput: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#CBD5E1',
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
      color: isDark ? '#F8FAFC' : '#0F172A',
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 13.5,
    },
    modalActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 10,
    },
    modalSecondaryBtn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#CBD5E1',
      backgroundColor: isDark ? '#334155' : '#F1F5F9',
    },
    modalSecondaryBtnText: {
      fontSize: isSmall ? 12.5 : 13.5,
      fontWeight: '700',
      color: isDark ? '#F8FAFC' : '#475569',
    },
    modalPrimaryBtn: {
      flex: 1.2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 44,
      borderRadius: 12,
      gap: 6,
      backgroundColor: theme.palette.primary.main,
    },
    modalPrimaryBtnText: {
      color: '#FFFFFF',
      fontSize: isSmall ? 12.5 : 13.5,
      fontWeight: '700',
    },
    modalDangerBtn: {
      flex: 1.2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 46,
      borderRadius: 12,
      gap: 6,
      backgroundColor: '#DC2626',
    },
    modalDangerBtnText: {
      color: '#FFFFFF',
      fontSize: isSmall ? 13 : 14,
      fontWeight: '700',
    },

    // Preserved for components
    loadingCard: {
      padding: isSmall ? 24 : 32,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.palette.text.secondary,
    },
    userBadgePill: {},
    userBadgeDot: {},
    userBadgeText: {},
    routeRow: {},
    routeIconCol: {},
    dashedLine: {},
    routeTextCol: {},
    kpiCardFooter: {},
    kpiLinkBtn: {},
    kpiLinkText: {},
    infoCard: {},
    infoCardHeader: {},
    infoCardTitle: {},
    infoCardDesc: {},
  });
};
