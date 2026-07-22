import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import * as ImagePicker from 'expo-image-picker';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Screen from '../../components/Screen';
import * as verificationApi from '../../api/verification';
import { apiErrorMessage } from '../../api/client';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

function toUploadFile(asset, fallbackName) {
  return {
    uri: asset.uri,
    type: asset.mimeType || 'image/jpeg',
    name: asset.fileName || fallbackName,
  };
}

export default function SubmitVerificationScreen({ navigation }) {
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [passportImage, setPassportImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickPassportImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert('Permission needed', 'Allow photo library access to upload your passport.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) setPassportImage(result.assets[0]);
  };

  const takeSelfie = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showAlert('Permission needed', 'Allow camera access to take a selfie.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      cameraType: ImagePicker.CameraType?.front,
    });
    if (!result.canceled) setSelfieImage(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (!passportNumber.trim()) {
      showAlert('Missing passport number', 'Enter your passport number.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(passportExpiry.trim())) {
      showAlert('Invalid date', 'Enter the passport expiry as YYYY-MM-DD.');
      return;
    }
    if (!passportImage || !selfieImage) {
      showAlert('Missing photos', 'Upload a passport photo and a selfie to continue.');
      return;
    }

    setLoading(true);
    try {
      await verificationApi.submitVerification({
        passport_number: passportNumber.trim(),
        passport_expiry: passportExpiry.trim(),
        passportImage: toUploadFile(passportImage, 'passport.jpg'),
        selfieImage: toUploadFile(selfieImage, 'selfie.jpg'),
      });
      showAlert('Submitted', 'Your verification is now under review.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      showAlert('Could not submit', apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Verify your identity</Text>
      <Text style={styles.subtitle}>Your passport must be valid for at least 6 more months.</Text>

      <Input label="Passport number" placeholder="P1234567" value={passportNumber} onChangeText={setPassportNumber} />
      <Input
        label="Passport expiry (YYYY-MM-DD)"
        placeholder="2030-01-01"
        value={passportExpiry}
        onChangeText={setPassportExpiry}
        keyboardType="numbers-and-punctuation"
      />

      <Text style={styles.label}>Passport photo</Text>
      <Pressable style={styles.uploadBox} onPress={pickPassportImage}>
        {passportImage ? (
          <Image source={{ uri: passportImage.uri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <Text style={styles.uploadHint}>Tap to upload a photo of your passport</Text>
        )}
      </Pressable>

      <Text style={styles.label}>Selfie</Text>
      <Pressable style={styles.uploadBox} onPress={takeSelfie}>
        {selfieImage ? (
          <Image source={{ uri: selfieImage.uri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <Text style={styles.uploadHint}>Tap to take a selfie</Text>
        )}
      </Pressable>

      <Button title="Submit for review" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  uploadBox: {
    height: 140,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  uploadHint: { color: colors.textMuted, fontSize: fontSize.sm, paddingHorizontal: spacing.lg, textAlign: 'center' },
  preview: { width: '100%', height: '100%' },
});
