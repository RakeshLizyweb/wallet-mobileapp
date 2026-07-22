import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import * as qrApi from '../../api/qr';
import { apiErrorMessage } from '../../api/client';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

export default function ScanQrScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleScanned = async ({ data }) => {
    if (scanned || checking) return;
    setScanned(true);
    setChecking(true);
    try {
      const res = await qrApi.validateQr(data);
      navigation.replace('SendMoney', { receiver: res.data.upi_handle });
    } catch (e) {
      showAlert('Invalid QR code', apiErrorMessage(e, 'This QR code could not be recognized.'), [
        { text: 'Try again', onPress: () => setScanned(false) },
      ]);
    } finally {
      setChecking(false);
    }
  };

  if (!permission) {
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <Text style={styles.permissionText}>We need camera access to scan QR codes.</Text>
          <Button title="Grant camera access" onPress={requestPermission} style={{ marginTop: spacing.md }} />
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.hint}>Point your camera at a Wallet QR code</Text>
        {checking ? <ActivityIndicator color={colors.textInverse} style={{ marginTop: spacing.md }} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  permissionText: { color: colors.text, fontSize: fontSize.md, textAlign: 'center' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: 240,
    height: 240,
    borderRadius: radius.md,
    borderWidth: 3,
    borderColor: colors.textInverse,
  },
  hint: { color: colors.textInverse, marginTop: spacing.lg, fontSize: fontSize.sm },
});
