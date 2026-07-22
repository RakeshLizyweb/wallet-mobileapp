import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Screen from '../../components/Screen';
import * as transfersApi from '../../api/transfers';
import { apiErrorMessage } from '../../api/client';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

const STATUS_COLORS = {
  success: colors.success,
  pending: colors.warning,
  failed: colors.danger,
  cancelled: colors.textMuted,
  refunded: colors.warning,
  reversed: colors.warning,
};

export default function TransactionHistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(async (pageNumber) => {
    const res = await transfersApi.listTransfers({ page: pageNumber, per_page: 20 });
    return res;
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchPage(1);
      setItems(res.data);
      setPage(1);
      setLastPage(res.meta?.last_page || 1);
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  }, [fetchPage]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || page >= lastPage) return;
    setLoadingMore(true);
    try {
      const res = await fetchPage(page + 1);
      setItems((prev) => [...prev, ...res.data]);
      setPage(page + 1);
    } catch (e) {
      // silently ignore load-more failures, user can retry by scrolling again
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction history</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.reference_number}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReachedThreshold={0.4}
        onEndReached={handleLoadMore}
        ListEmptyComponent={
          !loading ? <EmptyState title="No transactions yet" subtitle="Your activity will show up here." /> : null
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('TransactionDetail', { reference: item.reference_number })}>
            <Card style={styles.card}>
              <View style={styles.row}>
                <View
                  style={[
                    styles.icon,
                    { backgroundColor: item.direction === 'credit' ? colors.successLight : colors.dangerLight },
                  ]}
                >
                  <Ionicons
                    name={item.direction === 'credit' ? 'arrow-down' : 'arrow-up'}
                    size={16}
                    color={item.direction === 'credit' ? colors.success : colors.danger}
                  />
                </View>
                <View style={styles.info}>
                  <Text style={styles.type} numberOfLines={1}>
                    {item.counterparty?.name || item.bank_account?.bank_name || item.type.replace(/_/g, ' ')}
                  </Text>
                  <Text style={styles.date}>{formatDateTime(item.created_at)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.amount, { color: item.direction === 'credit' ? colors.success : colors.text }]}>
                    {item.direction === 'credit' ? '+' : '-'}
                    {formatCurrency(item.amount)}
                  </Text>
                  <Text style={[styles.status, { color: STATUS_COLORS[item.status] || colors.textMuted }]}>
                    {item.status}
                  </Text>
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
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  error: { color: colors.danger, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  info: { flex: 1 },
  type: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, textTransform: 'capitalize' },
  date: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  amount: { fontSize: fontSize.sm, fontWeight: '700' },
  status: { fontSize: fontSize.xs, marginTop: 2, textTransform: 'capitalize' },
});
