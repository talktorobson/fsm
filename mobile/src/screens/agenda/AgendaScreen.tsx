/**
 * Yellow Grid Mobile - Agenda / Calendar Screen
 * Calendar view with daily appointments
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Card } from '../../components/ui/Card';
import { StatusBadge, UrgencyBadge } from '../../components/ui/Badge';
import { serviceOrdersService } from '../../services/service-orders.service';
import type { ServiceOrder, Urgency } from '../../types/service-order';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AgendaScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await serviceOrdersService.getServiceOrders({
        assignedToMe: true,
        scheduledFrom: startOfDay.toISOString(),
        scheduledTo: endOfDay.toISOString(),
        take: 50,
        sortBy: 'scheduledDate',
        sortOrder: 'asc',
      });
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    setIsLoading(true);
    loadOrders();
  }, [loadOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const navigateToOrder = (orderId: string) => {
    // @ts-ignore
    navigation.navigate('Orders', {
      screen: 'ServiceOrderDetail',
      params: { orderId },
    });
  };

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const getWeekDates = () => {
    const dates = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - 3);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatTimeSlot = (order: ServiceOrder) => {
    if (!order.scheduledTimeSlot) return 'All day';
    const start = new Date(order.scheduledTimeSlot.start);
    const end = new Date(order.scheduledTimeSlot.end);
    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const renderEmptyState = () => (
    <Card style={styles.emptyCard}>
      <Ionicons name="calendar-outline" size={48} color={colors.gray[300]} />
      <Text style={styles.emptyTitle}>No appointments</Text>
      <Text style={styles.emptySubtitle}>You have no scheduled orders for this day</Text>
    </Card>
  );

  const renderOrdersList = () => (
    <>
      {orders.map((order) => (
        <TouchableOpacity
          key={order.id}
          onPress={() => navigateToOrder(order.id)}
          activeOpacity={0.7}
        >
          <Card style={styles.orderCard}>
            <View style={styles.orderTimeSection}>
              <Text style={styles.orderTime}>
                {order.scheduledTimeSlot
                  ? new Date(order.scheduledTimeSlot.start).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'All day'}
              </Text>
              <View style={styles.timeIndicator} />
            </View>

            <View style={styles.orderContent}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>#{order.externalId || order.id.slice(0, 8)}</Text>
                <View style={styles.badges}>
                  <StatusBadge status={order.status} size="sm" />
                  {order.urgency === 'URGENT' && (
                    <View style={{ marginLeft: 4 }}>
                      <UrgencyBadge urgency={order.urgency as Urgency} size="sm" />
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="person" size={14} color={colors.gray[500]} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {order.customerName || 'Customer'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={14} color={colors.gray[500]} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {order.serviceAddress?.city || order.customerAddress || 'No address'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="construct" size={14} color={colors.gray[500]} />
                  <Text style={styles.detailText}>
                    {order.serviceType?.replaceAll('_', ' ') || 'Service'}
                  </Text>
                </View>
              </View>

              <View style={styles.orderMeta}>
                <Text style={styles.timeSlot}>{formatTimeSlot(order)}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
        {!isToday(selectedDate) && (
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity style={styles.navButton} onPress={goToPreviousDay}>
          <Ionicons name="chevron-back" size={24} color={colors.gray[600]} />
        </TouchableOpacity>
        <Text style={styles.dateTitle}>{formatDate(selectedDate)}</Text>
        <TouchableOpacity style={styles.navButton} onPress={goToNextDay}>
          <Ionicons name="chevron-forward" size={24} color={colors.gray[600]} />
        </TouchableOpacity>
      </View>

      {/* Week Strip */}
      <View style={styles.weekStrip}>
        {getWeekDates().map((date) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isTodayDate = isToday(date);
          return (
            <TouchableOpacity
              key={date.toISOString()}
              style={[
                styles.dayButton,
                isSelected && styles.dayButtonSelected,
                isTodayDate && !isSelected && styles.dayButtonToday,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dayName,
                  isSelected && styles.dayNameSelected,
                ]}
              >
                {WEEKDAYS[date.getDay()]}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                  isTodayDate && !isSelected && styles.dayNumberToday,
                ]}
              >
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Ionicons name="calendar" size={16} color={colors.primary[600]} />
        <Text style={styles.summaryText}>
          {orders.length} appointment{orders.length === 1 ? '' : 's'}
        </Text>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[600]]}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
          </View>
        ) : orders.length === 0 ? (
          renderEmptyState()
        ) : (
          renderOrdersList()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  todayButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
  },
  todayButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[800],
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  dayButton: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    minWidth: 44,
  },
  dayButtonSelected: {
    backgroundColor: colors.primary[600],
  },
  dayButtonToday: {
    backgroundColor: colors.primary[50],
  },
  dayName: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginBottom: 4,
  },
  dayNameSelected: {
    color: colors.white,
  },
  dayNumber: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[800],
  },
  dayNumberSelected: {
    color: colors.white,
  },
  dayNumberToday: {
    color: colors.primary[600],
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  summaryText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginLeft: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  loadingContainer: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  emptyCard: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[700],
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.gray[500],
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  orderCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  orderTimeSection: {
    alignItems: 'center',
    marginRight: spacing.md,
    paddingRight: spacing.md,
    borderRightWidth: 2,
    borderRightColor: colors.primary[200],
  },
  orderTime: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
  },
  timeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    marginTop: spacing.sm,
  },
  orderContent: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderNumber: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderDetails: {
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginLeft: spacing.sm,
    flex: 1,
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  timeSlot: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
});

export default AgendaScreen;
