import { Alert, Platform } from 'react-native';

// react-native-web ships Alert.alert as a no-op stub, so confirmations and
// error messages silently do nothing when this app runs in a browser.
// This falls back to window.alert/confirm on web and defers to the real
// native Alert everywhere else.
export function showAlert(title, message, buttons) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  const list = buttons && buttons.length ? buttons : [{ text: 'OK' }];
  const text = message ? `${title}\n\n${message}` : title;

  if (list.length <= 1) {
    window.alert(text);
    list[0]?.onPress?.();
    return;
  }

  const cancelButton = list.find((b) => b.style === 'cancel') || list[0];
  const confirmButton = list.find((b) => b !== cancelButton) || list[list.length - 1];

  if (window.confirm(text)) {
    confirmButton.onPress?.();
  } else {
    cancelButton.onPress?.();
  }
}
