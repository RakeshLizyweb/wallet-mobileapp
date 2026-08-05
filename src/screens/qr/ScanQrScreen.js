import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import * as qrApi from '../../api/qr';
import { apiErrorMessage } from '../../api/client';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

// Fixed pixel size for the camera box. Deliberately NOT a flex/percentage/absoluteFillObject
// size - a concrete number here means the camera view's layout can never resolve to a 0-height
// box no matter what a parent container's flex layout does.
const SCAN_BOX_SIZE = 280;

export default function ScanQrScreen({ navigation }) {
  const [scanned, setScanned] = useState(false);
  const [checking, setChecking] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission?.granted, permission?.canAskAgain]);

  const handleBarcodeScanned = async (event) => {
    const qrData = event.data;
    if (!qrData || scanned || checking) return;

    setScanned(true);
    setChecking(true);
    try {
      const res = await qrApi.validateQr(qrData);
      navigation.replace('SendMoney', {
        recipient: {
          name: res.data.name,
          identifier: res.data.upi_handle,
          subtitle: res.data.upi_handle,
        },
      });
    } catch (e) {
      showAlert('Invalid QR code', apiErrorMessage(e, 'This QR code could not be recognized.'), [
        { text: 'Try again', onPress: () => setScanned(false) },
      ]);
    } finally {
      setChecking(false);
    }
  };

  const renderScanBox = () => {
    if (!permission) {
      return (
        <View style={styles.scanBox}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.scanBox}>
          <Ionicons name="camera-outline" size={36} color={colors.textMuted} />
          <Text style={styles.permissionText}>
            {permission.canAskAgain
              ? 'Allow camera access to scan a Wallet QR code.'
              : 'Camera access is disabled. Enable it in your device settings.'}
          </Text>
          {permission.canAskAgain && (
            <Button title="Allow camera access" onPress={requestPermission} style={{ marginTop: spacing.md }} />
          )}
        </View>
      );
    }

    return (
      <View style={styles.scanBox}>
        {isFocused && (
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
        )}
        {checking && (
          <View style={styles.checkingOverlay}>
            <ActivityIndicator color={colors.textInverse} />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Scan QR Code</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.body}>
        {renderScanBox()}
        <Text style={styles.hint}>Point your camera at a Wallet QR code</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  scanBox: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  camera: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
  },
  checkingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  hint: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
