import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Screen from '../../components/Screen';
import * as banksApi from '../../api/banks';
import { apiErrorMessage } from '../../api/client';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

export default function AddBankScreen({ navigation }) {
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!bankName.trim()) next.bankName = 'Enter the bank name.';
    if (!accountHolderName.trim()) next.accountHolderName = 'Enter the account holder name.';
    if (!/^[0-9]{9,18}$/.test(accountNumber.trim())) next.accountNumber = 'Enter a valid account number.';
    if (!/^[A-Za-z]{4}0[A-Z0-9]{6}$/.test(ifscCode.trim())) next.ifscCode = 'Enter a valid IFSC code.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await banksApi.addBank({
        bank_name: bankName.trim(),
        account_holder_name: accountHolderName.trim(),
        account_number: accountNumber.trim(),
        ifsc_code: ifscCode.trim().toUpperCase(),
      });
      showAlert('Bank account added', 'It will need to be verified before you can withdraw to it.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      showAlert('Could not add bank account', apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Add a bank account</Text>
      <Text style={styles.subtitle}>New accounts require verification before you can withdraw to them.</Text>

      <View style={styles.form}>
        <Input label="Bank name" placeholder="HDFC Bank" value={bankName} onChangeText={setBankName} error={errors.bankName} />
        <Input
          label="Account holder name"
          placeholder="Full name as per bank"
          value={accountHolderName}
          onChangeText={setAccountHolderName}
          error={errors.accountHolderName}
          autoCapitalize="words"
        />
        <Input
          label="Account number"
          placeholder="123456789012"
          value={accountNumber}
          onChangeText={(v) => setAccountNumber(v.replace(/[^0-9]/g, ''))}
          error={errors.accountNumber}
          keyboardType="number-pad"
        />
        <Input
          label="IFSC code"
          placeholder="HDFC0001234"
          value={ifscCode}
          onChangeText={(v) => setIfscCode(v.toUpperCase())}
          error={errors.ifscCode}
          autoCapitalize="characters"
        />
        <Button title="Add bank account" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { marginTop: spacing.sm },
});
