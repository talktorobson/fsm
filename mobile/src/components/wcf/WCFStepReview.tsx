import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWCFStore } from '@store/wcf.store';
import { useNavigation } from '@react-navigation/native';

interface WCFStepReviewProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const WCFStepReview: React.FC<WCFStepReviewProps> = ({ onPrevious }) => {
  const navigation = useNavigation();
  const { wcfData, markComplete, resetWCF } = useWCFStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Call API to submit WCF
      // await submitWCF(wcfData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      markComplete();
      Alert.alert('Success', 'Work Closing Form submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            resetWCF();
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit WCF. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Review & Submit</Text>
          <Text style={styles.subtitle}>
            Review your work closing form before submitting
          </Text>
        </View>

        {/* Labor Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="time-outline" size={18} /> Labor Summary
          </Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{wcfData.completionStatus.replace(/_/g, ' ')}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Work Time:</Text>
              <Text style={styles.value}>{wcfData.workDurationMinutes} min ({(wcfData.workDurationMinutes / 60).toFixed(1)}h)</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Tasks Completed:</Text>
              <Text style={styles.value}>{wcfData.tasksCompleted.length}</Text>
            </View>
          </View>
        </View>

        {/* Materials Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="cube-outline" size={18} /> Materials Used
          </Text>
          <View style={styles.card}>
            {wcfData.materials.length > 0 ? (
              wcfData.materials.map((m, i) => (
                <Text key={i} style={styles.materialItem}>
                  • {m.materialName} ({m.quantity} {m.unit})
                </Text>
              ))
            ) : (
              <Text style={styles.emptyText}>No materials recorded</Text>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={onPrevious} disabled={isSubmitting}>
          <Ionicons name="arrow-back" size={20} color="#007AFF" />
          <Text style={styles.buttonTextSecondary}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSubmit]} onPress={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
              <Text style={styles.buttonTextPrimary}>Submit WCF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  headerSection: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333333', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666666' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333333', marginBottom: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { fontSize: 15, color: '#666666' },
  value: { fontSize: 15, fontWeight: '500', color: '#333333' },
  materialItem: { fontSize: 15, color: '#333333', paddingVertical: 4 },
  emptyText: { fontSize: 14, color: '#999999', fontStyle: 'italic' },
  footer: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  button: { flex: 1, flexDirection: 'row', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 8 },
  buttonSubmit: { backgroundColor: '#34C759' },
  buttonSecondary: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#007AFF' },
  buttonTextPrimary: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  buttonTextSecondary: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
});

export default WCFStepReview;
