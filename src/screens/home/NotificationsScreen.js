import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Screen from '../../components/Screen';
import * as notificationsApi from '../../api/notifications';
import { apiErrorMessage } from '../../api/client';
import { formatDateTime } from '../../utils/format';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

export default function NotificationsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await notificationsApi.listNotifications();
      setItems(res.data);
    } catch (e) {
      // fail silently, list stays empty with a retry via pull-to-refresh
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    notificationsApi.markAllAsRead().catch(() => {});
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handlePress = async (item) => {
    if (!item.read) {
      try {
        await notificationsApi.markAsRead(item.id);
        setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <Screen scroll={false}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          !loading ? <EmptyState title="No notifications" subtitle="You're all caught up." /> : null
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => handlePress(item)}>
            <Card style={[styles.card, !item.read && styles.unreadCard]}>
              <View style={styles.row}>
                {!item.read ? <View style={styles.dot} /> : null}
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifBody}>{item.body}</Text>
                  <Text style={styles.notifDate}>{formatDateTime(item.created_at)}</Text>
                </View>
              </View>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, margin: spacing.lg, marginBottom: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.sm },
  unreadCard: { borderColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
    marginTop: 6,
  },
  notifTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  notifBody: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  notifDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.xs },
});
