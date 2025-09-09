import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Clock, CheckCircle, AlertTriangle, Trophy, BookOpen, Users, Star } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

interface Notification {
  id: string;
  type: 'achievement' | 'lesson' | 'social' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  actionType?: 'lesson' | 'leaderboard' | 'profile' | 'course';
  actionData?: any;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme, t } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'achievement',
      title: 'New Badge Unlocked! 🏆',
      message: 'Congratulations! You\'ve earned the "Chemistry Explorer" badge for completing 5 chemistry lessons.',
      timestamp: '2 minutes ago',
      isRead: false,
      icon: '🏆',
      priority: 'high',
      actionType: 'profile',
    },
    {
      id: '2',
      type: 'lesson',
      title: 'New Lesson Available',
      message: 'Chemical Bonding: Advanced Concepts is now available in your Chemistry course.',
      timestamp: '1 hour ago',
      isRead: false,
      icon: '📚',
      priority: 'medium',
      actionType: 'course',
    },
    {
      id: '3',
      type: 'social',
      title: 'Leaderboard Update',
      message: 'You\'ve moved up 3 positions! You\'re now ranked #12 in your class.',
      timestamp: '3 hours ago',
      isRead: true,
      icon: '📈',
      priority: 'medium',
      actionType: 'leaderboard',
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Study Reminder',
      message: 'Don\'t forget to complete your daily practice quiz in Mathematics.',
      timestamp: '5 hours ago',
      isRead: true,
      icon: '⏰',
      priority: 'low',
      actionType: 'course',
    },
    {
      id: '5',
      type: 'achievement',
      title: 'Streak Milestone! 🔥',
      message: 'Amazing! You\'ve maintained a 7-day learning streak. Keep up the great work!',
      timestamp: '1 day ago',
      isRead: true,
      icon: '🔥',
      priority: 'high',
      actionType: 'profile',
    },
    {
      id: '6',
      type: 'social',
      title: 'New Discussion Reply',
      message: 'Sarah replied to your question in "Atomic Structure" discussion.',
      timestamp: '1 day ago',
      isRead: true,
      icon: '💬',
      priority: 'low',
      actionType: 'lesson',
    },
    {
      id: '7',
      type: 'system',
      title: 'App Update Available',
      message: 'Version 2.1.0 is now available with improved video playback and new features.',
      timestamp: '2 days ago',
      isRead: true,
      icon: '📱',
      priority: 'medium',
    },
    {
      id: '8',
      type: 'achievement',
      title: 'Perfect Score! ⭐',
      message: 'You scored 100% on the Algebra Practice Quiz. Excellent work!',
      timestamp: '3 days ago',
      isRead: true,
      icon: '⭐',
      priority: 'high',
      actionType: 'course',
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call to refresh notifications
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const getNotificationIcon = (type: string, iconEmoji: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy size={20} color="#F59E0B" />;
      case 'lesson':
        return <BookOpen size={20} color="#10B981" />;
      case 'social':
        return <Users size={20} color="#3B82F6" />;
      case 'reminder':
        return <Clock size={20} color="#8B5CF6" />;
      case 'system':
        return <Bell size={20} color="#6B7280" />;
      default:
        return <Bell size={20} color={theme.primary} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return theme.textSecondary;
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on action type
    switch (notification.actionType) {
      case 'profile':
        router.push('/(tabs)/profile');
        break;
      case 'leaderboard':
        router.push('/(tabs)/leaderboard');
        break;
      case 'course':
        router.push('/(tabs)/courses');
        break;
      case 'lesson':
        router.push('/(tabs)/courses');
        break;
      default:
        // No navigation for system notifications
        break;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filters = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'achievement', label: 'Achievements', count: notifications.filter(n => n.type === 'achievement').length },
    { id: 'lesson', label: 'Lessons', count: notifications.filter(n => n.type === 'lesson').length },
    { id: 'social', label: 'Social', count: notifications.filter(n => n.type === 'social').length },
  ];

  const getFilteredNotifications = () => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'achievement':
        return notifications.filter(n => n.type === 'achievement');
      case 'lesson':
        return notifications.filter(n => n.type === 'lesson');
      case 'social':
        return notifications.filter(n => n.type === 'social');
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('notifications') || 'Notifications'}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity 
            style={[styles.markAllButton, { backgroundColor: theme.primary }]}
            onPress={markAllAsRead}
          >
            <CheckCircle size={16} color="#FFFFFF" />
            <Text style={styles.markAllText}>Mark All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                {
                  backgroundColor: activeFilter === filter.id ? theme.primary : theme.surface,
                  borderColor: activeFilter === filter.id ? theme.primary : theme.border,
                }
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color: activeFilter === filter.id ? '#FFFFFF' : theme.text,
                  }
                ]}
              >
                {filter.label}
              </Text>
              {filter.count > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    {
                      backgroundColor: activeFilter === filter.id ? 'rgba(255,255,255,0.3)' : theme.primary,
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      {
                        color: '#FFFFFF',
                      }
                    ]}
                  >
                    {filter.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#10B981']}
            tintColor="#10B981"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {activeFilter === 'unread' ? 'No Unread Notifications' :
               activeFilter === 'achievement' ? 'No Achievement Notifications' :
               activeFilter === 'lesson' ? 'No Lesson Notifications' :
               activeFilter === 'social' ? 'No Social Notifications' :
               'No Notifications'}
            </Text>
            <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
              {activeFilter === 'unread' ? 'You\'re all caught up! No unread notifications.' :
               activeFilter === 'achievement' ? 'Complete lessons and quizzes to earn achievement notifications.' :
               activeFilter === 'lesson' ? 'New lesson notifications will appear here.' :
               activeFilter === 'social' ? 'Social interactions and updates will appear here.' :
               'You\'re all caught up! We\'ll notify you when something new happens.'}
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {filteredNotifications.map((notification, index) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  { 
                    backgroundColor: notification.isRead ? theme.surface : theme.background,
                    borderLeftColor: getPriorityColor(notification.priority),
                  }
                ]}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
              >
                {/* Priority Indicator */}
                <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(notification.priority) }]} />
                
                {/* Content */}
                <View style={styles.notificationContent}>
                  {/* Header */}
                  <View style={styles.notificationHeader}>
                    <View style={styles.iconContainer}>
                      {getNotificationIcon(notification.type, notification.icon)}
                    </View>
                    <View style={styles.headerText}>
                      <Text style={[styles.notificationTitle, { color: theme.text }]} numberOfLines={1}>
                        {notification.title}
                      </Text>
                      <View style={styles.timestampContainer}>
                        <Clock size={12} color={theme.textSecondary} />
                        <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
                          {notification.timestamp}
                        </Text>
                        {!notification.isRead && (
                          <View style={styles.unreadDot} />
                        )}
                      </View>
                    </View>
                  </View>
                  
                  {/* Message */}
                  <Text style={[styles.notificationMessage, { color: theme.textSecondary }]} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  
                  {/* Action Button */}
                  {notification.actionType && (
                    <View style={styles.actionContainer}>
                      <Text style={[styles.actionText, { color: theme.primary }]}>
                        {notification.actionType === 'profile' ? 'View Profile' :
                         notification.actionType === 'leaderboard' ? 'View Leaderboard' :
                         notification.actionType === 'course' ? 'Go to Course' :
                         notification.actionType === 'lesson' ? 'View Lesson' : 'View'}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 12,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  markAllText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  filtersContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  filtersContent: {
    gap: 12,
    paddingRight: 20,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    minHeight: 36,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationsList: {
    padding: 20,
    gap: 8,
  },
  notificationCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  priorityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  notificationContent: {
    marginLeft: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  headerText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 22,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginLeft: 4,
  },
  notificationMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.8,
  },
  actionContainer: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
    textDecorationColor: 'currentColor',
  },
});