import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/lib/appTheme';
import { Icon } from '@/lib/layout';
import { useGetUsers, usePostRegisterUser } from './Functions';

export default function UsersScreen() {
  const { theme } = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // API hooks
  const [getUsers, { data: usersData, isLoading: usersLoading }] = useGetUsers();
  const [postRegisterUser, { isLoading: isRegistering }] = usePostRegisterUser();

  const getUsersRef = useRef(getUsers);
  getUsersRef.current = getUsers;

  // Modal State
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number>(4); // 4 = Employee, 3 = Manager

  // Stable fetch triggered on screen mount/focus
  useFocusEffect(
    useCallback(() => {
      getUsersRef.current({ is_all_users: true });
    }, [])
  );

  const onRefresh = useCallback(() => {
    getUsersRef.current({ is_all_users: true });
  }, []);

  const handleAddUser = async () => {
    if (!employeeId.trim() || !firstName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please fill in Employee ID, First Name, Email, and Password.');
      return;
    }

    try {
      await postRegisterUser({
        employee_id: employeeId.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
        mail_id: email.trim(),
        password: password.trim(),
        phone: phone.trim() || undefined,
        role_id: roleId,
      });

      setIsAddModalVisible(false);
      setEmployeeId('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setRoleId(4);

      getUsersRef.current({ is_all_users: true });
    } catch (err: any) {
      console.warn('Failed to add user:', err);
    }
  };

  const users: any[] = useMemo(() => {
    if (Array.isArray(usersData)) return usersData;
    if (Array.isArray(usersData?.data)) return usersData.data;
    if (Array.isArray(usersData?.data?.items)) return usersData.data.items;
    return [];
  }, [usersData]);

  const capitalize = (s: string) =>
    s?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') ?? s;

  const getInitials = (name: string) =>
    name?.split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('') ?? '?';

  const AVATAR_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

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
        countBadge: {
          backgroundColor: isDark ? '#334155' : '#EFF6FF',
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 3,
        },
        countText: { fontSize: 12, fontWeight: '700', color: theme.palette.primary.main },
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
        list: { padding: 14 },
        card: {
          backgroundColor: isDark ? '#1E293B' : '#fff',
          borderRadius: 12,
          padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: isDark ? '#334155' : '#E2E8F0',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        avatar: {
          width: 42,
          height: 42,
          borderRadius: 21,
          alignItems: 'center',
          justifyContent: 'center',
        },
        initials: { color: '#fff', fontSize: 14, fontWeight: '700' },
        name: { fontSize: 14, fontWeight: '600', color: theme.palette.text.primary },
        empId: { fontSize: 11, color: theme.palette.text.secondary, marginTop: 1, fontFamily: 'monospace' },
        role: { fontSize: 12, color: theme.palette.text.secondary, marginTop: 1 },
        statusDot: { width: 8, height: 8, borderRadius: 4 },
        right: { marginLeft: 'auto', alignItems: 'flex-end', gap: 6 },
        statusChip: {
          borderRadius: 6,
          paddingHorizontal: 8,
          paddingVertical: 3,
        },
        statusText: { fontSize: 10, fontWeight: '700' },
        empty: { textAlign: 'center', color: theme.palette.text.secondary, marginTop: 40, fontSize: 14 },
        loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

        // Modal Styles
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
          paddingVertical: 9,
          fontSize: 14,
          color: theme.palette.text.primary,
          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
          marginBottom: 12,
        },
        row: { flexDirection: 'row', gap: 10 },
        col: { flex: 1 },
        roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
        roleBtn: {
          flex: 1,
          paddingVertical: 9,
          borderRadius: 8,
          borderWidth: 1,
          alignItems: 'center',
        },
        roleBtnText: { fontSize: 13, fontWeight: '600' },
        saveBtn: {
          backgroundColor: theme.palette.primary.main,
          borderRadius: 10,
          paddingVertical: 13,
          alignItems: 'center',
          marginTop: 6,
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
          <Text style={s.headerTitle}>Team Members</Text>
          <View style={s.countBadge}>
            <Text style={s.countText}>{users.length} total</Text>
          </View>
        </View>

        <TouchableOpacity
          style={s.addBtn}
          onPress={() => setIsAddModalVisible(true)}
          activeOpacity={0.8}
        >
          <Icon name="user-plus" type="feather" size={14} color="#fff" />
          <Text style={s.addBtnText}>Add User</Text>
        </TouchableOpacity>
      </View>

      {usersLoading && users.length === 0 ? (
        <View style={s.loaderContainer}>
          <ActivityIndicator size="large" color={theme.palette.primary.main} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl
              refreshing={Boolean(usersLoading)}
              onRefresh={onRefresh}
              colors={[theme.palette.primary.main]}
              tintColor={theme.palette.primary.main}
            />
          }
        >
          {users.length === 0 ? (
            <Text style={s.empty}>No team members found.</Text>
          ) : (
            users.map((user: any, idx: number) => {
              const name = user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Employee';
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const isActive = user.isActive;
              return (
                <View key={user.id ?? idx} style={s.card}>
                  <View style={[s.avatar, { backgroundColor: avatarColor }]}>
                    <Text style={s.initials}>{getInitials(name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>{capitalize(name)}</Text>
                    {(user.employeeId || user.employee_id) && (
                      <Text style={s.empId}>{user.employeeId ?? user.employee_id}</Text>
                    )}
                    <Text style={s.role}>{capitalize(user.role?.roleName ?? user.userType ?? 'CS Associate')}</Text>
                  </View>
                  <View
                    style={[
                      s.statusChip,
                      {
                        backgroundColor: isActive ? '#F0FDF4' : '#F1F5F9',
                      },
                    ]}
                  >
                    <Text style={[s.statusText, { color: isActive ? '#16A34A' : '#64748B' }]}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Add User Modal */}
      <Modal visible={isAddModalVisible} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Add Team Member</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Icon name="x" type="feather" size={20} color={theme.palette.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.label}>Employee ID *</Text>
              <TextInput
                style={s.input}
                value={employeeId}
                onChangeText={setEmployeeId}
                placeholder="e.g. AH1009"
                placeholderTextColor={theme.palette.text.secondary}
                autoCapitalize="characters"
              />

              <View style={s.row}>
                <View style={s.col}>
                  <Text style={s.label}>First Name *</Text>
                  <TextInput
                    style={s.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First name"
                    placeholderTextColor={theme.palette.text.secondary}
                  />
                </View>
                <View style={s.col}>
                  <Text style={s.label}>Last Name</Text>
                  <TextInput
                    style={s.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last name"
                    placeholderTextColor={theme.palette.text.secondary}
                  />
                </View>
              </View>

              <Text style={s.label}>Email Address *</Text>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="user@example.com"
                placeholderTextColor={theme.palette.text.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={s.label}>Phone Number</Text>
              <TextInput
                style={s.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. 9876543210"
                placeholderTextColor={theme.palette.text.secondary}
                keyboardType="phone-pad"
              />

              <Text style={s.label}>Password *</Text>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Initial password"
                placeholderTextColor={theme.palette.text.secondary}
                secureTextEntry
              />

              <Text style={s.label}>Role</Text>
              <View style={s.roleRow}>
                <TouchableOpacity
                  style={[
                    s.roleBtn,
                    {
                      backgroundColor: roleId === 4 ? theme.palette.primary.main : 'transparent',
                      borderColor: roleId === 4 ? theme.palette.primary.main : (isDark ? '#334155' : '#E2E8F0'),
                    },
                  ]}
                  onPress={() => setRoleId(4)}
                >
                  <Text style={[s.roleBtnText, { color: roleId === 4 ? '#fff' : theme.palette.text.secondary }]}>
                    CS Specialist
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    s.roleBtn,
                    {
                      backgroundColor: roleId === 3 ? theme.palette.primary.main : 'transparent',
                      borderColor: roleId === 3 ? theme.palette.primary.main : (isDark ? '#334155' : '#E2E8F0'),
                    },
                  ]}
                  onPress={() => setRoleId(3)}
                >
                  <Text style={[s.roleBtnText, { color: roleId === 3 ? '#fff' : theme.palette.text.secondary }]}>
                    Manager
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={s.saveBtn} onPress={handleAddUser} disabled={isRegistering}>
                {isRegistering ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.saveBtnText}>Save User</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsAddModalVisible(false)} style={s.cancelBtn}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
