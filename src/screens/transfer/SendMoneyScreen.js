import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Contact, ContactField, requestPermissionsAsync as requestContactsPermissionAsync } from 'expo-contacts';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Screen from '../../components/Screen';
import * as transfersApi from '../../api/transfers';
import * as usersApi from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/format';
import { PEER_TRANSFER_FEE_RATE } from '../../constants/fees';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

function digitsOnly(phone) {
  return (phone || '').replace(/\D/g, '');
}

// Matching key used both locally and against the backend: the last 10 digits of a number.
// This way a contact saved as "98765 43210" still matches a registered user stored as
// "+919876543210" - as long as both ultimately share the same local subscriber number.
function last10(phone) {
  const digits = digitsOnly(phone);
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

export default function SendMoneyScreen({ route, navigation }) {
  const { user } = useAuth();
  const [recipient, setRecipient] = useState(route.params?.recipient || null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [method, setMethod] = useState('wallet');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  // 'idle' -> 'loading' -> 'granted' | 'denied'
  const [contactsStatus, setContactsStatus] = useState('idle');
  const [contacts, setContacts] = useState([]);

  // The current user's own country-calling-code prefix (e.g. "91" for a stored "+919876543210"),
  // used to complete contact numbers that were saved locally without one (see inviteContact).
  const countryPrefix = useMemo(() => {
    const digits = digitsOnly(user?.phone);
    return digits.length > 10 ? digits.slice(0, digits.length - 10) : '';
  }, [user?.phone]);

  useEffect(() => {
    if (route.params?.recipient) {
      setRecipient(route.params.recipient);
    }
  }, [route.params?.recipient]);

  useEffect(() => {
    if (recipient || query.trim().length < 3) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      usersApi
        .searchByPhone(query.trim())
        .then((res) => {
          if (!cancelled) setResults(res.data);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, recipient]);

  const loadContacts = useCallback(async () => {
    setContactsStatus('loading');
    try {
      const permission = await requestContactsPermissionAsync();
      if (!permission.granted) {
        setContactsStatus('denied');
        return;
      }

      const details = await Contact.getAllDetails([ContactField.FULL_NAME, ContactField.PHONES]);

      const deviceContacts = [];
      const seen = new Set();
      for (const c of details) {
        const firstPhone = c.phones?.[0]?.number;
        const key = last10(firstPhone);
        if (!c.fullName || !key || seen.has(key)) continue;
        seen.add(key);
        deviceContacts.push({ id: c.id, name: c.fullName, phone: firstPhone, key });
      }

      const matchMap = new Map();
      for (const batch of chunk(deviceContacts.map((c) => c.key), 500)) {
        if (!batch.length) continue;
        try {
          const res = await usersApi.lookupContacts(batch);
          (res.data || []).forEach((walletUser) => matchMap.set(last10(walletUser.phone), walletUser));
        } catch (e) {
          // If a batch fails, the rest of the contacts still show up without a wallet match.
        }
      }

      const merged = deviceContacts
        .map((c) => ({ ...c, walletUser: matchMap.get(c.key) || null }))
        .sort((a, b) => {
          if (!!a.walletUser !== !!b.walletUser) return a.walletUser ? -1 : 1;
          return a.name.localeCompare(b.name);
        });

      setContacts(merged);
      setContactsStatus('granted');
    } catch (e) {
      setContactsStatus('denied');
    }
  }, []);

  useEffect(() => {
    if (!recipient && contactsStatus === 'idle') {
      loadContacts();
    }
  }, [recipient, contactsStatus, loadContacts]);

  const filteredContacts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    const qDigits = digitsOnly(q);
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || (qDigits && digitsOnly(c.phone).includes(qDigits))
    );
  }, [contacts, query]);

  const selectResult = (matchedUser) => {
    setRecipient({ name: matchedUser.name, identifier: matchedUser.phone, subtitle: matchedUser.phone });
    setQuery('');
    setResults([]);
  };

  const selectContact = (item) => {
    if (!item.walletUser) return;
    setRecipient({
      name: item.name,
      identifier: item.walletUser.phone,
      subtitle: item.walletUser.upi_handle || item.walletUser.phone,
    });
    setQuery('');
  };

  const inviteContact = async (item) => {
    const digits = digitsOnly(item.phone);
    if (!digits) return;
    // A bare 10-digit local number has no country code - fall back to assuming the same
    // country as the current user, since contacts saved by a peer-to-peer payment app's
    // user are overwhelmingly in the same country as the user themselves.
    const target = digits.length === 10 && countryPrefix ? `${countryPrefix}${digits}` : digits;
    const message = encodeURIComponent('Download the Wallet App');
    const appUrl = `whatsapp://send?phone=${target}&text=${message}`;
    const webUrl = `https://wa.me/${target}?text=${message}`;
    // Try the native app scheme directly rather than gating on Linking.canOpenURL() first:
    // canOpenURL() relies on Android's package-visibility queries, which this app's manifest
    // doesn't declare for WhatsApp, so it would report "not installed" even when it is. Opening
    // the scheme directly and falling back to the web link on failure sidesteps that.
    try {
      await Linking.openURL(appUrl);
    } catch (e) {
      try {
        await Linking.openURL(webUrl);
      } catch (e2) {
        showAlert('Could not open WhatsApp', 'Make sure WhatsApp is installed on this device.');
      }
    }
  };

  const changeRecipient = () => {
    setRecipient(null);
    navigation.setParams({ recipient: undefined });
  };

  const validate = () => {
    const next = {};
    if (!amount || Number(amount) <= 0) next.amount = 'Enter a valid amount.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const sendingAmount = Number(amount) || 0;
  const fee = Math.round(sendingAmount * PEER_TRANSFER_FEE_RATE * 100) / 100;
  const reachingAmount = Math.round((sendingAmount - fee) * 100) / 100;

  const submitPayment = async (pin) => {
    const res =
      method === 'account'
        ? await transfersApi.accountToAccount(recipient.identifier, Number(amount), pin, note.trim() || undefined)
        : await transfersApi.walletToWallet(recipient.identifier, Number(amount), pin, note.trim() || undefined);
    return res.data;
  };

  const handleSend = () => {
    if (!validate()) return;
    navigation.navigate('ConfirmPin', {
      title: 'Confirm payment',
      subtitle: `Send ${formatCurrency(sendingAmount)} — ${recipient.name} gets ${formatCurrency(reachingAmount)}`,
      onConfirm: submitPayment,
      successMessage: 'Money sent successfully',
    });
  };

  if (!recipient) {
    const sections = [];
    if (query.trim().length >= 3 && results.length > 0) {
      sections.push({
        title: 'Search results',
        data: results.map((u) => ({ type: 'result', key: `result-${u.id}`, name: u.name, phone: u.phone, walletUser: u })),
      });
    }
    if (contactsStatus === 'granted' && filteredContacts.length > 0) {
      sections.push({
        title: 'From your contacts',
        data: filteredContacts.map((c) => ({
          type: 'contact',
          key: `contact-${c.id}`,
          name: c.name,
          phone: c.phone,
          walletUser: c.walletUser,
        })),
      });
    }

    return (
      <Screen scroll={false}>
        <Text style={styles.title}>Send money</Text>
        <Text style={styles.subtitle}>Search for someone by phone number, or scan their QR code.</Text>

        <Input
          placeholder="Search by phone number"
          value={query}
          onChangeText={setQuery}
          keyboardType="phone-pad"
          autoFocus
        />

        <Pressable style={styles.qrRow} onPress={() => navigation.navigate('ScanQr')}>
          <View style={styles.qrIcon}>
            <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.qrTitle}>Scan QR to pay</Text>
            <Text style={styles.qrSubtitle}>Point your camera at a Wallet QR code</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        {searching ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} /> : null}

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ marginTop: spacing.sm, paddingBottom: spacing.xl }}
          keyboardShouldPersistTaps="handled"
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          renderItem={({ item }) => {
            const hasWallet = !!item.walletUser;
            return (
              <Card style={styles.resultCard}>
                <Pressable
                  style={styles.resultTouchable}
                  disabled={item.type === 'contact' && !hasWallet}
                  onPress={() => (item.type === 'result' ? selectResult(item.walletUser) : selectContact(item))}
                >
                  <View style={styles.resultAvatar}>
                    <Text style={styles.resultAvatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    <Text style={styles.resultPhone}>{hasWallet ? item.walletUser.phone : item.phone}</Text>
                  </View>
                </Pressable>
                {item.type === 'contact' && !hasWallet ? (
                  <Pressable style={styles.inviteButton} onPress={() => inviteContact(item)}>
                    <Text style={styles.inviteButtonText}>Invite</Text>
                  </Pressable>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                )}
              </Card>
            );
          }}
          ListHeaderComponent={
            contactsStatus === 'loading' ? (
              <View style={styles.contactsStatusRow}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.contactsStatusText}>Checking your contacts…</Text>
              </View>
            ) : contactsStatus === 'denied' ? (
              <Pressable style={styles.contactsStatusRow} onPress={loadContacts}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
                <Text style={styles.contactsStatusText}>
                  Allow contacts access to see which of your friends are on Zemapay.
                </Text>
              </Pressable>
            ) : null
          }
          ListEmptyComponent={
            !searching && contactsStatus !== 'loading' && query.trim().length >= 3 ? (
              <Text style={styles.emptyText}>No matching users found.</Text>
            ) : null
          }
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Send money</Text>

      <Card style={styles.recipientCard}>
        <View style={styles.resultAvatar}>
          <Text style={styles.resultAvatarText}>{recipient.name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.resultName}>{recipient.name}</Text>
          <Text style={styles.resultPhone}>{recipient.subtitle}</Text>
        </View>
        <Pressable onPress={changeRecipient}>
          <Text style={styles.changeLink}>Change</Text>
        </Pressable>
      </Card>

      <Text style={styles.label}>Pay with</Text>
      <View style={styles.methodRow}>
        <Pressable
          style={[styles.methodOption, method === 'wallet' && styles.methodOptionActive]}
          onPress={() => setMethod('wallet')}
        >
          <Ionicons name="wallet-outline" size={18} color={method === 'wallet' ? colors.textInverse : colors.text} />
          <Text style={[styles.methodText, method === 'wallet' && styles.methodTextActive]}>Wallet</Text>
        </Pressable>
        <Pressable
          style={[styles.methodOption, method === 'account' && styles.methodOptionActive]}
          onPress={() => setMethod('account')}
        >
          <Ionicons name="business-outline" size={18} color={method === 'account' ? colors.textInverse : colors.text} />
          <Text style={[styles.methodText, method === 'account' && styles.methodTextActive]}>Account</Text>
        </Pressable>
      </View>
      <Text style={styles.methodHint}>{recipient.name} will receive this in their Account.</Text>

      <View style={styles.form}>
        <Input
          label="Amount"
          placeholder="0.00"
          value={amount}
          onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
          error={errors.amount}
          keyboardType="decimal-pad"
        />

        {sendingAmount > 0 ? (
          <Card style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Sending amount</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(sendingAmount)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Fee (1%)</Text>
              <Text style={styles.breakdownValue}>-{formatCurrency(fee)}</Text>
            </View>
            <View style={[styles.breakdownRow, styles.breakdownRowFinal]}>
              <Text style={styles.breakdownLabelFinal}>{recipient.name} receives</Text>
              <Text style={styles.breakdownValueFinal}>{formatCurrency(reachingAmount)}</Text>
            </View>
          </Card>
        ) : null}

        <Input label="Note (optional)" placeholder="What's this for?" value={note} onChangeText={setNote} />

        <Button title="Send money" onPress={handleSend} style={{ marginTop: spacing.sm }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { marginTop: spacing.sm },
  breakdownCard: { marginTop: spacing.xs, marginBottom: spacing.md },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  breakdownRowFinal: { marginTop: spacing.xs, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  breakdownLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  breakdownValue: { fontSize: fontSize.xs, color: colors.textMuted },
  breakdownLabelFinal: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  breakdownValueFinal: { fontSize: fontSize.sm, fontWeight: '800', color: colors.success },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  qrIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  qrTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  qrSubtitle: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  sectionHeader: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  resultCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  resultTouchable: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  resultAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  resultAvatarText: { color: colors.textInverse, fontWeight: '800' },
  resultName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  resultPhone: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  inviteButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  inviteButtonText: { color: colors.primaryDark, fontWeight: '700', fontSize: fontSize.xs },
  contactsStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  contactsStatusText: { flex: 1, fontSize: fontSize.xs, color: colors.textMuted },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
  recipientCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  changeLink: { color: colors.primary, fontWeight: '700', fontSize: fontSize.sm },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  methodRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
  methodHint: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing.lg },
  methodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  methodOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  methodText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  methodTextActive: { color: colors.textInverse },
});
