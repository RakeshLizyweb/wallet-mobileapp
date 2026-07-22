import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Screen from '../../components/Screen';
import * as authApi from '../../api/auth';
import { apiErrorMessage } from '../../api/client';
import { formatDateTime } from '../../utils/format';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

export default function DevicesScreen() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    authApi
      .listDevices()
      .then((res) => setDevices(res.data))
      .catch((e) => showAlert('Could not load devices', apiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleRemove = (device) => {
    showAlert('Remove device', `Sign out ${device.device_name || 'this device'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await authApi.removeDevice(device.id);
            load();
          } catch (e) {
            showAlert('Could not remove device', apiErrorMessage(e));
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <Text style={styles.title}>Devices</Text>

      {!loading && devices.length === 0 ? (
        <EmptyState title="No devices found" />
      ) : (
        devices.map((device) => (
          <Card key={device.id} style={styles.card}>
            <View style={styles.row}>
              <Ionicons
                name={device.platform === 'ios' ? 'logo-apple' : 'logo-android'}
                size={22}
                color={colors.textMuted}
                style={{ marginRight: spacing.sm }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.deviceName}>{device.device_name || 'Unknown device'}</Text>
                <Text style={styles.meta}>Last active {formatDateTime(device.last_login_at)}</Text>
              </View>
              <Pressable onPress={() => handleRemove(device)} hitSlop={10}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md, marginBottom: spacing.lg },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  deviceName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  meta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});
