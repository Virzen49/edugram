import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, FlatList, Modal, TouchableOpacity, Pressable } from 'react-native';
import Svg, { Line, Circle, Rect, Text as SvgText, G, Defs, LinearGradient, Stop, Polyline } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

const pastelColors = {
  pink: '#F8BBD0',
  blue: '#BBDEFB',
  green: '#C8E6C9',
  yellow: '#FFF9C4',
  purple: '#E1BEE7',
  gray: '#F3F4F6',
  accent: '#E91E63',
  text: '#1F2937',
  muted: '#6B7280',
  surface: '#FFFFFF',
};

// Backend-ready data structure
interface AnalyticsData {
  usageData: {
    labels: string[];
    datasets: {
      data: number[];
      color: string;
      label: string;
    }[];
  };
  questData: {
    questName: string;
    classPerformance: {
      className: string;
      averageScore: number;
      totalAttempts: number;
      color: string;
    }[];
  }[];
  classPerformance: {
    label: string;
    value: number;
    color: string;
  }[];
  defaulters: {
    name: string;
    class: string;
    score?: number;
  }[];
  topScorers: {
    name: string;
    class: string;
    score: number;
  }[];
}

// Sample data - replace with API calls later
const sampleData: AnalyticsData = {
  usageData: {
    labels: ['W1', 'W2', 'W3', 'W4'],
    datasets: [
      {
        data: [20, 45, 28, 80],
        color: pastelColors.accent,
        label: 'Overall Usage',
      },
    ],
  },
  questData: [
    {
      questName: 'Math Fundamentals',
      classPerformance: [
        { className: '10A', averageScore: 85, totalAttempts: 25, color: pastelColors.green },
        { className: '11B', averageScore: 78, totalAttempts: 30, color: pastelColors.blue },
        { className: '9C', averageScore: 72, totalAttempts: 28, color: pastelColors.purple },
      ],
    },
    {
      questName: 'Science Challenge',
      classPerformance: [
        { className: '10A', averageScore: 90, totalAttempts: 25, color: pastelColors.green },
        { className: '11B', averageScore: 82, totalAttempts: 30, color: pastelColors.blue },
        { className: '9C', averageScore: 68, totalAttempts: 28, color: pastelColors.purple },
      ],
    },
    {
      questName: 'English Literature',
      classPerformance: [
        { className: '10A', averageScore: 88, totalAttempts: 25, color: pastelColors.green },
        { className: '11B', averageScore: 75, totalAttempts: 30, color: pastelColors.blue },
        { className: '9C', averageScore: 80, totalAttempts: 28, color: pastelColors.purple },
      ],
    },
  ],
  classPerformance: [
    { label: '10A', value: 78, color: pastelColors.green },
    { label: '11B', value: 82, color: pastelColors.purple },
    { label: '9C', value: 69, color: pastelColors.yellow },
  ],
  defaulters: [
    { name: 'Amit Singh', class: '10A', score: 45 },
    { name: 'Priya Verma', class: '9C', score: 38 },
    { name: 'Rahul Das', class: '11B', score: 42 },
    { name: 'Sneha Roy', class: '9C', score: 35 },
  ],
  topScorers: [
    { name: 'Riya Sharma', class: '10A', score: 95 },
    { name: 'Manish Gupta', class: '11B', score: 92 },
    { name: 'Ananya Patel', class: '9C', score: 89 },
  ],
};

// Custom Line Chart Component
const CustomLineChart = ({ data, width, height, onPress }: { 
  data: number[]; 
  width: number; 
  height: number; 
  onPress?: () => void;
}) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - 60) + 30;
    const y = height - 50 - ((value - minValue) / range) * (height - 100);
    return `${x},${y}`;
  }).join(' ');

  return (
    <Pressable onPress={onPress}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={pastelColors.accent} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={pastelColors.pink} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <Line
            key={index}
            x1="30"
            y1={30 + ratio * (height - 60)}
            x2={width - 30}
            y2={30 + ratio * (height - 60)}
            stroke={pastelColors.gray}
            strokeWidth="1"
            opacity="0.3"
          />
        ))}
        
        {/* Data line */}
        <Polyline
          points={points}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * (width - 60) + 30;
          const y = height - 50 - ((value - minValue) / range) * (height - 100);
          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r="6"
              fill={pastelColors.accent}
              stroke={pastelColors.surface}
              strokeWidth="2"
            />
          );
        })}
      </Svg>
    </Pressable>
  );
};

// Custom Bar Chart Component
const CustomBarChart = ({ data, width, height, onPress }: { 
  data: { label: string; value: number; color: string }[]; 
  width: number; 
  height: number;
  onPress?: () => void;
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = (width - 80) / data.length;
  
  return (
    <Pressable onPress={onPress}>
      <Svg width={width} height={height}>
        <Defs>
          {data.map((item, index) => (
            <LinearGradient key={index} id={`barGradient${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={item.color} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={item.color} stopOpacity="0.4" />
            </LinearGradient>
          ))}
        </Defs>
        
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 80);
          const x = 40 + index * barWidth;
          const y = height - 40 - barHeight;
          
          return (
            <G key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth - 8}
                height={barHeight}
                fill={`url(#barGradient${index})`}
                rx="4"
              />
              <SvgText
                x={x + barWidth/2 - 15}
                y={y - 8}
                fontSize="11"
                fill={pastelColors.text}
                textAnchor="middle"
              >
                {item.value}%
              </SvgText>
              <SvgText
                x={x + barWidth/2 - 15}
                y={height - 15}
                fontSize="9"
                fill={pastelColors.muted}
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </Pressable>
  );
};

// Custom Horizontal Bar Chart for Quest Comparison
const CustomHorizontalBarChart = ({ data, width, height, onPress }: { 
  data: { className: string; averageScore: number; totalAttempts: number; color: string }[]; 
  width: number; 
  height: number;
  onPress?: () => void;
}) => {
  const maxValue = Math.max(...data.map(d => d.averageScore));
  const barHeight = (height - 60) / data.length;
  
  return (
    <Pressable onPress={onPress}>
      <Svg width={width} height={height}>
        <Defs>
          {data.map((item, index) => (
            <LinearGradient key={index} id={`hBarGradient${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={item.color} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={item.color} stopOpacity="0.4" />
            </LinearGradient>
          ))}
        </Defs>
        
        {data.map((item, index) => {
          const barWidth = (item.averageScore / maxValue) * (width - 100);
          const y = 20 + index * (barHeight + 10);
          
          return (
            <G key={index}>
              <Rect
                x="60"
                y={y}
                width={barWidth}
                height={barHeight - 5}
                fill={`url(#hBarGradient${index})`}
                rx="4"
              />
              <SvgText
                x="55"
                y={y + barHeight/2 + 3}
                fontSize="10"
                fill={pastelColors.text}
                textAnchor="end"
              >
                {item.className}
              </SvgText>
              <SvgText
                x={60 + barWidth + 5}
                y={y + barHeight/2 + 3}
                fontSize="10"
                fill={pastelColors.text}
                textAnchor="start"
              >
                {item.averageScore}%
              </SvgText>
              <SvgText
                x={60 + barWidth + 5}
                y={y + barHeight/2 + 15}
                fontSize="8"
                fill={pastelColors.muted}
                textAnchor="start"
              >
                {item.totalAttempts} attempts
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </Pressable>
  );
};

export default function TeacherAnalyticsScreen() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(sampleData);
  const [loading, setLoading] = useState(false);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // This function will be used to fetch data from backend
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetch('/api/analytics');
      // const data = await response.json();
      // setAnalyticsData(data);
      
      // For now, use sample data
      setAnalyticsData(sampleData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>Analytics</Text>

      {/* Overall Usage Graph */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Overall Usage (Monthly)</Text>
        <CustomLineChart 
          data={analyticsData.usageData.datasets[0].data} 
          width={screenWidth - 60} 
          height={180} 
          onPress={() => setSelectedChart('usage')}
        />
        <View style={styles.chartLabels}>
          {analyticsData.usageData.labels.map((label, index) => (
            <Text key={index} style={styles.chartLabel}>{label}</Text>
          ))}
        </View>
      </View>

      {/* Quest Performance */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Quest Performance Comparison</Text>
        <View style={styles.questChartsContainer}>
          {analyticsData.questData.map((quest, idx) => (
            <View key={quest.questName} style={styles.questChart}>
              <Text style={styles.questTitle}>{quest.questName}</Text>
              <CustomHorizontalBarChart 
                data={quest.classPerformance}
                width={screenWidth - 60} 
                height={140} 
                onPress={() => setSelectedChart(`quest-${idx}`)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Class Performance */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Class Performance</Text>
        <CustomBarChart 
          data={analyticsData.classPerformance} 
          width={screenWidth - 60} 
          height={160} 
          onPress={() => setSelectedChart('class')}
        />
      </View>

      {/* Students Needing Attention */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Students Needing Attention</Text>
        <View style={styles.defaultersRow}>
          <View style={styles.defaultersCount}>
            <Text style={styles.defaultersCountText}>{analyticsData.defaulters.length}</Text>
            <Text style={styles.defaultersLabel}>Students</Text>
          </View>
          <View style={styles.defaultersList}>
            {analyticsData.defaulters.map((item, idx) => (
              <TouchableOpacity 
                key={item.name + idx}
                style={styles.defaulterItem}
                onPress={() => setSelectedStudent({ ...item, type: 'defaulter' })}
              >
                <View style={styles.defaulterInfo}>
                  <Text style={styles.defaulterName}>{item.name}</Text>
                  <Text style={styles.defaulterClass}>{item.class}</Text>
                </View>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>{item.score}%</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Top Performers */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Top Performers</Text>
        <View style={styles.topScorersContainer}>
          {analyticsData.topScorers.map((scorer, index) => (
            <TouchableOpacity 
              key={scorer.name} 
              style={[styles.topScorer, { backgroundColor: index === 0 ? pastelColors.green : pastelColors.blue }]}
              onPress={() => setSelectedStudent({ ...scorer, type: 'topScorer' })}
            >
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.scorerInfo}>
                <Text style={styles.topScorerName}>{scorer.name}</Text>
                <Text style={styles.topScorerClass}>{scorer.class}</Text>
              </View>
              <Text style={styles.topScorerScore}>{scorer.score}%</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chart Detail Modal */}
      <Modal
        visible={selectedChart !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedChart(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedChart === 'usage' && 'Overall Usage Details'}
                {selectedChart === 'class' && 'Class Performance Details'}
                {selectedChart?.startsWith('quest-') && 'Quest Performance Details'}
              </Text>
              <TouchableOpacity onPress={() => setSelectedChart(null)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {selectedChart === 'usage' && (
                <View>
                  <CustomLineChart 
                    data={analyticsData.usageData.datasets[0].data} 
                    width={screenWidth - 80} 
                    height={250} 
                  />
                  <View style={styles.chartLabels}>
                    {analyticsData.usageData.labels.map((label, index) => (
                      <Text key={index} style={styles.chartLabel}>{label}</Text>
                    ))}
                  </View>
                  <Text style={styles.modalDescription}>
                    This chart shows the overall platform usage across different weeks. 
                    The trend indicates user engagement levels and platform adoption.
                  </Text>
                </View>
              )}
              
              {selectedChart === 'class' && (
                <View>
                  <CustomBarChart 
                    data={analyticsData.classPerformance} 
                    width={screenWidth - 80} 
                    height={250} 
                  />
                  <Text style={styles.modalDescription}>
                    Class performance comparison showing average scores across different classes. 
                    Higher bars indicate better overall performance.
                  </Text>
                </View>
              )}
              
              {selectedChart?.startsWith('quest-') && (
                <View>
                  <CustomHorizontalBarChart 
                    data={analyticsData.questData[parseInt(selectedChart.split('-')[1])].classPerformance}
                    width={screenWidth - 80} 
                    height={200} 
                  />
                  <Text style={styles.modalDescription}>
                    Class performance comparison for {analyticsData.questData[parseInt(selectedChart.split('-')[1])].questName}. 
                    Shows average scores and total attempts by class.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Student Detail Modal */}
      <Modal
        visible={selectedStudent !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedStudent(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedStudent?.type === 'defaulter' ? 'Student Needs Attention' : 'Top Performer Details'}
              </Text>
              <TouchableOpacity onPress={() => setSelectedStudent(null)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.studentHeader}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.avatarText}>{selectedStudent?.name?.charAt(0)}</Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{selectedStudent?.name}</Text>
                  <Text style={styles.studentClass}>{selectedStudent?.class}</Text>
                  <Text style={[styles.studentScore, { 
                    color: selectedStudent?.type === 'defaulter' ? pastelColors.accent : pastelColors.green 
                  }]}>
                    {selectedStudent?.score}% Average
                  </Text>
                </View>
              </View>

              {selectedStudent?.type === 'defaulter' && (
                <View style={styles.questDetails}>
                  <Text style={styles.sectionSubtitle}>Missed Quests</Text>
                  {['Math Quiz 1', 'Science Test', 'English Assignment'].map((quest, index) => (
                    <View key={index} style={styles.questItem}>
                      <Text style={styles.questName}>{quest}</Text>
                      <Text style={styles.questScore}>Not Attempted</Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedStudent?.type === 'topScorer' && (
                <View style={styles.questDetails}>
                  <Text style={styles.sectionSubtitle}>Completed Quests</Text>
                  {['Advanced Math', 'Physics Challenge', 'Literature Analysis'].map((quest, index) => (
                    <View key={index} style={styles.questItem}>
                      <Text style={styles.questName}>{quest}</Text>
                      <Text style={[styles.questScore, { color: pastelColors.green }]}>
                        {95 - index * 2}%
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: pastelColors.gray, 
    padding: 20 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: pastelColors.accent, 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  card: {
    backgroundColor: pastelColors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: pastelColors.text, 
    marginBottom: 16 
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: pastelColors.muted,
    fontWeight: '500',
  },
  questChartsContainer: {
    gap: 20,
  },
  questChart: {
    alignItems: 'center',
  },
  questTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: pastelColors.text,
    marginBottom: 8,
  },
  defaultersRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: 20 
  },
  defaultersCount: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    minWidth: 80 
  },
  defaultersCountText: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    color: pastelColors.accent 
  },
  defaultersLabel: { 
    color: pastelColors.muted, 
    fontWeight: '600',
    fontSize: 12,
  },
  defaultersList: { 
    flex: 1 
  },
  defaulterItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 12, 
    paddingHorizontal: 16,
    backgroundColor: pastelColors.gray,
    borderRadius: 8,
    marginBottom: 8,
  },
  defaulterInfo: {
    flex: 1,
  },
  defaulterName: { 
    color: pastelColors.text, 
    fontWeight: '600',
    fontSize: 16,
  },
  defaulterClass: { 
    color: pastelColors.muted, 
    fontWeight: '500',
    fontSize: 14,
  },
  scoreContainer: {
    backgroundColor: pastelColors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    color: pastelColors.surface,
    fontWeight: '700',
    fontSize: 12,
  },
  topScorersContainer: {
    gap: 12,
  },
  topScorer: { 
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12, 
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rankBadge: {
    backgroundColor: pastelColors.surface,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: pastelColors.text,
  },
  scorerInfo: {
    flex: 1,
  },
  topScorerName: { 
    fontWeight: '700', 
    color: pastelColors.surface, 
    fontSize: 16 
  },
  topScorerClass: { 
    color: pastelColors.surface, 
    fontWeight: '500', 
    fontSize: 14,
    opacity: 0.8,
  },
  topScorerScore: { 
    color: pastelColors.surface, 
    fontWeight: '700', 
    fontSize: 20 
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: pastelColors.surface,
    borderRadius: 20,
    padding: 0,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: pastelColors.gray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: pastelColors.text,
    flex: 1,
  },
  closeButton: {
    fontSize: 24,
    color: pastelColors.muted,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: pastelColors.muted,
    marginTop: 16,
    lineHeight: 20,
  },
  // Student modal styles
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: pastelColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: pastelColors.surface,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700',
    color: pastelColors.text,
    marginBottom: 4,
  },
  studentClass: {
    fontSize: 16,
    color: pastelColors.muted,
    marginBottom: 8,
  },
  studentScore: {
    fontSize: 18,
    fontWeight: '600',
  },
  questDetails: {
    marginTop: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: pastelColors.text,
    marginBottom: 12,
  },
  questItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: pastelColors.gray,
    borderRadius: 8,
    marginBottom: 8,
  },
  questName: {
    fontSize: 14,
    fontWeight: '500',
    color: pastelColors.text,
    flex: 1,
  },
  questScore: {
    fontSize: 14,
    fontWeight: '600',
    color: pastelColors.accent,
  },
});
