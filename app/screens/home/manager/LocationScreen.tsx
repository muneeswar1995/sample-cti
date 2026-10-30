import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@/lib/appTheme';
import { Icon } from '@/lib/layout';
import { usePostLocation } from './Functions';
import { LocationsListSection } from '@/components/LocationsListSection';
import { getCurrentGPSPosition } from '@/utils/location';
import { showToast } from '@/utils/ShowToast';

export default function LocationScreen() {
  const { theme } = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'HOSPITAL' | 'OFFICE' | 'HOME'>('HOSPITAL');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('150');
  const [distance, setDistance] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [postLocation, { isLoading: saving }] = usePostLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 600);
  }, []);

  const handleOpenAdd = () => {
    setEditingLocation(null);
    setName('');
    setType('HOSPITAL');
    setLatitude('');
    setLongitude('');
    setRadius('150');
    setDistance('');
    setModalVisible(true);
  };

  const handleOpenEdit = (loc: any) => {
    setEditingLocation(loc);
    setName(loc.locationName || '');
    const rawType = (loc.locationType || 'HOSPITAL').toUpperCase();
    setType(rawType === 'OFFICE' || rawType === 'HOME' ? rawType : 'HOSPITAL');
    setLatitude(loc.latitude ? String(loc.latitude) : '');
    setLongitude(loc.longitude ? String(loc.longitude) : '');
    setRadius(String(loc.radiusMeter ?? '150'));
    setDistance(loc.distanceKm != null ? String(loc.distanceKm) : '');
    setModalVisible(true);
  };

  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const pos = await getCurrentGPSPosition();
      setLatitude(String(pos.latitude));
      setLongitude(String(pos.longitude));
      showToast('Live GPS coordinates captured!', 'success');
    } catch (err: any) {
      Alert.alert('GPS Location Error', err?.message || 'Could not fetch current GPS coordinates.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter a Location Name.');
      return;
    }
    if (!latitude.trim() || !longitude.trim()) {
      Alert.alert('Required Coordinates', 'Please enter Latitude and Longitude values (or tap "Use Current Location").');
      return;
    }

    const latNum = parseFloat(latitude.trim());
    const lngNum = parseFloat(longitude.trim());
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      Alert.alert('Invalid Latitude', 'Latitude must be a valid number between -90 and 90.');
      return;
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      Alert.alert('Invalid Longitude', 'Longitude must be a valid number between -180 and 180.');
      return;
    }

    try {
      await postLocation({
        ...(editingLocation?.id ? { id: editingLocation.id } : {}),
        locationName: name.trim(),
        locationType: type,
        latitude: latitude.trim(),
        longitude: longitude.trim(),
        radiusMeter: Number(radius) || 150,
        distanceKm: distance ? Number(distance) : undefined,
        isActive: true,
      });

      showToast(editingLocation ? 'Location updated successfully!' : 'Location added successfully!', 'success');
      setModalVisible(false);
      setEditingLocation(null);
      setName('');
      setType('HOSPITAL');
      setLatitude('');
      setLongitude('');
      setRadius('150');
      setDistance('');
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.warn('Failed to save location:', err);
      Alert.alert('Error', err?.message || 'Failed to save location.');
    }
  };

  const s = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
        header: {
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: isDark ? '#1E293B' : '#fff',
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#334155' : '#E2E8F0',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        headerLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        },
        headerTitle: { fontSize: 16, fontWeight: '700', color: theme.palette.text.primary },
        addBtn: {
          backgroundColor: theme.palette.primary.main,
          borderRadius: 8,
          paddingHorizontal: 14,
          paddingVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
        addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
        content: { padding: 16, paddingBottom: 40 },

        // Modal
        overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
        sheet: {
          backgroundColor: isDark ? '#1E293B' : '#fff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
          maxHeight: '90%',
        },
        sheetHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        },
        sheetTitle: { fontSize: 17, fontWeight: '700', color: theme.palette.text.primary },
        label: { fontSize: 12, fontWeight: '600', color: theme.palette.text.secondary, marginBottom: 5 },
        input: {
          borderWidth: 1,
          borderColor: isDark ? '#334155' : '#E2E8F0',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 14,
          color: theme.palette.text.primary,
          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
          marginBottom: 12,
        },
        typeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
        typeBtn: {
          flex: 1,
          paddingVertical: 9,
          borderRadius: 8,
          borderWidth: 1,
          alignItems: 'center',
        },
        typeBtnText: { fontSize: 12.5, fontWeight: '600' },
        coordHeaderRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        },
        gpsPillBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 6,
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.1)',
        },
        gpsPillText: {
          fontSize: 11,
          fontWeight: '700',
          color: theme.palette.primary.main,
        },
        coordInputsRow: {
          flexDirection: 'row',
          gap: 10,
        },
        coordCol: {
          flex: 1,
        },
        saveBtn: {
          backgroundColor: theme.palette.primary.main,
          borderRadius: 10,
          paddingVertical: 13,
          alignItems: 'center',
          marginTop: 8,
        },
        saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
        cancelBtn: { alignItems: 'center', marginTop: 12, paddingVertical: 4 },
        cancelBtnText: { color: theme.palette.text.secondary, fontSize: 13, fontWeight: '500' },
      }),
    [isDark, theme]
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerTitle}>Locations Directory</Text>
        </View>

        <TouchableOpacity
          style={s.addBtn}
          onPress={handleOpenAdd}
          activeOpacity={0.8}
        >
          <Icon name="plus" type="feather" size={14} color="#fff" />
          <Text style={s.addBtnText}>Add Location</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
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
          key={refreshKey}
          onAddPress={handleOpenAdd}
          onEditPress={handleOpenEdit}
        />
      </ScrollView>

      {/* Add / Edit Location Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.overlay}
        >
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>{editingLocation ? 'Edit Location' : 'Add Location'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="x" type="feather" size={20} color={theme.palette.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={s.label}>Location Name *</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Apollo Jubilee Hills"
                placeholderTextColor={theme.palette.text.secondary}
              />

              <Text style={s.label}>Location Type</Text>
              <View style={s.typeRow}>
                {(['HOSPITAL', 'OFFICE', 'HOME'] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      s.typeBtn,
                      {
                        backgroundColor: type === t ? theme.palette.primary.main : 'transparent',
                        borderColor: type === t ? theme.palette.primary.main : (isDark ? '#334155' : '#E2E8F0'),
                      },
                    ]}
                    onPress={() => setType(t)}
                  >
                    <Text
                      style={[
                        s.typeBtnText,
                        { color: type === t ? '#fff' : theme.palette.text.secondary },
                      ]}
                    >
                      {t === 'HOSPITAL' ? 'Hospital' : t === 'OFFICE' ? 'Office' : 'Home'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Coordinates Section with GPS auto-detect */}
              <View style={s.coordHeaderRow}>
                <Text style={s.label}>GPS Coordinates (Latitude & Longitude) *</Text>
                <TouchableOpacity
                  style={s.gpsPillBtn}
                  onPress={handleUseCurrentLocation}
                  disabled={isGettingLocation}
                  activeOpacity={0.7}
                >
                  {isGettingLocation ? (
                    <ActivityIndicator size="small" color={theme.palette.primary.main} />
                  ) : (
                    <>
                      <Icon name="crosshair" type="feather" size={12} color={theme.palette.primary.main} />
                      <Text style={s.gpsPillText}>Use Current GPS</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={s.coordInputsRow}>
                <View style={s.coordCol}>
                  <TextInput
                    style={s.input}
                    value={latitude}
                    onChangeText={setLatitude}
                    keyboardType="numeric"
                    placeholder="Latitude (e.g. 17.4435)"
                    placeholderTextColor={theme.palette.text.secondary}
                  />
                </View>
                <View style={s.coordCol}>
                  <TextInput
                    style={s.input}
                    value={longitude}
                    onChangeText={setLongitude}
                    keyboardType="numeric"
                    placeholder="Longitude (e.g. 78.3845)"
                    placeholderTextColor={theme.palette.text.secondary}
                  />
                </View>
              </View>

              <Text style={s.label}>Radius (meters)</Text>
              <TextInput
                style={s.input}
                value={radius}
                onChangeText={setRadius}
                keyboardType="numeric"
                placeholder="150"
                placeholderTextColor={theme.palette.text.secondary}
              />

              <Text style={s.label}>Distance (km to office, optional)</Text>
              <TextInput
                style={s.input}
                value={distance}
                onChangeText={setDistance}
                keyboardType="numeric"
                placeholder="e.g. 12"
                placeholderTextColor={theme.palette.text.secondary}
              />

              <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.saveBtnText}>{editingLocation ? 'Update Location' : 'Save Location'}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisible(false)} style={s.cancelBtn}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
