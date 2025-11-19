import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WCFStepIssuesProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const WCFStepIssues: React.FC<WCFStepIssuesProps> = ({ onNext, onPrevious }) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Issues & Problems</Text>
          <Text style={styles.subtitle}>
            Record any issues encountered during service
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.infoBox}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF9500" />
            <Text style={styles.infoTitle}>Coming Soon</Text>
            <Text style={styles.infoText}>
              Issue tracking will be available soon
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={onPrevious}>
          <Ionicons name="arrow-back" size={20} color="#007AFF" />
          <Text style={styles.buttonTextSecondary}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={onNext}>
          <Text style={styles.buttonTextPrimary}>Next: Review</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
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
  infoBox: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#FFFFFF', borderRadius: 12 },
  infoTitle: { fontSize: 20, fontWeight: '600', color: '#333333', marginTop: 16 },
  infoText: { fontSize: 14, color: '#666666', marginTop: 8, textAlign: 'center' },
  footer: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  button: { flex: 1, flexDirection: 'row', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 8 },
  buttonPrimary: { backgroundColor: '#007AFF' },
  buttonSecondary: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#007AFF' },
  buttonTextPrimary: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  buttonTextSecondary: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
});

export default WCFStepIssues;
