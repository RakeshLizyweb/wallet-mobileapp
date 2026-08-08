import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import * as qrApi from '../../api/qr';
import { apiErrorMessage } from '../../api/client';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

export default function MyQrScreen() {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await qrApi.getMyQr();
      setQr(res.data);
    } catch (e) {
      showAlert('Could not load QR code', apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const writeQrToFile = async () => {
    if (!qr?.qr_image) return null;
    const base64Data = qr.qr_image.includes('base64,')
      ? qr.qr_image.split('base64,')[1]
      : qr.qr_image;

    const file = new File(Paths.cache, `wallet-qr-${Date.now()}.png`);
    file.create({ overwrite: true });
    file.write(base64Data, { encoding: 'base64' });
    return file.uri;
  };

  const handleShare = async () => {
    if (!qr) return;
    setBusy(true);
    try {
      const uri = await writeQrToFile();
      if (!uri) throw new Error('Failed to generate image file.');

      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, { dialogTitle: 'Share my Wallet QR code' });
      } else {
        showAlert('Sharing unavailable', 'Sharing is not supported on this device.');
      }
    } catch (e) {
      showAlert('Could not share QR code', e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async () => {
    if (!qr) return;
    setBusy(true);
    try {
      const uri = await writeQrToFile();
      if (uri) {
        showAlert('Saved', 'Your QR code image has been cached and ready on this device.');
      }
    } catch (e) {
      showAlert('Could not save QR code', e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>My QR code</Text>
      <Text style={styles.subtitle}>Anyone can scan this to send you money instantly.</Text>

      <Card style={styles.qrCard}>
        {qr?.qr_image ? (
          <Image source={{ uri: qr.qr_image }} style={styles.qrImage} resizeMode="contain" />
        ) : null}
        <Text style={styles.handle}>{qr?.upi_handle}</Text>
        <Text style={styles.walletNumber}>{qr?.wallet_number}</Text>
      </Card>

      <View style={styles.actions}>
        <Button title="Share" onPress={handleShare} loading={busy} style={{ flex: 1, marginRight: spacing.sm }} />
        <Button title="Save" variant="outline" onPress={handleDownload} loading={busy} style={{ flex: 1 }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  qrCard: { alignItems: 'center', paddingVertical: spacing.xl },
  qrImage: { width: 220, height: 220, marginBottom: spacing.md },
  handle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  walletNumber: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.xs },
  actions: { flexDirection: 'row', marginTop: spacing.lg },
});