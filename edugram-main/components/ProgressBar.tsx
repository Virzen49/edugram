import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  backgroundColor?: string;
  height?: number;
}

export default function ProgressBar({ 
  progress, 
  color = '#E91E63', 
  backgroundColor = '#F3F4F6',
  height = 8 
}: ProgressBarProps) {
  return (
    <View style={[styles.container, { backgroundColor, height }]}>
      <View 
        style={[
          styles.fill, 
          { 
            backgroundColor: color, 
            width: `${Math.min(Math.max(progress * 100, 0), 100)}%`,
            height 
          }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
});